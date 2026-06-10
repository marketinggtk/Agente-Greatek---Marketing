export interface ChatSuggestion {
    id: string;
    label: string;
    prompt: string;
}

export const QUICK_QUESTIONS: ChatSuggestion[] = [
    { id: 'vender', label: 'Como vender este produto para um provedor?', prompt: 'Como vender este produto para um provedor de internet?' },
    { id: 'objecoes', label: 'Quais objeções o cliente pode trazer?', prompt: 'Quais as principais objeções que um cliente pode trazer sobre este produto?' },
    { id: 'argumentos', label: 'Quais argumentos comerciais usar?', prompt: 'Quais os melhores argumentos comerciais para usar ao oferecer este produto?' },
    { id: 'valor', label: 'Em qual cenário este produto gera mais valor?', prompt: 'Explique em qual cenário técnico e comercial este produto gera mais valor para o cliente.' },
    { id: 'tecnico', label: 'Quais pontos técnicos devo dominar?', prompt: 'Quais são os pontos técnicos fundamentais que eu preciso dominar para falar com autoridade sobre este produto?' },
    { id: 'pitch', label: 'Monte um pitch rápido de venda.', prompt: 'Monte um pitch rápido de venda (30 segundos) para este produto.' },
    { id: 'comparativo_simples', label: 'Compare este produto com uma solução mais simples.', prompt: 'Compare este produto com uma solução mais simples/custo-benefício, mostrando quando vale a pena investir neste modelo superior.' },
    { id: 'diagnostico', label: 'Crie perguntas para diagnóstico.', prompt: 'Crie perguntas de diagnóstico para eu fazer ao cliente e descobrir se ele realmente precisa deste produto.' },
];

export const ACTION_CHIPS: ChatSuggestion[] = [
    { id: 'chip_pitch', label: 'Pitch comercial', prompt: 'Crie um pitch comercial curto e direto para vender este produto a um provedor de internet.' },
    { id: 'chip_objecoes', label: 'Objeções', prompt: 'Liste as principais objeções que um cliente pode trazer sobre este produto e como contornar cada uma.' },
    { id: 'chip_checklist', label: 'Checklist técnico', prompt: 'Crie um checklist técnico com os pontos que o vendedor precisa dominar antes de oferecer este produto.' },
    { id: 'chip_diagnostico', label: 'Perguntas de diagnóstico', prompt: 'Crie perguntas de diagnóstico para entender se o cliente realmente precisa deste produto.' },
    { id: 'chip_comparativo', label: 'Comparativo', prompt: 'Compare este produto com uma alternativa mais simples, destacando quando vale a pena escolher este modelo.' },
    { id: 'chip_valor', label: 'Argumentos de valor', prompt: 'Liste argumentos de valor para mostrar que este produto não deve ser analisado apenas pelo preço.' },
    { id: 'chip_riscos', label: 'Riscos de venda errada', prompt: 'Explique quais riscos existem ao indicar este produto para o cenário errado.' },
    { id: 'chip_proximo', label: 'Próximo passo com o cliente', prompt: 'Depois de apresentar este produto, qual deve ser o próximo passo comercial com o cliente?' },
];
