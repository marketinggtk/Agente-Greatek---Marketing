/**
 * Returns a contextual consultant tip based on the product category
 */
export const getCategoryConsultantTip = (category: string): string => {
    const c = category.toLowerCase();
    
    if (c.includes('fusao')) {
        return 'Antes de vender, descubra o volume de fusões, o tipo de equipe em campo e se o cliente valoriza produtividade ou apenas preço.';
    }
    if (c.includes('energia')) {
        return 'Comece perguntando sobre quedas de energia, autonomia necessária e criticidade do POP.';
    }
    if (c.includes('ont') || c.includes('onu')) {
        return 'Entenda o perfil da base do provedor: plano vendido, Wi-Fi necessário, suporte remoto e reclamações de cobertura.';
    }
    if (c.includes('roteador')) {
        return 'Conecte a venda com experiência do assinante, redução de chamados e percepção de qualidade do serviço.';
    }
    if (c.includes('teste') || c.includes('ferramental')) {
        return 'Mostre como a ferramenta reduz retrabalho, melhora diagnóstico e aumenta a velocidade da equipe técnica.';
    }
    
    return 'Comece entendendo o cenário de uso, o problema atual e o impacto operacional para o cliente.';
};
