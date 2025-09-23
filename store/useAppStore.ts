
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as XLSX from 'xlsx';
import { AppMode, Conversation, Message, Attachment, ImageAdPackage, isImageAdPackage } from '../types';
import { generateConversationTitle, runGeminiJsonQuery, streamGeminiQuery, generateImageAd, runImageEditingQuery } from '../services/geminiService';

interface AppState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  abortController: AbortController | null;
  attachments: File[];
  toastInfo: { message: string; type: 'success' | 'info' | 'error'; duration?: number } | null;
  feedbackModalState: { isOpen: boolean; conversationId: string | null; messageIndex: number | null; };
  isAnalyzerOpen: boolean;
  
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
  toggleAnalyzer: () => void;

  // Attachment actions
  addAttachments: (files: File[]) => void;
  removeAttachment: (indexToRemove: number) => void;
  clearAttachments: () => void;

  // Tool actions
  startAnalysisFromSpreadsheet: (file: File, instructions: string) => Promise<void>;
  upscaleImage: (conversationId: string, messageIndex: number) => Promise<void>;
  regenerateImage: (conversationId: string, messageIndex: number) => Promise<void>;
  handleNegativeSkywatchResponse: () => void;
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
      isAnalyzerOpen: false,
      
      createNewConversation: (mode) => {
        const newConversation: Conversation = {
          id: `conv_${Date.now()}`,
          title: `Nova Conversa`,
          mode: mode,
          messages: [],
          createdAt: new Date(),
        };
        set(state => ({
          conversations: [...state.conversations, newConversation],
          activeConversationId: newConversation.id,
          error: null,
          attachments: [], // Clear attachments
        }));
      },

      setActiveConversationId: (id) => {
        get().stopGeneration();
        set({
            activeConversationId: id,
            error: null,
            attachments: [], // Clear attachments
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
            const isSpreadsheet = fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls');
            const isTextBased = fileNameLower.endsWith('.csv') || fileNameLower.endsWith('.txt') || fileNameLower.endsWith('.doc') || fileNameLower.endsWith('.docx');
            
            if (isSpreadsheet || isTextBased) {
                try {
                    let content = '';
                    if (isSpreadsheet) {
                        const arrayBuffer = await file.arrayBuffer();
                        const workbook = XLSX.read(arrayBuffer);
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        content = XLSX.utils.sheet_to_csv(worksheet);
                    } else {
                        content = await readFileAsText(file);
                    }
                    textBasedPromptAdditions.push(`\n\n--- Conteúdo do Arquivo Anexado (${file.name}) ---\n${content}`);
                } catch (e) {
                    console.error(`Error reading file ${file.name}:`, e);
                    get().setConversationError(`Falha ao ler o arquivo ${file.name}.`);
                    return;
                }
            } else { // Assume binary/image, etc.
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
          AppMode.PAGE, AppMode.MARKET_INTEL, AppMode.INSTRUCTOR, AppMode.VIGIA, AppMode.ARQUITETO
        ].includes(activeConversation.mode);
        const isImageMode = activeConversation.mode === AppMode.IMAGE_ADS;
        const history = [...activeConversation.messages, userMessage];

        try {
            if (isJsonMode) {
                const response = await runGeminiJsonQuery(activeConversation.mode, history, controller.signal);
                const agentMessage: Message = { role: 'agent', content: response };
                get().updateLastMessage(activeConversationId, agentMessage);
            } else if (isImageMode) {
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
      toggleAnalyzer: () => set(state => ({ isAnalyzerOpen: !state.isAnalyzerOpen })),
      
      addAttachments: (files) => {
        set(state => ({ attachments: [...state.attachments, ...files] }));
      },
      removeAttachment: (indexToRemove) => {
        set(state => ({ attachments: state.attachments.filter((_, index) => index !== indexToRemove) }));
      },
      clearAttachments: () => set({ attachments: [] }),

      startAnalysisFromSpreadsheet: async (file: File, instructions: string) => {
        get().toggleAnalyzer();
        await new Promise(resolve => setTimeout(resolve, 300)); // Allow modal to close visually
    
        const mode = AppMode.INTEGRATOR;
        get().createNewConversation(mode);
        const conversationId = get().activeConversationId!;
        if (!conversationId) return;

        const controller = new AbortController();
        get().setAbortController(controller);

        let spreadsheetContent: string;
        try {
            const fileNameLower = file.name.toLowerCase();
            if (fileNameLower.endsWith('.csv')) {
                spreadsheetContent = await readFileAsText(file);
            } else if (fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls')) {
                const arrayBuffer = await file.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                spreadsheetContent = XLSX.utils.sheet_to_csv(worksheet);
            } else {
                throw new Error("Formato de arquivo não suportado para análise.");
            }
        } catch (e: any) {
            get().setConversationError(e.message || `Falha ao ler a planilha ${file.name}.`);
            return;
        }

        const userMessage: Message = {
          role: 'user',
          content: instructions,
          // Add a display-only attachment
          attachments: [{ name: file.name, type: file.type, size: file.size, data: '' }],
        };
        
        get().startAgentResponse(conversationId, userMessage);

        generateConversationTitle(instructions).then(title => {
            get().updateConversationTitle(conversationId, title);
        });
        
        const history = [...get().conversations.find(c => c.id === conversationId)!.messages.slice(0, -1)];

        try {
            const stream = streamGeminiQuery(mode, history, controller.signal, {
                isSpreadsheetAnalysis: true,
                spreadsheetContent: spreadsheetContent,
            });
            for await (const chunk of stream) {
                if (controller.signal.aborted) break;
                get().appendChunkToLastMessage(conversationId, chunk);
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error("Gemini API Error:", error);
                get().setConversationError(error.message || 'Ocorreu um erro na análise.');
            }
        } finally {
            if (!controller.signal.aborted) {
                set({ isLoading: false, abortController: null });
            }
        }
      },

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
    }),
    {
      name: 'greatek-agent-storage-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAppStore;
