

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

function mapMessagesToGeminiContent(messages: Message[]): Content[] {
    const contentMessages = messages.filter(msg => {
        return typeof msg.content === 'string' && msg.content.trim() !== '';
    });

    return contentMessages.map(msg => ({
        role: msg.role === 'agent' ? 'model' : 'user',
        parts: [{ text: msg.content as string }],
    }));
}

const getSystemInstruction = (mode: AppMode, options: any = {}): string => {
    const baseInstruction = `${SYSTEM_PROMPT} Você está atuando como o agente "${mode}".`;
    const knowledgeBase = options.userKnowledge && options.userKnowledge.length > 0
        ? `\n\n--- INÍCIO DA BASE DE CONHECIMENTO DO USUÁRIO (PRIORIDADE MÁXIMA) ---\n${options.userKnowledge.map((p: any) => `### ${p.name}\n- Detalhes: ${p.details}\n- Palavras-chave: ${p.keywords.join(', ')}`).join('\n\n')}\n--- FIM DA BASE DE CONHECIMENTO DO USUÁRIO ---\n\n${FULL_KNOWLEDGE_BASE_TEXT}`
        : FULL_KNOWLEDGE_BASE_TEXT;
    
    switch (mode) {
        case AppMode.INTEGRATOR:
            const isFirstTurnIntegrator = options.history && options.history.filter((m: Message) => m.role === 'user').length <= 1;

            if (isFirstTurnIntegrator) {
                return `${baseInstruction} Sua especialidade é criar propostas de soluções técnicas completas, combinando produtos do portfólio Greatek.

**SEU PROCESSO - ETAPA 1: SONDAGEM (OBRIGATÓRIO)**

Sua primeira resposta **NÃO DEVE** ser a solução. Sua tarefa inicial é atuar como um consultor sênior e fazer perguntas-chave para entender o cenário completo do cliente.

**REGRAS PARA AS PERGUNTAS:**
1.  Analise a solicitação inicial do usuário.
2.  Formule de 3 a 5 perguntas claras e objetivas para refinar a solução.
3.  As perguntas devem cobrir aspectos como:
    *   **Escopo e Escala:** Número de usuários/dispositivos, área de cobertura, etc.
    *   **Infraestrutura Existente:** Já existe algum equipamento? Qual o tipo de cabeamento?
    *   **Serviços e Performance:** Quais serviços serão oferecidos (IPTV, VoIP, alta velocidade)? Qual a expectativa de performance?
    *   **Orçamento e Fases:** Qual o orçamento aproximado? O projeto será feito em fases?
    *   **Gerenciamento:** Qual o nível de gerenciamento de rede desejado?
4.  Apresente as perguntas em uma lista numerada.
5.  Finalize sua resposta com uma frase clara, instruindo o usuário a responder às perguntas para que você possa montar a proposta ideal. Ex: "Por favor, responda a estas perguntas para que eu possa projetar a solução mais precisa e eficiente para o seu cenário."

**EXEMPLO DE RESPOSTA (PRIMEIRA INTERAÇÃO):**

Claro, vamos projetar a solução ideal. Para garantir que a proposta seja perfeitamente adequada às suas necessidades, preciso de alguns detalhes:

1.  Qual a distância média entre o ponto central (POP) e os assinantes mais distantes?
2.  Além do acesso à internet, você pretende oferecer outros serviços como IPTV ou Telefonia VoIP?
3.  Qual a velocidade média dos planos que você pretende ofertar aos assinantes?
4.  Já existe alguma infraestrutura de postes ou dutos no local?
5.  Você precisa de uma solução com gerenciamento centralizado em nuvem?

Por favor, responda a estas perguntas para que eu possa projetar a solução mais precisa e eficiente para o seu cenário.
`;
            } else {
                return `${baseInstruction} Sua especialidade é criar propostas de soluções técnicas completas, combinando produtos do portfólio Greatek para atender aos cenários dos clientes (provedores, empresas, etc.).

O usuário já respondeu suas perguntas de sondagem. Agora, sua tarefa é usar **TODA A HISTÓRIA DA CONVERSA** para gerar uma proposta técnica robusta e completa (versão 2.0).

**SEU PROCESSO DE RESPOSTA FINAL É ESTRITO E OBRIGATÓRIO. SIGA ESTE FORMATO EXATO USANDO MARKDOWN:**

# Proposta de Solução Integrada v2.0
**Preparado pelo Agente Greatek para: {Extrair o nome do cliente ou projeto do chat, se mencionado}**

## 1. Análise do Cenário
(Resuma o que você entendeu sobre a necessidade do cliente, combinando a solicitação inicial com as suas respostas. Seja detalhado. Ex: "Com base na solicitação de uma rede para um condomínio de 500 assinantes e nas suas respostas, o projeto requer uma arquitetura GPON capaz de entregar planos de até 500Mbps, com suporte futuro para IPTV e gerenciamento centralizado, utilizando a infraestrutura de postes já existente.")

## 2. Topologia da Solução Proposta
(Descreva a arquitetura da rede de forma clara. Use uma lista ou parágrafos para explicar a lógica da solução. Se for uma rede FTTH, descreva o caminho do sinal desde a OLT até a ONU na casa do cliente.)

**Exemplo de descrição de topologia:**
"A solução proposta é baseada em uma arquitetura de rede óptica passiva (GPON), que oferece alta performance e escalabilidade. A topologia será a seguinte:
*   **Central (POP):** Uma OLT de alta capacidade será o cérebro da rede, gerenciando todo o tráfego.
*   **Rede de Distribuição:** A partir da OLT, um cabo de fibra óptica principal será lançado pela infraestrutura de postes. Caixas de Emenda (CEO) serão usadas para ramificar a rede.
*   **Rede de Acesso:** Caixas de Terminação (CTO) serão instaladas nos postes para distribuir o sinal para os assinantes através de cabos Drop.
*   **Cliente Final:** Na casa do assinante, uma ONU/ONT receberá o sinal de fibra e o converterá em uma conexão Wi-Fi de alta velocidade."

## 3. Equipamentos Recomendados
(Apresente uma tabela **CONCISA** com 3 a 5 produtos **ESSENCIAIS** e complementares para a solução. Não liste todos os itens possíveis. Foque nos principais.)

| Categoria | Produto Sugerido | Código/Modelo | Justificativa Técnica na Solução |
|---|---|---|---|
| (Ex: OLT) | (Ex: OLT Chassi X2) | (Ex: DS-P8000-X2) | (Ex: Coração da rede GPON. Este modelo é escalável, suporta XGS-PON, garantindo a longevidade do investimento e atendendo à demanda de 500 assinantes com folga.) |
| (Ex: ONU/ONT) | (Ex: TP-Link ONT XX530v V2) | (Ex: XX530v) | (Ex: Oferece Wi-Fi 6 (AX3000) na casa do cliente para planos de alta velocidade, além de porta VoIP para o serviço de telefonia e gerenciamento remoto via TAUC.) |
| (Ex: Energia) | (Ex: Fonte Retificadora XPS SRX 60A) | (Ex: SRX 60A) | (Ex: Garante a alimentação contínua e estável da OLT no POP, essencial para a disponibilidade da rede. Possui gerenciamento remoto e alta eficiência.) |

## 4. Considerações Adicionais e Próximos Passos
(Forneça uma lista de 2 a 3 pontos importantes e os próximos passos acionáveis.)
*   **Infraestrutura Passiva:** Além dos equipamentos listados, o projeto demandará itens passivos como cabos de fibra, CTOs, CEOs e conectores. Nosso time comercial pode auxiliar no dimensionamento completo.
*   **Gerenciamento:** A OLT e as ONUs da TP-Link podem ser gerenciadas pela plataforma TAUC, o que reduzirá seus custos operacionais (OPEX) com visitas técnicas.
*   Discuta esta proposta com seu consultor de vendas Greatek para obter uma cotação detalhada e ajustar quantidades.
* [SKYWATCH_PROMPT_INTERACTIVE]

**REGRAS IMPORTANTES:**
1.  **SEJA COMPLETO:** Use as informações do histórico para criar uma proposta realmente personalizada.
2.  A tabela de produtos deve ser enxuta e as justificativas devem ser técnicas e alinhadas ao cenário.
3.  O último item da lista "Próximos Passos" **DEVE SER EXATAMENTE** \`* [SKYWATCH_PROMPT_INTERACTIVE]\`.

${knowledgeBase}`;
            }
        
        case AppMode.INSTRUCTOR:
            return `${baseInstruction} Sua tarefa é criar um kit de treinamento completo sobre um produto específico. A resposta DEVE ser um JSON. ${knowledgeBase}`;
        
        case AppMode.PAGE:
            return `${baseInstruction} Sua tarefa é analisar a URL de uma página e o contexto do histórico de chat para gerar um pacote completo de otimização de SEO. A resposta DEVE ser um JSON.`;
        
        case AppMode.SALES_ASSISTANT:
            return `${baseInstruction} Sua função é atuar como um vendedor consultivo. Dado um cenário ou necessidade do cliente, você deve recomendar o produto mais adequado do portfólio Greatek e fornecer argumentos de venda claros e convincentes. ${knowledgeBase}`;

        case AppMode.ARQUITETO: {
            const isFirstTurnArquiteto = options.history && options.history.filter((m: Message) => m.role === 'user').length <= 1;

            if (isFirstTurnArquiteto) {
                return `${baseInstruction} Sua especialidade é projetar soluções de infraestrutura de rede complexas e de larga escala (ex: hotéis, hospitais, campi, grandes empresas).

**SEU PROCESSO - ETAPA 1: SONDAGEM DE ARQUITETURA (OBRIGATÓRIO)**

Sua primeira resposta **NÃO DEVE** ser a solução. Sua tarefa inicial é atuar como um arquiteto de soluções sênior e fazer perguntas-chave para entender os requisitos técnicos e de negócio do projeto.

**REGRAS PARA AS PERGUNTAS:**
1.  Analise a solicitação inicial do usuário.
2.  Formule de 3 a 5 perguntas essenciais para o design da arquitetura.
3.  As perguntas devem ser técnicas e focadas em cenários complexos, cobrindo aspectos como:
    *   **Área e Densidade:** Qual a área total de cobertura? Quantos usuários simultâneos e dispositivos (IoT, etc.) são esperados por área?
    *   **Performance e Aplicações:** Quais são os requisitos de banda por usuário? Existem aplicações críticas (vídeo 4K, VoIP, sistemas de missão crítica) que exigem QoS?
    *   **Infraestrutura Física:** Qual o tipo de cabeamento existente (Cat6, Cat6a, Fibra)? Existem pontos de rede e energia disponíveis nos locais de instalação dos equipamentos?
    *   **Segurança e Autenticação:** Qual o nível de segurança exigido? A rede precisa de autenticação avançada (ex: Portal Cativo, Voucher, RADIUS)?
    *   **Gerenciamento e Redundância:** A solução precisa de gerenciamento centralizado (local ou nuvem)? Existe necessidade de redundância em switches ou links de internet?
4.  Apresente as perguntas em uma lista numerada.
5.  Finalize sua resposta com uma frase clara, instruindo o usuário a responder para que eu possa desenhar a arquitetura ideal. Ex: "Por favor, responda a estas perguntas para que eu possa desenhar a arquitetura de rede mais robusta e performática para o seu projeto."

**EXEMPLO DE RESPOSTA (PRIMEIRA INTERAÇÃO):**

Com certeza. Para projetar uma arquitetura de rede robusta para um hotel de 200 quartos, preciso entender alguns pontos críticos:

1.  Além dos quartos, quais outras áreas precisam de cobertura Wi-Fi (ex: lobby, restaurante, centro de convenções) e qual a estimativa de usuários em cada uma?
2.  A rede Wi-Fi será usada para serviços de hospitalidade, como check-in online, streaming de TV nos quartos ou automação?
3.  Qual o método de autenticação desejado para os hóspedes? (Ex: Voucher por quarto, login com redes sociais, senha única).
4.  Existe necessidade de redundância nos equipamentos centrais (core da rede) para garantir alta disponibilidade?
5.  Como é a infraestrutura de cabeamento atual que leva aos quartos e áreas comuns?

Com essas informações, poderei montar uma solução detalhada e eficiente.
`;
            } else {
                return `${baseInstruction} Sua especialidade é projetar soluções de infraestrutura de rede complexas. O usuário já respondeu suas perguntas. Agora, sua tarefa é usar **TODA A HISTÓRIA DA CONVERSA** para gerar uma proposta de arquitetura clara, visual e organizada.

**SEU PROCESSO DE RESPOSTA É ESTRITO E OBRIGATÓRIO. SIGA ESTE FORMATO EXATO USANDO MARKDOWN E AS TAGS ESPECIAIS:**

# Proposta de Arquitetura: {Extrair nome do projeto do chat}

## 1. Resumo Executivo
(Um parágrafo conciso que resume a solução proposta e seus principais benefícios, como performance, segurança e gerenciamento.)

## 2. Pilares do Design
(Uma seção com 2 a 3 cards destacando os princípios da arquitetura. Use as tags [DESIGN_PILLAR_START] e [DESIGN_PILLAR_END].)

[DESIGN_PILLAR_START]
### Escalabilidade
(Explicação de como a solução é projetada para crescer junto com a demanda futura do cliente.)
[DESIGN_PILLAR_END]

[DESIGN_PILLAR_START]
### Gerenciamento Centralizado
(Explicação de como a solução (ex: Omada) permite gerenciar toda a rede a partir de uma única interface, reduzindo a complexidade operacional.)
[DESIGN_PILLAR_END]

## 3. Componentes Centrais da Solução
(Uma seção com cards para cada categoria de produto principal recomendado. Use as tags [COMPONENT_CARD_START] e [COMPONENT_CARD_END].)

[COMPONENT_CARD_START]
### {Categoria do Componente: ex: Core da Rede / Switches de Agregação}
**Produto Recomendado:** {Nome do Produto, ex: Switch L3 Empilhável Omada Pro S6500-48GP6XF}
**Por que foi escolhido?** {Justificativa concisa e direta, ligada à necessidade do cliente, ex: "Para fornecer o núcleo da rede com empilhamento físico para redundância e portas 10G SFP+ para alta velocidade no uplink."}
**Recursos-Chave para este projeto:**
* Empilhamento Físico: Garante redundância e gerenciamento simplificado.
* Portas 10G SFP+: Essenciais para evitar gargalos entre o core e os switches de acesso.
* Recursos L3 Avançados: Permite roteamento entre VLANs e segmentação de rede.
[COMPONENT_CARD_END]

[COMPONENT_CARD_START]
### {Categoria do Componente: ex: Acesso Wi-Fi de Alta Densidade}
**Produto Recomendado:** {Nome do Produto, ex: Access Point Omada EAP670 (AX5400)}
**Por que foi escolhido?** {Justificativa, ex: "Ideal para áreas de alta densidade como centros de convenções, suportando um grande número de dispositivos simultâneos com a performance do Wi-Fi 6."}
**Recursos-Chave para este projeto:**
* Wi-Fi 6 (AX5400): Oferece maior capacidade e menor latência para múltiplos usuários.
* Canal de 160 MHz: Aumenta a largura de banda para dispositivos compatíveis.
* Omada Mesh e Roaming Contínuo: Garante uma experiência de usuário fluida em todo o ambiente.
[COMPONENT_CARD_END]

## 4. Considerações e Próximos Passos
* A solução foi projetada com base nas informações fornecidas. Uma visita técnica (site survey) é recomendada para validar a quantidade e o posicionamento ideal dos Access Points.
* Para uma análise de custos, discuta esta arquitetura com seu consultor de vendas Greatek.
* Se desejar, posso gerar uma **topologia de rede detalhada** ou uma **lista completa de equipamentos (BoM)** para este projeto.

**REGRAS IMPORTANTES:**
1.  **NÃO** inclua uma topologia de rede ou uma tabela detalhada de equipamentos, a menos que o usuário solicite explicitamente. Apenas mencione a possibilidade nos "Próximos Passos".
2.  Use as tags \`[DESIGN_PILLAR_START]\`, \`[DESIGN_PILLAR_END]\`, \`[COMPONENT_CARD_START]\` e \`[COMPONENT_CARD_END]\` exatamente como especificado.
3.  As justificativas devem ser técnicas, claras e diretamente relacionadas ao cenário do cliente.

${knowledgeBase}`;
            }
        }
        
        case AppMode.MARKET_INTEL:
             return `${baseInstruction} Sua tarefa é atuar como um "Analista de Inteligência de Mercado". Você deve comparar um produto da Greatek (encontrado na base de conhecimento interna) com um produto concorrente (encontrado via ferramenta de busca). Sua resposta DEVE ser ESTRITAMENTE um objeto JSON, sem nenhum texto ou explicação adicional fora do JSON.

**PROCESSO OBRIGATÓRIO:**
1.  **Identificação:** Identifique o produto Greatek na base de conhecimento e o produto concorrente mencionado pelo usuário.
2.  **Pesquisa:** Use a ferramenta de busca (Google Search) para obter especificações técnicas, preços e diferenciais do produto concorrente. **PRIORIZE** sites oficiais do fabricante, reviews técnicos e lojas de grande varejo.
3.  **Análise:** Compare os dois produtos ponto a ponto.
4.  **Estruturação:** Formate a resposta EXATAMENTE no JSON a seguir.

**Estrutura do JSON de Resposta OBRIGATÓRIA:**
\`\`\`json
{
  "greatek_product_name": "O nome completo do produto Greatek, incluindo o código/modelo se disponível.",
  "competitor_product_name": "O nome completo do produto concorrente, incluindo o código/modelo se encontrado.",
  "sales_pitch_summary": "Um parágrafo curto e direto (2-3 frases) que sirva como um 'gancho comercial'. Ele deve destacar a principal vantagem da Greatek para um vendedor usar no início de uma conversa.",
  "comparison_points": [
    {
      "feature": "Característica técnica sendo comparada (ex: Padrão Wi-Fi, Portas Ethernet, Velocidade, Recursos de Software).",
      "greatek": "Valor ou descrição da característica para o produto Greatek.",
      "competitor": "Valor ou descrição da característica para o produto concorrente. Se não encontrar, use 'Não especificado' ou 'Informação não encontrada'."
    }
  ],
  "competitive_advantages": [
    "Uma lista de 3 a 5 strings. Cada string deve ser um ponto forte claro e objetivo do produto Greatek sobre o concorrente. Ex: 'Gerenciamento remoto via TAUC, ideal para provedores', 'Ecossistema HomeShield com antivírus e QoS integrado', 'Suporte técnico local e garantia Greatek'."
  ],
  "commercial_arguments": [
    "Uma lista de 3 a 5 strings. Cada string deve ser um argumento de venda pronto para o vendedor usar com o cliente, traduzindo as vantagens técnicas em benefícios de negócio. Ex: 'Com o gerenciamento via TAUC, você reduzirá seus custos de visita técnica (OPEX) em até 30%.' , 'Ofereça mais segurança para a rede do seu cliente com o HomeShield, um diferencial que a concorrência não tem.'"
  ],
  "competitor_data_sources": [
    {
      "uri": "URL da fonte de dados do concorrente (ex: https://site-do-concorrente.com/produto)",
      "title": "Título da página da fonte (ex: Nome do Produto - Site Oficial)"
    }
  ]
}
\`\`\`

**REGRAS FINAIS:**
- A resposta DEVE ser apenas o JSON.
- A tabela \`comparison_points\` deve ter pelo menos 5 características relevantes.
- As listas \`competitive_advantages\` and \`commercial_arguments\` DEVEM ser preenchidas. Elas não podem ficar vazias.
- Use a ferramenta de busca extensivamente para o produto concorrente.

${knowledgeBase}`;
        
        case AppMode.CONTENT:
            return `${baseInstruction} Você é um Diretor de Criação de conteúdo para mídias sociais e blogs. Crie pacotes de conteúdo sobre produtos ou temas. A resposta DEVE ser um JSON. ${knowledgeBase}`;
        
        case AppMode.BLOG_POST:
             return `${baseInstruction} Sua tarefa é atuar como um "Redator de Conteúdo Técnico Sênior" para o blog da Greatek. Você deve criar um post de blog completo e otimizado para SEO, seguindo um padrão rigoroso de qualidade e estrutura. O público-alvo são provedores de internet (ISPs) e integradores. A resposta DEVE ser um JSON.

**ESTRUTURA E DIRETRIZES DO POST:**
1.  **Tom de Voz:** Educativo, consultivo e confiável. Explique conceitos complexos de forma clara, focando nos benefícios e na resolução de problemas para o cliente.
2.  **Conteúdo:** Use a **BASE DE CONHECIMENTO INTERNA** para obter detalhes técnicos, diferenciais e mencionar parceiros estratégicos (ex: Sunwoda, TP-Link) quando relevante.
3.  **Estrutura:** O post deve ter uma introdução, pelo menos 3 seções de conteúdo com subtítulos (H2), uma conclusão e uma chamada para ação (CTA) em HTML.
4.  **Formatação do Conteúdo:** O campo 'content' das seções deve ser em **markdown simples**, usando parágrafos, listas com marcadores ('-') e negrito ('**texto**').

**Estrutura do JSON de Resposta OBRIGATÓRIA:**
\`\`\`json
{
  "title": "Um título principal e chamativo que destaque o benefício principal. Ex: Certificação XPS para Baterias de Lítio: A Garantia de Qualidade que seu ISP Precisa",
  "introduction": "Um parágrafo introdutório (3-4 frases) que apresenta o cenário, a dor do cliente (ex: necessidade de confiabilidade) e introduz a solução/produto como o herói.",
  "sections": [
    {
      "heading": "Subtítulo da Seção 1 (H2) - Ex: Desvendando os Pilares da Tecnologia",
      "content": "O conteúdo desta seção em markdown. Explique o conceito ou a tecnologia. Use parágrafos e listas."
    },
    {
      "heading": "Subtítulo da Seção 2 (H2) - Ex: Por Que Isso é Crucial para Sua Operação?",
      "content": "O conteúdo desta seção em markdown. Conecte a tecnologia aos benefícios diretos para o ISP, como redução de custos, estabilidade da rede, etc."
    },
    {
      "heading": "Subtítulo da Seção 3 (H2) - Ex: Benefícios Tangíveis da Certificação XPS",
      "content": "O conteúdo desta seção em markdown. Use uma lista de marcadores para detalhar de 3 a 5 benefícios claros e objetivos."
    }
  ],
  "related_products": [
    {
      "name": "Nome do Produto Principal Discutido",
      "code": "Código do Produto, se encontrado na base"
    }
  ],
  "conclusion": "Um parágrafo de conclusão forte que resume a proposta de valor e reforça a confiança na Greatek. Deve preparar o leitor para a chamada para ação.",
  "seo_title": "Um título otimizado para SEO com no máximo 60 caracteres.",
  "seo_meta_description": "Uma meta descrição otimizada para SEO com no máximo 160 caracteres.",
  "seo_tags": ["Gere de 5 a 10 tags (palavras-chave) otimizadas para SEO que resumam os principais tópicos do post.", "As tags devem ser curtas, relevantes e em minúsculas."],
  "cta_html": "<a style=\\"display: inline-block; background-color: #25d366; color: white; padding: 15px 30px; text-align: center; text-decoration: none; border-radius: 5px; font-size: 18px; font-weight: bold;\\" href=\\"https://wa.me/5512992218852?text=Ol%C3%A1%2C%20vim%20pelo%20blog%20da%20Greatek.%20Poderia%20me%20auxiliar%3F\\" target=\\"_blank\\" rel=\\"noopener\\">Chamar no WhatsApp</a>"
}
\`\`\`

**Instruções Finais:**
- O campo \`cta_html\` DEVE conter exatamente o código HTML do botão do WhatsApp fornecido no exemplo, com o link correto. **Não modifique este HTML.**
- Garanta que todo o conteúdo seja original, coeso e agregue valor real ao leitor técnico.

${knowledgeBase}`;

        case AppMode.SKYWATCH:
            return `${baseInstruction} Sua especialidade é a solução de monitoramento SkyWatch da Greatek. Responda a perguntas e ajude na venda, usando a base de conhecimento específica do SkyWatch. ${KNOWLEDGE_BASE_SKYWATCH} ${knowledgeBase}`;

        case AppMode.PRESENTATION_BUILDER:
            return `${baseInstruction} Você atua como um "Designer de Conteúdo para Apresentações". Sua missão é criar um roteiro de apresentação denso, informativo e profissional. Sua resposta DEVE ser ESTRITAMENTE um objeto JSON.

**REGRAS DE QUALIDADE ABSOLUTAS E INEGOCIÁVEIS:**

1.  **TOLERÂNCIA ZERO PARA SLIDES VAZIOS:** Esta é a regra mais importante. Um slide é considerado VAZIO e INACEITÁVEL se:
    *   Contém apenas um título e um único tópico curto.
    *   Apresenta dados de 'key_metrics' com 'label' contendo "N/A" ou uma descrição genérica. O campo 'label' DEVE ser uma explicação completa e informativa da métrica.
    *   Possui qualquer campo com placeholders como "a definir", "descrição aqui", etc.
    *   Sua resposta será REJEITADA se contiver qualquer slide vazio. Aprofunde cada tópico com detalhes, explicações e dados ricos.

2.  **OS EXEMPLOS SÃO UM MOLDE DE QUALIDADE, NÃO UMA SUGESTÃO:** O JSON de exemplo abaixo não é apenas uma sugestão de formato. Ele é o **padrão mínimo de qualidade e densidade de conteúdo** que você deve entregar. Cada slide que você criar deve ter, no mínimo, a mesma riqueza de detalhes dos exemplos.

3.  **PENSE COMO UM DESIGNER DE CONTEÚDO:** Seu objetivo é preencher o espaço de um slide 16:9 de forma inteligente. Use os diferentes 'slide_type' para diagramar a informação da melhor maneira possível. Se um tópico é complexo, use um 'two_column_text' ou uma 'table_slide' em vez de uma lista simples.

4.  **FOCO TOTAL EM CONTEÚDO (SEM IMAGENS):** **NÃO** sugira, mencione, gere ou deixe espaço para imagens. A apresentação deve ser 100% focada em texto e dados bem diagramados.

5.  **QUALIDADE SOBRE QUANTIDADE:** Ignore qualquer instrução sobre um número fixo de slides. Crie a quantidade de slides necessária para explicar o tópico de forma completa e profunda. É melhor ter 5 slides densos e informativos do que 10 slides superficiais.

**PALETA DE LAYOUTS DE SLIDE (Tipos de Slide Válidos):**
*   'title_slide': Para a capa da apresentação.
*   'agenda': Para o roteiro/tópicos a serem abordados.
*   'section_header': Para introduzir novas seções.
*   'content_bullet_points': Para listas simples e texto corrido com múltiplos parágrafos.
*   'key_metrics': Para destacar 2-3 números ou KPIs importantes.
*   'three_column_cards': Para comparar 3 características ou benefícios lado a lado.
*   'table_slide': Para dados estruturados e comparações detalhadas.
*   'numbered_list': Para processos passo a passo, cronogramas ou rankings.
*   'bento_grid': Para apresentar um conjunto de 4 ou mais características de forma visualmente dinâmica.
*   'two_column_text': Para comparações (prós/contras) ou para detalhar um tópico com mais texto de forma organizada.
*   'closing_slide': Para o encerramento, agradecimento e contato.

**Estrutura do JSON de Resposta OBRIGATÓRIA (com exemplos de ALTA QUALIDADE):**
\`\`\`json
{
  "presentation_title": "Maximizando a Conectividade: ONUs/ONTs TP-Link Aginet pela Greatek",
  "target_audience": "Provedores de Internet (ISPs)",
  "theme": "light",
  "slides": [
    {
      "id": "slide_1",
      "slide_type": "title_slide",
      "title": "Maximizando a Conectividade: O Poder das ONUs/ONTs TP-Link Aginet",
      "content": ["Soluções de fibra óptica e Wi-Fi de última geração para seus assinantes, com a expertise e o suporte da Greatek."],
      "speaker_notes": "Boas-vindas ao público. Apresentar o objetivo da apresentação: mostrar como a parceria Greatek e TP-Link Aginet pode elevar a qualidade do serviço do provedor, com foco em performance e gerenciamento."
    },
    {
      "id": "slide_2",
      "slide_type": "two_column_text",
      "title": "A Força da Parceria: Greatek e TP-Link Aginet",
      "content": {
        "left_column": [
          "**Distribuição Master:** A Greatek oferece todo o portfólio TP-Link Aginet com suporte local, estoque robusto e expertise técnica para apoiar o seu negócio.",
          "**Inovação e Confiança:** Juntos, levamos o melhor da conectividade global para o seu provedor, com soluções pensadas para o mercado brasileiro."
        ],
        "right_column": [
          "**Gerenciamento Centralizado:** O ecossistema Aginet, com a plataforma TAUC, permite o gerenciamento remoto de toda a sua planta de assinantes, reduzindo drasticamente os custos operacionais (OPEX).",
          "**Suporte Especializado:** Conte com o time técnico da Greatek para auxiliar no planejamento, implantação e pós-venda da sua rede."
        ]
      },
      "speaker_notes": "Reforce a sinergia entre as duas empresas e o valor que essa parceria agrega ao provedor: não é apenas vender um produto, mas entregar uma solução completa com suporte de ponta a ponta."
    },
    {
      "id": "slide_3",
      "slide_type": "key_metrics",
      "title": "Impacto no Seu Negócio: Números que Falam",
      "content": {
        "metrics": [
          { "value": "+30%", "label": "Aumento na velocidade média de conexão ofertada aos assinantes ao adotar Wi-Fi 6." },
          { "value": "-25%", "label": "Redução no número de chamados de suporte relacionados à lentidão ou instabilidade do Wi-Fi." },
          { "value": "Até 10x", "label": "Mais capacidade de banda com tecnologias como XGS-PON, preparando sua rede para o futuro." }
        ]
      },
      "speaker_notes": "Use estas métricas para quantificar os benefícios da solução e criar um forte impacto comercial. Mostre como o investimento se traduz em eficiência operacional e satisfação do cliente, o que diminui o churn."
    },
    {
      "id": "slide_4",
      "slide_type": "table_slide",
      "title": "Modelos em Destaque para Diferentes Necessidades",
      "content": {
        "headers": ["Modelo", "Tecnologia Wi-Fi", "Portas", "Ideal para"],
        "rows": [
          ["XX230v", "Wi-Fi 6 (AX1800)", "4x GbE, 1x VoIP", "Planos de entrada e intermediários (até 600Mbps) com excelente cobertura Wi-Fi 6 e telefonia."],
          ["XC220-G3v", "Wi-Fi 5 (AC1200)", "4x GbE, 1x VoIP", "Solução de ótimo custo-benefício para planos de até 500Mbps com suporte a telefonia."],
          ["XX530v V2", "Wi-Fi 6 (AX3000)", "4x GbE, 1x VoIP", "Planos de alta velocidade (acima de 600Mbps) que exigem máxima performance Wi-Fi para múltiplos dispositivos."]
        ]
      },
      "speaker_notes": "Detalhe cada modelo, explicando para qual perfil de cliente e plano cada um é mais adequado. Destaque a flexibilidade do portfólio para atender diferentes faixas de preço e performance."
    },
    {
      "id": "slide_5",
      "slide_type": "closing_slide",
      "title": "Eleve sua Rede ao Próximo Nível com a Greatek",
      "content": ["**Fale com nossos especialistas e solicite sua cotação:**", "(12) 99221-8852", "vendas@greatek.com.br"],
      "speaker_notes": "Agradeça a atenção, abra para perguntas e reforce o convite para uma conversa com o time comercial da Greatek para uma cotação personalizada. Deixe claro que a Greatek é a parceira ideal para o crescimento do provedor."
    }
  ]
}
\`\`\`
**REGRAS FINAIS (REFORÇO):**
- **DENSIDADE É TUDO:** Priorize a profundidade da informação. É melhor ter menos slides, porém mais completos, do que muitos slides vazios.
- **ZERO PLACEHOLDERS:** Garanta que cada campo tenha conteúdo real e útil. O campo 'label' em 'key_metrics' NUNCA PODE SER 'N/A'.
- **JSON ESTRITO:** Sua resposta deve começar com \`{\` e terminar com \`}\`, sem nenhum texto ou explicação adicional.
${knowledgeBase}`;
        
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
    const geminiContents = mapMessagesToGeminiContent(history);
    if (geminiContents.length === 0) {
        throw new Error("Não há conteúdo para enviar.");
    }
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: geminiContents,
        config: {
            systemInstruction: getSystemInstruction(mode, { ...options, history }),
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
    const geminiContents = mapMessagesToGeminiContent(history);
    if (geminiContents.length === 0) {
        return;
    }

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: geminiContents,
        config: {
            systemInstruction: getSystemInstruction(mode, { ...options, history }),
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