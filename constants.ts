import { AppMode } from './types';

export const SYSTEM_PROMPT = `Você é o Agente Marketing 1.0 da Greatek.
Objetivo: Acelerar a criação de conteúdo e campanhas, fornecer inteligência de mercado e apoiar a equipe comercial e de marketing com informações precisas e criativas.
Diretrizes:
• Lembre-se que a Greatek é uma DISTRIBUIDORA, não uma fabricante. Apresente os produtos como parcerias (ex: "Sunwoda, parceira da Greatek em soluções de energia..." ou "roteadores da TP-Link, que você encontra na Greatek...").
• Use a terminologia comercial correta: "máquinas de fusão", e não "fusionadoras de fibra".
• Responda em PT-BR, claro, técnico e direto, sugerindo next steps.
• Siga limites de SEO quando aplicável: Title ≤ 60 caracteres; Meta ≤ 155; H1 único.
• Para campanhas, seja criativo e considere o calendário comercial B2B.
• Formate entregas em blocos prontos (Markdown) e JSON quando solicitado.
• Para o modo "Divisor de Águas", baseie TODAS as suas respostas exclusivamente no conteúdo do site da Greatek. NUNCA invente informações ou produtos.`;

export const PLACEHOLDER_PROMPTS: Record<AppMode, string> = {
  [AppMode.PAGE]: 'Ex: otimizar /baterias-sunwoda-48v',
  [AppMode.SALES_ASSISTANT]: 'Ex: meu cliente precisa de uma solução de energia para um rack de 19"...',
  [AppMode.AUDIT]: 'Ex: varrer o site em busca de problemas técnicos',
  [AppMode.CONTENT]: 'Ex: post para Instagram sobre o lançamento de um produto parceiro',
  [AppMode.CAMPAIGN]: 'Ex: ideias de campanha para a Black Friday de ISPs',
  [AppMode.COMPLIANCE]: 'Ex: comunicado interno sobre a nova política de segurança',
  [AppMode.MARKET_INTEL]: 'Ex: compare as soluções de energia da Sunwoda com as do Concorrente X',
};

export const MODE_DESCRIPTIONS: Record<AppMode, { title: string; description: string; example: string; }> = {
    [AppMode.PAGE]: {
        title: "Otimizar Página (SEO)",
        description: "Analisa uma URL e fornece um pacote completo de otimização on-page para gerar recomendações prontas para implementação.",
        example: "Para usar, insira o caminho da URL. Ex: /produtos/baterias-sunwoda"
    },
    [AppMode.SALES_ASSISTANT]: {
        title: "Divisor de Águas (Apoio Comercial)",
        description: "Descreva a dor ou a necessidade do cliente. O agente atuará como um assistente de vendas, consultando o site da Greatek para fornecer argumentos técnicos, comerciais e sugestões de produtos das marcas parceiras para resolver o problema.",
        example: "Para usar, descreva o cenário. Ex: Meu cliente tem uma rede FTTH e reclama de custos altos com manutenção. O que oferecer?"
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