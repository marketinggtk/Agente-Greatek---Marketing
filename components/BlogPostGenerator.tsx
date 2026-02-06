
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SubmitButton } from './ui/SubmitButton';
import BlogPostViewer from './BlogPostViewer';
import { isBlogPostPackage } from '../types';
import Loader from './Loader';
import { identifyCategory, BLOG_CATEGORIES } from './utils/categoryMapping';
import { generateLinkingStrategy, generateGEOMetadata } from './utils/internalLinkingStrategy';

const BlogPostGenerator: React.FC = () => {
    const { activeConversationId, conversations, submitQuery, isLoading, error, createNewConversation } = useAppStore();
    
    const activeConversation = useMemo(() => 
        conversations.find(c => c.id === activeConversationId),
        [conversations, activeConversationId]
    );

    const lastMessage = activeConversation?.messages[activeConversation.messages.length - 1];
    const hasResult = lastMessage && lastMessage.role === 'agent' && isBlogPostPackage(lastMessage.content);

    const [topic, setTopic] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('auto');

    // Identificar categoria automaticamente ao digitar
    const suggestedCategory = useMemo(() => {
        if (!topic.trim()) return null;
        return identifyCategory(topic);
    }, [topic]);

    const handleGenerate = () => {
        if (!topic.trim()) return;
        
        // Identificar categoria
        const category = selectedCategory === 'auto' && suggestedCategory 
            ? suggestedCategory 
            : selectedCategory;
        
        // Gerar estratégia de links
        const linkingStrategy = generateLinkingStrategy(topic);
        const geoMetadata = generateGEOMetadata(topic, category as any);
        
        // Construir prompt otimizado para GEO
        const optimizedPrompt = `
Gere um post de blog profissional sobre: "${topic}".

## INSTRUÇÕES DE OTIMIZAÇÃO GEO:

### 0. OBJETIVO (LEIA COM ATENÇÃO):
- Escrever com foco na dor real do ISP/integrador (OPEX, truck roll, churn, instabilidade, retrabalho)
- Mostrar como a Greatek ajuda com infraestrutura robusta por trás (qualidade de campo + energia + visibilidade + gestão)
- Manter a mesma estrutura e quantidade de parágrafos, porém com texto menos denso (frases mais curtas)
- O CTA final DEVE ter botão de WhatsApp com mensagem pré-preenchida (e NÃO crie outro WhatsApp fora do CTA)

### 1. ESTRUTURA DO POST:
- Título otimizado para SEO (H1)
- Introdução engajadora (2-3 parágrafos)
- 4-6 seções com subtítulos (H2/H3)
- Conclusão com CTA (com WhatsApp somente no bloco final)
- Seção de FAQ (3-5 perguntas)

**RITMO E DENSIDADE (OBRIGATÓRIO):**
- Mantenha a mesma quantidade de parágrafos por seção, mas deixe o texto mais dinâmico.
- Cada parágrafo deve ter no máximo 2-3 frases curtas.
- Evite parágrafos longos e listas enormes. Use listas apenas quando ajudar a leitura.
- Priorize: dor > impacto operacional > caminho prático > como a Greatek sustenta.

### 2. CATEGORIA E CONTEXTO:
- **Categoria Principal:** ${geoMetadata.category}
- **Keywords Relacionadas:** ${geoMetadata.relatedKeywords.slice(0, 5).join(', ')}
- Use essas keywords naturalmente ao longo do texto

### 3. INTERLINKING OBRIGATÓRIO (GEO-OTIMIZADO):

**IMPORTANTE (NÃO NEGOCIÁVEL):**
- Insira links usando tag HTML <a href="...">anchor</a> (não escreva URL pura).
- Distribua os links ao longo do texto (não concentrar todos no fim).
- Garanta que o HTML final contenha pelo menos **3 links clicáveis**.
- Use no máximo 5 links.

Insira de forma natural e contextual a partir desta lista (escolha os mais relevantes para o tema):

${linkingStrategy.productLinks.map((link, idx) => `
${idx + 1}. Link para produto:
   - URL: ${link.url}
   - Anchor text: "${link.anchorText}"
   - Contexto sugerido: Quando mencionar "${link.contextHint}"
   - Exemplo: "Para essa aplicação, recomendamos <a href="${link.url}" rel="noopener" target="_blank">${link.anchorText}</a>."
`).join('\n')}

${linkingStrategy.specialProjectLinks.map((link, idx) => `
${linkingStrategy.productLinks.length + idx + 1}. Link para projeto especial:
   - URL: ${link.url}
   - Anchor text: "${link.anchorText}"
   - Contexto: Inserir no meio do artigo, quando relevante
   - Exemplo: "Conheça também nossas <a href="${link.url}" rel="noopener" target="_blank">${link.anchorText}</a>."
`).join('\n')}

**REGRAS DE INTERLINKING:**
- Máximo 5 links internos por post
- Distribuir ao longo do texto (não concentrar tudo no início ou fim)
- Links devem ser contextuais e naturais
- Usar anchor text variado (evitar repetição)
- Não forçar links onde não fazem sentido

### 4. OTIMIZAÇÃO PARA GEO (GENERATIVE ENGINE Optimization):

**CRÍTICO:** Google está usando IA para gerar respostas diretas. Otimize para isso:

- **Respostas Diretas:** Cada seção deve responder uma pergunta específica de forma clara e direta
- **Listas e Bullets:** Use listas quando apropriado (facilita extração pela IA)
- **Dados Estruturados:** Inclua números, estatísticas, comparações
- **Entidades Nomeadas:** Mencione marcas parceiras (TP-Link, Omada, VIGI, Tapo, XPS, Volt, etc.)
- **Contexto Rico:** Explique "por quê" e "como", não apenas "o quê"

### 5. FAQ ESTRUTURADO (Schema.org):
Ao final, crie uma seção FAQ com 3-5 perguntas estruturadas assim:

**HTML:**
\`\`\`html
<div itemscope itemtype="https://schema.org/FAQPage">
  <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <h3 itemprop="name">Pergunta aqui?</h3>
    <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <p itemprop="text">Resposta clara e direta aqui.</p>
    </div>
  </div>
</div>
\`\`\`

### 6. BREADCRUMBS (Navegação):
Adicione no topo do HTML em formato de acordeon (WordPress reconhece via <details>/<summary>):
\`\`\`html
<details class="breadcrumbs-accordion" style="margin: 10px 0 18px 0;">
  <summary style="cursor: pointer; font-weight: 700; color: #083561;">Navegação do artigo</summary>
  <div style="margin-top: 10px;">
    <nav aria-label="breadcrumb">
      <ol itemscope itemtype="https://schema.org/BreadcrumbList" style="margin: 0; padding-left: 18px;">
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a itemprop="item" href="https://www.greatek.com.br/">
            <span itemprop="name">Home</span>
          </a>
          <meta itemprop="position" content="1" />
        </li>
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a itemprop="item" href="https://www.greatek.com.br/blog-greatek/">
            <span itemprop="name">Blog</span>
          </a>
          <meta itemprop="position" content="2" />
        </li>
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a itemprop="item" href="https://www.greatek.com.br/blog-greatek/categoria/${geoMetadata.categorySlug}/">
            <span itemprop="name">${geoMetadata.category}</span>
          </a>
          <meta itemprop="position" content="3" />
        </li>
      </ol>
    </nav>
  </div>
</details>
\`\`\`

### 7. CTA FINAL (COM WHATSAPP):
Incluir sempre ao final (NÃO crie outro WhatsApp fora deste bloco):
\`\`\`html
<div class="cta-box" style="background: linear-gradient(135deg, #083561 0%, #0081cc 100%); padding: 30px; border-radius: 12px; text-align: left; color: white; margin-top: 40px;">
  <h3 style="color: white; margin-top: 0;">Próximo passo</h3>
  <p style="font-size: 16px; margin-bottom: 10px;">Se o seu OPEX está crescendo, o caminho é reduzir urgências: padronizar campo, proteger POP e ganhar visibilidade real da rede.</p>
  <p style="font-size: 16px; margin: 0;">A Greatek ajuda a montar uma infraestrutura robusta por trás disso, com soluções que aumentam previsibilidade e diminuem deslocamentos.</p>
  <a href="https://wa.me/5512992218852?text=Ol%C3%A1%2C%20vim%20pelo%20blog%20post%20{{nome%20do%20blog%20post}}%20e%20queria%20mais%20informa%C3%A7%C3%B5es%20sobre%20{{assunto%20do%20blog%20post}}%20para%20entender%20melhor%20em%20como%20se%20encaixa%20na%20sua%20realidade%20hoje." target="_blank" rel="noopener" style="display: inline-block; margin-top: 18px; background: #25D366; color: white; padding: 14px 22px; border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 16px;">Falar no WhatsApp</a>
</div>
\`\`\`

### 8. SEÇÃO DE CONTEÚDO RELACIONADO:
Adicione antes do CTA final:
\`\`\`html
<div class="related-content" style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-left: 4px solid #083561;">
  <h3 style="margin-top: 0; color: #083561;">📚 Continue Lendo</h3>
  <ul style="list-style: none; padding: 0;">
    ${linkingStrategy.categoryLinks.map(link => `
    <li style="margin-bottom: 10px;">
      <a href="${link.url}" rel="noopener" style="color: #083561; text-decoration: none;">
        → ${link.anchorText.charAt(0).toUpperCase() + link.anchorText.slice(1)}
      </a>
    </li>
    `).join('')}
    ${linkingStrategy.relatedPostLinks.slice(0, 2).map(link => `
    <li style="margin-bottom: 10px;">
      <a href="${link.url}" rel="noopener" style="color: #083561; text-decoration: none;">
        → ${link.anchorText.charAt(0).toUpperCase() + link.anchorText.slice(1)}
      </a>
    </li>
    `).join('')}
  </ul>
</div>
\`\`\`

### 9. META TAGS SEO (Para você copiar):
\`\`\`html
<!-- Meta Title (50-60 caracteres) -->
<title>[Título otimizado] | Greatek</title>

<!-- Meta Description (150-160 caracteres) -->
<meta name="description" content="[Descrição atrativa com call-to-action]">

<!-- Open Graph -->
<meta property="og:title" content="[Título]">
<meta property="og:description" content="[Descrição]">
<meta property="og:type" content="article">
<meta property="og:url" content="[URL do post]">

<!-- Article Schema -->
<meta property="article:published_time" content="[Data]">
<meta property="article:section" content="${geoMetadata.category}">
<meta property="article:tag" content="${geoMetadata.relatedKeywords.slice(0, 3).join(', ')}">
\`\`\`

### 10. TOM E ESTILO:
- Profissional mas acessível
- Foco em ISPs e Integradores
- Educar e informar (não apenas vender)
- Usar dados técnicos quando relevante
- Mencionar marcas parceiras naturalmente

**IMPORTANTE:**
- Evite virar catálogo: não liste muitos SKUs nem empilhe especificações.
- Mencione soluções/produtos apenas quando fizer sentido para resolver a dor citada.
- Priorize "o que dói" e "o que muda na operação".

Agora, gere o post completo em HTML otimizado seguindo TODAS essas diretrizes!
        `.trim();

        submitQuery(optimizedPrompt);
    };

    const handleNewPost = () => {
        if (activeConversation) {
            createNewConversation(activeConversation.mode);
        }
        setTopic('');
        setSelectedCategory('auto');
    };

    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-greatek-bg-light/50 animate-fade-in">
                <Loader />
                <p className="mt-4 text-text-secondary text-sm font-medium text-center max-w-md">
                    🔍 Analisando categoria e contexto...<br/>
                    🔗 Gerando estratégia de interlinking GEO...<br/>
                    ✍️ Escrevendo artigo otimizado com links contextuais...
                </p>
            </div>
        );
    }

    if (hasResult) {
        return (
            <div className="h-full flex flex-col bg-greatek-bg-light/50 animate-fade-in">
                <div className="p-4 border-b border-greatek-border bg-white flex justify-between items-center shadow-sm z-10">
                    <h2 className="text-lg font-bold text-greatek-dark-blue flex items-center gap-2">
                        <i className="bi bi-check-circle-fill text-green-500"></i>
                        Artigo GEO-Otimizado Gerado
                    </h2>
                    <button 
                        onClick={handleNewPost}
                        className="text-sm font-medium text-greatek-blue hover:text-greatek-dark-blue flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-greatek-blue/10 transition-colors"
                    >
                        <i className="bi bi-plus-lg"></i> Criar Novo Post
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto custom-scrollbar p-4 sm:p-6">
                    <BlogPostViewer data={lastMessage.content} />
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 bg-greatek-bg-light/50 animate-fade-in overflow-y-auto custom-scrollbar">
            <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-lg border border-greatek-border my-auto text-center">
                <div className="mb-8">
                    <div className="w-16 h-16 bg-greatek-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i className="bi bi-pen-fill text-4xl text-greatek-blue"></i>
                    </div>
                    <h1 className="text-2xl font-bold text-greatek-dark-blue">Redator de Blog Greatek</h1>
                    <p className="text-text-secondary mt-2 max-w-lg mx-auto">
                        Digite o tema ou título sugerido. A IA identificará a categoria, selecionará os produtos Greatek ideais e criará um post <strong>GEO-otimizado</strong> com links internos estratégicos.
                    </p>
                </div>

                <div className="space-y-5 text-left">
                    <div>
                        <label className="block text-sm font-bold text-greatek-dark-blue mb-2">Qual o tema do post?</label>
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Ex: Como reduzir custos de manutenção em redes FTTH"
                            className="w-full p-4 rounded-xl border border-greatek-border focus:ring-2 focus:ring-greatek-blue focus:border-transparent bg-[#e9e9e9] text-black font-medium text-lg placeholder:text-gray-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        
                        {/* Sugestão de categoria automática */}
                        {suggestedCategory && topic.trim() && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <i className="bi bi-lightbulb-fill mr-2"></i>
                                    <strong>Categoria sugerida:</strong> {BLOG_CATEGORIES[suggestedCategory].name}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Seletor de categoria (opcional) */}
                    <div>
                        <label className="block text-sm font-bold text-greatek-dark-blue mb-2">
                            Categoria (opcional)
                            <span className="text-xs font-normal text-gray-500 ml-2">
                                - Deixe em "Auto" para identificação automática
                            </span>
                        </label>
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full p-3 rounded-xl border border-greatek-border focus:ring-2 focus:ring-greatek-blue bg-white text-black font-medium"
                        >
                            <option value="auto">🤖 Identificação Automática</option>
                            {Object.entries(BLOG_CATEGORIES).map(([id, cat]) => (
                                <option key={id} value={id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <SubmitButton 
                            onClick={handleGenerate} 
                            disabled={isLoading || !topic.trim()}
                            className="w-full py-4 text-lg font-bold rounded-xl shadow-md hover:scale-[1.01] transition-transform"
                        >
                            {isLoading ? 'Otimizando para GEO...' : '🚀 Gerar Post GEO-Otimizado'}
                        </SubmitButton>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-900 font-medium mb-2">
                            ✨ <strong>Novo:</strong> Otimização GEO (Generative Engine Optimization)
                        </p>
                        <ul className="text-xs text-blue-800 space-y-1">
                            <li>✅ Links internos estratégicos (máx. 5)</li>
                            <li>✅ Anchor text balanceado (60% long-tail)</li>
                            <li>✅ Schema markup para FAQs</li>
                            <li>✅ Breadcrumbs estruturados</li>
                            <li>✅ Otimizado para respostas de IA do Google</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPostGenerator;