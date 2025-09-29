import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as XLSX from 'xlsx';
// FIX: Imported `isPresentationPackage` to resolve reference error.
// FIX: Imported `BusinessAnalysisResult` to be used in the store's state.
import { AppMode, Conversation, Message, Attachment, ImageAdPackage, isImageAdPackage, PresentationPackage, PresentationSlide, isPresentationPackage, BusinessAnalysisResult, GoalCalculatorState } from '../types';
import { generateConversationTitle, runGeminiJsonQuery, streamGeminiQuery, generateImageAd, runImageEditingQuery, runImageCompositionQuery } from '../services/geminiService';

interface AppState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  abortController: AbortController | null;
  attachments: File[];
  toastInfo: { message: string; type: 'success' | 'info' | 'error'; duration?: number } | null;
  feedbackModalState: { isOpen: boolean; conversationId: string | null; messageIndex: number | null; };
  
  // Presentation Builder State
  isGeneratingPresentation: boolean;

  // FIX: Added state for Spreadsheet/Business Analyzer features.
  isAnalyzerOpen: boolean;
  isAnalyzing: boolean;
  businessAnalysisResult: BusinessAnalysisResult | null;

  // Conversation actions
  createNewConversation: (mode: AppMode) => void;
  setActiveConversationId: (id: string) => void;
  startAgentResponse: (conversationId: string, userMessage: Message) => void;
  appendChunkToLastMessage: (conversationId: string, chunk: string) => void;
  updateLastMessage: (conversationId: string, newMessage: Message | ((current: Message) => Message)) => void;
  updateConversationTitle: (conversationId: string, title: string) => void;
  setLoading: (isLoading: boolean) => void;
  setConversationError: (error: string | null) => void;
  deleteConversation: (id: string) => void;
  returnToAgentSelection: () => void;
  setAbortController: (controller: AbortController | null) => void;
  stopGeneration: () => void;
  submitQuery: (prompt: string) => Promise<void>;
  
  // Feedback and UI actions
  setMessageFeedback: (conversationId: string, messageIndex: number, feedbackType: 'good' | 'bad') => void;
  submitNegativeFeedback: (reason: string) => void;
  openFeedbackModal: (conversationId: string, messageIndex: number) => void;
  closeFeedbackModal: () => void;
  showToast: (message: string, type: 'success' | 'info' | 'error', duration?: number) => void;
  hideToast: () => void;

  // Attachment actions
  addAttachments: (files: File[]) => void;
  removeAttachment: (indexToRemove: number) => void;
  clearAttachments: () => void;

  // Tool actions
  upscaleImage: (conversationId: string, messageIndex: number) => Promise<void>;
  regenerateImage: (conversationId: string, messageIndex: number) => Promise<void>;
  handleNegativeSkywatchResponse: () => void;
  createImageAdFromPrompt: (prompt: string) => void;

  // FIX: Added actions for Spreadsheet/Business Analyzer features.
  toggleAnalyzer: () => void;
  startAnalysisFromSpreadsheet: (file: File, instructions: string) => Promise<void>;
  startBusinessAnalysis: (file: File) => Promise<void>;
  resetBusinessAnalysis: () => void;

  // Presentation Builder actions
  generatePresentation: (prompt: string, numberOfSlides: number) => Promise<void>;
  updatePresentation: (updatedPresentation: PresentationPackage) => void;
  updateSlideImage: (slideId: string, imageUrl: string) => void;
  updateSlideUserImage: (slideId: string, imageBase64: string | null) => void;
  resetPresentation: () => void;

  // Goal Calculator actions
  updateGoalCalculatorState: (newState: Partial<GoalCalculatorState>) => void;
  resetGoalCalculator: () => void;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });

const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isLoading: false,
      error: null,
      abortController: null,
      attachments: [],
      toastInfo: null,
      feedbackModalState: { isOpen: false, conversationId: null, messageIndex: null },
      isGeneratingPresentation: false,
      
      // FIX: Added initial state for Spreadsheet/Business Analyzer features.
      isAnalyzerOpen: false,
      isAnalyzing: false,
      businessAnalysisResult: null,

      createNewConversation: (mode) => {
        let title = 'Nova Conversa';
        if (mode === AppMode.GOAL_CALCULATOR) title = 'Novo cálculo de meta';
        if (mode === AppMode.PRESENTATION_BUILDER) title = 'Nova Apresentação';
        
        const newConversation: Conversation = {
          id: `conv_${Date.now()}`,
          title: title,
          mode: mode,
          messages: [],
          createdAt: new Date(),
          presentationPackage: mode === AppMode.PRESENTATION_BUILDER ? null : undefined,
          goalCalculatorState: mode === AppMode.GOAL_CALCULATOR ? {
            salesGoal: '',
            salesSoFar: '',
            totalProposals: '',
            wonProposals: '',
          } : undefined,
        };
        set(state => ({
          conversations: [...state.conversations, newConversation],
          activeConversationId: newConversation.id,
          error: null,
          attachments: [],
        }));
      },

      setActiveConversationId: (id) => {
        get().stopGeneration();
        set({
            activeConversationId: id,
            error: null,
            attachments: [], 
        });
      },
      
      startAgentResponse: (conversationId, userMessage) => set(state => {
        const conversations = state.conversations.map(conv => {
          if (conv.id === conversationId) {
            const agentPlaceholder: Message = { role: 'agent', content: '' };
            return {
              ...conv,
              messages: [
                ...conv.messages,
                userMessage,
                agentPlaceholder
              ],
            };
          }
          return conv;
        });
        return { 
          conversations, 
          isLoading: true,
          error: null 
        };
      }),
      
      appendChunkToLastMessage: (conversationId, chunk) => set(state => ({
        conversations: state.conversations.map(conv => {
          if (conv.id === conversationId) {
            const newMessages = [...conv.messages];
            const lastMessageIndex = newMessages.length - 1;
            const lastMessage = newMessages[lastMessageIndex];
            
            if (lastMessage && lastMessage.role === 'agent' && typeof lastMessage.content === 'string') {
              newMessages[lastMessageIndex] = {
                ...lastMessage,
                content: lastMessage.content + chunk
              };
              return { ...conv, messages: newMessages };
            }
          }
          return conv;
        })
      })),

      updateLastMessage: (conversationId, updater) => set(state => {
          const conversations = state.conversations.map(conv => {
              if (conv.id === conversationId) {
                  const newMessages = [...conv.messages];
                  const lastMessageIndex = newMessages.length - 1;
                  if (lastMessageIndex >= 0) {
                      const currentMessage = newMessages[lastMessageIndex];
                      newMessages[lastMessageIndex] = typeof updater === 'function' ? updater(currentMessage) : updater;
                  }
                  return { ...conv, messages: newMessages };
              }
              return conv;
          });
          return { conversations };
      }),

      updateConversationTitle: (conversationId, title) => set(state => {
          const conversations = state.conversations.map(conv => {
              if (conv.id === conversationId) {
                  return { ...conv, title: title };
              }
              return conv;
          });
          return { conversations };
      }),

      setLoading: (isLoading) => set({ isLoading }),
      
      setConversationError: (error) => set({ error, isLoading: false }),

      deleteConversation: (id: string) => {
        set(state => {
          const remainingConversations = state.conversations.filter(c => c.id !== id);
    
          if (remainingConversations.length === 0) {
            return {
              conversations: [],
              activeConversationId: null,
            };
          }
    
          let nextActiveId = state.activeConversationId;
          if (state.activeConversationId === id) {
            const sorted = [...remainingConversations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            nextActiveId = sorted[0].id;
          }
          return { conversations: remainingConversations, activeConversationId: nextActiveId };
        });
      },

      returnToAgentSelection: () => set({ activeConversationId: null }),

      setAbortController: (controller) => set({ abortController: controller }),

      stopGeneration: () => {
        const { abortController } = get();
        if (abortController) {
          abortController.abort();
          set({ isLoading: false, abortController: null, error: 'A geração foi cancelada.' });
        }
      },
      
      submitQuery: async (prompt: string) => {
        const { activeConversationId, conversations, attachments } = get();
        if (!activeConversationId) return;

        const activeConversation = conversations.find(c => c.id === activeConversationId);
        if (!activeConversation) return;

        const controller = new AbortController();
        get().setAbortController(controller);
        
        const textBasedPromptAdditions: string[] = [];
        const binaryAttachments: Attachment[] = [];

        for (const file of attachments) {
            const fileNameLower = file.name.toLowerCase();
            const isSpreadsheetOrText = fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls') || fileNameLower.endsWith('.csv') || fileNameLower.endsWith('.txt');

            if (isSpreadsheetOrText) {
                try {
                    let content = '';
                    if (fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls')) {
                        const arrayBuffer = await file.arrayBuffer();
                        const workbook = XLSX.read(arrayBuffer);
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        content = XLSX.utils.sheet_to_csv(worksheet);
                    } else { // .csv or .txt
                        content = await readFileAsText(file);
                    }
                    textBasedPromptAdditions.push(`\n\n--- Conteúdo do Arquivo Anexado (${file.name}) ---\n${content}`);
                } catch (e) {
                    console.error(`Error reading file ${file.name}:`, e);
                    get().setConversationError(`Falha ao ler o arquivo ${file.name}.`);
                    return;
                }
            } else { // Assume image, as validation happens in addAttachments
                try {
                    binaryAttachments.push({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: await fileToBase64(file),
                    });
                } catch (e) {
                    console.error(`Error processing file ${file.name}:`, e);
                    get().setConversationError(`Falha ao processar o anexo ${file.name}.`);
                    return;
                }
            }
        }

        const finalPrompt = prompt + textBasedPromptAdditions.join('');

        const userMessage: Message = {
          role: 'user',
          content: finalPrompt,
          attachments: binaryAttachments.length > 0 ? binaryAttachments : undefined,
        };

        get().startAgentResponse(activeConversationId, userMessage);
        get().clearAttachments();

        if (activeConversation.messages.length === 0) {
            const titlePrompt = finalPrompt.length > 500 ? finalPrompt.substring(0, 500) + '...' : finalPrompt;
            generateConversationTitle(titlePrompt).then(title => {
                if (get().activeConversationId === activeConversationId) {
                    get().updateConversationTitle(activeConversationId, title);
                }
            }).catch(e => console.error("Error generating title:", e));
        }
        
        const isJsonMode = [
          AppMode.PAGE, AppMode.MARKET_INTEL, AppMode.INSTRUCTOR, AppMode.CONTENT
        ].includes(activeConversation.mode);
        const isImageMode = activeConversation.mode === AppMode.IMAGE_ADS;
        const history = [...activeConversation.messages, userMessage];

        try {
            if (isJsonMode) {
                const response = await runGeminiJsonQuery(activeConversation.mode, history, controller.signal);
                const agentMessage: Message = { role: 'agent', content: response };
                get().updateLastMessage(activeConversationId, agentMessage);
            } else if (isImageMode) {
                const lastAgentMessage = activeConversation.messages.filter(m => m.role === 'agent').pop();
                const hasReferenceImageInPrompt = binaryAttachments.length > 0;

                // Check for edit/composition request
                if (lastAgentMessage && isImageAdPackage(lastAgentMessage.content) && hasReferenceImageInPrompt) {
                    const baseImagePackage = lastAgentMessage.content;
                    const [header, base64Data] = baseImagePackage.imageUrl.split(',');
                    const baseImage: Attachment = {
                        name: 'base_image.jpeg',
                        type: header.match(/:(.*?);/)?.[1] || 'image/jpeg',
                        size: 0, 
                        data: base64Data,
                    };
                    const newProductImage = binaryAttachments[0];
                    const editText = finalPrompt;

                    // Use the placeholder message to show a loading state
                    get().updateLastMessage(activeConversationId, current => {
                        if (isImageAdPackage(lastAgentMessage.content)) {
                             // Temporarily update previous message to show loading state
                            const updatedMessages = activeConversation.messages.map(msg => 
                                msg === lastAgentMessage ? { ...msg, content: { ...lastAgentMessage.content, isRegenerating: true } } : msg
                            );
                            set(state => ({ conversations: state.conversations.map(c => c.id === activeConversationId ? {...c, messages: [...updatedMessages, userMessage]} : c) }));
                        }
                        return { role: 'agent', content: '' }; // Keep the placeholder empty for now
                    });
                    
                    const newBase64Data = await runImageCompositionQuery(baseImage, newProductImage, editText, controller.signal);
                    
                    const newImagePackage: ImageAdPackage = {
                        ...baseImagePackage,
                        imageUrl: `data:${newProductImage.type};base64,${newBase64Data}`,
                        originalPrompt: `Editado: ${editText}`, 
                        generatedPrompt: `Imagem editada para incluir ${newProductImage.name}`,
                        referenceImage: newProductImage,
                        isRegenerating: false,
                        isUpscaled: false,
                        isUpscaling: false,
                    };

                    get().updateLastMessage(activeConversationId, { role: 'agent', content: newImagePackage });

                    // Restore previous message state
                     set(state => ({ conversations: state.conversations.map(c => c.id === activeConversationId ? {...c, messages: c.messages.map(m => isImageAdPackage(m.content) ? {...m, content: {...m.content, isRegenerating: false}} : m)} : c) }));

                } else {
                     const stream = streamGeminiQuery(activeConversation.mode, history, controller.signal);
                    let fullResponse = '';
                    for await (const chunk of stream) {
                        if (controller.signal.aborted) break;
                        fullResponse += chunk;
                    }

                    if (controller.signal.aborted) {
                       return; // Stop processing if aborted
                    }
                    
                    let parsedJson;
                    try {
                        const jsonMatch = fullResponse.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
                        if (jsonMatch) {
                            const jsonString = jsonMatch[1] || jsonMatch[2];
                            parsedJson = JSON.parse(jsonString);
                        }
                    } catch (e) { /* Not valid JSON, will be treated as text */ }

                    if (parsedJson && parsedJson.intent === 'generate' && parsedJson.prompt) {
                        const lastUserMessage = history[history.length - 1];
                        const referenceImage = lastUserMessage.attachments;
                        
                        const imagePackage = await generateImageAd(parsedJson.prompt, referenceImage, controller.signal);
                        const agentFinalMessage: Message = { role: 'agent', content: imagePackage };
                        get().updateLastMessage(activeConversationId, agentFinalMessage);
                    } else {
                        get().updateLastMessage(activeConversationId, current => ({ ...current, content: fullResponse.trim() }));
                    }
                }
            } else {
                const stream = streamGeminiQuery(activeConversation.mode, history, controller.signal);
                for await (const chunk of stream) {
                    if (controller.signal.aborted) break;
                    get().appendChunkToLastMessage(activeConversationId, chunk);
                }
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error("Gemini API Error:", error);
                get().setConversationError(error.message || 'Ocorreu um erro ao se comunicar com a IA.');
            }
        } finally {
            if (!controller.signal.aborted) {
                set({ isLoading: false, abortController: null });
            }
        }
      },

      setMessageFeedback: (conversationId, messageIndex, feedbackType) => {
        set(state => ({
          conversations: state.conversations.map(conv => {
            if (conv.id === conversationId) {
              const newMessages = [...conv.messages];
              const message = newMessages[messageIndex];
              const currentFeedback = message.feedback;

              if (currentFeedback?.type === feedbackType) {
                 message.feedback = null;
              } else {
                 message.feedback = { type: feedbackType };
                 if (feedbackType === 'bad') {
                    state.openFeedbackModal(conversationId, messageIndex);
                 } else if (feedbackType === 'good') {
                    state.showToast('Obrigado pelo seu feedback!', 'success');
                 }
              }
              return { ...conv, messages: newMessages };
            }
            return conv;
          })
        }));
      },
      
      submitNegativeFeedback: (reason) => {
        const { feedbackModalState } = get();
        const { conversationId, messageIndex } = feedbackModalState;

        if (conversationId && messageIndex !== null) {
            set(state => ({
                conversations: state.conversations.map(conv => {
                    if (conv.id === conversationId) {
                        const newMessages = [...conv.messages];
                        newMessages[messageIndex].feedback = { type: 'bad', reason };
                        return { ...conv, messages: newMessages };
                    }
                    return conv;
                })
            }));
            get().showToast('Obrigado pelo seu feedback!', 'success');
        }
        get().closeFeedbackModal();
      },
      
      openFeedbackModal: (conversationId, messageIndex) => {
        set({ feedbackModalState: { isOpen: true, conversationId, messageIndex } });
      },
      
      closeFeedbackModal: () => {
        set({ feedbackModalState: { isOpen: false, conversationId: null, messageIndex: null } });
      },

      showToast: (message, type, duration) => set({ toastInfo: { message, type, duration } }),
      hideToast: () => set({ toastInfo: null }),
      
      addAttachments: (files) => {
        const supportedFiles: File[] = [];
        const unsupportedFiles: string[] = [];
        const validExtensions = ['.txt', '.csv', '.xls', '.xlsx'];
        
        for (const file of files) {
            const fileNameLower = file.name.toLowerCase();
            const isSupported = validExtensions.some(ext => fileNameLower.endsWith(ext)) || file.type.startsWith('image/');

            if (isSupported) {
                supportedFiles.push(file);
            } else {
                unsupportedFiles.push(file.name);
            }
        }

        if (unsupportedFiles.length > 0) {
            get().showToast(`Arquivos não suportados: ${unsupportedFiles.join(', ')}.`, 'error', 5000);
        }

        if (supportedFiles.length > 0) {
            set(state => ({ attachments: [...state.attachments, ...supportedFiles] }));
        }
      },
      removeAttachment: (indexToRemove) => {
        set(state => ({ attachments: state.attachments.filter((_, index) => index !== indexToRemove) }));
      },
      clearAttachments: () => set({ attachments: [] }),

      upscaleImage: async (conversationId: string, messageIndex: number) => {
        const conversations = get().conversations;
        const conversation = conversations.find(c => c.id === conversationId);
        if (!conversation) return;

        const message = conversation.messages[messageIndex];
        if (!message || !isImageAdPackage(message.content)) return;

        const { imageUrl } = message.content;
        const [header, base64Data] = imageUrl.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';

        get().updateLastMessage(conversationId, (current) => {
            if (isImageAdPackage(current.content)) {
                return { ...current, content: { ...current.content, isUpscaling: true } };
            }
            return current;
        });

        const controller = new AbortController();
        get().setAbortController(controller);
        
        try {
            const upscalePrompt = "Melhore a qualidade desta imagem e aumente sua resolução em 2x (upscale), focando em aprimorar os detalhes existentes sem adicionar novos elementos.";
            const newBase64Data = await runImageEditingQuery(base64Data, mimeType, upscalePrompt, controller.signal);
            const newImageUrl = `data:${mimeType};base64,${newBase64Data}`;
            
            get().updateLastMessage(conversationId, (current) => {
                if (isImageAdPackage(current.content)) {
                    return { ...current, content: { ...current.content, imageUrl: newImageUrl, isUpscaling: false, isUpscaled: true } };
                }
                return current;
            });

            get().showToast('Imagem melhorada com sucesso!', 'success');
        } catch (error: any) {
            console.error("Image Upscale Error:", error);
            get().showToast(error.message || 'Falha ao melhorar a imagem.', 'error', 6000);
            get().updateLastMessage(conversationId, (current) => {
                if (isImageAdPackage(current.content)) {
                    return { ...current, content: { ...current.content, isUpscaling: false } };
                }
                return current;
            });
        } finally {
             get().setAbortController(null);
        }
      },

      regenerateImage: async (conversationId: string, messageIndex: number) => {
        const { conversations } = get();
        const conversation = conversations.find(c => c.id === conversationId);
        if (!conversation) return;
        const message = conversation.messages[messageIndex];
        if (!message || !isImageAdPackage(message.content)) return;

        const { originalPrompt, referenceImage } = message.content;

        get().updateLastMessage(conversationId, current => {
            if (isImageAdPackage(current.content)) {
                return { ...current, content: { ...current.content, isRegenerating: true } };
            }
            return current;
        });

        const controller = new AbortController();
        get().setAbortController(controller);
        
        try {
            const attachments = referenceImage ? [referenceImage] : undefined;
            const newImagePackage = await generateImageAd(originalPrompt, attachments, controller.signal);
            get().updateLastMessage(conversationId, current => ({ ...current, content: newImagePackage }));
        } catch (error: any) {
            console.error("Image Regeneration Error:", error);
            get().showToast(error.message || 'Falha ao gerar a imagem novamente.', 'error', 6000);
            get().updateLastMessage(conversationId, current => {
                if (isImageAdPackage(current.content)) {
                    return { ...current, content: { ...current.content, isRegenerating: false } };
                }
                return current;
            });
        } finally {
            get().setAbortController(null);
        }
      },
      
      handleNegativeSkywatchResponse: () => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;
    
        const userMessage: Message = {
            role: 'user',
            content: 'Não, obrigado.',
        };
    
        const agentResponse: Message = {
            role: 'agent',
            content: 'Compreendido. Não há problema.\n\nEstou à disposição para detalhar qualquer outro item da proposta de solução que apresentei, ou se preferir, podemos revisitar algum aspecto do projeto que o cliente tenha mencionado.',
        };
    
        set(state => ({
            conversations: state.conversations.map(conv => {
                if (conv.id === activeConversationId) {
                    return {
                        ...conv,
                        messages: [...conv.messages, userMessage, agentResponse],
                        skywatchDeclined: true,
                    };
                }
                return conv;
            })
        }));
      },

      createImageAdFromPrompt: (prompt: string) => {
        const { createNewConversation, submitQuery } = get();
        createNewConversation(AppMode.IMAGE_ADS);
        setTimeout(() => {
            submitQuery(prompt);
        }, 100);
      },
      
      generatePresentation: async (prompt: string, numberOfSlides: number) => {
        set({ isGeneratingPresentation: true, error: null });
        const controller = new AbortController();
        get().setAbortController(controller);
        const activeConvId = get().activeConversationId;

        try {
          const userMessage: Message = { role: 'user', content: prompt };
          const response = await runGeminiJsonQuery(
              AppMode.PRESENTATION_BUILDER, 
              [userMessage], 
              controller.signal,
              { numberOfSlides }
          );

          if (isPresentationPackage(response)) {
            const presentationWithUserImages = {
                ...response,
                slides: response.slides.map(slide => ({...slide, userImage: undefined }))
            };
            set(state => ({
                conversations: state.conversations.map(conv => 
                    conv.id === activeConvId
                        ? { ...conv, presentationPackage: presentationWithUserImages }
                        : conv
                ),
            }));
            
            if (activeConvId) {
              get().updateConversationTitle(activeConvId, `Apresentação: "${response.presentation_title}"`);
            }
          } else {
            throw new Error("A IA retornou uma resposta em um formato de apresentação inválido.");
          }

        } catch (error: any) {
           if (error.name !== 'AbortError') {
                console.error("Presentation Generation Error:", error);
                set({ error: error.message || 'Ocorreu um erro ao gerar a apresentação.', isGeneratingPresentation: false });
           }
        } finally {
            if (!controller.signal.aborted) {
                set({ isGeneratingPresentation: false, abortController: null });
            }
        }
      },
      
      updatePresentation: (updatedPresentation: PresentationPackage) => {
        const activeConvId = get().activeConversationId;
        set(state => ({
            conversations: state.conversations.map(conv => 
                conv.id === activeConvId
                    ? { ...conv, presentationPackage: updatedPresentation }
                    : conv
            ),
        }));
      },

      updateSlideImage: (slideId: string, imageUrl: string) => {
        const activeConvId = get().activeConversationId;
        set(state => ({
            conversations: state.conversations.map(conv => {
                // FIX: Added a direct null/undefined check for presentationPackage to satisfy TypeScript's type narrowing before spreading.
                if (conv.id !== activeConvId || !conv.presentationPackage) {
                    return conv;
                }
                const newSlides = conv.presentationPackage.slides.map(slide =>
                    slide.id === slideId ? { ...slide, imageUrl } : slide
                );
                return {
                    ...conv,
                    presentationPackage: {
                        ...conv.presentationPackage,
                        slides: newSlides,
                    }
                };
            })
        }));
      },

      updateSlideUserImage: (slideId: string, imageBase64: string | null) => {
        const activeConvId = get().activeConversationId;
        set(state => ({
            conversations: state.conversations.map(conv => {
                // FIX: Added a direct null/undefined check for presentationPackage to satisfy TypeScript's type narrowing before spreading.
                if (conv.id !== activeConvId || !conv.presentationPackage) {
                    return conv;
                }
                const newSlides = conv.presentationPackage.slides.map(slide =>
                    slide.id === slideId ? { ...slide, userImage: imageBase64 || undefined } : slide
                );
                return {
                    ...conv,
                    presentationPackage: {
                        ...conv.presentationPackage,
                        slides: newSlides,
                    }
                };
            })
        }));
      },
      
      resetPresentation: () => {
        const activeConvId = get().activeConversationId;
        set(state => ({ 
            isGeneratingPresentation: false, 
            error: null,
            conversations: state.conversations.map(conv =>
                conv.id === activeConvId
                    ? { ...conv, presentationPackage: null }
                    : conv
            ),
        }));
      },

      // FIX: Added implementations for Spreadsheet/Business Analyzer actions.
      toggleAnalyzer: () => set(state => ({ isAnalyzerOpen: !state.isAnalyzerOpen })),

      startAnalysisFromSpreadsheet: async (file, instructions) => {
          const { createNewConversation, submitQuery, addAttachments, toggleAnalyzer } = get();
          toggleAnalyzer(); // Close modal
          
          createNewConversation(AppMode.INTEGRATOR);
          
          setTimeout(() => {
              addAttachments([file]);
              submitQuery(`Analise a planilha anexada com as seguintes instruções: ${instructions}`);
          }, 100);
      },
  
      startBusinessAnalysis: async (file) => {
          set({ isAnalyzing: true, error: null, businessAnalysisResult: null });
          console.log("Starting business analysis for file:", file.name);
  
          // In a real app, this would read the file and call a specific geminiService function.
          // For this fix, we simulate the analysis process and result.
          setTimeout(() => {
              // Dummy data to allow the UI to render correctly.
              const dummyResult: BusinessAnalysisResult = {
                  kpis: [
                      { title: 'Taxa de Vitória', value: '45%', icon: 'bi-trophy-fill', description: 'De 100 negociações' },
                      { title: 'Valor Médio Ganho', value: 'R$ 25.000', icon: 'bi-tags-fill', description: 'Ticket médio' },
                      { title: 'Total Perdido', value: 'R$ 1.3M', icon: 'bi-graph-down-arrow', description: 'Em 55 negociações' },
                      { title: 'Ciclo de Venda', value: '32 dias', icon: 'bi-calendar-check-fill', description: 'Médio para ganhar' },
                  ],
                  winReasons: [
                      { label: 'Preço Competitivo', value: 20, percentage: 44.4 },
                      { label: 'Relacionamento', value: 15, percentage: 33.3 },
                      { label: 'Recursos do Produto', value: 10, percentage: 22.2 },
                  ],
                  lossReasons: [
                      { label: 'Preço Acima do Concorrente', value: 25, percentage: 45.5 },
                      { label: 'Falta de Recurso Chave', value: 18, percentage: 32.7 },
                      { label: 'Timing do Cliente', value: 12, percentage: 21.8 },
                  ],
                  aiInsights: `## Análise da IA\n\nCom base nos dados fornecidos, aqui estão os principais insights:\n\n### Pontos Fortes\n*   **Preço Competitivo:** Sua estratégia de preço é um fator decisivo em **44%** das negociações ganhas. Continue a destacar o custo-benefício.\n*   **Relacionamento com Cliente:** Um forte relacionamento foi o segundo motivo mais comum para o sucesso, indicando uma boa atuação da equipe de vendas.\n\n### Oportunidades de Melhoria\n*   **Competitividade de Preço:** Paradoxalmente, o preço também é seu maior motivo de perda (**45%**). Isso sugere uma inconsistência ou que você está perdendo para concorrentes com propostas de valor diferentes. É crucial analisar os concorrentes nesses casos.\n*   **Roadmap de Produto:** A "Falta de Recurso Chave" é um motivo significativo de perda. Colete feedback detalhado sobre quais recursos são esses para informar o desenvolvimento de produtos.`
              };
              set({
                  isAnalyzing: false,
                  businessAnalysisResult: dummyResult,
              });
          }, 2500);
      },
      
      resetBusinessAnalysis: () => set({ businessAnalysisResult: null, isAnalyzing: false, error: null }),

      updateGoalCalculatorState: (newState: Partial<GoalCalculatorState>) => {
        const activeConvId = get().activeConversationId;
        set(state => ({
            conversations: state.conversations.map(conv => {
                if (conv.id === activeConvId && conv.mode === AppMode.GOAL_CALCULATOR && conv.goalCalculatorState) {
                    return {
                        ...conv,
                        goalCalculatorState: {
                            ...conv.goalCalculatorState,
                            ...newState,
                        }
                    };
                }
                return conv;
            })
        }));
      },
    
      resetGoalCalculator: () => {
        const activeConvId = get().activeConversationId;
        set(state => ({
            conversations: state.conversations.map(conv => {
                if (conv.id === activeConvId && conv.mode === AppMode.GOAL_CALCULATOR) {
                    return {
                        ...conv,
                        goalCalculatorState: {
                            salesGoal: '',
                            salesSoFar: '',
                            totalProposals: '',
                            wonProposals: '',
                        }
                    };
                }
                return conv;
            })
        }));
      },

    }),
    {
      name: 'greatek-agent-storage-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAppStore;