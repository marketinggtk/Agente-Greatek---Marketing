import { GoogleGenAI, Type, Part, Content, Modality, GenerateContentResponse } from "@google/genai";
import { AppMode, PageOptimizationPackage, MarketIntelReport, Message, TrainingKitReport, VigiaReport, NetworkArchitectureReport, GroundingSource, Attachment, ImageAdPackage, AdCopy } from '../types';
import { SYSTEM_PROMPT } from '../constants';
import { KNOWLEDGE_BASE_PRODUCTS, PARTNER_COMPANIES, KNOWLEDGE_BASE_SKYWATCH } from './knowledgeBase';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const knowledgeBaseText = KNOWLEDGE_BASE_PRODUCTS.map(p => `## Produto: ${p.name}\n${p.details}`).join('\n\n');
const partnerCompaniesText = PARTNER_COMPANIES.map(p => `- **${p.name} (${p.type})**: ${p.description}`).join('\n');

const FULL_KNOWLEDGE_BASE_CONTEXT = `
---
**CONTEXTO TÉCNICO E DE NEGÓCIO DA GREATEK**

Você tem acesso a uma base de conhecimento interna com informações detalhadas sobre os produtos distribuídos pela Greatek e suas empresas parceiras. Use esta base para enriquecer suas respostas, fornecer detalhes técnicos precisos e construir soluções de alto valor agregado.

**Base de Conhecimento de Produtos:**
${knowledgeBaseText}

**Empresas Parceiras da Greatek:**
${partnerCompaniesText}
---
`;

const getSystemInstruction = (mode: AppMode, options?: { isSpreadsheetAnalysis?: boolean; spreadsheetContent?: string; }): string => {
    let specificInstruction = '';
    
    if (options?.isSpreadsheetAnalysis && options.spreadsheetContent) {
        specificInstruction = `O usuário anexou uma planilha. Sua tarefa é analisar o conteúdo dela e responder à solicitação do usuário. O conteúdo da planilha em formato CSV é:\n\n${options.spreadsheetContent}`;
    }

    switch (mode) {
        case AppMode.SKYWATCH_ASSISTANT:
            specificInstruction = `Seu conhecimento é limitado à base de dados do SkyWatch fornecida. Responda APENAS com base nessas informações. Se a pergunta não puder ser respondida com a base, informe que você não tem essa informação. Base de conhecimento:\n${KNOWLEDGE_BASE_SKYWATCH}`;
            break;
        case AppMode.INTEGRATOR:
            specificInstruction = `Você é um "Arquiteto de Soluções" especialista da Greatek. Sua missão é transformar um pedido inicial de um cliente em uma oferta de alto valor agregado, identificando produtos complementares e essenciais.

**PROCESSO OBRIGATÓRIO:**
1.  **Análise e Qualificação (MODO CONSULTIVO):**
    *   Ao receber o pedido inicial do usuário (ex: "meu cliente pediu uma OLT"), sua primeira ação é AVALIAR se a informação é suficiente.
    *   Se for vago, você DEVE FAZER PERGUNTAS para entender o contexto do cliente. Exemplos de perguntas: "Excelente! Para que eu possa montar a melhor solução, me diga um pouco mais sobre o cliente: Quantos assinantes ele pretende atender inicialmente? É um projeto residencial ou corporativo? Qual a estrutura que ele já possui?".
    *   NÃO forneça uma lista de produtos antes de entender o cenário. Aja como um consultor.

2.  **Construção da Solução:**
    *   Após entender o contexto, use a BASE DE CONHECIMENTO para selecionar os produtos MAIS RELEVANTES e complementares.
    *   Seu objetivo é criar uma solução completa e coesa, não um catálogo. Mostre como os produtos se conectam.
    *   Inclua itens essenciais que o cliente pode não ter considerado (ex: DIOs, cabos, conectores, sistema de energia).

3.  **Formato de Resposta (ESTRITAMENTE EM MARKDOWN):**
    *   Sua resposta final DEVE seguir esta estrutura em Markdown:
        \`\`\`markdown
        ## Análise da Solicitação
        (Um parágrafo resumindo o que você entendeu da necessidade do cliente).

        ## Proposta de Solução Integrada
        (Um parágrafo explicando a lógica da solução que você montou e os benefícios).

        ### Produtos Recomendados
        | Categoria | Produto Sugerido | Justificativa |
        |---|---|---|
        | (Ex: OLT) | (Ex: OLT Chassi X2 da TP-Link) | (Ex: Ideal para iniciar a operação com alta performance e escalabilidade futura para XGS-PON.) |
        | (Ex: Energia) | (Ex: Sistema Retificador XPS SRX 60A) | (Ex: Garante a alimentação contínua e segura para a OLT e demais equipamentos do rack.) |
        | (Ex: Distribuição) | (Ex: DIO 24FO Completo) | (Ex: Essencial para organizar e proteger as fibras ópticas na ponta da rede.) |
        ... (continue com os outros produtos)

        ## Próximos Passos
        - Verifique o estoque dos itens sugeridos.
        - Apresente esta solução ao cliente, destacando os benefícios da integração.
        - [SKYWATCH_PROMPT_INTERACTIVE]
        \`\`\`
    *   A tabela é OBRIGATÓRIA.
    *   A tag [SKYWATCH_PROMPT_INTERACTIVE] ao final é OBRIGATÓRIA.`;
            break;
        case AppMode.SALES_ASSISTANT:
        case AppMode.INSTRUCTOR:
        case AppMode.ARQUITETO:
            specificInstruction += `\nVocê está operando em um modo que exige profundo conhecimento técnico dos produtos. Utilize o CONTEXTO TÉCNICO E DE NEGÓCIO DA GREATEK fornecido para todas as suas respostas.`;
            break;
        case AppMode.IMAGE_ADS:
            specificInstruction = `Você é um assistente de IA conversacional para geração de imagens.
Sua primeira tarefa é determinar a intenção do usuário a partir da última mensagem dele.
1.  Se o usuário deseja gerar uma NOVA imagem (ex: "crie um anúncio para...", "agora em um dia de sol", "adicione um cachorro"), você DEVE responder APENAS com um objeto JSON válido com a seguinte estrutura: {"intent": "generate", "prompt": "o pedido principal do usuário para a imagem"}. Extraia apenas a essência do pedido para o prompt.
2.  Se o usuário está fazendo uma pergunta, um comentário ou dando feedback (ex: "por que você fez isso?", "gostei!", "qual modelo você está usando?"), você deve responder conversacionalmente como um assistente prestativo em texto simples.
NÃO adicione nenhum texto antes ou depois do JSON se sua intenção for 'generate'.`;
            break;
    }

    return `${SYSTEM_PROMPT}\n${specificInstruction}\n${FULL_KNOWLEDGE_BASE_CONTEXT}`;
};

const getResponseSchema = (mode: AppMode): object | undefined => {
    switch (mode) {
        case AppMode.PAGE:
            return {
              type: Type.OBJECT,
              properties: {
                url: { type: Type.STRING },
                title: { type: Type.STRING },
                meta_description: { type: Type.STRING },
                h1: { type: Type.STRING },
                h2: { type: Type.ARRAY, items: { type: Type.STRING } },
                faqs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { q: { type: Type.STRING }, a: { type: Type.STRING } } } },
                internal_links: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { anchor: { type: Type.STRING }, target: { type: Type.STRING } } } },
                schema_jsonld: { type: Type.STRING },
                ab_test_meta: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { variant: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING } } } },
                tech_checklist: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            };
        case AppMode.MARKET_INTEL:
            return {
                type: Type.OBJECT,
                properties: {
                    sales_pitch_summary: { type: Type.STRING },
                    greatek_product_name: { type: Type.STRING },
                    competitor_product_name: { type: Type.STRING },
                    comparison_points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { feature: { type: Type.STRING }, greatek: { type: Type.STRING }, competitor: { type: Type.STRING } } } },
                    competitive_advantages: { type: Type.ARRAY, items: { type: Type.STRING } },
                    commercial_arguments: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            };
        case AppMode.INSTRUCTOR:
            return {
                type: Type.OBJECT,
                properties: {
                    product_name: { type: Type.STRING },
                    key_selling_points: { type: Type.ARRAY, items: { type: Type.STRING } },
                    technical_faq: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { q: { type: Type.STRING }, a: { type: Type.STRING } } } },
                    knowledge_quiz: {
                        type: Type.ARRAY, items: {
                            type: Type.OBJECT, properties: {
                                question: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                correct_answer: { type: Type.STRING },
                                explanation: { type: Type.STRING }
                            }
                        }
                    }
                }
            };
        case AppMode.VIGIA:
             return {
                type: Type.OBJECT,
                properties: {
                    monitoring_topic: { type: Type.STRING },
                    executive_summary: { type: Type.ARRAY, items: { type: Type.STRING } },
                    opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                    threats: { type: Type.ARRAY, items: { type: Type.STRING } },
                    actionable_insight: { type: Type.STRING }
                }
            };
        case AppMode.ARQUITETO:
            return {
                type: Type.OBJECT,
                properties: {
                    diagnosis: { type: Type.STRING },
                    proposed_solution: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } } },
                    benefit_simulation: {
                        type: Type.ARRAY, items: {
                            type: Type.OBJECT, properties: {
                                metric: { type: Type.STRING },
                                current_scenario: { type: Type.STRING },
                                proposed_scenario: { type: Type.STRING },
                                improvement: { type: Type.STRING }
                            }
                        }
                    },
                    commercial_arguments: { type: Type.ARRAY, items: { type: Type.STRING } },
                    required_products: {
                        type: Type.ARRAY, items: {
                            type: Type.OBJECT, properties: {
                                category: { type: Type.STRING },
                                product: { type: Type.STRING },
                                suggestion: { type: Type.STRING }
                            }
                        }
                    }
                }
            };
        default:
            return undefined;
    }
};

const constructHistoryForApi = (messages: Message[]): Content[] => {
    return messages.flatMap(msg => {
        const role = msg.role === 'user' ? 'user' : 'model';
        const parts: Part[] = [];

        if (typeof msg.content === 'string') {
            parts.push({ text: msg.content });
        } else if (msg.content) {
            // Handle specific structured content for history
            if ('imageUrl' in msg.content && 'generatedPrompt' in msg.content) {
                 parts.push({ text: `Gerei uma imagem com o seguinte prompt: "${(msg.content as ImageAdPackage).generatedPrompt}"` });
            } else {
                parts.push({ text: JSON.stringify(msg.content) });
            }
        }
        
        if (msg.attachments) {
            msg.attachments.forEach(att => {
                parts.push({ inlineData: { mimeType: att.type, data: att.data } });
            });
        }
        
        if (parts.length === 0) return [];
        
        return [{ role, parts }];
    });
};

export const generateConversationTitle = async (prompt: string): Promise<string> => {
    const titlePrompt = `Gere um título curto e descritivo (máximo 5 palavras) para uma conversa iniciada com o seguinte prompt: "${prompt}"`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: titlePrompt }] }],
            config: {
                systemInstruction: "Você é um gerador de títulos concisos."
            }
        });
        return response.text.replace(/["']/g, ""); // Remove quotes
    } catch (error) {
        console.error("Error generating title:", error);
        return "Nova Conversa";
    }
};

export const runGeminiJsonQuery = async (mode: AppMode, history: Message[], signal: AbortSignal): Promise<any> => {
    const systemInstruction = getSystemInstruction(mode);
    const schema = getResponseSchema(mode);
    const apiHistory = constructHistoryForApi(history.slice(0, -1));
    const lastMessage = history[history.length - 1];
    
    let contents: Content;
    if (typeof lastMessage.content === 'string') {
        const parts: Part[] = [{ text: lastMessage.content }];
        if (lastMessage.attachments) {
            lastMessage.attachments.forEach(att => {
                parts.push({ inlineData: { mimeType: att.type, data: att.data } });
            });
        }
        contents = { role: 'user', parts };
    } else {
        throw new Error("Invalid content type for JSON query.");
    }

    const config: any = { systemInstruction };
    if (schema) {
        config.responseMimeType = "application/json";
        config.responseSchema = schema;
    }
     if (mode === AppMode.MARKET_INTEL || mode === AppMode.VIGIA) {
        config.tools = [{ googleSearch: {} }];
        delete config.responseMimeType;
        delete config.responseSchema;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [...apiHistory, contents],
        config
    });

    let jsonStr = response.text.trim();
    
    if (config.tools) {
        const jsonMatch = jsonStr.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})|(\[[\s\S]*\])/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1] || jsonMatch[2] || jsonMatch[3];
        }
    }
    
    try {
        const parsedJson = JSON.parse(jsonStr);
        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            const sources = response.candidates[0].groundingMetadata.groundingChunks
                .filter((chunk: any) => chunk.web)
                .map((chunk: any) => ({
                    uri: chunk.web.uri,
                    title: chunk.web.title,
                }));

             if (mode === AppMode.MARKET_INTEL) {
                parsedJson.competitor_data_sources = sources;
            } else if (mode === AppMode.VIGIA) {
                parsedJson.sources = sources;
            }
        }
        return parsedJson;
    } catch (e) {
        console.error("JSON parsing failed for content:", jsonStr);
        throw new Error("A IA retornou uma resposta em um formato inválido. Tente novamente.");
    }
};

export async function* streamGeminiQuery(
    mode: AppMode,
    history: Message[],
    signal: AbortSignal,
    options?: { isSpreadsheetAnalysis?: boolean; spreadsheetContent?: string; }
): AsyncGenerator<string> {
    const systemInstruction = getSystemInstruction(mode, options);
    const apiHistory = constructHistoryForApi(history.slice(0, -1));
    const lastMessage = history[history.length - 1];

    let contents: Content;
    if (typeof lastMessage.content === 'string') {
        const parts: Part[] = [{ text: lastMessage.content }];
        if (lastMessage.attachments) {
            lastMessage.attachments.forEach(att => {
                parts.push({ inlineData: { mimeType: att.type, data: att.data } });
            });
        }
        contents = { role: 'user', parts };
    } else {
        throw new Error("Invalid content type for stream query.");
    }

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [...apiHistory, contents],
        config: {
            systemInstruction
        }
    });

    for await (const chunk of responseStream) {
        if (signal.aborted) {
            console.log("Stream aborted by user.");
            break;
        }
        yield chunk.text;
    }
}

const findPartnerData = (prompt: string) => {
    const lowerPrompt = prompt.toLowerCase();
    for (const partner of PARTNER_COMPANIES) {
        if (lowerPrompt.includes(partner.name.toLowerCase())) {
            return partner;
        }
    }
    for (const product of KNOWLEDGE_BASE_PRODUCTS) {
        if (product.keywords.some(kw => lowerPrompt.includes(kw))) {
             for (const partner of PARTNER_COMPANIES) {
                if (product.name.toLowerCase().includes(partner.name.toLowerCase())) {
                    return partner;
                }
             }
        }
    }
    return null;
}

export const generateImageAd = async (prompt: string, attachments?: Attachment[], signal?: AbortSignal): Promise<ImageAdPackage> => {
    const promptEnhancerSystemInstruction = `You are a "Scene Composer" AI, an expert in creating hyper-realistic photography prompts. Your task is to take a subject from a user-provided reference image and place it into a new scene described by the user's text prompt.

**CORE DIRECTIVE: THE SUBJECT IS IMMUTABLE**
- Your primary goal is to treat the main subject from the reference image as a non-modifiable object.
- Think of this as a digital composition task: you are defining a new background and environment for the **exact same subject**.
- **DO NOT RE-IMAGINE THE SUBJECT.** The final image must feature a "digital twin" of the subject, identical in every detail: shape, color, texture, logos, text, unique design patterns, and even lighting reflections on its surface.

**YOUR PROCESS:**
1.  **SUBJECT ANALYSIS:**
    *   Examine the reference image and identify the main subject.
    *   Extract a list of its most critical and unique visual characteristics. Be specific (e.g., "distinctive triangular perforated pattern on top," "two cylindrical antennas," "small green circular LED light on the front bottom-right"). This is for your internal understanding to build the prompt.
2.  **SCENE ANALYSIS:**
    *   Analyze the user's text prompt to understand the desired new background, environment, mood, and any additional elements. The user's text **only defines the scene, not the subject**.
3.  **PROMPT ENGINEERING:**
    *   Combine your analysis into a single, detailed, and commanding prompt **in ENGLISH**.
    *   **Part A: Subject Command & Description:**
        *   Start with a clear command: "Create a photorealistic image of a [product type, e.g., 'white Wi-Fi router'] placed in a new setting. The product must be an **exact visual replica** of the one in the reference image, maintaining all its original features."
        *   Immediately follow with the specific visual details you identified: "Key features to replicate perfectly are its [feature 1, e.g., 'unique triangular perforated top surface'], [feature 2, e.g., 'horizontal slit vents on the sides'], and [feature 3, e.g., 'brand logo on the front']."
    *   **Part B: Scene Description:**
        *   Describe the new scene based on the user's text prompt. Example: "The product is placed on a rustic wooden table, next to a steaming coffee mug."
    *   **Part C: Photographic Style:**
        *   Add professional photography details: "Style: hyperrealistic product photography, 8K, ultra-detailed, sharp focus."
        *   Specify camera and lighting: "Shot on a Canon EOS R5 with a 100mm macro lens, soft and diffused studio lighting to highlight the product's texture."
    *   **Part D: Negative Prompt (Crucial):**
        *   Include a negative prompt to avoid common errors: "--no different product, modified design, altered logo, blurry, deformed, cartoonish"
4.  **ANTI-CROP COMPOSITION:** Critically, ensure the main subject is fully visible and not awkwardly cropped at the edges, regardless of the aspect ratio. Use compositional terms like **"full shot," "wide shot," or "medium shot"**.
5.  **ASPECT RATIO DETERMINATION:** Analyze the user's prompt for keywords. Use '9:16' for "stories", '1:1' for "feed post" or "Instagram", '16:9' for "banner" or "YouTube thumbnail". Default to '1:1' if unspecified. Supported values are: "1:1", "3:4", "4:3", "9:16", "16:9".
6.  **JSON OUTPUT:** Your entire output must be a single, valid JSON object with this exact structure:
    {
      "generatedPrompt": "The detailed, professional English prompt you crafted.",
      "aspectRatio": "The determined aspect ratio string."
    }`;

    const enhancerSchema = {
        type: Type.OBJECT,
        properties: {
            generatedPrompt: { type: Type.STRING },
            aspectRatio: { type: Type.STRING }
        },
        required: ["generatedPrompt", "aspectRatio"]
    };

    const enhancerParts: Part[] = [{ text: prompt }];
    if (attachments && attachments.length > 0) {
        enhancerParts.push({ inlineData: { mimeType: attachments[0].type, data: attachments[0].data } });
    }

    const enhancerResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: enhancerParts },
        config: {
            systemInstruction: promptEnhancerSystemInstruction,
            responseMimeType: "application/json",
            responseSchema: enhancerSchema,
        }
    });

    let generatedPrompt: string;
    let aspectRatio: '1:1' | '9:16' | '16:9' | '4:3' | '3:4';
    try {
        const parsedResponse = JSON.parse(enhancerResponse.text);
        generatedPrompt = parsedResponse.generatedPrompt;
        const validRatios = ["1:1", "9:16", "16:9", "4:3", "3:4"];
        aspectRatio = validRatios.includes(parsedResponse.aspectRatio) ? parsedResponse.aspectRatio : '1:1';
    } catch (e) {
        console.error("Failed to parse enhancer response, falling back.", e, enhancerResponse.text);
        generatedPrompt = "A photorealistic image of a Greatek partner product in a professional setting."; // Fallback prompt
        aspectRatio = '1:1';
    }

    const imageGenResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: generatedPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
    });

    const base64ImageBytes: string = imageGenResponse.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

    let adCopy: AdCopy | undefined = undefined;
    if (prompt.toLowerCase().includes('anúncio')) {
        const adCopySystemInstruction = `Você é um copywriter de marketing sênior especializado em criar textos para anúncios de redes sociais.
        Sua tarefa é, com base no pedido original do usuário, gerar um pacote de textos para um anúncio.
        O resultado DEVE ser um JSON válido.
        O JSON deve conter:
        - "headline": Um título principal curto e impactante (máx 5 palavras).
        - "description": Uma descrição curta do produto ou da oferta (máx 15 palavras).
        - "highlights": Um array com EXATAMENTE 3 pontos de destaque curtos (máx 3 palavras cada), como "Estoque Limitado", "Descontos Exclusivos", "Condições Especiais".
        - "cta": Um Call-to-Action (chamada para ação) claro e direto (máx 3 palavras), como "SAIBA MAIS", "COMPRE AGORA".`;
        
        const adCopySchema = {
            type: Type.OBJECT,
            properties: {
                headline: { type: Type.STRING },
                description: { type: Type.STRING },
                highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
                cta: { type: Type.STRING }
            }
        };

        const adCopyResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Pedido do usuário: "${prompt}"`,
            config: {
                systemInstruction: adCopySystemInstruction,
                responseMimeType: "application/json",
                responseSchema: adCopySchema,
            }
        });

        try {
            adCopy = JSON.parse(adCopyResponse.text);
        } catch(e) {
            console.error("Failed to parse ad copy JSON:", adCopyResponse.text);
            adCopy = {
                headline: "Oferta Imperdível",
                description: "A solução que você precisa com a qualidade que você confia.",
                highlights: ["Qualidade Garantida", "Pronta Entrega", "Preço Justo"],
                cta: "Saiba Mais"
            };
        }
    }
    
    const partnerData = adCopy ? findPartnerData(prompt) : null;

    return {
        imageUrl,
        generatedPrompt,
        originalPrompt: prompt,
        adCopy,
        partnerLogoUrl: partnerData?.logoUrl,
        referenceImage: attachments?.[0],
        aspectRatio: aspectRatio
    };
};

export const runImageEditingQuery = async (base64Data: string, mimeType: string, prompt: string, signal?: AbortSignal): Promise<string> => {
    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };
    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [imagePart, textPart],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        
        let textResponse = '';
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                textResponse += part.text;
            }
        }

        if (textResponse) {
            throw new Error(`A IA retornou uma mensagem: "${textResponse.trim()}"`);
        }
    }

    throw new Error('A IA não retornou uma imagem editada. A resposta pode ter sido bloqueada ou está em um formato inesperado.');
};