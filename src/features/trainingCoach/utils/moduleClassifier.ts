import { normalizeText } from './normalizeText';

/**
 * Classifies a product and returns its icon and category
 */
export const getIconAndCategory = (name: string) => {
    const n = normalizeText(name);
    
    if (n.includes('fusao')) return { icon: 'bi-lightning-charge', category: 'Máquinas de Fusão' };
    if (n.includes('bateria') || n.includes('nobreak') || n.includes('energia')) return { icon: 'bi-battery-charging', category: 'Energia' };
    if (n.includes('roteador') || n.includes('wi-fi') || n.includes('wifi') || n.includes('wr') || n.includes('arch') || n.includes('mr')) return { icon: 'bi-router', category: 'Roteadores' };
    if (n.includes('ont') || n.includes('onu') || n.includes('xz') || n.includes('xc') || n.includes('xx')) return { icon: 'bi-router-fill', category: 'ONTs' };
    if (n.includes('switch')) return { icon: 'bi-motherboard', category: 'Switches' };
    if (n.includes('cabo') || n.includes('fibra')) return { icon: 'bi-reception-4', category: 'Cabos e Fibras' };
    if (n.includes('otdr') || n.includes('kit') || n.includes('ferramenta')) return { icon: 'bi-tools', category: 'Teste e Ferramental' };
    
    return { icon: 'bi-box-seam', category: 'Outros' };
};

/**
 * Detects the brand of a product based on its name or details
 */
export const detectBrand = (name: string, details: string): string => {
    const n = normalizeText(name);
    const d = normalizeText(details);
    
    if (n.includes('tp-link') || d.includes('tp-link')) return 'TP-Link';
    if (n.includes('mercusys') || d.includes('mercusys')) return 'Mercusys';
    if (n.includes('volt') || d.includes('volt')) return 'Volt';
    if (n.includes('think') || d.includes('think')) return 'Think Technology';
    if (n.includes('lacerda') || d.includes('lacerda')) return 'Lacerda';
    if (n.includes('cabel') || d.includes('cabel')) return 'Cabel';
    
    return 'Greatek';
};
