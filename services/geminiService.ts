import { GoogleGenAI, Type } from "@google/genai";
import { AppMode, PageOptimizationPackage } from '../types';
import { SYSTEM_PROMPT } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getPageOptimizationSchema = () => ({
  type: Type.OBJECT,
  properties: {
    url: { type: Type.STRING },
    title: { type: Type.STRING, description: 'Título otimizado com no máximo 60 caracteres.' },
    meta_description: { type: Type.STRING, description: 'Meta descrição otimizada com no máximo 155 caracteres.' },
    h1: { type: Type.STRING, description: 'Cabeçalho H1 único e otimizado.' },
    h2: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Lista de subtítulos H2 sugeridos.' },
    faqs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          q: { type: Type.STRING },
          a: { type: Type.STRING }
        },
        required: ['q', 'a']
      }
    },
    internal_links: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          anchor: { type: Type.STRING },
          target: { type: Type.STRING }
        },
        required: ['anchor', 'target']
      }
    },
    schema_jsonld: { type: Type.STRING, description: 'Um JSON-LD válido como uma string. Ex: FAQPage, Article.' },
    ab_test_meta: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          variant: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ['variant', 'title', 'description']
      }
    },
    tech_checklist: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ['url', 'title', 'meta_description', 'h1', 'h2', 'faqs', 'internal_links', 'schema_jsonld', 'ab_test_meta', 'tech_checklist']
});

const getPromptForMode = (mode: AppMode, userPrompt: string): string => {
  let prompt = '';
  
  switch (mode) {
    case AppMode.PAGE:
      prompt = `Otimize a página ${userPrompt}. Entregue o pacote completo de otimização no formato JSON solicitado. Se faltar algum dado para a análise, marque o campo correspondente como "N/D". Siga estritamente os limites de caracteres para título e meta descrição.`;
      break;
    case AppMode.SALES_ASSISTANT:
      prompt = `Aja como um assistente de vendas especialista. A dor do cliente é: "${userPrompt}". Sua tarefa é analisar essa necessidade e fornecer uma resposta comercial e técnica, em formato de chat/conversa, para ajudar o vendedor. 
      Siga estas regras OBRIGATORIAMENTE:
      1.  Baseie 100% da sua resposta nas informações, produtos e soluções disponíveis no site https://www.greatek.com.br/. Não invente produtos ou especificações.
      2.  Posicione a Greatek como uma DISTRIBUIDORA. A Greatek não fabrica produtos como OLTs, ONUs, etc. Ela distribui produtos de marcas parceiras.
      3.  Ao falar de produtos, use o formato "Produto X da Marca Y, parceira da Greatek" ou "Na Greatek você encontra as soluções de rede da TP-Link".
      4.  Use a terminologia correta: "máquinas de fusão". Se aplicável, cite modelos como "Máquina de Fusão X6" e "Máquina de Fusão GFSUIONpro". NUNCA use "fusionadoras de fibra".
      5.  Sugira produtos e soluções reais das parceiras da Greatek (como Sunwoda, TP-Link, etc.) que resolvam o problema do cliente. Seja íntegro e preciso.`;
      break;
    case AppMode.AUDIT:
      prompt = `Realize uma auditoria técnica para "${userPrompt}". Liste os problemas encontrados em formato Markdown, ordenados por impacto. Para cada problema, inclua uma descrição, a ação recomendada e o responsável sugerido (dev/conteúdo/infra).`;
      break;
    case AppMode.CONTENT:
      prompt = `Crie um conteúdo para marketing com base na seguinte solicitação: "${userPrompt}". Gere o texto no formato Markdown. Se for para redes sociais, inclua sugestões de título, legenda, hashtags e CTAs. Permita ajustar o tom de voz se solicitado (ex: "tom mais técnico").`;
      break;
    case AppMode.CAMPAIGN:
      prompt = `Desenvolva ideias para uma campanha de marketing sobre "${userPrompt}". Entregue em formato Markdown. Inclua sugestões de: 1. Nomes criativos para a campanha. 2. Slogans. 3. Ações de engajamento para o público B2B (ISPs). 4. Temas para posts e e-mails.`;
      break;
    case AppMode.COMPLIANCE:
      prompt = `Crie um comunicado de endomarketing ou compliance sobre o tema: "${userPrompt}". O texto deve ser claro, objetivo e alinhado à cultura da Greatek. Se for um tema sensível, adote um tom formal e informativo. Formate a saída em Markdown.`;
      break;
    case AppMode.MARKET_INTEL:
      prompt = `Aja como um analista de inteligência de mercado. A solicitação é: "${userPrompt}". Crie um relatório em Markdown que inclua: 1. Uma tabela comparativa clara entre os produtos mencionados. 2. Após a tabela, uma análise comercial detalhada, justificando os pontos fortes e os diferenciais competitivos dos produtos das parceiras da Greatek em relação aos concorrentes.`;
      break;
    default:
      prompt = userPrompt;
  }
  return prompt;
};


export const runGeminiQuery = async (mode: AppMode, userPrompt: string): Promise<PageOptimizationPackage | string> => {
  const model = 'gemini-2.5-flash';
  const fullPrompt = getPromptForMode(mode, userPrompt);
  
  try {
    if (mode === AppMode.PAGE) {
      const response = await ai.models.generateContent({
        model: model,
        contents: fullPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: getPageOptimizationSchema(),
        },
      });
      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as PageOptimizationPackage;
    } else {
      const response = await ai.models.generateContent({
        model: model,
        contents: fullPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
        },
      });
      return response.text;
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Falha na comunicação com a API Gemini: ${error.message}`);
    }
    throw new Error("Ocorreu um erro desconhecido ao chamar a API Gemini.");
  }
};