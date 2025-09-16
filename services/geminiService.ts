



import { GoogleGenAI, Type } from "@google/genai";
import { AppMode, PageOptimizationPackage, MarketIntelReport, Message, TrainingKitReport, VigiaReport, NetworkArchitectureReport } from '../types';
import { SYSTEM_PROMPT } from '../constants';
import { KNOWLEDGE_BASE_PRODUCTS, PARTNER_COMPANIES } from './knowledgeBase';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const INTEGRATOR_SYSTEM_PROMPT = `Você é o **"Integrador"**, um consultor de vendas sênior da Greatek.

**FLUXO DE TRABALHO OBRIGATÓRIO:**

1.  **Análise Primária da Intenção:**
    *   A pergunta do usuário é PRIMARIAMENTE sobre "monitoramento", "SkyWatch", "qualidade da rede", "latência", "DNS" ou "jitter"?
        *   **SIM?** Vá para o **MODO DE OFERTA EXCLUSIVA SKYWATCH** (Etapa 2).
        *   **NÃO?** Vá para o **MODO DE SOLUÇÃO PADRÃO + UP-SELL** (Etapa 3).

---

**2. MODO DE OFERTA EXCLUSIVA SKYWATCH**

*   **Sua Missão:** O cliente está interessado em monitoramento. Sua única tarefa é construir uma oferta completa e detalhada para a solução **SkyWatch**. Ignore todos os outros produtos.
*   **A. Coleta de Dados:**
    *   Para dimensionar a solução SkyWatch, você PRECISA saber a **quantidade de POPs** e a **quantidade de clientes B2B dedicados**.
    *   Se o usuário não forneceu esses dados, sua **ÚNICA AÇÃO PERMITIDA** é fazer perguntas para obtê-los.
    *   **Exemplo de Pergunta:** "Excelente escolha focar na qualidade da rede. Para que eu possa dimensionar a solução SkyWatch perfeitamente para você, me informe por favor: quantos POPs sua rede possui e quantos clientes B2B dedicados você atende ou planeja atender? (Lembre-se que o NOC é sempre considerado 1)."
*   **B. Geração da Solução SkyWatch (APÓS ter os dados):**
    *   Apresente a solução no formato padrão: Tabela de Produtos, Justificativa Comercial e Ganchos Técnicos.
    *   **Regra da Tabela de Produtos:** Você DEVE criar linhas separadas na tabela para cada tipo de sonda, da seguinte forma:
        *   **Linha 1 (Obrigatória):** Categoria: "Monitoramento Inteligente", Produto: **"Sonda SkyWatch (NOC)"**, Quantidade: 1.
        *   **Linha 2 (Se houver POPs):** Categoria: "Monitoramento Inteligente", Produto: **"Sonda SkyWatch (POP)"**, Quantidade: [O número de POPs informado].
        *   **Linha 3 (Se houver Clientes B2B):** Categoria: "Monitoramento Inteligente", Produto: **"Sonda SkyWatch (Cliente B2B Dedicado)"**, Quantidade: [O número de clientes B2B informado].

---

**3. MODO DE SOLUÇÃO PADRÃO + UP-SELL**

*   **Sua Missão:** O cliente pediu por um produto ou solução específica (OLT, CTO, etc.). Sua tarefa é montar a melhor solução para essa necessidade e, ao final, fazer um up-sell inteligente com o SkyWatch.
*   **A. Coleta de Dados:**
    *   Se a solicitação for vaga (ex: "preciso de uma OLT"), sua **ÚNICA AÇÃO PERMITIDA** é fazer perguntas para obter o contexto completo (nº de assinantes, etc.). **NÃO SUGIRA PRODUTOS SEM DETALHES.**
*   **B. Geração da Solução Principal (APÓS ter os dados):**
    *   Gere uma solução focada e realista para o que foi solicitado.
    *   Use o formato padrão: Tabela de Produtos, Justificativa Comercial e Ganchos Técnicos.
*   **C. Adicionar Melhoria Final OBRIGATÓRIA:**
    *   Ao final da sua resposta, adicione a seguinte seção, sem exceções, terminando com o marcador especial:
    
        \`## Melhoria Final: Garanta a Qualidade da Experiência com SkyWatch\`
        \`Além dos equipamentos que compõem a infraestrutura, a qualidade percebida pelo seu cliente é o que realmente fideliza. Para garantir que esta nova solução entregue a melhor performance, a etapa final é implementar o **SkyWatch**, nossa plataforma de monitoramento inteligente.\`
        \`Com ele, você enxerga a rede com os olhos do seu assinante, identificando problemas de lentidão e latência antes que eles se tornem reclamações.\`
        \`[SKYWATCH_PROMPT_INTERACTIVE]\`

---

**4. FLUXO DE RESPOSTA INTERATIVA (APÓS USAR O MARCADOR):**

*   Se a **próxima mensagem do usuário** for EXATAMENTE \`"Gostaria de saber mais sobre o SkyWatch para ofertar para o cliente."\`, sua **única ação permitida** é responder com a pergunta para dimensionamento: \`"Excelente! Para que eu possa dimensionar esta melhoria para você, por favor, me informe: qual a quantidade de POPs na sua rede e quantos clientes B2B dedicados você atende?"\`
*   Se a **próxima mensagem do usuário** for EXATAMENTE \`"Não, obrigado."\`, sua **única ação permitida** é responder de forma cortês: \`"Entendido. Sem problemas! Caso necessite de algo relacionado ao SkyWatch no futuro, não hesite em me contatar. Estou à disposição para ajudar."\`

---

**DIRETRIZES GERAIS:**
*   Use \`**negrito**\` para nomes de produtos.
*   Lembre-se que a Greatek é uma **DISTRIBUIDORA**.
*   Baseie 100% das suas recomendações no **CONTEXTO TÉCNICO** fornecido.
`;

const INSTRUCTOR_SYSTEM_PROMPT = `Você é o **"Instrutor"**, um especialista em produtos da Greatek e seus parceiros. Sua missão é criar kits de treinamento completos, precisos e interativos para capacitar a equipe comercial.

**REGRAS OBRIGATÓRIAS:**
1.  **Fonte de Verdade:** Use o **CONTEXTO TÉCNICO** fornecido como sua **ÚNICA** fonte de informação. Não invente especificações, recursos ou nomes de produtos.
2.  **Formato de Saída:** Sua resposta DEVE ser um objeto JSON que siga o schema fornecido, sem exceções. Não inclua texto ou explicações fora do JSON.
3.  **Conteúdo do Kit:**
    *   **product_name:** O nome exato do produto solicitado.
    *   **key_selling_points:** Crie 3 a 5 pontos curtos e impactantes, focados em benefícios e diferenciais, que um vendedor possa usar.
    *   **technical_faq:** Elabore perguntas técnicas que um cliente faria e forneça respostas diretas e claras, baseadas no contexto.
    *   **knowledge_quiz:** Crie um quiz com **exatamente 10 perguntas** de múltipla escolha para testar o conhecimento sobre o produto. As perguntas e respostas devem ser baseadas estritamente nas informações do contexto. Para cada pergunta, forneça uma **explicação detalhada** do porquê a resposta correta é a certa.`;

const VIGIA_SYSTEM_PROMPT = `Você é **"O Vigia"**, um agente de inteligência de mercado da Greatek.
Sua missão é usar a busca do Google para monitorar ativamente a internet sobre um tópico e gerar um relatório conciso e acionável para a equipe comercial.

**REGRAS OBRIGATÓRIAS:**
1.  **Use a Busca:** Baseie sua análise nas informações mais recentes encontradas na web.
2.  **Formato de Saída:** Sua resposta DEVE ser um único objeto JSON válido, sem nenhum texto ou formatação (como \`\`\`json\`) ao redor dele.
3.  **Estrutura do JSON:**
    *   \`monitoring_topic\`: O tópico que você foi solicitado a monitorar.
    *   \`executive_summary\`: Um array de strings com os 3-4 pontos mais importantes que você encontrou.
    *   \`opportunities\`: Um array de strings listando potenciais negócio para a Greatek.
    *   \`threats\`: Um array de strings listando potenciais ameaças ou desafios.
    *   \`actionable_insight\`: Uma única string com uma sugestão clara e direta sobre o que a equipe comercial pode fazer com essa informação.`;

const ARQUITETO_SYSTEM_PROMPT = `Você é o **"Arquiteto"**, um especialista em planejamento e evolução de redes de telecomunicações da Greatek.
Sua missão é analisar o cenário de um cliente, diagnosticar gargalos e propor uma solução de upgrade, quantificando os benefícios de forma clara.

**REGRAS OBRIGATÓRIAS:**
1.  **Fonte de Verdade:** Use o **CONTEXTO TÉCNICO** fornecido (especialmente sobre produtos GPON, XGS-PON da TP-Link) como sua **ÚNICA** fonte de informação para produtos.
2.  **Formato de Saída:** Sua resposta DEVE ser um único objeto JSON válido que siga o schema fornecido, sem nenhum texto ou formatação extra.
3.  **Estrutura do Relatório:**
    *   \`diagnosis\`: Descreva de forma clara e técnica o problema ou gargalo do cenário atual do cliente.
    *   \`proposed_solution\`: Apresente a solução de upgrade (ex: Migração para XGS-PON). Inclua um título e uma breve descrição.
    *   \`benefit_simulation\`: A parte mais importante. Crie uma tabela comparativa (array de objetos) com métricas TANGÍVEIS. Compare o "antes" e o "depois". Seja específico (ex: "Velocidade média por usuário em horário de pico", "Capacidade de streams 4K simultâneos").
    *   \`commercial_arguments\`: Liste argumentos que o vendedor pode usar para convencer o cliente, traduzindo os benefícios técnicos em vantagens de negócio.
    *   \`required_products\`: Liste os produtos essenciais da Greatek e parceiros (como TP-Link) para realizar o upgrade.`;


const getPageOptimizationSchema = () => ({
  type: Type.OBJECT,
  properties: {
    url: { type: Type.STRING },
    title: { type: Type.STRING, description: 'Título otimizado com no máximo 60 caracteres.' },
    meta_description: { type: Type.STRING, description: 'Meta descrição otimizada com no máximo 155 caracteres.' },
    h1: { type: Type.STRING, description: 'Cabeçalho H1 único e otimizado.' },
    h2: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Lista de subtítulos H2 sugeridos.' },
    faqs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { q: { type: Type.STRING }, a: { type: Type.STRING } }, required: ['q', 'a']}},
    internal_links: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { anchor: { type: Type.STRING }, target: { type: Type.STRING } }, required: ['anchor', 'target']}},
    schema_jsonld: { type: Type.STRING, description: 'Um JSON-LD válido como uma string. Ex: FAQPage, Article.' },
    ab_test_meta: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { variant: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['variant', 'title', 'description']}},
    tech_checklist: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ['url', 'title', 'meta_description', 'h1', 'h2', 'faqs', 'internal_links', 'schema_jsonld', 'ab_test_meta', 'tech_checklist']
});

const getMarketIntelSchema = () => ({
  type: Type.OBJECT,
  properties: {
    sales_pitch_summary: { type: Type.STRING, description: 'Um parágrafo curto e impactante para o vendedor usar como gancho de venda.' },
    greatek_product_name: { type: Type.STRING, description: 'Nome do produto da Greatek ou do parceiro Greatek sendo comparado.' },
    competitor_product_name: { type: Type.STRING, description: 'Nome do produto concorrente.' },
    comparison_points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { feature: { type: Type.STRING }, greatek: { type: Type.STRING }, competitor: { type: Type.STRING } }, required: ['feature', 'greatek', 'competitor']}},
    competitive_advantages: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Uma lista em pontos dos diferenciais competitivos da solução Greatek/Parceiro.'},
    commercial_arguments: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Uma lista em pontos dos argumentos comerciais que um vendedor pode usar, incluindo ganchos comerciais.'}
  },
  required: ['sales_pitch_summary', 'greatek_product_name', 'competitor_product_name', 'comparison_points', 'competitive_advantages', 'commercial_arguments']
});

const getTrainingKitSchema = () => ({
  type: Type.OBJECT,
  properties: {
    product_name: { type: Type.STRING, description: "Nome exato do produto." },
    key_selling_points: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de 3 a 5 argumentos de venda curtos e impactantes." },
    technical_faq: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          q: { type: Type.STRING, description: "Pergunta técnica comum sobre o produto." },
          a: { type: Type.STRING, description: "Resposta clara e direta baseada nos dados do produto." }
        },
        required: ['q', 'a']
      }
    },
    knowledge_quiz: {
      type: Type.ARRAY,
      description: "Um array com exatamente 10 perguntas de múltipla escolha.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correct_answer: { type: Type.STRING },
          explanation: { type: Type.STRING, description: "Uma explicação detalhada do porquê a resposta correta está certa." }
        },
        required: ['question', 'options', 'correct_answer', 'explanation']
      }
    }
  },
  required: ['product_name', 'key_selling_points', 'technical_faq', 'knowledge_quiz']
});

const getNetworkArchitectureSchema = () => ({
    type: Type.OBJECT,
    properties: {
        diagnosis: { type: Type.STRING, description: "Diagnóstico técnico claro do problema no cenário atual do cliente." },
        proposed_solution: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Título da solução proposta. Ex: 'Upgrade para Rede XGS-PON'." },
                description: { type: Type.STRING, description: "Breve descrição da solução e seus principais benefícios." }
            },
            required: ['title', 'description']
        },
        benefit_simulation: {
            type: Type.ARRAY,
            description: "Array comparando métricas chave entre o cenário atual e o proposto.",
            items: {
                type: Type.OBJECT,
                properties: {
                    metric: { type: Type.STRING, description: "A métrica sendo comparada. Ex: 'Largura de Banda por Assinante'." },
                    current_scenario: { type: Type.STRING, description: "Valor da métrica no cenário atual." },
                    proposed_scenario: { type: Type.STRING, description: "Valor da métrica com a nova solução." },
                    improvement: { type: Type.STRING, description: "Descrição do ganho. Ex: '+300%' ou 'Redução de 80%'." }
                },
                required: ['metric', 'current_scenario', 'proposed_scenario', 'improvement']
            }
        },
        commercial_arguments: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Lista de argumentos de venda para o vendedor usar com o cliente."
        },
        required_products: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING, description: "Categoria do produto. Ex: 'OLT'." },
                    product: { type: Type.STRING, description: "Nome específico do produto. Ex: 'TP-Link DS-P7500-16'." },
                    suggestion: { type: Type.STRING, description: "Breve justificativa para a escolha do produto." }
                },
                required: ['category', 'product', 'suggestion']
            }
        }
    },
    required: ['diagnosis', 'proposed_solution', 'benefit_simulation', 'commercial_arguments', 'required_products']
});


const getPromptForMode = (mode: AppMode, userPrompt: string, history: Message[]): any[] => {
  const MAX_HISTORY_MESSAGES = 10; // 5 user/agent pairs
  let finalPrompt = '';
  const knowledgeBaseText = KNOWLEDGE_BASE_PRODUCTS.map(p => `## Produto: ${p.name}\n${p.details}`).join('\n\n');
  const partnerCompaniesText = PARTNER_COMPANIES.map(p => `- **${p.name} (${p.type})**: ${p.description}`).join('\n');

  const modelHistory = history.map(msg => ({
    role: msg.role === 'agent' ? 'model' : 'user',
    parts: [{ text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) }]
  }));
  
  const currentPromptObject = modelHistory.pop();
  const currentPromptText = currentPromptObject?.parts[0].text || userPrompt;
  
  const truncatedHistory = modelHistory.length > MAX_HISTORY_MESSAGES
    ? modelHistory.slice(-MAX_HISTORY_MESSAGES)
    : modelHistory;

  switch (mode) {
    case AppMode.PAGE:
      finalPrompt = `Otimize a página ${currentPromptText}. Entregue o pacote completo de otimização no formato JSON solicitado. Se faltar algum dado para a análise, marque o campo correspondente como "N/D". Siga estritamente os limites de caracteres para título e meta descrição.`;
      break;
    case AppMode.MARKET_INTEL:
      finalPrompt = `Gere o relatório de inteligência de mercado para: "${currentPromptText}". Entregue a resposta no formato JSON solicitado.`;
      break;
    case AppMode.VIGIA:
      finalPrompt = `Monitore o seguinte tópico usando a busca: "${currentPromptText}". Gere o relatório JSON conforme suas instruções.`;
      break;
    case AppMode.SALES_ASSISTANT:
    case AppMode.INTEGRATOR:
    case AppMode.INSTRUCTOR:
    case AppMode.ARQUITETO:
      finalPrompt = `Use o CONTEXTO abaixo como sua única fonte de verdade para informações de produtos e parceiros. NÃO use conhecimento externo.
      ---
      **CONTEXTO DE PRODUTOS GREATEK:**
      ${knowledgeBaseText}
      ---
      **CONTEXTO DE PARCEIROS ESTRATÉGICOS:**
      ${partnerCompaniesText}
      ---
      A solicitação do usuário é: "${currentPromptText}".
      Siga as regras do seu modo de operação para responder.`;
      break;
    default:
      finalPrompt = currentPromptText;
  }
  
  const finalPromptObject = { role: 'user', parts: [{ text: finalPrompt }] };
  return [...truncatedHistory, finalPromptObject];
};

export const runGeminiJsonQuery = async (
  mode: AppMode,
  conversationHistory: Message[],
  signal: AbortSignal
): Promise<PageOptimizationPackage | MarketIntelReport | TrainingKitReport | VigiaReport | NetworkArchitectureReport> => {
    const userPrompt = conversationHistory[conversationHistory.length - 1].content as string;
    const contents = getPromptForMode(mode, userPrompt, conversationHistory);

    let systemInstruction = SYSTEM_PROMPT;
    const config: any = {};

    if (mode === AppMode.PAGE) {
        config.responseMimeType = "application/json";
        config.responseSchema = getPageOptimizationSchema();
    } else if (mode === AppMode.MARKET_INTEL) {
        config.responseMimeType = "application/json";
        config.responseSchema = getMarketIntelSchema();
    } else if (mode === AppMode.INSTRUCTOR) {
        config.responseMimeType = "application/json";
        config.responseSchema = getTrainingKitSchema();
        systemInstruction = INSTRUCTOR_SYSTEM_PROMPT;
    } else if (mode === AppMode.ARQUITETO) {
        config.responseMimeType = "application/json";
        config.responseSchema = getNetworkArchitectureSchema();
        systemInstruction = ARQUITETO_SYSTEM_PROMPT;
    } else if (mode === AppMode.VIGIA) {
        systemInstruction = VIGIA_SYSTEM_PROMPT;
        config.tools = [{googleSearch: {}}];
    } else {
        throw new Error(`Modo não suportado para query JSON: ${mode}`);
    }
    
    config.systemInstruction = systemInstruction;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config,
    });

  // Fix: The `signal` property is not supported. Check for abort after the request
  // has finished but before processing to preserve cancellation behavior.
  if (signal.aborted) {
    const abortError = new Error("Request aborted by user.");
    abortError.name = "AbortError";
    throw abortError;
  }

  try {
    let jsonText = response.text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(jsonText);

    if (mode === AppMode.VIGIA) {
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
          result.sources = groundingChunks
              .filter((chunk: any) => chunk.web)
              .map((chunk: any) => ({
                  uri: chunk.web.uri,
                  title: chunk.web.title,
              }));
      }
    }
    
    return result;
  } catch (e) {
    console.error(`Erro ao analisar JSON para o modo ${mode}:`, e);
    throw new Error(`A resposta da IA para ${mode} não estava no formato JSON esperado.`);
  }
};

export async function* streamGeminiQuery(
  mode: AppMode,
  conversationHistory: Message[],
  signal: AbortSignal
): AsyncGenerator<string> {
  const userPrompt = conversationHistory[conversationHistory.length - 1].content as string;
  const contents = getPromptForMode(mode, userPrompt, conversationHistory);
  
  const systemInstruction = mode === AppMode.INTEGRATOR ? INTEGRATOR_SYSTEM_PROMPT : SYSTEM_PROMPT;

  const responseStream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents,
    config: {
      systemInstruction,
    },
  });

  for await (const chunk of responseStream) {
    // Fix: The `signal` property is not supported. This check preserves cancellation
    // behavior by stopping the stream if an abort is requested.
    if (signal.aborted) {
      const abortError = new Error("Stream generation aborted by user.");
      abortError.name = "AbortError";
      throw abortError;
    }
    yield chunk.text;
  }
}

export const generateConversationTitle = async (prompt: string): Promise<string> => {
    try {
        const titleSchema = {
            type: Type.OBJECT,
            properties: {
                title: { 
                    type: Type.STRING, 
                    description: 'Um título curto e conciso de no máximo 4 palavras.' 
                }
            },
            required: ['title']
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Gere um título para uma conversa de chat que começa com a seguinte pergunta do usuário: "${prompt}"`,
            config: {
              systemInstruction: "Você é um gerador de títulos para chats. Responda apenas com o JSON solicitado.",
              responseMimeType: "application/json",
              responseSchema: titleSchema,
              thinkingConfig: { thinkingBudget: 0 }
            }
        });
        
        const jsonText = response.text.replace(/```json|```/g, '').trim();
        const result = JSON.parse(jsonText);
        return result.title || "Nova Conversa";

    } catch (error) {
        console.error("Error generating title:", error);
        return "Nova Conversa";
    }
};