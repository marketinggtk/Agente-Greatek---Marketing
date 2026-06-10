
export type BlogCategory = 
  | 'redes-conectividade'
  | 'fibra-optica-ftth'
  | 'energia-infraestrutura'
  | 'telecom-provedores'
  | 'seguranca-vigilancia'
  | 'casa-inteligente'
  | 'ferramentas-equipamentos';

export interface CategoryInfo {
  id: BlogCategory;
  name: string;
  slug: string;
  description: string;
  keywords: string[];
  relatedProducts: string[];
}

export const BLOG_CATEGORIES: Record<BlogCategory, CategoryInfo> = {
  'redes-conectividade': {
    id: 'redes-conectividade',
    name: 'Redes e Conectividade',
    slug: 'redes-conectividade',
    description: 'Soluções completas para infraestrutura de rede empresarial e provedores',
    keywords: [
      'switch', 'roteador', 'access point', 'wi-fi', 'mesh', 'omada', 
      'rede empresarial', 'conectividade', 'wireless', 'lan', 'wan',
      'tp-link', 'mercusys', 'poe', 'vlan', 'sdwan'
    ],
    relatedProducts: [
      'switches', 'roteadores', 'access-points', 'controladores', 'antenas'
    ]
  },
  
  'fibra-optica-ftth': {
    id: 'fibra-optica-ftth',
    name: 'Fibra Óptica e FTTH',
    slug: 'fibra-optica-ftth',
    description: 'Equipamentos e soluções para redes de fibra óptica até o cliente',
    keywords: [
      'fibra óptica', 'ftth', 'gpon', 'xgs-pon', 'olt', 'ont', 'onu',
      'fusão', 'emenda', 'cabo óptico', 'drop', 'splitter', 'cto', 'ceo',
      'monomodo', 'multimodo', 'conector', 'pigtail', 'cordão óptico',
      'otdr', 'medidor de potência', 'vfl', 'think technology', '2flex'
    ],
    relatedProducts: [
      'olts', 'onts', 'cabos-opticos', 'maquinas-fusao', 'otdr', 'splitters'
    ]
  },
  
  'energia-infraestrutura': {
    id: 'energia-infraestrutura',
    name: 'Energia e Infraestrutura',
    slug: 'energia-infraestrutura',
    description: 'Sistemas de energia ininterrupta e infraestrutura para telecom',
    keywords: [
      'nobreak', 'bateria', 'retificador', 'inversor', 'ups', 'energia',
      'fonte', 'rack', 'quadro elétrico', 'controlador de carga',
      'solar', 'backup', 'autonomia', 'volt', 'xps', 'lacerda',
      'sunwoda', 'litio', 'chumbo ácido', 'telecom power'
    ],
    relatedProducts: [
      'nobreaks', 'baterias', 'retificadores', 'inversores', 'racks'
    ]
  },
  
  'telecom-provedores': {
    id: 'telecom-provedores',
    name: 'Telecom e Provedores',
    slug: 'telecom-provedores',
    description: 'Soluções completas para provedores de internet e operadoras',
    keywords: [
      'isp', 'provedor', 'internet', 'banda larga', 'telecom',
      'monitoramento', 'gestão de rede', 'skywatch', 'noc', 'soc',
      'qualidade de serviço', 'sla', 'troubleshooting', 'diagnóstico',
      'performance', 'latência', 'uptime', 'infraestrutura de rede'
    ],
    relatedProducts: [
      'skywatch', 'olts', 'switches-core', 'servidores', 'monitoramento'
    ]
  },
  
  'seguranca-vigilancia': {
    id: 'seguranca-vigilancia',
    name: 'Segurança e Vigilância',
    slug: 'seguranca-vigilancia',
    description: 'Sistemas profissionais de videovigilância e segurança',
    keywords: [
      'câmera', 'nvr', 'cftv', 'vigilância', 'segurança', 'vigi',
      'gravador', 'monitoramento', 'ia', 'detecção', 'reconhecimento',
      'analítica de vídeo', 'alarme', 'controle de acesso', 'ip camera',
      'poe camera', 'dome', 'bullet', 'ptz'
    ],
    relatedProducts: [
      'cameras-vigi', 'nvrs', 'gravadores', 'alarmes'
    ]
  },
  
  'casa-inteligente': {
    id: 'casa-inteligente',
    name: 'Casa Inteligente',
    slug: 'casa-inteligente',
    description: 'Dispositivos e soluções para automação residencial',
    keywords: [
      'casa inteligente', 'smart home', 'automação', 'iot', 'tapo',
      'câmera ip', 'plugue inteligente', 'lâmpada inteligente',
      'sensor', 'controle remoto', 'app', 'alexa', 'google home',
      'segurança residencial', 'monitoramento residencial'
    ],
    relatedProducts: [
      'tapo-cameras', 'tapo-plugues', 'tapo-lampadas', 'sensores'
    ]
  },
  
  'ferramentas-equipamentos': {
    id: 'ferramentas-equipamentos',
    name: 'Ferramentas e Equipamentos',
    slug: 'ferramentas-equipamentos',
    description: 'Ferramentas profissionais para instalação e manutenção',
    keywords: [
      'máquina de fusão', 'fusionadora', 'clivador', 'decapador',
      'otdr', 'medidor de potência', 'vfl', 'localizador visual',
      'alicate', 'crimpador', 'teste', 'certificação', 'ferramenta',
      'instalação', 'manutenção', 'x6', 'gfusionpro', 'equipamento de teste'
    ],
    relatedProducts: [
      'maquinas-fusao', 'otdr', 'medidores', 'ferramentas-instalacao'
    ]
  }
};

// Função para identificar categoria baseada em keywords do tema
export function identifyCategory(topic: string): BlogCategory {
  const topicLower = topic.toLowerCase();
  
  // Pontuação por categoria
  const scores: Record<BlogCategory, number> = {
    'redes-conectividade': 0,
    'fibra-optica-ftth': 0,
    'energia-infraestrutura': 0,
    'telecom-provedores': 0,
    'seguranca-vigilancia': 0,
    'casa-inteligente': 0,
    'ferramentas-equipamentos': 0
  };
  
  // Calcular pontuação baseada em keywords
  Object.entries(BLOG_CATEGORIES).forEach(([categoryId, categoryInfo]) => {
    categoryInfo.keywords.forEach(keyword => {
      if (topicLower.includes(keyword.toLowerCase())) {
        scores[categoryId as BlogCategory] += 1;
      }
    });
  });
  
  // Retornar categoria com maior pontuação
  const maxScore = Math.max(...Object.values(scores));
  const bestCategory = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];
  
  return (bestCategory as BlogCategory) || 'telecom-provedores'; // Default para telecom
}

// Função para obter categorias relacionadas (para interlinking)
export function getRelatedCategories(category: BlogCategory, limit: number = 2): BlogCategory[] {
  const categoryRelations: Record<BlogCategory, BlogCategory[]> = {
    'redes-conectividade': ['telecom-provedores', 'seguranca-vigilancia'],
    'fibra-optica-ftth': ['telecom-provedores', 'ferramentas-equipamentos'],
    'energia-infraestrutura': ['telecom-provedores', 'fibra-optica-ftth'],
    'telecom-provedores': ['fibra-optica-ftth', 'redes-conectividade'],
    'seguranca-vigilancia': ['redes-conectividade', 'casa-inteligente'],
    'casa-inteligente': ['seguranca-vigilancia', 'redes-conectividade'],
    'ferramentas-equipamentos': ['fibra-optica-ftth', 'telecom-provedores']
  };
  
  return categoryRelations[category].slice(0, limit);
}
