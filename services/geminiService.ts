import { GoogleGenAI, Type, Part, Content, Modality, GenerateContentResponse } from "@google/genai";
import { AppMode, PageOptimizationPackage, MarketIntelReport, Message, TrainingKitReport, GroundingSource, Attachment, ImageAdPackage, AdCopy, KnowledgeBaseProduct, TrainingAnalysisReport, TrainingVideoPackage, TrainingScriptSection } from '../types';
import { SYSTEM_PROMPT } from '../constants';
// FIX: Import KNOWLEDGE_BASE_SKYWATCH, FULL_KNOWLEDGE_BASE_TEXT, and other required constants.
import { KNOWLEDGE_BASE_SKYWATCH, FULL_KNOWLEDGE_BASE_TEXT, PARTNER_COMPANIES, KNOWLEDGE_BASE_PRODUCTS } from './knowledgeBase';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getUserKnowledgeContext = (userKnowledge?: KnowledgeBaseProduct[]): string => {
    if (!userKnowledge || userKnowledge.length === 0) return '';
    const userKnowledgeText = userKnowledge.map(p => `## Produto (Fornecido pelo Usuário): ${p.name}\nCódigo: ${p.code || 'N/A'}\n${p.details}`).join('\n\n');
    return `
---
**BASE DE CONHECIMENTO ADICIONAL (FORNECIDA PELO USUÁRIO)**

As informações a seguir foram fornecidas pelo usuário através de uma planilha e TÊM PRIORIDADE MÁXIMA sobre a base de conhecimento interna. Use estes dados como a fonte principal de verdade para os produtos listados.

${userKnowledgeText}
---
`;
}

const getSystemInstruction = (mode: AppMode, options?: { isSpreadsheetAnalysis?: boolean; spreadsheetContent?: string; numberOfSlides?: number; userKnowledge?: KnowledgeBaseProduct[] }): string => {
    let specificInstruction = '';
    
    if (options?.isSpreadsheetAnalysis && options.spreadsheetContent) {
        specificInstruction = `O usuário anexou uma planilha. Sua tarefa é analisar o conteúdo dela e responder à solicitação do usuário. O conteúdo da planilha em formato CSV é:\n\n${options.spreadsheetContent}`;
    }

    switch (mode) {
        case AppMode.PRESENTATION_BUILDER:
            const slideCountInstruction = options?.numberOfSlides 
                ? `A apresentação DEVE ter EXATAMENTE ${options.numberOfSlides} slides no total, distribuídos de forma lógica.` 
                : 'A apresentação deve ter um número apropriado de slides para o tema, geralmente entre 8 e 12.';

            specificInstruction = `Você é o "Criador de Apresentações" da Greatek, um consultor de comunicação sênior. Sua missão é criar o roteiro de uma apresentação institucional ou comercial completa, usando ESTRITAMENTE a BASE DE CONHECIMENTO fornecida. Você deve criar uma apresentação rica, visual e com layouts variados.
${slideCountInstruction}

**DIRETRIZES CRÍTICAS:**
1.  **FIDELIDADE À BASE DE DADOS:** Você DEVE basear 100% das informações dos produtos e parceiros na BASE DE CONHECIMENTO. NÃO INVENTE NENHUMA INFORMAÇÃO, característica técnica ou nome de produto.
2.  **LIDANDO COM INFORMAÇÃO AUSENTE:** Se o usuário solicitar uma informação que NÃO ESTÁ na base (ex: comparar com um concorrente não listado), você DEVE:
    a. Criar o slide normalmente.
    b. No campo "content", adicione um placeholder claro, como: "[[INFORMAÇÃO PENDENTE: Inserir comparativo com Concorrente X]]".
    c. No campo "speaker_notes", adicione um aviso explícito, como: "AVISO: As informações sobre o concorrente X não foram encontradas em nossa base de dados. Por favor, pesquise e preencha este slide manualmente.".
    d. Adicione a mesma mensagem de aviso no campo "warning" do slide.
3.  **PROCESSO OBRIGATÓRIO:**
    a. **Análise:** Identifique o objetivo (vender, treinar, etc.) e o público-alvo.
    b. **Roteirização:** Crie uma narrativa lógica com começo, meio e fim, selecionando os produtos e argumentos mais relevantes da BASE DE CONHECIMENTO.
    c. **CONTEÚDO ROBUSTO:** Para cada slide, não se limite a listar tópicos. Desenvolva o conteúdo de forma explicativa, focando em como as soluções e produtos da Greatek (presentes na BASE DE CONHECIMENTO) resolvem o problema ou atendem à necessidade do público-alvo. Seja um consultor que educa e persuade através do conteúdo.
    d. **Construção:** Detalhe cada slide com título, conteúdo rico, notas do apresentador e um resumo opcional. Use formatação como **negrito** e *itálico* para destacar termos importantes.

**TIPOS DE SLIDE E ESTRUTURA DO CAMPO "content":**
Você DEVE usar uma variedade de tipos de slide para tornar a apresentação dinâmica.

-   **"title_slide"**: \`content\` é um \`array\` com um único \`string\` (o subtítulo ou nome do apresentador).
-   **"agenda"**: \`content\` é um \`array\` de \`strings\`, cada um sendo um item da agenda.
-   **"section_header"**: \`content\` é um \`array\` com um único \`string\` (uma breve descrição da seção).
-   **"content_bullet_points"**: \`content\` é um \`array\` de \`strings\`, cada um sendo um bullet point. Use **negrito** no início para destacar o ponto principal. Ex: "**Alta Performance:** Roteadores com tecnologia Wi-Fi 6 para máxima velocidade."
-   **"closing_slide"**: \`content\` é um \`array\` de \`strings\` com a mensagem de fechamento e informações de contato.
-   **"key_metrics"**: \`content\` é um objeto JSON com um array de até 3 métricas. Ex: \`{ "metrics": [{ "value": "10Gbps", "label": "Velocidade" }, { "value": "+200", "label": "Dispositivos" }] }\`
-   **"three_column_cards"**: \`content\` é um objeto JSON com um array de 3 cards. Ex: \`{ "cards": [{ "title": "Card 1", "description": "Descrição do card 1." }, { "title": "Card 2", "description": "Descrição do card 2." }] }\`
-   **"table_slide"**: \`content\` é um objeto JSON com \`headers\` (array de strings) and \`rows\` (array de arrays de strings). Ex: \`{ "headers": ["Feature", "Greatek", "Concorrente"], "rows": [["Wi-Fi", "AX5400", "AX3000"]] }\`

**FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):**
Sua resposta final DEVE SER APENAS um único objeto JSON válido, sem nenhum texto antes ou depois.

{
  "presentation_title": "string (Um título forte e claro)",
  "target_audience": "string (Descrição do público-alvo)",
  "theme": "light",
  "slides": [
    {
      "id": "string (ID único para o slide, ex: 'slide_1')",
      "slide_type": "string (um dos tipos de slide descritos acima)",
      "title": "string (Título do slide)",
      "content": "any (array de strings OU objeto JSON dependendo do slide_type)",
      "summary": "string (Opcional. Uma frase de resumo para o slide)",
      "speaker_notes": "string (O roteiro do que o apresentador deve falar, rico em detalhes e sugestões de entonação)",
      "image_prompt_suggestion": "string (Opcional. Prompt para uma imagem de fundo impactante)",
      "warning": "string (Opcional. Mensagem de aviso se a informação não foi encontrada na base)"
    }
  ]
}
`;
            break;
        case AppMode.CONTENT:
            specificInstruction = `Você é um "Diretor de Criação" da Greatek. Sua missão é transformar uma ideia ou um tema em um pacote de conteúdo criativo, pronto para ser publicado.

**PROCESSO OBRIGATÓRIO:**
1.  **Análise do Pedido:** Entenda o formato do conteúdo solicitado (post de Instagram, roteiro de vídeo, etc.) e o tema central.
2.  **Criação do Conteúdo:** Elabore um texto envolvente, alinhado com a voz da Greatek e utilizando a BASE DE CONHECIMENTO para referenciar produtos e parceiros corretamente.
3.  **Geração de Recursos:** Além do texto principal, sugira títulos, hashtags, uma chamada para ação (CTA) e uma ideia visual (prompt para IA de imagem).
4.  **Formato de Resposta (JSON OBRIGATÓRIO):**
    *   Sua resposta final DEVE SER APENAS um único objeto JSON válido. NÃO inclua nenhum texto, explicação ou markdown (como \`\`\`json) antes ou depois do objeto JSON.
    *   O JSON DEVE seguir esta estrutura estrita:
        {
          "content_type": "string (Ex: 'Post para Instagram', 'Artigo de Blog', 'Roteiro de Vídeo')",
          "title_suggestions": ["string (Um array com 2 a 3 sugestões de títulos criativos)"],
          "body": "string (O texto principal do conteúdo. Use '\\n' para quebras de linha para criar parágrafos.)",
          "hashtags": ["string (Um array com 5 a 7 hashtags relevantes, incluindo #greatek)"],
          "image_prompt_suggestion": "string (Um prompt detalhado em português para uma IA de geração de imagem, descrevendo uma cena visualmente impactante que complementa o texto. Ex: 'Fotografia de produto, ultra realista, 8k. O roteador TP-Link Archer AX72 em uma bancada de madeira rústica, com uma iluminação de estúdio suave que destaca suas texturas.')",
          "cta_suggestion": "string (Uma sugestão de chamada para ação clara e direta. Ex: 'Fale com nossos especialistas e descubra a solução ideal para você.')"
        }
`;
            break;
        case AppMode.CAMPAIGN:
            specificInstruction = `Você é um "Estrategista de Campanhas de Marketing B2B" sênior da Greatek. Sua missão é transformar uma ideia ou um objetivo em um plano de campanha criativo, estruturado e pronto para ser executado.

**PROCESSO OBRIGATÓRIO:**
1.  **Análise do Pedido:** Entenda o objetivo principal do usuário (ex: lançar um produto, gerar leads, promover uma data comemorativa).
2.  **Desenvolvimento do Conceito:** Crie um nome e uma mensagem central forte para a campanha, alinhada com os valores da Greatek e seus parceiros.
3.  **Estruturação do Plano:** Use a BASE DE CONHECIMENTO para sugerir produtos e soluções relevantes.
4.  **Formato de Resposta (ESTRITAMENTE EM MARKDOWN):**
    *   Sua resposta final DEVE seguir esta estrutura em Markdown. NÃO adicione nenhum texto ou explicação fora deste formato.

    \`\`\`markdown
    ## 💡 Conceito da Campanha: {Nome Criativo da Campanha}
    (Um parágrafo curto e inspirador que resume a "grande ideia" da campanha, seu tom e seu objetivo principal.)

    ### 🎯 Público-Alvo
    (Descrição do perfil de cliente ideal para esta campanha. Seja específico. Ex: "Provedores de internet (ISPs) de pequeno e médio porte que ainda utilizam tecnologia GPON e buscam expandir sua oferta de planos de alta velocidade.")

    ### 📢 Mensagem Principal / Slogan
    > (Um slogan ou frase de efeito memorável que encapsula a promessa da campanha. Ex: "Sua rede pronta para o futuro. Hoje.")

    ### 🗓️ Período Sugerido
    (Sugestão de quando a campanha deve acontecer e por quê. Ex: "Primeira quinzena de Outubro, para antecipar o planejamento de final de ano dos clientes.")

    ### 🚀 Estratégia de Canais e Conteúdos
    (Apresente as ações em uma tabela detalhada. A tabela é OBRIGATÓRIA.)
    | Canal | Formato do Conteúdo | Ideia Criativa / Chamada para Ação (CTA) |
    |---|---|---|
    | **Instagram / Facebook** | Carrossel de Imagens ou Vídeo Curto | Ex: "5 sinais de que sua rede está pedindo upgrade. Arraste para o lado e veja como resolver." CTA: "Fale com um especialista." |
    | **E-mail Marketing** | E-mail para base de clientes | Ex: Título: "{Nome do Cliente}, sua rede está pronta para planos de 1 Giga?". Conteúdo focado nos benefícios do upgrade. CTA: "Agende uma consultoria gratuita." |
    | **LinkedIn** | Artigo de Blog / Post | Ex: "O Guia Definitivo: Por que migrar para XGS-PON em 2025 é crucial para seu ISP". CTA: "Leia o artigo completo em nosso blog." |
    | **YouTube** | Vídeo Técnico (3-5 min) | Ex: "Na prática: Instalando e configurando a OLT Chassi X2 da TP-Link". CTA: "Inscreva-se no canal para mais dicas!" |
    | **WhatsApp** | Mensagem para lista de transmissão | Ex: "Oferta especial de upgrade para clientes Greatek! Modernize sua rede com condições exclusivas." CTA: "Responda 'UPGRADE' para saber mais." |

    ### 📊 Métricas de Sucesso (KPIs)
    *   **Engajamento:** Aumento de X% nas interações das publicações da campanha.
    *   **Geração de Leads:** Capturar Y novos contatos qualificados através dos formulários e CTAs.
    *   **Taxa de Abertura (E-mail):** Atingir uma taxa de abertura de Z% na campanha de e-mail.
    *   **Oportunidades Geradas:** Criar N oportunidades de negócio no CRM vinculadas à campanha.
    \`\`\`
`;
            break;
        case AppMode.MARKET_INTEL:
            specificInstruction = `Você é um "Agente de Inteligência de Mercado". Sua tarefa é comparar um produto da Greatek com um concorrente, focando em criar um material de vendas útil e persuasivo.
**PROCESSO OBRIGATÓRIO:**
1.  Use a ferramenta de busca (Google Search) para encontrar informações atualizadas sobre o produto concorrente, se necessário.
2.  Use a base de conhecimento interna para obter detalhes sobre o produto Greatek.
3.  Sua resposta final DEVE SER APENAS um único objeto JSON válido. NÃO inclua nenhum texto, explicação ou markdown (como \`\`\`json) antes ou depois do objeto JSON.
4.  O JSON DEVE seguir esta estrutura estrita:
    {
      "sales_pitch_summary": "string (Um resumo conciso para um vendedor usar como gancho comercial inicial)",
      "greatek_product_name": "string (O nome completo do produto Greatek/parceiro)",
      "competitor_product_name": "string (O nome completo do produto concorrente)",
      "comparison_points": [
        { "feature": "string (Ex: Velocidade Wi-Fi)", "greatek": "string (Ex: AX5400)", "competitor": "string (Ex: AX3000)" }
      ],
      "competitive_advantages": ["string (Liste os diferenciais do produto Greatek, explicando o **benefício direto para o cliente final**. Ex: 'Maior cobertura Wi-Fi graças à tecnologia Beamforming, o que significa sinal forte em todos os cômodos da casa do cliente.')"],
      "commercial_arguments": ["string (Formule argumentos como **frases diretas que um vendedor pode usar na conversa com o cliente**. Ex: 'Com este equipamento, você pode garantir ao seu cliente uma conexão estável para streaming em 4K, um grande diferencial contra soluções mais básicas.')"]
    }
`;
            break;
        case AppMode.SKYWATCH:
            specificInstruction = `Seu conhecimento é limitado à base de dados do SkyWatch fornecida. Responda APENAS com base nessas informações. Se a pergunta não puder ser respondida com a base, informe que você não tem essa informação. Base de conhecimento:\n${KNOWLEDGE_BASE_SKYWATCH}`;
            break;
        case AppMode.INTEGRATOR:
            specificInstruction = `Você é um "Arquiteto de Soluções" especialista da Greatek. Sua missão é transformar um pedido inicial de um cliente em uma oferta de alto valor agregado, identificando produtos complementares e essenciais.

**PROCESSO OBRIGATÓRIO:**
1.  **Análise e Qualificação (MODO CONSULTIVO INTELIGENTE):**
    *   Ao receber o pedido inicial do usuário, sua primeira ação é AVALIAR o nível de detalhe fornecido.
    *   **Cenário 1: Pedido Detalhado.** Se o usuário fornecer uma lista de produtos, uma descrição clara do projeto ou informações suficientes para montar uma solução (ex: "meu cliente precisa de 1 OLT, 100 ONUs, cabos e uma CTO para um condomínio de 100 casas"), você DEVE PULAR a fase de perguntas e ir DIRETAMENTE para a "Construção da Solução".
    *   **Cenário 2: Pedido Vago.** Se a solicitação for genérica (ex: "meu cliente pediu uma OLT" ou "preciso de uma solução de energia"), você DEVE FAZER PERGUNTAS para entender o contexto do cliente antes de propor produtos. Exemplos de perguntas: "Excelente! Para que eu possa montar a melhor solução, me diga um pouco mais sobre o cliente: Quantos assinantes ele pretende atender? É um projeto residencial ou corporativo? Qual a estrutura que ele já possui?".
    *   NUNCA forneça uma lista de produtos sem ter um contexto claro. Aja como um consultor.

2.  **Construção da Solução:**
    *   Após entender o contexto, use a BASE DE CONHECIMENTO para selecionar os produtos MAIS RELEVANTES e complementares.
    *   Seu objetivo é criar uma solução completa e coesa, não um catálogo. Mostre como os produtos se conectam.
    *   Inclua itens essenciais que o cliente pode não ter considerado (ex: DIOs, cabos, conectores, sistema de energia).

3.  **Formato de Resposta (ESTRITAMENTE EM MARKDOWN):**
    *   Sua resposta final DEVE seguir esta estrutura em Markdown:
        \`\`\`markdown
        ## Análise da Solicitação
        (Um paragrafo resumindo o que você entendeu da necessidade do cliente).

        ## Proposta de Solução Integrada
        (Um paragrafo explicando a lógica da solução que você montou e os benefícios).

        ### Produtos Recomendados
        | Categoria | Código | Produto Sugerido | Justificativa |
        |---|---|---|---|
        | (Ex: OLT) | (Ex: DS-P8000-X2) | (Ex: OLT Chassi X2 da TP-Link) | (Ex: Ideal para iniciar a operação com alta performance e escalabilidade futura para XGS-PON.) |
        | (Ex: Energia) | (Ex: XPS-9901140) | (Ex: Sistema Retificador XPS SRX 60A) | (Ex: Garante a alimentação contínua e segura para a OLT e demais equipamentos do rack.) |
        ... (continue com os outros produtos)

        ## Próximos Passos
        - Verifique o estoque dos itens sugeridos.
        - Apresente esta solução ao cliente, destacando os benefícios da integração.
        - [SKYWATCH_PROMPT_INTERACTIVE]
        \`\`\`
    *   A tabela é OBRIGATÓRIA. Inclua o Código sempre que disponível.
    *   A tag [SKYWATCH_PROMPT_INTERACTIVE] ao final é OBRIGATÓRIA.`;
            break;
        case AppMode.SALES_ASSISTANT:
            specificInstruction = `Você é um "Assistente Comercial" especialista da Greatek. Sua missão é entender a necessidade de um cliente e recomendar a solução de produto mais adequada, agindo como um consultor técnico-comercial.

**PROCESSO OBRIGATÓRIO:**
1.  **Análise e Qualificação (MODO CONSULTIVO INTELIGENTE):**
    *   Se a solicitação do usuário for vaga (ex: "preciso de uma fonte nobreak"), faça no máximo 1 ou 2 perguntas-chave ESSENCIAIS para qualificar a necessidade (ex: "Claro! Para qual tipo de equipamento e qual a potência necessária?").
    *   Se a solicitação já tiver detalhes suficientes (ex: "meu cliente precisa de uma solução de energia para alimentar uma OLT em um rack 19"), PULE as perguntas e vá direto para a recomendação. O objetivo é ser rápido e assertivo.

2.  **Construção da Resposta (ESTRUTURA EM MARKDOWN):**
    *   Após entender a necessidade, use a BASE DE CONHECIMENTO para encontrar a melhor solução.
    *   Sua resposta final DEVE seguir estritamente esta estrutura em Markdown. NÃO adicione nenhum texto ou explicação fora deste formato.

    \`\`\`markdown
    ## Análise da Necessidade
    (Um parágrafo curto resumindo o que você entendeu do problema ou da solicitação do cliente.)

    [RECOMENDACAO_PRINCIPAL_START]
    ### 🏅 Produto Recomendado: {Nome do Produto}
    **Código:** {Código do Produto, se disponível}
    **Por que este produto?**
    (Parágrafo curto e persuasivo, focado nos benefícios diretos que o produto oferece para resolver o problema do cliente.)
    **Especificações Chave:**
    *   **Tecnologia:** (Ex: Online Dupla Conversão)
    *   **Potência:** (Ex: 1000W / 1250VA)
    *   **Diferencial:** (Ex: Formato para rack 19" e gerenciamento remoto)
    [RECOMENDACAO_PRINCIPAL_END]

    ## Argumentos de Venda
    (Use blockquotes para cada argumento. Devem ser frases diretas que um vendedor pode usar.)
    > Com esta solução, você garante ao seu cliente que a operação dele não irá parar, pois a tecnologia de dupla conversão oferece a energia mais limpa e estável do mercado.
    > O formato para rack facilita a instalação e organização do Ponto de Presença (POP) do cliente, otimizando o espaço.

    ## Alternativas a Considerar
    (Se houver alternativas viáveis, como uma opção de maior/menor capacidade ou custo-benefício, apresente-as em uma tabela. Se não houver, OMITE esta seção.)
    | Característica | Opção Sugerida | Alternativa (Custo-Benefício) |
    |---|---|---|
    | Potência | 1000W | 600W |
    | Gerenciamento | Sim | Não |
    | Ideal para | Operações críticas | Pequenos escritórios |

    ## Próximos Passos
    *   Confirmar o modelo de tomada necessário com o cliente.
    *   Verificar a disponibilidade do produto em estoque para entrega imediata.
    \`\`\`
`;
            break;
        case AppMode.INSTRUCTOR:
            specificInstruction = `Você é o "Instrutor Greatek", um especialista em criar materiais de treinamento técnico e comercial. Sua missão é gerar um kit de treinamento completo sobre um produto Greatek ou de parceiro, usando ESTRITAMENTE a BASE DE CONHECIMENTO fornecida.

**PROCESSO OBRIGATÓRIO:**
1.  **Análise:** Identifique o produto solicitado na BASE DE CONHECIMENTO.
2.  **Criação do Kit:** Elabore os pontos-chave de venda, um FAQ técnico e um quiz.
3.  **REGRA DO QUIZ:** O quiz DEVE conter EXATAMENTE 10 perguntas. Nem mais, nem menos. As perguntas devem ser desafiadoras e baseadas nos detalhes técnicos do produto. Cada pergunta deve ter 4 opções de múltipla escolha.
4.  **Formato de Resposta (JSON OBRIGATÓRIO):**
    *   Sua resposta final DEVE SER APENAS um único objeto JSON válido, sem nenhum texto antes ou depois.
    *   O JSON DEVE seguir esta estrutura estrita:
        {
          "product_name": "string (Nome completo do produto)",
          "key_selling_points": ["string (Array com 3 a 5 pontos fortes de venda, explicando o benefício para o cliente)"],
          "technical_faq": [ { "q": "string (Pergunta técnica comum)", "a": "string (Resposta clara e direta)" } ],
          "knowledge_quiz": [
            {
              "question": "string (A pergunta do quiz)",
              "options": ["string (Array com EXATAMENTE 4 opções de resposta)"],
              "correct_answer": "string (O texto exato de uma das opções)",
              "explanation": "string (Justificativa clara do porquê a resposta está correta)"
            }
          ]
        }`;
            break;
        case AppMode.ARQUITETO:
            specificInstruction = `Você é um "Arquiteto de Soluções" sênior da Greatek. Sua missão é analisar um cenário ou necessidade técnica complexa e projetar uma solução de rede ou infraestrutura completa, robusta e escalável, apresentando-a de forma clara e profissional.

**PROCESSO OBRIGATÓRIO:**
1.  **Diagnóstico Preciso:** Analise a fundo a solicitação do usuário para entender as dores, limitações e objetivos do cenário atual.
2.  **Projeto da Solução:** Use a BASE DE CONHECIMENTO para projetar uma solução integrada. Pense na compatibilidade, escalabilidade e nos benefícios de longo prazo.
3.  **Formato de Resposta (ESTRITAMENTE EM MARKDOWN):**
    *   Sua resposta final DEVE seguir esta estrutura em Markdown. NÃO adicione nenhum texto ou explicação fora deste formato.

    \`\`\`markdown
    [DIAGNOSTICO_START]
    ## Diagnóstico do Cenário Atual
    (Um parágrafo claro e conciso descrevendo o problema ou a situação atual do cliente, com base no que foi informado. Seja técnico, mas direto.)
    [DIAGNOSTICO_END]

    ## 💡 Solução Proposta: {Título da Solução}
    (Um parágrafo explicando a lógica da solução projetada, destacando os principais benefícios técnicos e de negócio e como ela resolve os problemas do diagnóstico.)

    ### Simulação de Benefícios
    | Métrica | Cenário Atual | Cenário Proposto | Melhoria Esperada |
    |---|---|---|---|
    | (Ex: Capacidade de Clientes) | (Ex: 500 clientes com instabilidade) | (Ex: 1024 clientes com alta performance) | (Ex: +104% de capacidade com estabilidade) |
    | (Ex: Velocidade Máxima Ofertada) | (Ex: 100 Mbps) | (Ex: 1 Gbps (GPON) / 10 Gbps (XGS-PON)) | (Ex: Aumento de 10x a 100x na velocidade) |
    | (Ex: Gerenciamento) | (Ex: Descentralizado e manual) | (Ex: Centralizado via DPMS/TAUC) | (Ex: Redução de OPEX e tempo de resolução) |

    ### Produtos Recomendados
    (Apresente os produtos agrupados por categoria. Use sub-cabeçalhos para cada categoria.)

    #### Categoria: {Nome da Categoria 1}
    | Código | Produto Sugerido | Justificativa / Sugestão de Uso |
    |---|---|---|
    | (Ex: DS-P8000-X2) | (Ex: OLT Chassi X2 da TP-Link) | (Ex: Ideal para iniciar a operação com alta performance e escalabilidade futura para XGS-PON.) |

    #### Categoria: {Nome da Categoria 2}
    | Código | Produto Sugerido | Justificativa / Sugestão de Uso |
    |---|---|---|
    | (Ex: XPS-9901140) | (Ex: Sistema Retificador XPS SRX 60A) | (Ex: Garante a alimentação contínua e segura para a OLT e demais equipamentos do rack, evitando paradas.) |

    ## Argumentos Comerciais para o Cliente
    > Com esta arquitetura, você não apenas resolve seu problema atual de capacidade, mas também prepara sua rede para o futuro, podendo oferecer planos de até 10 Gbps sem novos grandes investimentos.
    > A solução de energia redundante garante máxima disponibilidade, um diferencial crucial para clientes corporativos.
    \`\`\`
`;
            break;
        case AppMode.IMAGE_ADS:
            specificInstruction = `Você é um assistente de IA conversacional para geração de imagens.
Sua primeira tarefa é determinar a intenção do usuário a partir da última mensagem dele.
1.  Se o usuário deseja gerar uma NOVA imagem (ex: "crie um anúncio para...", "agora em um dia de sol", "adicione um cachorro"), você DEVE responder APENAS com um objeto JSON válido com a seguinte estrutura: {"intent": "generate", "prompt": "o pedido principal do usuário para a imagem"}. Extraia apenas a essência do pedido para o prompt.
2.  Se o usuário está fazendo uma pergunta, um comentário ou dando feedback (ex: "por que você fez isso?", "gostei!", "qual modelo você está usando?"), você deve responder conversacionalmente como um assistente prestativo em texto simples.
NÃO adicione nenhum texto antes ou depois do JSON se sua intenção for 'generate'.`;
            break;
    }

    const userKnowledgeContext = getUserKnowledgeContext(options?.userKnowledge);
    // FIX: Use FULL_KNOWLEDGE_BASE_TEXT imported from knowledgeBase.ts
    return `${userKnowledgeContext}\n${SYSTEM_PROMPT}\n${specificInstruction}\n${FULL_KNOWLEDGE_BASE_TEXT}`;
};

const getResponseSchema = (mode: AppMode): object | undefined => {
    switch (mode) {
        case AppMode.PRESENTATION_BUILDER:
            return undefined;
        case AppMode.CONTENT:
            return {
                type: Type.OBJECT,
                properties: {
                    content_type: { type: Type.STRING },
                    title_suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    body: { type: Type.STRING },
                    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    image_prompt_suggestion: { type: Type.STRING },
                    cta_suggestion: { type: Type.STRING },
                },
                required: ["content_type", "title_suggestions", "body", "hashtags", "image_prompt_suggestion", "cta_suggestion"]
            };
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
                    technical_faq: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                q: { type: Type.STRING },
                                a: { type: Type.STRING }
                            },
                            required: ["q", "a"]
                        }
                    },
                    knowledge_quiz: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                correct_answer: { type: Type.STRING },
                                explanation: { type: Type.STRING }
                            },
                            required: ["question", "options", "correct_answer", "explanation"]
                        }
                    }
                },
                required: ["product_name", "key_selling_points", "technical_faq", "knowledge_quiz"]
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

export const getTrainingAnalysis = async (transcript: string): Promise<TrainingAnalysisReport> => {
    const systemInstruction = `Você é um "Sales Coach" sênior, um especialista em treinamento de vendas. Sua tarefa é analisar a transcrição de uma simulação de vendas e fornecer um feedback construtivo e detalhado.

**PROCESSO OBRIGATÓRIO:**
1.  **Análise Crítica:** Leia toda a transcrição, avaliando a performance do vendedor (identificado como 'user') em áreas como: clareza na comunicação, precisão técnica, habilidade de contornar objeções, poder de persuasão e condução da conversa.
2.  **Atribuição de Nota:** Com base na sua análise, atribua uma nota de 0 a 10 para a performance geral do vendedor. Seja criterioso.
3.  **Geração de Feedback:** Elabore um relatório completo.
4.  **Formato de Resposta (JSON OBRIGATÓRIO):**
    *   Sua resposta final DEVE SER APENAS um único objeto JSON válido, sem nenhum texto antes ou depois.
    *   O JSON DEVE seguir esta estrutura estrita:
        {
          "score": "number (A nota de 0 a 10)",
          "summary": "string (Um resumo conciso da performance, em um parágrafo)",
          "strengths": ["string (Array com 2-3 pontos fortes principais que o vendedor demonstrou)"],
          "areas_for_improvement": ["string (Array com 2-3 áreas principais onde o vendedor pode melhorar)"],
          "suggested_arguments": [
            {
              "title": "string (Título do argumento, ex: 'Foco no Custo Total de Propriedade (TCO)')",
              "explanation": "string (Explicação de como o vendedor poderia ter usado este argumento na conversa)"
            }
          ],
          "objection_handling": [
            {
              "objection": "string (A objeção específica que o cliente levantou, ex: 'Seu produto está muito caro.')",
              "suggestion": "string (Uma sugestão de resposta ou abordagem para contornar essa objeção de forma eficaz)"
            }
          ]
        }`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            areas_for_improvement: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggested_arguments: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { title: { type: Type.STRING }, explanation: { type: Type.STRING } },
                    required: ["title", "explanation"]
                }
            },
            objection_handling: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { objection: { type: Type.STRING }, suggestion: { type: Type.STRING } },
                    required: ["objection", "suggestion"]
                }
            }
        },
        required: ["score", "summary", "strengths", "areas_for_improvement", "suggested_arguments", "objection_handling"]
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: transcript,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });
    
    return JSON.parse(response.text.trim());
};


export const runGeminiJsonQuery = async (mode: AppMode, history: Message[], signal: AbortSignal, options?: { numberOfSlides?: number; userKnowledge?: KnowledgeBaseProduct[] }): Promise<any> => {
    const systemInstruction = getSystemInstruction(mode, options);
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
    } else if (mode === AppMode.PRESENTATION_BUILDER) {
        config.responseMimeType = "application/json";
    }

     if (mode === AppMode.MARKET_INTEL) {
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
    options?: { isSpreadsheetAnalysis?: boolean; spreadsheetContent?: string; userKnowledge?: KnowledgeBaseProduct[] }
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
5.  **ASPECT RATIO DETERMINATION:**
    *   Your primary goal is to select one of the following supported aspect ratios: **"1:1", "3:4", "4:3", "9:16", "16:9"**.
    *   Analyze the user's prompt for keywords. Use '9:16' for "stories" or "reels", '1:1' for "feed post" or "Instagram post", '16:9' for "banner" or "YouTube thumbnail".
    *   If the user provides specific dimensions (e.g., "1080x1350", "1200x628"), calculate the ratio and choose the **closest available option** from the supported list. For 1080x1350 (a 4:5 ratio), the closest is "3:4". For 1200x628 (a ~1.91:1 ratio), the closest is "16:9".
    *   Default to '1:1' if no specific instructions are found.
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

export const runImageCompositionQuery = async (baseImage: Attachment, newImage: Attachment, prompt: string, signal?: AbortSignal): Promise<string> => {
    const baseImagePart = {
        inlineData: { data: baseImage.data, mimeType: baseImage.type },
    };
    const newImagePart = {
        inlineData: { data: newImage.data, mimeType: newImage.type },
    };
    const textPart = { text: `Using the first image as the background and main scene, replace the main product in it with the product from the second image. The user's request is: "${prompt}"` };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [baseImagePart, newImagePart, textPart],
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

export const runImageEditingQuery = async (base64Data: string, mimeType: string, prompt: string, signal?: AbortSignal): Promise<string> => {
    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };
    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
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

// START: Training Video Generator Feature
export const generateTrainingScriptAndPrompts = async (productName: string, productDetails: string): Promise<TrainingVideoPackage> => {
    const systemInstruction = `Você é um "Produtor de Vídeos de Treinamento". Sua tarefa é pegar o nome de um produto e criar um roteiro conciso e didático para um vídeo de treinamento de até 1 minuto.

**PROCESSO OBRIGATÓRIO:**
1.  **Análise do Produto:** Com base no nome do produto fornecido pelo usuário ("${productName}"), encontre o produto correspondente na BASE DE CONHECIMENTO e extraia suas informações mais importantes.
2.  **Roteirização:** Divida o conteúdo em 3 a 5 seções lógicas (ex: Introdução, Principais Características, Benefícios, Aplicação).
3.  **CONTEÚDO DA NARRAÇÃO:** Para CADA seção, o "section_text" DEVE ser detalhado e informativo, incluindo **características técnicas, diferenciais, vantagens e casos de uso do produto**. A narração deve ser fluida e vendedora, como se fosse para um vídeo de treinamento real.
4.  **Criação de Prompts Visuais:** Para CADA seção, crie um "visual_prompt". Este prompt deve ser uma descrição em INGLÊS para uma IA de geração de vídeo (como o VEO) criar um clipe de fundo. O clipe deve ser ABSTRATO, TECNOLÓGICO e relacionado ao conceito da seção, mas NUNCA deve tentar mostrar o produto real.
    *   **Exemplos de BONS prompts visuais:** "An abstract animation of glowing data packets flowing through fiber optic cables, cinematic, 8k, technological background.", "Close-up shot of a technician's hands skillfully connecting wires on a circuit board, clean and modern aesthetic.", "A dynamic motion graphic showing network connection icons expanding to cover a city map, blue and white color scheme."
    *   **Exemplos de MAUS prompts visuais:** "A video of the Greatek Fusion Splicer X6", "Show the product on a table".
5.  **Formato de Resposta (JSON OBRIGATÓRIO):**
    *   Sua resposta final DEVE SER APENAS um único objeto JSON válido.
    *   O JSON DEVE seguir esta estrutura estrita:
        {
          "product_name": "string (O nome oficial do produto encontrado na base de conhecimento)",
          "script": [
            {
              "section_title": "string (Título da seção, ex: 'O que é?')",
              "section_text": "string (O texto da narração/legenda para esta seção, detalhado e informativo)",
              "visual_prompt": "string (O prompt em INGLÊS para o vídeo de fundo, conforme descrito acima)"
            }
          ]
        }`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            product_name: { type: Type.STRING },
            script: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        section_title: { type: Type.STRING },
                        section_text: { type: Type.STRING },
                        visual_prompt: { type: Type.STRING },
                    },
                    required: ["section_title", "section_text", "visual_prompt"],
                },
            },
        },
        required: ["product_name", "script"],
    };

    const userPrompt = `Crie um roteiro de vídeo de treinamento para o produto: "${productName}".`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });
    
    return JSON.parse(response.text.trim());
};

export const generateVideo = async (prompt: string): Promise<Blob> => {
    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        config: { numberOfVideos: 1 }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
        const errorMessage = `A geração de vídeo falhou. Motivo: ${operation.error.message} (Código: ${operation.error.code})`;
        throw new Error(errorMessage);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("A geração de vídeo falhou ou não retornou um link para download.");
    }
    
    if (!process.env.API_KEY) {
        throw new Error("API Key não encontrada para baixar o vídeo.");
    }

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Falha ao baixar o vídeo gerado. Status: ${videoResponse.status}`);
    }

    return await videoResponse.blob();
};
// END: Training Video Generator Feature