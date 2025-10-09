

import { GoogleGenAI, Type, Modality, Content } from "@google/genai";
import { 
    AppMode, 
    Message, 
    Attachment, 
    ImageAdPackage, 
    AdCopy, 
    isAdCopy,
    CustomerDossier,
    GroundingSource,
    TrainingAnalysisReport,
    GoalComparisonState,
} from '../types';
import { SYSTEM_PROMPT } from "../constants";
import { FULL_KNOWLEDGE_BASE_TEXT, KNOWLEDGE_BASE_SKYWATCH } from './knowledgeBase';

// Correct initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This file is now a proper module. The raw text from the original file is moved to a constant.
const CUSTOMER_DOSSIER_PROMPT = `Você é um "Analista de Inteligência de Negócios" sênior. Sua tarefa é receber o nome de uma empresa e criar um dossiê completo sobre ela para ajudar um vendedor a se preparar para uma reunião.
**PROCESSO OBRIGATÓRIO:**
1.  Use a ferramenta de busca (Google Search) para encontrar informações públicas e atualizadas sobre a empresa-alvo. **PRIORIZE** informações dos links oficiais da empresa, como páginas "sobre", "produtos", "noticias", "blog", "solucoes", "servicos", etc. (exemplos: cliente.com.br/sobre, cliente.com.br/produtos).
2.  Estruture sua resposta **ESTRITAMENTE** no formato Markdown a seguir. Não adicione nenhum texto ou explicação fora deste formato.

\`\`\`markdown
# Dossiê de Inteligência: {Nome da Empresa}

## 📌 Resumo da Empresa
(Um resumo conciso sobre a empresa: o que ela faz, onde atua, seu porte aproximado, principais clientes e diferenciais de mercado.)

## 👥 Pessoas-Chave
| Nome | Cargo | Observações |
|---|---|---|
| (Nome da pessoa) | (Cargo, ex: CEO, Diretor de TI) | (Breve descrição ou link do LinkedIn, se encontrar) |

## 📰 Últimas Notícias e Posts
(Liste de 3 a 5 notícias ou posts recentes, com um breve resumo de cada um. Ideal para iniciar conversas.)
*   **{Título da Notícia 1}:** {Resumo da notícia}.
*   **{Título da Notícia 2}:** {Resumo da notícia}.

## 📦 Produtos e Serviços Principais
(Liste os principais produtos ou serviços oferecidos pela empresa, com uma breve descrição do que cada um faz.)
*   **{Produto/Serviço 1}:** {Descrição}.
*   **{Produto/Serviço 2}:** {Descrição}.

## ⚡️ Dores e Desafios (Inferidos)
(Com base na sua pesquisa, infira de 3 a 4 possíveis desafios que a empresa enfrenta. Apresente como cards destacados. **NÃO** inclua o texto "Título da Dor" na sua resposta, apenas o desafio real.)
[CARD_START]
**Escalabilidade de Rede:** Descrição do porquê isso pode ser um problema para a empresa.
[CARD_END]
[CARD_START]
**Custos de Energia:** Descrição do porquê isso pode ser um problema.
[CARD_END]

## 💬 Ganchos para Conversa
(Sugira 3 perguntas ou comentários inteligentes para o vendedor usar na reunião, baseados nas informações coletadas.)
*   "{Gancho de conversa 1}"
*   "{Gancho de conversa 2}"

## 💡 Soluções Greatek Recomendadas
(**PROCESSO ABSOLUTO E OBRIGATÓRIO PARA ESTA SEÇÃO - ANÁLISE EM 3 NÍVEIS:**
1.  **NÍVEL 1 (CORRESPONDÊNCIA DIRETA):** Primeiro, analise os itens que você listou na seção "Produtos e Serviços Principais". Busque na **BASE DE CONHECIMENTO INTERNA** por produtos que atendam **diretamente** a essas ofertas. Ex: Se a empresa vende "Segurança Eletrônica", priorize produtos da linha \`VIGI\`. Se atua com "Redes Corporativas", priorize \`Omada\`.
2.  **NÍVEL 2 (SOLUÇÃO DE DORES):** Em seguida, analise a seção "Dores e Desafios (Inferidos)" que você criou. Recomende produtos da BASE DE CONHECIMENTO que resolvem **diretamente** essas dores. Ex: Se a dor é "Custos de Energia", recomende a \`Bateria Sunwoda\` ou \`Fonte Retificadora XPS\` e justifique na tabela que é para mitigar esse custo específico.
3.  **NÍVEL 3 (INFRAESTRUTURA ESSENCIAL - FALLBACK):** **SOMENTE SE** os níveis 1 e 2 resultarem em menos de 3 produtos, complete a lista até o mínimo de 3 usando produtos de infraestrutura geral (ex: 'Rack de Parede Volt', 'Máquina de Fusão Óptica X6'). Justifique-os como fundamentais para a operação de qualquer empresa do setor.
4.  **REGRAS INEGOCIÁVEIS:**
    *   A tabela DEVE conter no mínimo 3 e no máximo 5 produtos.
    *   A tabela **NUNCA PODE FICAR VAZIA**.
    *   A coluna "Justificativa da Recomendação" deve ser específica, explicando qual nível de análise (1, 2 ou 3) levou àquela sugestão (ex: "Para atender à sua oferta de Segurança Eletrônica" ou "Para ajudar a reduzir os altos custos de energia inferidos").

| Produto Greatek | Código | Área de Negócio | Justificativa da Recomendação |
|---|---|---|---|
| {Nome do Produto 1} | {Código do Produto 1} | {Ex: Segurança Eletrônica} | {Explicação baseada na análise de 3 níveis.} |
| {Nome do Produto 2} | {Código do Produto 2} | {Ex: Redução de Custos} | {Explicação baseada na análise de 3 níveis.} |
| {Nome do Produto 3} | {Código do Produto 3} | {Ex: Infraestrutura Geral} | {Explicação baseada na análise de 3 níveis.} |
... (até 5 produtos)
\`\`\`
`;

const getSystemInstruction = (mode: AppMode, options: any = {}): string => {
    const baseInstruction = `${SYSTEM_PROMPT} Você está atuando como o agente "${mode}".`;
    const knowledgeBase = options.userKnowledge && options.userKnowledge.length > 0
        ? `\n\n--- INÍCIO DA BASE DE CONHECIMENTO DO USUÁRIO (PRIORIDADE MÁXIMA) ---\n${options.userKnowledge.map((p: any) => `### ${p.name}\n- Detalhes: ${p.details}\n- Palavras-chave: ${p.keywords.join(', ')}`).join('\n\n')}\n--- FIM DA BASE DE CONHECIMENTO DO USUÁRIO ---\n\n${FULL_KNOWLEDGE_BASE_TEXT}`
        : FULL_KNOWLEDGE_BASE_TEXT;
    
    switch (mode) {
        case AppMode.INTEGRATOR:
            return `${baseInstruction} Sua especialidade é criar soluções completas e detalhadas, combinando múltiplos produtos do portfólio Greatek para atender a cenários complexos de clientes (provedores de internet, empresas, etc.). Especifique os produtos, suas funções na solução e crie um diagrama ou topologia simples em markdown. ${knowledgeBase}`;
        
        case AppMode.INSTRUCTOR:
            return `${baseInstruction} Sua tarefa é criar um kit de treinamento completo sobre um produto específico. A resposta DEVE ser um JSON. ${knowledgeBase}`;
        
        case AppMode.PAGE:
            return `${baseInstruction} Sua tarefa é analisar a URL de uma página e o contexto do histórico de chat para gerar um pacote completo de otimização de SEO. A resposta DEVE ser um JSON.`;
        
        case AppMode.SALES_ASSISTANT:
            return `${baseInstruction} Sua função é atuar como um vendedor consultivo. Dado um cenário ou necessidade do cliente, você deve recomendar o produto mais adequado do portfólio Greatek e fornecer argumentos de venda claros e convincentes. ${knowledgeBase}`;

        case AppMode.MARKET_INTEL:
             return `${baseInstruction} Sua tarefa é comparar um produto Greatek com um concorrente, usando a ferramenta de busca para obter dados atualizados. Gere um relatório de inteligência de mercado. A resposta DEVE ser um JSON. ${knowledgeBase}`;
        
        case AppMode.CONTENT:
            return `${baseInstruction} Você é um Diretor de Criação de conteúdo para mídias sociais e blogs. Crie pacotes de conteúdo sobre produtos ou temas. A resposta DEVE ser um JSON. ${knowledgeBase}`;
        
        case AppMode.SKYWATCH:
            return `${baseInstruction} Sua especialidade é a solução de monitoramento SkyWatch da Greatek. Responda a perguntas e ajude na venda, usando a base de conhecimento específica do SkyWatch. ${KNOWLEDGE_BASE_SKYWATCH} ${knowledgeBase}`;

        case AppMode.PRESENTATION_BUILDER:
             return `${baseInstruction} Sua tarefa é criar um roteiro completo de apresentação com ${options.numberOfSlides || 8} slides. A resposta DEVE ser um JSON.`;
        
        case AppMode.CUSTOMER_DOSSIER:
            if(options.isFollowUp) {
                return `${baseInstruction} O usuário está fazendo uma pergunta de acompanhamento sobre o dossiê que você gerou. Use a ferramenta de busca, se necessário, para encontrar informações adicionais e responder à pergunta. ${knowledgeBase}`;
            }
            return CUSTOMER_DOSSIER_PROMPT + '\n' + knowledgeBase;
        
        default:
            return `${baseInstruction} ${knowledgeBase}`;
    }
};

export const generateConversationTitle = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Gere um título curto e conciso (máximo 5 palavras) para uma conversa que começa com a seguinte pergunta do usuário: "${prompt}"`,
        });
        return response.text.replace(/"/g, '').trim();
    } catch (error) {
        console.error("Error generating title:", error);
        return "Nova Conversa";
    }
};

export const runGeminiJsonQuery = async (mode: AppMode, history: Message[], signal: AbortSignal, options?: any): Promise<any> => {
    const lastUserMessage = history[history.length - 1];
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: lastUserMessage.content as string,
        config: {
            systemInstruction: getSystemInstruction(mode, options),
            responseMimeType: "application/json",
        }
    });

    try {
        return JSON.parse(response.text);
    } catch(e) {
        console.error("Failed to parse JSON response:", e, "Raw text:", response.text);
        throw new Error("A IA retornou um formato de dados inválido. Tente novamente.");
    }
};

export async function* streamGeminiQuery(mode: AppMode, history: Message[], signal: AbortSignal, options?: any): AsyncGenerator<string> {
    const lastUserMessage = history[history.length - 1];
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: lastUserMessage.content as string,
        config: {
            systemInstruction: getSystemInstruction(mode, options),
        }
    });

    for await (const chunk of responseStream) {
        if (signal.aborted) {
            console.log("Stream aborted by user.");
            return;
        }
        yield chunk.text;
    }
}

export async function* streamGoalComparisonAnalysis(
    data: { prev: any; curr: any },
    signal: AbortSignal
): AsyncGenerator<string> {
    const prompt = `
        Você é um analista de vendas sênior e especialista em performance comercial. Sua tarefa é analisar e comparar os resultados de vendas de dois meses de forma técnica e cortês.

        **Dados do Mês Anterior:**
        - Meta de Vendas: ${data.prev.goal}
        - Vendas Realizadas: ${data.prev.sold}
        - Taxa de Conversão: ${data.prev.conversionRate}
        - Ticket Médio: ${data.prev.avgTicket}

        **Dados do Mês Atual:**
        - Meta de Vendas: ${data.curr.goal}
        - Vendas Realizadas: ${data.curr.sold}
        - Taxa de Conversão: ${data.curr.conversionRate}
        - Ticket Médio: ${data.curr.avgTicket}

        Com base nesses dados, forneça uma análise concisa em markdown. Siga esta estrutura:

        ### Análise Comparativa de Performance

        **Resumo Geral:**
        (Faça um breve parágrafo resumindo a performance geral do Mês Atual em comparação com o Mês Anterior.)

        **Análise por Métrica:**
        *   **Vendas Realizadas:** Comente sobre o crescimento ou queda nas vendas, relacionando com a meta e o resultado do mês anterior.
        *   **Taxa de Conversão:** Analise a variação na eficiência de fechamento de propostas. Uma taxa maior é positiva, mesmo que o volume de vendas tenha caído, pois indica maior assertividade.
        *   **Ticket Médio:** Comente sobre a variação no valor médio por venda. Um aumento indica vendas de maior valor ou mix de produtos mais rentável.

        **Recomendações:**
        (Forneça uma ou duas recomendações acionáveis com base nos dados. Se a conversão caiu, sugira revisar a qualificação de leads. Se o ticket médio caiu, sugira focar em upsell ou produtos de maior valor agregado.)
    `;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    for await (const chunk of responseStream) {
        if (signal.aborted) {
            return;
        }
        yield chunk.text;
    }
}

export const generateImageAd = async (prompt: string, attachments?: Attachment[], aspectRatio?: string): Promise<ImageAdPackage> => {
    const imageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `fotografia cinematográfica de um anúncio de produto. ${prompt}`,
        config: {
            numberOfImages: 1,
            aspectRatio: aspectRatio || "1:1"
        }
    });

    const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
    
    const adCopyResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Crie uma cópia de anúncio para um produto descrito como "${prompt}". A resposta deve ser um JSON com os campos: headline (string), description (string), highlights (array de 3 strings curtas) e cta (string).`,
        config: { responseMimeType: "application/json" }
    });
    
    let adCopy: AdCopy = { headline: "Produto Incrível", description: "Compre agora!", highlights: ["Destaque 1"], cta: "Saber Mais" };
    try {
        const parsedCopy = JSON.parse(adCopyResponse.text);
        if (isAdCopy(parsedCopy)) {
            adCopy = parsedCopy;
        }
    } catch (e) { console.error("Failed to parse ad copy JSON", e); }


    return {
        imageUrl,
        generatedPrompt: `fotografia cinematográfica de um anúncio de produto. ${prompt}`,
        originalPrompt: prompt,
        adCopy,
        aspectRatio: aspectRatio || "1:1"
    };
};

export const runImageEditingQuery = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: base64Data, mimeType: mimeType } },
                { text: prompt },
            ]
        },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] }
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    throw new Error("Nenhuma imagem foi retornada pela API de edição.");
};

// This function seems unused in the app but is imported. Providing a stub.
export const runImageCompositionQuery = async (prompt: string): Promise<any> => {
    console.warn("runImageCompositionQuery is not implemented.");
    return {};
};

export const runDossierQuery = async (history: Message[], signal: AbortSignal): Promise<CustomerDossier> => {
    const lastUserMessage = history[history.length - 1];
    const companyName = lastUserMessage.content as string;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: companyName,
        config: {
            systemInstruction: getSystemInstruction(AppMode.CUSTOMER_DOSSIER),
            tools: [{ googleSearch: {} }],
        },
    });
    
    const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        uri: chunk.web?.uri || '',
        title: chunk.web?.title || '',
    })) || [];

    return {
        company_name: companyName,
        markdown_content: response.text,
        sources: sources,
    };
};

export const getTrainingAnalysis = async (transcript: string): Promise<TrainingAnalysisReport> => {
    const prompt = `Você é um "Coach de Vendas" especialista. Sua tarefa é analisar a transcrição de uma simulação de vendas e fornecer um feedback construtivo. A transcrição contém diálogos entre "Vendedor" (o usuário) e "Cliente" (a IA).

Analise a transcrição a seguir:
---
${transcript}
---

Sua resposta DEVE ser um objeto JSON com a seguinte estrutura:
{
  "score": <um número de 0 a 10 representando a performance geral do vendedor>,
  "summary": "<um resumo conciso de uma frase sobre o desempenho do vendedor>",
  "strengths": [<um array de strings com 2 a 3 pontos fortes específicos da performance do vendedor>],
  "areas_for_improvement": [<um array de strings com 2 a 3 pontos específicos que o vendedor pode melhorar>],
  "suggested_arguments": [
    {
      "title": "<um título para um argumento de venda que o vendedor poderia ter usado>",
      "explanation": "<uma explicação de como e por que usar esse argumento>"
    }
  ],
  "objection_handling": [
    {
      "objection": "<uma objeção levantada pelo cliente que poderia ser melhor contornada>",
      "suggestion": "<uma sugestão de como o vendedor poderia ter respondido melhor a essa objeção>"
    }
  ]
}`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text);
};