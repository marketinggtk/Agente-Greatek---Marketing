
// Sistema de Interlinking Inteligente para Otimização GEO
// Implementa estratégia balanceada: 60% Long-tail, 25% Branded, 15% Exact Match

import { BlogCategory, identifyCategory, getRelatedCategories, BLOG_CATEGORIES } from './categoryMapping';
import { KnowledgeBaseProduct } from '../../types';

export type AnchorTextType = 'long-tail' | 'branded' | 'exact-match';

export interface InternalLink {
  url: string;
  anchorText: string;
  type: AnchorTextType;
  contextHint: string; // Dica de onde inserir no texto
  priority: number; // 1-5, quanto maior mais importante
}

export interface LinkingStrategy {
  productLinks: InternalLink[];
  categoryLinks: InternalLink[];
  relatedPostLinks: InternalLink[];
  specialProjectLinks: InternalLink[];
}

// Banco de dados simplificado de produtos (baseado no arquivo original)
const PRODUCT_DATABASE = {
  'maquina-fusao-x6': {
    url: 'https://www.greatek.com.br/produto/maquina-de-fusao-x6/',
    name: 'Máquina de Fusão X6',
    keywords: ['fusão', 'emenda', 'fibra óptica', 'x6', 'máquina'],
    category: 'ferramentas-equipamentos'
  },
  'maquina-fusao-gfusionpro': {
    url: 'https://www.greatek.com.br/produto/maquina-de-fusao-gfusionpro/',
    name: 'Máquina de Fusão G-FUSION PRO',
    keywords: ['fusão', 'emenda', 'fibra óptica', 'gfusion', 'pro'],
    category: 'ferramentas-equipamentos'
  },
  'bateria-litio-sunwoda': {
    url: 'https://www.greatek.com.br/produto/bateria-de-litio-100ah-sunwoda/',
    name: 'Bateria de Lítio Sunwoda 100Ah',
    keywords: ['bateria', 'lítio', 'energia', 'backup', 'sunwoda'],
    category: 'energia-infraestrutura'
  },
  'olt-gpon-tp-link': {
    url: 'https://www.greatek.com.br/categoria-produto/telecom/',
    name: 'OLT GPON TP-Link',
    keywords: ['olt', 'gpon', 'fibra', 'provedor', 'tp-link'],
    category: 'fibra-optica-ftth'
  },
  'switches-omada': {
    url: 'https://www.greatek.com.br/brand/omada/',
    name: 'Switches Omada TP-Link',
    keywords: ['switch', 'omada', 'rede', 'empresarial', 'poe'],
    category: 'redes-conectividade'
  },
  'cameras-vigi': {
    url: 'https://www.greatek.com.br/categoria-produto/redes/cameras-de-vigilancia-vigi/',
    name: 'Câmeras VIGI TP-Link',
    keywords: ['câmera', 'vigi', 'vigilância', 'segurança', 'ia'],
    category: 'seguranca-vigilancia'
  },
  'tapo-casa-inteligente': {
    url: 'https://www.greatek.com.br/brand/tapo/',
    name: 'Tapo Casa Inteligente',
    keywords: ['tapo', 'smart home', 'automação', 'iot', 'casa inteligente'],
    category: 'casa-inteligente'
  },
  'skywatch': {
    url: 'https://skywatch.greatek.com.br/',
    name: 'SkyWatch Monitoramento',
    keywords: ['skywatch', 'monitoramento', 'rede', 'diagnóstico', 'qualidade'],
    category: 'telecom-provedores'
  },
  'otdr-greatek': {
    url: 'https://www.greatek.com.br/categoria-produto/fibra-optica/otdr/',
    name: 'OTDR Greatek',
    keywords: ['otdr', 'teste', 'fibra', 'medidor', 'diagnóstico'],
    category: 'ferramentas-equipamentos'
  },
  'retificadores-xps': {
    url: 'https://www.greatek.com.br/brand/xps/',
    name: 'Retificadores XPS',
    keywords: ['retificador', 'energia', 'xps', 'telecom', 'backup'],
    category: 'energia-infraestrutura'
  }
};

const SPECIAL_PROJECTS = [
  {
    url: 'https://www.greatek.com.br/projetos-especiais/switches-poe-tp-link/',
    keywords: ['poe', 'switch', 'alimentação'],
    anchorText: 'soluções PoE para alimentação de dispositivos de rede'
  },
  {
    url: 'https://www.greatek.com.br/projetos-especiais/solucao-multi-gigabit/',
    keywords: ['gigabit', 'velocidade', 'alta performance'],
    anchorText: 'soluções Multi-Gigabit para alta performance'
  },
  {
    url: 'https://www.greatek.com.br/projetos-especiais/wi-fi-7/',
    keywords: ['wi-fi 7', 'wireless', 'última geração'],
    anchorText: 'tecnologia Wi-Fi 7 de última geração'
  },
  {
    url: 'https://www.greatek.com.br/projetos-especiais/wi-fi-de-alta-densidade/',
    keywords: ['alta densidade', 'wi-fi', 'múltiplos usuários'],
    anchorText: 'Wi-Fi de alta densidade para ambientes corporativos'
  }
];

// Gerador de anchor text baseado no tipo
function generateAnchorText(
  productName: string,
  keywords: string[],
  type: AnchorTextType,
  context: string
): string {
  const contextLower = context.toLowerCase();
  
  switch (type) {
    case 'branded':
      // Ex: "Greatek OLT", "Máquina de Fusão X6"
      return productName;
      
    case 'exact-match':
      // Ex: "OLT GPON para provedores"
      const mainKeyword = keywords.find(k => contextLower.includes(k.toLowerCase()));
      return mainKeyword ? `${mainKeyword} profissional` : productName;
      
    case 'long-tail':
      // Ex: "equipamento OLT ideal para redes FTTH de pequeno porte"
      const relevantKeywords = keywords.filter(k => contextLower.includes(k.toLowerCase()));
      if (relevantKeywords.length > 0) {
        return `solução ${relevantKeywords[0]} para infraestrutura de ${keywords[1] || 'rede'}`;
      }
      return `equipamento ideal para ${keywords[0]}`;
      
    default:
      return productName;
  }
}

// Função principal: gerar estratégia de links
export function generateLinkingStrategy(
  topic: string,
  contentPreview: string = ''
): LinkingStrategy {
  const category = identifyCategory(topic);
  const topicLower = topic.toLowerCase();
  const contentLower = contentPreview.toLowerCase();
  const combinedText = `${topicLower} ${contentLower}`;
  
  const strategy: LinkingStrategy = {
    productLinks: [],
    categoryLinks: [],
    relatedPostLinks: [],
    specialProjectLinks: []
  };
  
  // 1. LINKS DE PRODUTOS (máx. 3)
  const anchorTypes: AnchorTextType[] = ['long-tail', 'long-tail', 'branded']; // 60% long-tail, 25% branded
  let anchorTypeIndex = 0;
  
  Object.entries(PRODUCT_DATABASE).forEach(([productId, product]) => {
    const relevanceScore = product.keywords.filter(k => 
      combinedText.includes(k.toLowerCase())
    ).length;
    
    if (relevanceScore > 0 && strategy.productLinks.length < 3) {
      const anchorType = anchorTypes[anchorTypeIndex % anchorTypes.length];
      anchorTypeIndex++;
      
      strategy.productLinks.push({
        url: product.url,
        anchorText: generateAnchorText(product.name, product.keywords, anchorType, combinedText),
        type: anchorType,
        contextHint: product.keywords[0],
        priority: relevanceScore
      });
    }
  });
  
  // Ordenar por prioridade
  strategy.productLinks.sort((a, b) => b.priority - a.priority);
  
  // 2. LINK DE CATEGORIA PRINCIPAL (1)
  const categoryInfo = BLOG_CATEGORIES[category];
  strategy.categoryLinks.push({
    url: `https://www.greatek.com.br/blog-greatek/categoria/${categoryInfo.slug}/`,
    anchorText: `outros artigos sobre ${categoryInfo.name.toLowerCase()}`,
    type: 'long-tail',
    contextHint: 'final do artigo',
    priority: 5
  });
  
  // 3. PROJETOS ESPECIAIS (máx. 1)
  const relevantProject = SPECIAL_PROJECTS.find(project => 
    project.keywords.some(k => combinedText.includes(k.toLowerCase()))
  );
  
  if (relevantProject) {
    strategy.specialProjectLinks.push({
      url: relevantProject.url,
      anchorText: relevantProject.anchorText,
      type: 'long-tail',
      contextHint: 'meio do artigo',
      priority: 3
    });
  }
  
  // 4. POSTS RELACIONADOS (simulação - máx. 2)
  const relatedCategories = getRelatedCategories(category, 2);
  relatedCategories.forEach(relCat => {
    const relCatInfo = BLOG_CATEGORIES[relCat];
    strategy.relatedPostLinks.push({
      url: `https://www.greatek.com.br/blog-greatek/categoria/${relCatInfo.slug}/`,
      anchorText: `artigos relacionados sobre ${relCatInfo.name.toLowerCase()}`,
      type: 'long-tail',
      contextHint: 'final do artigo',
      priority: 2
    });
  });
  
  return strategy;
}

// Função para formatar links em HTML (para inserir no post)
export function formatLinksForPost(strategy: LinkingStrategy): {
  inlineLinks: string[];
  relatedLinksSection: string;
} {
  // Links inline (para serem inseridos ao longo do texto)
  const inlineLinks = [
    ...strategy.productLinks.slice(0, 3),
    ...strategy.specialProjectLinks.slice(0, 1)
  ].map(link => 
    `<a href="${link.url}" rel="noopener" target="_blank">${link.anchorText}</a>`
  );
  
  // Seção de links relacionados (para o final do post)
  const relatedLinks = [
    ...strategy.categoryLinks,
    ...strategy.relatedPostLinks.slice(0, 2)
  ];
  
  const relatedLinksSection = `
<div class="related-content" style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-left: 4px solid #0066cc;">
  <h3 style="margin-top: 0; color: #0066cc;">📚 Continue Lendo</h3>
  <ul style="list-style: none; padding: 0;">
    ${relatedLinks.map(link => `
      <li style="margin-bottom: 10px;">
        <a href="${link.url}" rel="noopener" style="color: #0066cc; text-decoration: none;">
          → ${link.anchorText.charAt(0).toUpperCase() + link.anchorText.slice(1)}
        </a>
      </li>
    `).join('')}
  </ul>
</div>
  `.trim();
  
  return { inlineLinks, relatedLinksSection };
}

// Função para gerar metadados GEO-otimizados
export function generateGEOMetadata(topic: string, category: BlogCategory) {
  const categoryInfo = BLOG_CATEGORIES[category];
  
  return {
    category: categoryInfo.name,
    categorySlug: categoryInfo.slug,
    breadcrumbs: [
      { name: 'Home', url: 'https://www.greatek.com.br/' },
      { name: 'Blog', url: 'https://www.greatek.com.br/blog-greatek/' },
      { name: categoryInfo.name, url: `https://www.greatek.com.br/blog-greatek/categoria/${categoryInfo.slug}/` },
      { name: topic, url: '#' }
    ],
    relatedKeywords: categoryInfo.keywords.slice(0, 10),
    schemaType: 'Article' // Para Schema.org markup
  };
}
