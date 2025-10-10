import { AppMode, SlideType } from './types';

// FIX: Added SYSTEM_PROMPT constant to provide a base instruction for all AI agents.
export const SYSTEM_PROMPT = `Você é o "Agente Greatek", um assistente de IA especializado, projetado para ser o principal ponto de apoio para as equipes Comercial e de Marketing da Greatek, uma distribuidora de tecnologia. Sua missão é fornecer respostas precisas, criativas e úteis, utilizando uma base de conhecimento interna sobre produtos, parceiros e estratégias da empresa.`;

export interface AgentDefinition {
    mode: AppMode;
    title: string;
    category: 'Comercial' | 'Marketing' | 'Ferramentas';
    iconClass: string;
}

// FIX: Added and exported the AGENTS constant, defining all available agents, their categories, and icons.
export const AGENTS: AgentDefinition[] = [
    { mode: AppMode.INTEGRATOR, title: "Integrador", category: 'Comercial', iconClass: "bi-bricks" },
    { mode: AppMode.ARQUITETO, title: "Arquiteto", category: 'Comercial', iconClass: "bi-building-gear" },
    { mode: AppMode.INSTRUCTOR, title: "Instrutor", category: 'Comercial', iconClass: "bi-person-video3" },
    { mode: AppMode.SKYWATCH, title: "SkyWatch", category: 'Comercial', iconClass: "bi-broadcast-pin" },
    { mode: AppMode.MARKET_INTEL, title: "Mercado", category: 'Comercial', iconClass: "bi-graph-up-arrow" },
    { mode: AppMode.SALES_ASSISTANT, title: "Assistente Comercial", category: 'Comercial', iconClass: "bi-headset" },
    { mode: AppMode.PAGE, title: "Otimizador de Página", category: 'Marketing', iconClass: "bi-file-earmark-text-fill" },
    { mode: AppMode.AUDIT, title: "Auditoria Técnica", category: 'Marketing', iconClass: "bi-shield-check" },
    { mode: AppMode.CAMPAIGN, title: "Estrategista de Campanhas", category: 'Marketing', iconClass: "bi-megaphone-fill" },
    { mode: AppMode.COMPLIANCE, title: "Endomarketing", category: 'Marketing', iconClass: "bi-card-checklist" },
    { mode: AppMode.IMAGE_ADS, title: "Gerador de Imagens", category: 'Marketing', iconClass: "bi-image-fill" },
    { mode: AppMode.GOAL_CALCULATOR, title: "Calculadora de Metas", category: 'Ferramentas', iconClass: "bi-calculator-fill" },
    { mode: AppMode.PRESENTATION_BUILDER, title: "Criador de Apresentações", category: 'Ferramentas', iconClass: "bi-file-slides-fill" },
    { mode: AppMode.PGR_CALCULATOR, title: "Calculadora de PGR", category: 'Ferramentas', iconClass: "bi-award-fill" },
];

// FIX: Added and exported a record of descriptions for each agent mode.
export const MODE_DESCRIPTIONS: Record<AppMode, { title: string; description: string; example: string; }> = {
    [AppMode.INTEGRATOR]: {
        title: 'Integrador',
        description: 'Cria soluções completas combinando produtos do portfólio Greatek para atender a necessidades específicas.',
        example: 'Meu cliente precisa montar um provedor do zero para 500 assinantes em um condomínio.'
    },
    [AppMode.INSTRUCTOR]: {
        title: 'Instrutor',
        description: 'Gera kits de treinamento técnico e comercial sobre produtos específicos, incluindo FAQs e quizzes.',
        example: 'Crie um treinamento sobre a OLT Chassi X2 da TP-Link.'
    },
    [AppMode.PAGE]: {
        title: 'Otimizador de Página',
        description: 'Analisa uma URL e gera um pacote completo de otimização de SEO (títulos, meta, h1, FAQs, etc.).',
        example: 'Otimize a página /produto/roteador-archer-ax72 para a palavra-chave "roteador wifi 6".'
    },
    [AppMode.SALES_ASSISTANT]: {
        title: 'Assistente Comercial',
        description: 'Recomenda o produto ideal e fornece argumentos de venda consultivos para fechar negócios.',
        example: 'Meu cliente precisa de uma solução de energia para uma OLT em um rack 19.'
    },
    [AppMode.AUDIT]: {
        title: 'Auditoria Técnica',
        description: 'Realiza auditorias técnicas de SEO, performance e acessibilidade em uma URL e sugere melhorias.',
        example: 'Faça uma auditoria de performance no site da Greatek.'
    },
    [AppMode.CAMPAIGN]: {
        title: 'Estrategista de Campanhas',
        description: 'Desenvolve conceitos e planos estruturados para campanhas de marketing B2B.',
        example: 'Crie uma campanha de lançamento para o novo roteador Wi-Fi 7.'
    },
    [AppMode.COMPLIANCE]: {
        title: 'Endomarketing',
        description: 'Cria comunicados internos, campanhas e materiais para engajamento dos colaboradores.',
        example: 'Crie um comunicado sobre a nova política de home office.'
    },
    // FIX: Added missing description for the Content agent mode.
    [AppMode.CONTENT]: {
        title: 'Gerador de Conteúdo',
        description: 'Atua como um Diretor de Criação para desenvolver pacotes de conteúdo (posts, legendas, hashtags) para redes sociais e blogs.',
        example: 'Crie um post para Instagram sobre a nova Máquina de Fusão X6.'
    },
    [AppMode.MARKET_INTEL]: {
        title: 'Mercado',
        description: 'Compara produtos Greatek com concorrentes e gera relatórios de inteligência de mercado.',
        example: 'Compare o roteador Archer AX72 da TP-Link com o principal concorrente.'
    },
    [AppMode.ARQUITETO]: {
        title: 'Arquiteto',
        description: 'Projeta soluções de infraestrutura complexas para cenários e projetos específicos.',
        example: 'Projete uma solução de rede para um hotel de 200 quartos com Wi-Fi de alta densidade.'
    },
    [AppMode.IMAGE_ADS]: {
        title: 'Gerador de Imagens',
        description: 'Cria imagens para anúncios e redes sociais a partir de descrições textuais.',
        example: 'Crie um anúncio do roteador Archer AX72 em uma sala de estar moderna.'
    },
    [AppMode.SKYWATCH]: {
        title: 'SkyWatch',
        description: 'Responde perguntas e auxilia na venda da solução de monitoramento SkyWatch da Greatek.',
        example: 'Quais os principais benefícios do SkyWatch para um provedor de internet?'
    },
    [AppMode.GOAL_CALCULATOR]: {
        title: 'Calculadora de Metas',
        description: 'Ferramenta para planejar o esforço de vendas necessário para atingir seus objetivos.',
        example: 'Preencha os campos para calcular as propostas necessárias.'
    },
    [AppMode.PRESENTATION_BUILDER]: {
        title: 'Criador de Apresentações',
        description: 'Cria roteiros completos de apresentações institucionais ou comerciais, slide a slide.',
        example: 'Crie uma apresentação sobre as soluções de energia da Greatek para ISPs.'
    },
    [AppMode.PGR_CALCULATOR]: {
        title: 'Calculadora de PGR Individual',
        description: 'Calcula o valor da premiação (PGR) com base nas metas e resultados do vendedor.',
        example: 'Preencha as metas e os valores realizados para ver o cálculo do PGR.'
    },
    [AppMode.BUSINESS_ANALYZER]: {
        title: 'Analisador de Negócios',
        description: 'Analisa dados de planilhas de vendas (ganhos/perdas) para extrair KPIs e insights estratégicos.',
        example: 'Faça o upload de sua planilha de vendas para começar a análise.'
    },
    [AppMode.TRAINING_COACH]: {
        title: 'Coach de Treinamento',
        description: 'Simula um cliente com dúvidas para que você treine suas respostas e receba uma avaliação detalhada.',
        example: 'Inicie uma simulação e teste suas habilidades de argumentação e quebra de objeções.'
    },
    [AppMode.CUSTOMER_DOSSIER]: {
        title: 'Gerador de Dossiê',
        description: 'Pesquisa uma empresa e cria um dossiê com notícias, insights e ganchos de conversa para preparar vendedores.',
        example: 'Gere um dossiê para a empresa "Provedor de Internet XYZ Ltda".'
    },
};