
import { AppMode } from './types';

export interface AgentDefinition {
    mode: AppMode;
    title: string;
    category: 'Comercial' | 'Marketing';
    iconClass: string;
}

export const AGENTS: AgentDefinition[] = [
    // Comercial
    { mode: AppMode.INTEGRATOR, title: 'Integrador', category: 'Comercial', iconClass: 'bi-bricks' },
    { mode: AppMode.INSTRUCTOR, title: 'Instrutor', category: 'Comercial', iconClass: 'bi-person-video3' },
    { mode: AppMode.ARQUITETO, title: 'Arquiteto', category: 'Comercial', iconClass: 'bi-bounding-box-circles' },
    { mode: AppMode.MARKET_INTEL, title: 'Mercado', category: 'Comercial', iconClass: 'bi-graph-up-arrow' },
    { mode: AppMode.SALES_ASSISTANT, title: 'Assistente Comercial', category: 'Comercial', iconClass: 'bi-chat-quote' },
    // Marketing
    { mode: AppMode.PAGE, title: 'Otimizar Página', category: 'Marketing', iconClass: 'bi-file-earmark-code' },
    { mode: AppMode.AUDIT, title: 'Auditoria Técnica', category: 'Marketing', iconClass: 'bi-shield-check' },
    { mode: AppMode.CONTENT, title: 'Conteúdo', category: 'Marketing', iconClass: 'bi-pencil-square' },
    { mode: AppMode.CAMPAIGN, title: 'Campanhas', category: 'Marketing', iconClass: 'bi-megaphone' },
    { mode: AppMode.COMPLIANCE, title: 'Endomarketing', category: 'Marketing', iconClass: 'bi-card-checklist' },
];


export const SYSTEM_PROMPT = `Você é o Agente Marketing 1.0 da Greatek.
Objetivo: Acelerar a criação de conteúdo e campanhas, fornecer inteligência de mercado e apoiar a equipe comercial e de marketing com informações precisas e criativas.
Diretrizes:
• Lembre-se que a Greatek é uma DISTRIBUIDORA, não uma fabricante. Apresente os produtos como parcerias (ex: "Sunwoda, parceira da Greatek em soluções de energia..." ou "roteadores da TP-Link, que você encontra na Greatek...").
• Sempre que o contexto for sobre conectividade (redes, roteadores, Wi-Fi), posicione a Greatek como distribuidora da TP-Link (Parceiro MASTER) e suas submarcas (Omada, Tapo, Vigi, Mercusys), alavancando essa parceria para criar soluções completas.
• Use a terminologia comercial correta: "máquinas de fusão", e não "fusionadoras de fibra".
• Responda em PT-BR, claro, técnico e direto, sugerindo próximos passos.
• Siga limites de SEO quando aplicável: Title ≤ 60 caracteres; Meta ≤ 155; H1 único.
• Para campanhas, seja criativo e considere o calendário comercial B2B.
• Formate entregas em blocos prontos (Markdown) e JSON quando solicitado.`;

export const PLACEHOLDER_PROMPTS: Record<AppMode, string> = {
  [AppMode.PAGE]: 'Ex: otimizar /baterias-sunwoda-48v',
  [AppMode.SALES_ASSISTANT]: 'Ex: meu cliente precisa de uma solução de energia para um rack de 19"...',
  [AppMode.AUDIT]: 'Ex: varrer o site em busca de problemas técnicos',
  [AppMode.CONTENT]: 'Ex: post para Instagram sobre o lançamento de um produto parceiro',
  [AppMode.CAMPAIGN]: 'Ex: ideias de campanha para a Black Friday de ISPs',
  [AppMode.COMPLIANCE]: 'Ex: comunicado interno sobre a nova política de segurança',
  [AppMode.MARKET_INTEL]: 'Ex: compare as soluções de energia da Sunwoda com as do Concorrente X',
  [AppMode.INTEGRATOR]: 'Ex: meu cliente pediu uma OLT. O que mais posso ofertar?',
  [AppMode.INSTRUCTOR]: 'Ex: gerar kit de treinamento para a Máquina de Fusão X6',
  [AppMode.VIGIA]: 'Ex: monitore o avanço do 5G FWA no Brasil',
  [AppMode.ARQUITETO]: 'Ex: cliente com rede GPON saturada querendo oferecer planos de 1 Giga',
};

export const MODE_DESCRIPTIONS: Record<AppMode, { title: string; description: string; example: string; }> = {
    [AppMode.PAGE]: {
        title: "Otimizar Página (SEO)",
        description: "Analisa uma URL e fornece um pacote completo de otimização on-page para gerar recomendações prontas para implementação.",
        example: "Para usar, insira o caminho da URL. Ex: /produtos/baterias-sunwoda"
    },
    [AppMode.SALES_ASSISTANT]: {
        title: "Assistente Comercial",
        description: "Descreva a dor ou a necessidade do cliente. O agente atuará como um assistente de vendas, consultando o site da Greatek para fornecer argumentos técnicos, comerciais e sugestões de produtos das marcas parceiras para resolver o problema.",
        example: "Para usar, descreva o cenário. Ex: Meu cliente tem uma rede FTTH e reclama de custos altos com manutenção. O que oferecer?"
    },
    [AppMode.INTEGRATOR]: {
        title: "Integrador (Soluções Completas)",
        description: "A partir de um único produto ou necessidade, o agente irá construir e sugerir uma solução completa, detalhando todos os componentes necessários (energia, ativos, passivos, ferramentas) do ecossistema Greatek e parceiros, para capacitar o vendedor a fazer uma venda consultiva e de maior valor.",
        example: "Para usar, cite a necessidade inicial. Ex: O cliente precisa de uma CTO para 16 assinantes."
    },
    [AppMode.INSTRUCTOR]: {
        title: "Instrutor (Capacitação)",
        description: "Crie um kit de treinamento 360° para qualquer produto. O agente gera argumentos de venda, um FAQ técnico e um quiz interativo de 10 perguntas com pontuação para testar e reforçar o conhecimento da equipe.",
        example: "Para usar, informe o produto. Ex: Máquina de Fusão Óptica G-FUSION PRO"
    },
    [AppMode.ARQUITETO]: {
        title: "Arquiteto (Planejamento de Rede)",
        description: "Diagnostica gargalos em redes existentes, propõe soluções de upgrade (ex: GPON para XGS-PON) e simula os benefícios em métricas claras para o cliente, gerando argumentos de venda e a lista de produtos necessários.",
        example: "Para usar, descreva o cenário. Ex: Meu cliente com 500 assinantes em GPON está com a rede lenta em horários de pico."
    },
    [AppMode.VIGIA]: {
        title: "O Vigia (Monitoramento Ativo)",
        description: "Monitore notícias, tendências e concorrentes. O agente usa a busca do Google para encontrar informações atualizadas, identifica oportunidades/ameaças e sugere ações comerciais.",
        example: "Para usar, peça um monitoramento. Ex: quais as últimas novidades sobre redes neutras para ISPs?"
    },
    [AppMode.AUDIT]: {
        title: "Auditoria Técnica (SEO)",
        description: "Faça uma varredura técnica no seu domínio para identificar problemas de indexação e performance, como Core Web Vitals, links quebrados e conteúdo duplicado.",
        example: "Para usar, insira o domínio ou confirme para varrer o site principal."
    },
    [AppMode.CONTENT]: {
        title: "Agente de Conteúdo",
        description: "Crie textos para posts, carrosséis, e-mails, blogs e roteiros de vídeo. O agente pode gerar variações de títulos, legendas e ajustar o tom de voz (profissional, técnico, comercial, criativo).",
        example: "Para usar, descreva o conteúdo. Ex: 3 opções de legenda para post sobre a nova OLT"
    },
    [AppMode.CAMPAIGN]: {
        title: "Agente de Campanhas & Ideias",
        description: "Ideal para brainstorming. O agente sugere temas para promoções sazonais (Customer Week, Black Friday, Abrint), cria nomes de campanhas, slogans e propõe ações de engajamento.",
        example: "Para usar, peça ideias para um evento. Ex: nomes criativos para nossa campanha da Semana do Cliente"
    },
    [AppMode.COMPLIANCE]: {
        title: "Agente de Endomarketing",
        description: "Apoie a comunicação interna e o alinhamento com as políticas da empresa. Crie textos para campanhas (Outubro Rosa, Novembro Azul), resuma normas de compliance ou gere quizzes para colaboradores.",
        example: "Para usar, solicite o comunicado. Ex: texto para e-mail interno sobre a campanha de vacinação"
    },
    [AppMode.MARKET_INTEL]: {
        title: "Agente de Inteligência de Mercado",
        description: "Compare produtos concorrentes e receba sugestões de diferenciais competitivos. O agente fornecerá uma tabela comparativa e uma justificativa comercial.",
        example: "Para usar, peça uma comparação. Ex: Compare o produto Greatek X com o produto Concorrente Y."
    }
};