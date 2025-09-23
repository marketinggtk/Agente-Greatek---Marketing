
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
    { mode: AppMode.SKYWATCH_ASSISTANT, title: 'Assistente SkyWatch', category: 'Comercial', iconClass: 'bi-broadcast-pin' },
    // Marketing
    { mode: AppMode.PAGE, title: 'Otimizar Página', category: 'Marketing', iconClass: 'bi-file-earmark-code' },
    { mode: AppMode.AUDIT, title: 'Auditoria Técnica', category: 'Marketing', iconClass: 'bi-shield-check' },
    { mode: AppMode.CONTENT, title: 'Conteúdo', category: 'Marketing', iconClass: 'bi-pencil-square' },
    { mode: AppMode.CAMPAIGN, title: 'Campanhas', category: 'Marketing', iconClass: 'bi-megaphone' },
    { mode: AppMode.IMAGE_ADS, title: 'Gerador de Imagens', category: 'Marketing', iconClass: 'bi-image-fill' },
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
• Formate entregas em blocos prontos (Markdown), utilizando tabelas para comparações e listas de dados sempre que apropriado para melhor clareza. Use JSON quando solicitado.`;

// Fix: Added missing placeholder prompts and corrected the broken one for MARKET_INTEL.
export const PLACEHOLDER_PROMPTS: Record<string, string> = {
  [AppMode.PAGE]: 'Ex: otimizar /baterias-sunwoda-48v',
  [AppMode.SALES_ASSISTANT]: 'Ex: meu cliente precisa de uma solução de energia para um rack de 19"...',
  [AppMode.AUDIT]: 'Ex: varrer o site em busca de problemas técnicos',
  [AppMode.CONTENT]: 'Ex: post para Instagram sobre o lançamento de um produto parceiro',
  [AppMode.CAMPAIGN]: 'Ex: ideias de campanha para a Black Friday de ISPs',
  [AppMode.COMPLIANCE]: 'Ex: comunicado interno sobre a nova política de segurança',
  [AppMode.MARKET_INTEL]: 'Ex: compare o roteador TP-Link Archer AX72 com o Intelbras Twibi Giga+',
  [AppMode.INTEGRATOR]: 'Ex: meu cliente pediu uma OLT da TP-Link. O que mais posso ofertar?',
  [AppMode.INSTRUCTOR]: 'Ex: crie um treinamento sobre a máquina de fusão X6',
  [AppMode.ARQUITETO]: 'Ex: projete uma solução para um provedor com 500 clientes',
  [AppMode.VIGIA]: 'Ex: monitore notícias sobre "redes neutras no Brasil"',
  [AppMode.IMAGE_ADS]: 'Ex: um anúncio para a máquina de fusão X6 em um poste',
  [AppMode.SKYWATCH_ASSISTANT]: 'Ex: O monitoramento do SkyWatch afeta a performance da rede?',
};

// Fix: Added missing MODE_DESCRIPTIONS export to be used by AgentWelcome and ModeDescription components.
export const MODE_DESCRIPTIONS: Record<string, { title: string; description: string; example: string; }> = {
    [AppMode.INTEGRATOR]: {
        title: "Agente Integrador",
        description: "Analisa a necessidade de um cliente a partir de um produto inicial e constrói uma oferta de maior valor agregado, sugerindo produtos complementares e essenciais para uma solução completa.",
        example: "Meu cliente pediu uma OLT Chassi X2 da TP-Link. O que mais posso ofertar para ele?"
    },
    [AppMode.INSTRUCTOR]: {
        title: "Agente Instrutor",
        description: "Especialista em produtos que cria kits de treinamento completos e interativos para capacitar a equipe comercial, incluindo pontos-chave, FAQ técnico e um quiz de conhecimento.",
        example: "Crie um kit de treinamento para a Máquina de Fusão X6."
    },
    [AppMode.PAGE]: {
        title: "Agente Otimizador de Página",
        description: "Analisa uma URL e entrega um pacote completo de otimização SEO, incluindo sugestões de título, meta descrição, cabeçalhos, FAQs, links internos e schema JSON-LD.",
        example: "Otimize a página /baterias-sunwoda-48v"
    },
    [AppMode.SALES_ASSISTANT]: {
        title: "Assistente Comercial",
        description: "Um especialista técnico-comercial que entende a necessidade do cliente e o guia ao produto exato que resolve seu problema, seja por modo direto ou consultivo.",
        example: "Meu cliente precisa de uma solução de energia para um rack de 19 polegadas."
    },
    [AppMode.AUDIT]: {
        title: "Agente de Auditoria",
        description: "Realiza uma varredura técnica no site da Greatek em busca de problemas de SEO, como links quebrados, imagens sem alt text, problemas de meta tags e outros fatores que afetam a performance.",
        example: "Faça uma auditoria completa no site www.greatek.com.br"
    },
    [AppMode.CONTENT]: {
        title: "Agente de Conteúdo",
        description: "Cria textos para diversas finalidades de marketing, como posts para redes sociais, roteiros para vídeos, artigos de blog e e-mails, seguindo as diretrizes de comunicação da Greatek.",
        example: "Crie um post para o Instagram sobre o lançamento do novo roteador TP-Link."
    },
    [AppMode.CAMPAIGN]: {
        title: "Agente de Campanhas",
        description: "Desenvolve conceitos criativos e estratégias para campanhas de marketing B2B, considerando o calendário comercial, público-alvo e objetivos de negócio.",
        example: "Me dê 3 ideias de campanha para a Black Friday focada em provedores de internet."
    },
    [AppMode.COMPLIANCE]: {
        title: "Agente de Endomarketing",
        description: "Cria comunicados internos, materiais para treinamento e campanhas de engajamento para os colaboradores da Greatek, garantindo clareza e alinhamento com a cultura da empresa.",
        example: "Elabore um comunicado interno sobre a nova política de segurança da informação."
    },
    [AppMode.MARKET_INTEL]: {
        title: "Agente de Inteligência de Mercado",
        description: "Compara produtos da Greatek e seus parceiros com concorrentes, gerando relatórios com diferenciais, argumentos comerciais e um resumo de vendas para a equipe.",
        example: "Compare o roteador TP-Link Archer AX72 com o Intelbras Twibi Giga+."
    },
    [AppMode.VIGIA]: {
        title: "O Vigia",
        description: "Monitora a internet usando a busca do Google para gerar relatórios de inteligência sobre tópicos específicos, identificando oportunidades, ameaças e insights acionáveis.",
        example: "Monitore notícias sobre 'redes neutras no Brasil'."
    },
    [AppMode.ARQUITETO]: {
        title: "Arquiteto de Soluções",
        description: "Analisa a necessidade técnica de um cliente e projeta uma solução completa, detalhando diagnóstico, benefícios, argumentos comerciais e todos os produtos necessários.",
        example: "Projete uma solução para um provedor com 500 clientes que precisa de um upgrade de rede."
    },
    [AppMode.IMAGE_ADS]: {
        title: "Gerador de Imagens para Anúncios",
        description: "Cria imagens de produtos prontas para redes sociais. Descreva a cena e o agente usará a base de conhecimento para gerar um anúncio visualmente impactante.",
        example: "Crie uma imagem da bateria Sunwoda instalada em um rack de telecomunicações bem iluminado."
    },
    [AppMode.SKYWATCH_ASSISTANT]: {
        title: "Assistente SkyWatch",
        description: "Seu especialista dedicado para responder todas as dúvidas sobre a plataforma de monitoramento SkyWatch, desde funcionalidades técnicas até benefícios para o negócio.",
        example: "O SkyWatch substitui ferramentas como Zabbix ou PRTG?"
    }
};