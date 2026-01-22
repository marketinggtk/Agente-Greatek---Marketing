
import { GoogleGenAI, Type, Schema, FunctionDeclaration } from "@google/genai";
import { AppMode, Message, ImageAdPackage, TrainingAnalysisReport, CustomerDossier } from "../types";
import { FULL_KNOWLEDGE_BASE_TEXT, KNOWLEDGE_BASE_SKYWATCH } from "./knowledgeBase";
import { SYSTEM_PROMPT } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CUSTOMER_DOSSIER_PROMPT = `
Atue como um especialista em Inteligência Comercial (BI) e Vendas Consultivas.
Seu objetivo é criar um **Dossiê de Cliente** completo para preparar um vendedor antes de uma reunião.
Pesquise profundamente sobre a empresa solicitada na web.

**Estrutura do Dossiê (Markdown):**
# Nome da Empresa
## Resumo da Empresa
## Pessoas-Chave (Tabela com Nome e Cargo)
## Últimas Notícias e Posts
## Produtos e Serviços Principais
## Dores e Desafios (Inferidos pelo setor e notícias)
[CARD_START]
**Título da Dor:** Descrição...
[CARD_END]
## Ganchos para Conversa
## Soluções Greatek Recomendadas
(Tabela relacionando dores com produtos Greatek conhecidos)
`;

interface PromptOptions {
    isFollowUp?: boolean;
}

const getSystemInstruction = (mode: AppMode, options: PromptOptions = {}) => {
    const baseInstruction = SYSTEM_PROMPT;
    const knowledgeBase = FULL_KNOWLEDGE_BASE_TEXT;

    switch (mode) {
        case AppMode.CUSTOMER_DOSSIER:
            if (options.isFollowUp) {
                return `${baseInstruction} O usuário está fazendo uma pergunta de acompanhamento sobre o dossiê que você gerou. Use a ferramenta de busca, se necessário, para encontrar informações adicionais e responder à pergunta. ${knowledgeBase}`;
            }
            return `${CUSTOMER_DOSSIER_PROMPT}\n\nConhecimento Interno Greatek:\n${knowledgeBase}`;

        case AppMode.SKYWATCH:
            return `${baseInstruction}\n\nConhecimento Específico SkyWatch:\n${KNOWLEDGE_BASE_SKYWATCH}\n\nConhecimento Geral:\n${knowledgeBase}`;

        case AppMode.CONTENT_PLANNER:
            return `${baseInstruction} Você é um estrategista de conteúdo. Gere um plano mensal em JSON seguindo a estrutura ContentPlan.`;

        case AppMode.LEAD_HUNTER:
            return `${baseInstruction} Você é um especialista em prospecção B2B. Use a busca do Google para encontrar leads qualificados. Retorne APENAS um JSON array.`;

        default:
            return `${baseInstruction}\n\nBase de Conhecimento:\n${knowledgeBase}`;
    }
};

const getHistoryContent = (history: Message[]) => {
    return history.map(msg => ({
        role: msg.role === 'agent' ? 'model' : 'user',
        parts: [{ text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) }]
    }));
};

const cleanJsonText = (text: string): string => {
    let cleaned = text.trim();
    
    // 1. Remove markdown code blocks (case insensitive)
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');

    // 2. Extract JSON substring if there's chatter around it
    const firstBrace = cleaned.search(/[\{\[]/);
    const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    
    if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    // 3. Fix common JSON syntax errors from LLMs (e.g., unquoted keys like { Day: "..." })
    // Regex targets keys (words) that are preceded by { or , and followed by :
    cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

    return cleaned;
};

export const runGeminiJsonQuery = async (mode: AppMode, history: Message[], signal?: AbortSignal): Promise<any> => {
    const systemInstruction = getSystemInstruction(mode);
    const contents = getHistoryContent(history);

    // Determines if search is absolutely necessary.
    // Enabling search prevents us from using responseMimeType: 'application/json' (API Constraint).
    const needsSearch = (mode === AppMode.LEAD_HUNTER || mode === AppMode.CUSTOMER_DOSSIER || mode === AppMode.MARKET_INTEL);
    
    // If search is needed, we cannot force JSON mime type in config (it throws 400).
    // We must rely on the prompt to request JSON.
    // If search is NOT needed, we enforce JSON mode for reliability.
    const useJsonMode = !needsSearch;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: useJsonMode ? 'application/json' : undefined,
            tools: needsSearch ? [{ googleSearch: {} }] : undefined
        }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    
    try {
        const cleanedText = cleanJsonText(text);
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("Failed to parse JSON", text);
        // If parsing fails but we really needed JSON, we might want to return text or throw.
        // For now, returning text might break some viewers, but allows debugging.
        return text;
    }
};

export const streamGeminiQuery = async function* (mode: AppMode, history: Message[], signal?: AbortSignal) {
    const systemInstruction = getSystemInstruction(mode);
    const contents = getHistoryContent(history);

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    for await (const chunk of responseStream) {
        if (signal?.aborted) break;
        yield chunk.text || '';
    }
};

export const runDossierQuery = async (history: Message[], signal?: AbortSignal): Promise<CustomerDossier> => {
    const systemInstruction = getSystemInstruction(AppMode.CUSTOMER_DOSSIER);
    const contents = getHistoryContent(history);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: systemInstruction,
            tools: [{ googleSearch: {} }]
        }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
        .map((chunk: any) => chunk.web ? { uri: chunk.web.uri, title: chunk.web.title } : null)
        .filter((s: any) => s !== null);

    let companyName = "Empresa Alvo";
    const lastUserMsg = history[history.length - 1].content;
    if (typeof lastUserMsg === 'string') {
         const match = lastUserMsg.match(/dossiê (?:para|da|de) (.*)/i);
         if (match) companyName = match[1];
    }

    return {
        company_name: companyName,
        markdown_content: response.text || '',
        sources: sources
    };
};

export const generateConversationTitle = async (firstMessage: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Gere um título curto (máx 5 palavras) para uma conversa que começa com: "${firstMessage}"`,
    });
    return response.text?.trim().replace(/^"|"$/g, '') || 'Nova Conversa';
};

export const generateImageAd = async (prompt: string): Promise<ImageAdPackage> => {
    // 1. Generate Image
    const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: prompt }]
        },
        config: {
            imageConfig: { aspectRatio: '1:1' }
        }
    });

    let imageUrl = '';
    if (imageResponse.candidates?.[0]?.content?.parts) {
        for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData) {
                imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }
    }

    if (!imageUrl) throw new Error("Falha ao gerar imagem.");

    // 2. Generate Ad Copy
    const copyResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Crie um texto publicitário curto para um anúncio com a imagem descrita como: "${prompt}".
        Retorne JSON: { headline, description, highlights: [], cta }`,
        config: { responseMimeType: 'application/json' }
    });

    const adCopy = JSON.parse(copyResponse.text || '{}');

    return {
        imageUrl,
        generatedPrompt: prompt,
        originalPrompt: prompt,
        adCopy,
        aspectRatio: '1:1'
    };
};

export const streamGoalComparisonAnalysis = async function* (data: any, signal?: AbortSignal) {
    const prompt = `
    Atue como um **Especialista Sênior em Performance de Vendas e Estratégia Comercial**.
    Sua missão é realizar uma análise densa, técnica e explicativa comparando o desempenho entre o Mês Anterior e o Mês Atual.

    **DADOS PARA ANÁLISE:**
    ${JSON.stringify(data)}

    **DIRETRIZES DA ANÁLISE:**

    1.  **Análise de Cenário (Dias Úteis & Ritmo):**
        *   Compare os dias úteis. Se o mês atual tem menos dias, calcule e explique se a queda é proporcional ou se há uma queda real de ritmo diário.
        *   Se o mês atual tem mais dias, a performance deveria ser obrigatoriamente superior.

    2.  **Diagnóstico de Performance (Positivo vs Negativo):**
        *   **Não seja superficial.** Se a venda caiu, foi por falta de propostas (topo de funil) ou baixa conversão (fundo de funil)?
        *   Analise o **Ticket Médio**: Estamos vendendo mais barato para fechar meta? Ou estamos conseguindo agregar valor?

    3.  **Estrutura da Resposta (Formato Markdown Rigoroso):**
        *   Use **[DIAGNOSTICO_START]** e **[DIAGNOSTICO_END]** para criar um card de destaque inicial com o "Veredito do Mês".
        *   Crie uma seção **"Pontos Fortes & Evolução"**: Cite métricas que estão acima da média ou melhoraram. Dê parabéns estratégico.
        *   Crie uma seção **"Pontos Críticos & Atenção"**: Cite métricas em queda. Seja direto. Ex: "A conversão caiu X%, o que indica perda de eficiência no fechamento".
        *   Crie uma seção **"Plano de Ação Tático"**: Dê 3 ações concretas para reverter o cenário negativo ou acelerar o positivo ainda neste mês.

    **TOM DE VOZ:**
    Profissional, analítico, motivador mas realista. Foque em métricas de melhoria.
    `;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    for await (const chunk of responseStream) {
        if (signal?.aborted) break;
        yield chunk.text || '';
    }
};

export const getTrainingAnalysis = async (transcript: string): Promise<TrainingAnalysisReport> => {
    const prompt = `Analise a seguinte transcrição de treinamento de vendas:\n\n${transcript}\n\nAvalie a performance do vendedor, identifique pontos fortes, fracos e dê sugestões. Retorne JSON conforme TrainingAnalysisReport.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });

    return JSON.parse(response.text || '{}');
};
