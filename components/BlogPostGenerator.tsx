
import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SubmitButton } from './ui/SubmitButton';
import BlogPostViewer from './BlogPostViewer';
import { isBlogPostPackage, AppMode, SocialMediaSummaries } from '../types';
import Loader from './Loader';
import { identifyCategory, BLOG_CATEGORIES, BlogCategory } from './utils/categoryMapping';
import { generateLinkingStrategy, generateGEOMetadata } from './utils/internalLinkingStrategy';
import { generateSocialMediaSummaries, generateImageAd } from '../services/geminiService';
import Modal from './ui/Modal';

const MAX_LINKS_PER_POST = 5;

/**
 * Ajustes aplicados:
 * 1) Clamp de links (0..5) e remoção de conflitos "EXATAMENTE N" vs "máx 5".
 * 2) Remoção de obrigação de estatísticas inventadas: números só com base clara/estimativa declarada.
 * 3) lastMessage mais seguro usando verificação de array.
 * 4) Ajuste de regra de links: internos sem target=_blank; externos com noopener noreferrer.
 * 5) FAQ em formato de Acordeão (details/summary).
 * 6) Bloqueio rigoroso de CTAs duplicados no corpo do texto.
 */
const BlogPostGenerator: React.FC = () => {
  const {
    activeConversationId,
    conversations,
    submitQuery,
    updateBlogPostDraft,
    isLoading,
    error,
    createNewConversation,
    dailyRequestsCount,
  } = useAppStore();

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  );

  // Safely access the last message
  const lastMessage = activeConversation?.messages && activeConversation.messages.length > 0 
    ? activeConversation.messages[activeConversation.messages.length - 1] 
    : undefined;

  const hasResult =
    !!lastMessage && lastMessage.role === 'agent' && isBlogPostPackage(lastMessage.content);

  const [topic, setTopic] = useState(activeConversation?.blogPostDraft?.topic || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(activeConversation?.blogPostDraft?.selectedCategory || 'auto');
  
  // Sync local state when changing conversations
  useEffect(() => {
    if (activeConversation?.blogPostDraft) {
      setTopic(activeConversation.blogPostDraft.topic || '');
      setSelectedCategory(activeConversation.blogPostDraft.selectedCategory || 'auto');
    } else {
      setTopic('');
      setSelectedCategory('auto');
    }
  }, [activeConversationId]);

  const handleTopicChange = (val: string) => {
    setTopic(val);
    if (activeConversationId) {
      updateBlogPostDraft(activeConversationId, { topic: val });
    }
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    if (activeConversationId) {
      updateBlogPostDraft(activeConversationId, { selectedCategory: val });
    }
  };

  const [socialSummaries, setSocialSummaries] = useState<SocialMediaSummaries | null>(null);
  const [isGeneratingSummaries, setIsGeneratingSummaries] = useState(false);
  const [isSummariesModalOpen, setIsSummariesModalOpen] = useState(false);
  const [activeSocialTab, setActiveSocialTab] = useState<'facebook' | 'instagram' | 'linkedin'>('instagram');
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);

  // Identificar categoria automaticamente ao digitar
  const suggestedCategory = useMemo(() => {
    if (!topic.trim()) return null;
    return identifyCategory(topic);
  }, [topic]);

  const handleGenerateSummaries = async () => {
    if (!lastMessage?.content) return;
    
    setIsGeneratingSummaries(true);
    // Increment usage for this extra generation
    useAppStore.getState().incrementDailyRequests();
    
    try {
        const contentString = JSON.stringify(lastMessage.content);
        const summaries = await generateSocialMediaSummaries(topic || "Tema do Post", contentString);
        if ((summaries as any).error) {
             console.error("API returned error:", (summaries as any).error);
             alert("Erro ao tentar gerar os resumos: " + (summaries as any).error);
             return;
        }
        setSocialSummaries(summaries);
        setIsSummariesModalOpen(true);
    } catch (error: any) {
        console.error("Failed to generate summaries", error);
        const errorMsg = error.message || error.error?.message || JSON.stringify(error);
        if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
             useAppStore.getState().showToast("Cota de IA atingida. Aguarde um momento.", 'error');
        } else {
             useAppStore.getState().showToast("Erro ao gerar resumo.", 'error');
        }
    } finally {
        setIsGeneratingSummaries(false);
    }
  };

  const handleGenerate = () => {
    if (!topic.trim()) return;

    // Identificar categoria
    const category: BlogCategory =
      selectedCategory === 'auto' && suggestedCategory 
      ? suggestedCategory 
      : (selectedCategory as BlogCategory);

    // Estratégia de links + GEO metadata
    const linkingStrategyRaw = generateLinkingStrategy(topic);
    const geoMetadata = generateGEOMetadata(topic, category);

    /**
     * Clamp/normalização para evitar:
     * - conflito de regras (ex: "EXATAMENTE 6 links" vs "máx 5 links")
     * - posts sem links quando a estratégia vem vazia (neste caso, não forçamos links)
     */
    const productLinks = (linkingStrategyRaw.productLinks || []).slice(0, MAX_LINKS_PER_POST);
    const remainingSlots = Math.max(0, MAX_LINKS_PER_POST - productLinks.length);
    const specialProjectLinks = (linkingStrategyRaw.specialProjectLinks || []).slice(
      0,
      remainingSlots
    );

    const linkingStrategy = {
      ...linkingStrategyRaw,
      productLinks,
      specialProjectLinks,
    };

    const totalRequiredLinks = linkingStrategy.productLinks.length + linkingStrategy.specialProjectLinks.length;
    const hasAnyRequiredLinks = totalRequiredLinks > 0;

    // Construir prompt otimizado para GEO
    // IMPORTANT: Template string backticks are escaped here for safety
    const optimizedPrompt = `
Gere um post de blog profissional sobre: "${topic}".

## INSTRUÇÕES CRÍTICAS DE OTIMIZAÇÃO GEO:

### 1. ESTRUTURA FOCADA NA DOR DO CLIENTE (AEO++ OTIMIZADO):

**ABERTURA (30% do conteúdo):**
- Título otimizado para SEO (H1) em FORMATO DE PERGUNTA quando possível
- **BOX RESPOSTA RÁPIDA** logo após H1 (AEO Critical):
  \`\`\`html
  <div style="background: #e8f4fd; border-left: 5px solid #0081cc; padding: 20px; margin: 20px 0; border-radius: 5px;">
    <strong style="color: #083561; font-size: 18px;">📌 Resposta Rápida:</strong>
    <p style="margin: 10px 0 0 0; font-size: 16px; line-height: 1.6;">[Resposta direta e objetiva em 2-3 linhas que responde o H1]</p>
  </div>
  \`\`\`
- Introdução CURTA (2 parágrafos de 2-3 linhas cada) focada no PROBLEMA.
- Primeira seção com H2 em FORMATO DE PERGUNTA: "Por Que [problema] está acontecendo?" ou similar.

**DESENVOLVIMENTO (40% do conteúdo):**
- Seção com H2 em PERGUNTA: "Qual o Verdadeiro Custo de Não Resolver Isso?" ou similar.
- Seção com H2 em PERGUNTA: "Como a Greatek Resolve Esse Desafio?" ou similar.
  - Solução overview.
  - Por que funciona.

**SOLUÇÃO PRÁTICA (20% do conteúdo):**
- Seção com H2 em PERGUNTA: "Quais Produtos e Soluções Resolvem Isso na Prática?".
  - Inserir links de produtos quando aplicável (ver seção 3).

**SE O POST FOR INSTRUCIONAL (passo a passo), adicione Schema HowTo:**
\`\`\`html
<div itemscope itemtype="https://schema.org/HowTo">
  <h2 itemprop="name">Como Implementar [Solução] em 5 Passos</h2>
  <div itemprop="step" itemscope itemtype="https://schema.org/HowToStep">
    <h3 itemprop="name">Passo 1: [Nome do Passo]</h3>
    <p itemprop="text">[Descrição]</p>
  </div>
  <!-- ... -->
</div>
\`\`\`

**FECHAMENTO (10% do conteúdo):**
- FAQ em formato de Acordeão (Ver seção 7).
- Conclusão CURTA (1-2 parágrafos) resumindo os benefícios.

### 2. REGRAS DE REDAÇÃO - EXTREMAMENTE IMPORTANTE:

⚠️ **PARÁGRAFOS CURTOS E DINÂMICOS:**
- Máximo 3-4 linhas por parágrafo.
- Evite "muros de texto".

⚠️ **TOM E LINGUAGEM:**
- Comece SEMPRE pela dor/problema do cliente.
- Use linguagem direta e objetiva.
- Evite jargões excessivos.

### 3. INTERLINKING (GEO-OTIMIZADO):

${hasAnyRequiredLinks ? `
🚨 **REGRA CRÍTICA DE LINKS:**

Você DEVE inserir ${totalRequiredLinks} links ao longo do texto (nem mais, nem menos),
seguindo exatamente as URLs e anchor texts fornecidos.

**COMO INSERIR OS LINKS:**
- Mencione o produto naturalmente e insira a tag <a href="URL"> no momento da menção
- Se o link for INTERNO (greatek.com.br): NÃO use target="_blank"
- Se o link for EXTERNO: use target="_blank" e rel="noopener noreferrer"

**LINKS OBRIGATÓRIOS PARA INSERIR:**

${linkingStrategy.productLinks.map((link, idx) => `
${idx + 1}. **Link de Produto:**
   URL: ${link.url}
   Anchor text: "${link.anchorText}"
   Contexto: Quando falar sobre ${link.contextHint}

   INSIRA ASSIM NO TEXTO (ajuste target/rel conforme interno/externo):
   <a href="${link.url}">${link.anchorText}</a>
`).join('\n')}

${linkingStrategy.specialProjectLinks.map((link, idx) => `
${linkingStrategy.productLinks.length + idx + 1}. **Link de Projeto Especial:**
   URL: ${link.url}
   Anchor text: "${link.anchorText}"

   INSIRA ASSIM NO TEXTO (ajuste target/rel conforme interno/externo):
   <a href="${link.url}">${link.anchorText}</a>
`).join('\n')}

**REGRAS DE DISTRIBUIÇÃO:**
- Links devem aparecer NATURALMENTE ao longo do texto.
- Distribua entre as seções de "Solução" e "Produtos".
- Total máximo neste post: ${MAX_LINKS_PER_POST}.
` : `
⚠️ **Links (opcional):**
Se fizer sentido, mencione soluções e direcione o leitor para conteúdos relacionados,
mas NÃO invente URLs nem anchors.
`}

### 4. CATEGORIA E CONTEXTO:
- **Categoria Principal:** ${geoMetadata.category}
- **Keywords Relacionadas:** ${geoMetadata.relatedKeywords.slice(0, 5).join(', ')}

### 5. ELEMENTOS VISUAIS E BOXES DE DESTAQUE:

Use boxes HTML para destacar informações importantes:

**Box de Alerta/Destaque (use 1-2 por post):**
\`\`\`html
<div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 20px 0; border-radius: 5px;">
  <strong>⚠️ Atenção:</strong> [Informação importante]
</div>
\`\`\`

**Box de Dica/Benefício (use 1-2 por post):**
\`\`\`html
<div style="background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px 20px; margin: 20px 0; border-radius: 5px;">
  <strong>💡 Dica Greatek:</strong> [Insight valioso]
</div>
\`\`\`

### 6. OTIMIZAÇÃO AEO++ (Answer Engine Optimization):

**A) RESPOSTAS DIRETAS:** Cada H2/H3 deve ser uma PERGUNTA, seguida de resposta direta.
**B) NÚMEROS E ESTATÍSTICAS:** Use números somente se fizer sentido e sem inventar dados irreais. Use "estimativa" ou "faixa típica" se necessário.

### 7. FAQ VISUAL (ACORDEÃO HTML):

**OBRIGATÓRIO:** Logo antes da conclusão, insira uma seção "Perguntas Frequentes" usando HTML nativo \`<details>\` e \`<summary>\` para criar acordeons interativos e bonitos.

**Use EXATAMENTE este código HTML para cada pergunta:**
\`\`\`html
<details style="margin-bottom: 10px; border: 1px solid #e9e9e9; border-radius: 8px; background-color: #fff; overflow: hidden;">
  <summary style="font-weight: bold; cursor: pointer; color: #083561; padding: 15px; background-color: #f9f9f9; list-style: none;">❓ [Sua Pergunta Aqui?]</summary>
  <div style="padding: 15px; color: #4a4a4a; line-height: 1.6; border-top: 1px solid #e9e9e9;">
    [Sua Resposta Aqui]
  </div>
</details>
\`\`\`
*Gere de 3 a 5 perguntas relevantes ao tema.*

### 8. BREADCRUMBS:
Adicione no topo do HTML:
\`\`\`html
<nav aria-label="breadcrumb">
  <ol itemscope itemtype="https://schema.org/BreadcrumbList">
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="https://www.greatek.com.br/"><span itemprop="name">Home</span></a>
      <meta itemprop="position" content="1" />
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="https://www.greatek.com.br/blog-greatek/"><span itemprop="name">Blog</span></a>
      <meta itemprop="position" content="2" />
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="https://www.greatek.com.br/blog-greatek/categoria/${geoMetadata.categorySlug}/"><span itemprop="name">${geoMetadata.category}</span></a>
      <meta itemprop="position" content="3" />
    </li>
  </ol>
</nav>
\`\`\`

### 9. CTA FINAL (ÚNICO E EXCLUSIVO):

🚨 **REGRA DE OURO - ZERO DUPLICIDADE:**
1. O campo JSON \`cta_html\` deve conter o botão "Falar com Especialista".
2. **PROIBIDO:** NÃO escreva frases como "Entre em contato conosco", "Fale com nossa equipe", "Solicite um orçamento", "Clique no botão abaixo" no final da \`introduction\`, nas \`sections\` ou na \`conclusion\`.
3. O post deve terminar com o texto informativo da conclusão. O sistema inserirá automaticamente o botão \`cta_html\` visualmente abaixo do texto. **NÃO adicione texto de chamada para ação redundante.**

**CTA HTML (Para o campo JSON):**
\`\`\`html
<div class="cta-box" style="background: linear-gradient(135deg, #083561 0%, #0081cc 100%); padding: 30px; border-radius: 10px; text-align: center; color: white; margin: 40px 0;">
  <h3 style="color: white; margin-top: 0; font-size: 24px;">🚀 Precisa de Ajuda para Resolver Esse Desafio?</h3>
  <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.6;">Fale com nossos especialistas Greatek e descubra como podemos transformar sua operação com as soluções certas!</p>
  <a href="https://api.whatsapp.com/send?phone=5512991723899&text=Olá, vim pelo blog da Greatek e gostaria de saber mais sobre as soluções para [TEMA DO POST]" target="_blank" style="display: inline-block; background: #25D366; color: white; padding: 15px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);">
    💬 Falar com Especialista
  </a>
</div>
\`\`\`

### 10. SEÇÃO DE CONTEÚDO RELACIONADO (Adicione após o CTA):
\`\`\`html
<div class="related-content" style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-left: 4px solid #0081cc;">
  <h3 style="margin-top: 0; color: #083561;">📚 Continue Lendo</h3>
  <ul style="list-style: none; padding: 0;">
    ${linkingStrategy.categoryLinks.map(link => `
    <li style="margin-bottom: 10px;">
      <a href="${link.url}" rel="noopener" style="color: #0081cc; text-decoration: none; font-weight: 500;">
        → ${link.anchorText.charAt(0).toUpperCase() + link.anchorText.slice(1)}
      </a>
    </li>
    `).join('')}
    ${linkingStrategy.relatedPostLinks.slice(0, 2).map(link => `
    <li style="margin-bottom: 10px;">
      <a href="${link.url}" rel="noopener" style="color: #0081cc; text-decoration: none; font-weight: 500;">
        → ${link.anchorText.charAt(0).toUpperCase() + link.anchorText.slice(1)}
      </a>
    </li>
    `).join('')}
  </ul>
</div>
\`\`\`

### 11. META TAGS SEO:
\`\`\`html
<title>[Título otimizado focado na DOR] | Greatek</title>
<meta name="description" content="[Descrição que destaca a DOR e a SOLUÇÃO]">
<meta property="og:title" content="[Título]">
<meta property="og:description" content="[Descrição]">
<meta property="og:type" content="article">
<meta property="article:section" content="${geoMetadata.category}">
<meta property="article:tag" content="${geoMetadata.relatedKeywords.slice(0, 3).join(', ')}">
\`\`\`

### 12. CHECKLIST FINAL:
- H1 em PERGUNTA.
- BOX "Resposta Rápida".
- FAQ visual com \`<details>\` e \`<summary>\`.
- **SEM CTA no texto (apenas no campo JSON)**.
- Links inseridos corretamente.
- "Continue Lendo" presente.

---

Agora, gere o post completo em JSON (não markdown) seguindo estritamente a seguinte estrutura (BlogPostPackage):

\`\`\`json
{
  "title": "string",
  "introduction": "string (HTML)",
  "sections": [
    {
      "subtitle": "string",
      "content": "string (HTML)"
    }
  ],
  "conclusion": "string (HTML)",
  "seo_title": "string",
  "seo_meta_description": "string",
  "seo_tags": ["string"],
  "cta_html": "string (HTML)"
}
\`\`\`

Mantenha máxima atenção à proibição de CTAs duplicados no texto e ao uso de Acordeons no FAQ na última seção.

**IMPORTANTE PARA SINTAXE JSON:**
- Escape corretamente todas as aspas duplas (\`"\`) dentro das strings de HTML (exemplo: \`<a href=\\"#\\" class=\\"link\\">\`). Caso contrário o JSON não será validamente interpretado.
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
          🔍 Analisando categoria e contexto...<br />
          ❓ Gerando perguntas AEO-otimizadas...<br />
          📊 Preparando estrutura e exemplos...<br />
          🔗 Criando estratégia de interlinking...<br />
          ✍️ Escrevendo artigo otimizado para Answer Engines...
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
            Artigo AEO++ Gerado
          </h2>
          <div className="flex items-center gap-2">
            <button
                onClick={handleGenerateSummaries}
                disabled={isGeneratingSummaries}
                className="text-sm font-medium text-greatek-blue hover:text-greatek-dark-blue flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-greatek-blue/10 transition-colors"
            >
                {isGeneratingSummaries ? (
                    <><i className="bi bi-hourglass-split animate-spin"></i> Gerando Resumo...</>
                ) : (
                    <><i className="bi bi-share-fill"></i> Resumo Social</>
                )}
            </button>
            <button
                onClick={handleNewPost}
                className="text-sm font-medium text-greatek-blue hover:text-greatek-dark-blue flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-greatek-blue/10 transition-colors"
            >
                <i className="bi bi-plus-lg"></i> Criar Novo Post
            </button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto custom-scrollbar p-4 sm:p-6">
          <BlogPostViewer data={lastMessage.content} />
        </div>
        
        {/* Modal de Resumo Social */}
        {isSummariesModalOpen && socialSummaries && (
            <Modal
                isOpen={isSummariesModalOpen}
                onClose={() => setIsSummariesModalOpen(false)}
                title="Resumo e Imagem para Redes Sociais"
                size="large"
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full text-left">
                    {/* Coluna Esquerda: Sugestão de Imagem (5 colunas) */}
                    <div className="lg:col-span-5 flex flex-col space-y-4">
                        <div className="bg-greatek-bg-light border border-greatek-border rounded-xl p-4 flex flex-col items-center">
                            <h4 className="text-xs font-bold text-greatek-dark-blue uppercase tracking-wider mb-3 self-start flex items-center gap-2">
                                <i className="bi bi-image text-greatek-blue"></i>
                                Imagem Sugerida pela IA
                            </h4>
                            {socialSummaries.suggested_image_url ? (
                                <div className="relative group w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                    <img 
                                        src={socialSummaries.suggested_image_url} 
                                        alt="Greatek Social Media Suggestion" 
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        referrerPolicy="no-referrer"
                                    />
                                    {isRegeneratingImage && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-3 text-center">
                                            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2"></div>
                                            <span className="text-xs font-bold font-mono">Gerando Nova Versão...</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="relative w-full aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4 text-center">
                                    {isRegeneratingImage ? (
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-8 h-8 border-4 border-greatek-blue/30 border-t-greatek-blue rounded-full animate-spin mb-2"></div>
                                            <span className="text-xs font-bold text-greatek-blue">Gerando Imagem...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <i className="bi bi-image-fill text-gray-300 text-5xl mb-2"></i>
                                            <span className="text-sm font-semibold text-gray-500">Sem imagem disponível</span>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Controles da Imagem */}
                            <div className="w-full mt-4 space-y-2">
                                {socialSummaries.suggested_image_url && (
                                    <button
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = socialSummaries.suggested_image_url!;
                                            link.download = `greatek-social-post-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`;
                                            link.click();
                                        }}
                                        className="w-full py-2.5 px-3 bg-greatek-blue hover:bg-greatek-dark-blue text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                                    >
                                        <i className="bi bi-download"></i> Baixar Imagem Greatek
                                    </button>
                                )}
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={async () => {
                                            const userPrompt = prompt(
                                                "Edite as orientações para gerar uma nova imagem (Dica: em inglês dá melhores resultados):",
                                                socialSummaries.suggested_image_prompt || ""
                                            );
                                            if (userPrompt === null) return;
                                            
                                            setIsRegeneratingImage(true);
                                            try {
                                                const result = await generateImageAd(userPrompt || "High tech telecom networking, professional, Greatek");
                                                setSocialSummaries(prev => prev ? {
                                                    ...prev,
                                                    suggested_image_url: result.imageUrl,
                                                    suggested_image_prompt: result.generatedPrompt
                                                } : null);
                                                useAppStore.getState().showToast("Nova imagem de sugestão gerada!", "success");
                                            } catch (err) {
                                                console.error(err);
                                                useAppStore.getState().showToast("Falha ao gerar imagem.", "error");
                                            } finally {
                                                setIsRegeneratingImage(false);
                                            }
                                        }}
                                        disabled={isRegeneratingImage}
                                        className="flex-grow py-2 px-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-750 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        {isRegeneratingImage ? (
                                            <><i className="bi bi-hourglass-split animate-spin text-greatek-blue"></i> Criando...</>
                                        ) : (
                                            <><i className="bi bi-arrow-repeat"></i> Outra Versão</>
                                        )}
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            if (socialSummaries.suggested_image_prompt) {
                                                navigator.clipboard.writeText(socialSummaries.suggested_image_prompt);
                                                useAppStore.getState().showToast("Prompt da imagem copiado!", "info");
                                            }
                                        }}
                                        className="py-2 px-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-750 flex items-center justify-center transition-colors cursor-pointer"
                                        title="Copiar prompt descritivo da imagem"
                                        disabled={!socialSummaries.suggested_image_prompt}
                                    >
                                        <i className="bi bi-clipboard-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coluna Direita: Abas e Textos Sociais (7 colunas) */}
                    <div className="lg:col-span-7 flex flex-col h-full">
                        {/* Tabs Header */}
                        <div className="flex border-b border-gray-200 mb-4">
                            <button
                                onClick={() => setActiveSocialTab('facebook')}
                                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                                    activeSocialTab === 'facebook'
                                        ? 'border-blue-600 text-blue-600 bg-blue-50/50 font-bold'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <i className="bi bi-facebook text-lg"></i> Facebook
                            </button>
                            <button
                                onClick={() => setActiveSocialTab('instagram')}
                                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                                    activeSocialTab === 'instagram'
                                        ? 'border-pink-600 text-pink-600 bg-pink-50/50 font-bold'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <i className="bi bi-instagram text-lg"></i> Instagram
                            </button>
                            <button
                                onClick={() => setActiveSocialTab('linkedin')}
                                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                                    activeSocialTab === 'linkedin'
                                        ? 'border-sky-700 text-sky-700 bg-sky-50/50 font-bold'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <i className="bi bi-linkedin text-lg"></i> LinkedIn
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 min-h-[280px]">
                            {activeSocialTab === 'facebook' && (
                                <div className="animate-fade-in text-left">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                            <i className="bi bi-facebook text-xl"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 leading-tight">Post para Facebook</h4>
                                            <p className="text-xs text-gray-500">Foco em engajamento e compartilhamento</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 text-gray-800 whitespace-pre-wrap leading-relaxed text-sm select-all">
                                        {socialSummaries.facebook?.content || "Conteúdo não gerado."}
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {(socialSummaries.facebook?.hashtags || []).map((tag, idx) => (
                                            <span key={idx} className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-md font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeSocialTab === 'instagram' && (
                                <div className="animate-fade-in text-left">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center text-white">
                                            <i className="bi bi-instagram text-xl"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 leading-tight">Post para Instagram</h4>
                                            <p className="text-xs text-gray-500">Interativo, focado e com hashtags</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 text-gray-800 whitespace-pre-wrap leading-relaxed text-sm select-all">
                                        {socialSummaries.instagram?.content || "Conteúdo não gerado."}
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {(socialSummaries.instagram?.hashtags || []).map((tag, idx) => (
                                            <span key={idx} className="bg-pink-100 text-pink-700 text-[10px] px-2 py-0.5 rounded-md font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeSocialTab === 'linkedin' && (
                                <div className="animate-fade-in text-left">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-sky-700 flex items-center justify-center text-white">
                                            <i className="bi bi-linkedin text-xl"></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 leading-tight">Post para LinkedIn</h4>
                                            <p className="text-xs text-gray-500">Tom de liderança de pensamento e relevância do setor B2B</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 text-gray-800 whitespace-pre-wrap leading-relaxed text-sm select-all">
                                        {socialSummaries.linkedin?.content || "Conteúdo não gerado."}
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {(socialSummaries.linkedin?.hashtags || []).map((tag, idx) => (
                                            <span key={idx} className="bg-sky-100 text-sky-800 text-[10px] px-2 py-0.5 rounded-md font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => {
                                    const content = socialSummaries[activeSocialTab]?.content || "";
                                    const tags = (socialSummaries[activeSocialTab]?.hashtags || []).join(' ');
                                    navigator.clipboard.writeText(`${content}\n\n${tags}`);
                                    useAppStore.getState().showToast("Texto e hashtags copiados com sucesso!", "success");
                                }}
                                className="text-sm font-semibold text-greatek-blue hover:text-greatek-dark-blue flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-greatek-blue/10 transition-colors shadow-xs bg-white border border-greatek-border"
                            >
                                <i className="bi bi-clipboard-check"></i> Copiar Conteúdo Copiado
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        )}
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
          <h1 className="text-2xl font-bold text-greatek-dark-blue">Redator de Blog Greatek AEO++</h1>
          <p className="text-text-secondary mt-2 max-w-lg mx-auto">
            Digite o tema do post. A IA criará conteúdo <strong>otimizado para Answer Engines</strong> (Google SGE),
            focado na dor do cliente, com perguntas nos títulos, parágrafos curtos, <strong>FAQ em Acordeão</strong> e links estratégicos.
          </p>
        </div>

        <div className="space-y-5 text-left">
          
          {/* Daily Usage Counter */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600" title="Contador local de requisições diárias">
                <i className="bi bi-lightning-charge-fill text-yellow-500"></i>
                <span>Uso Hoje: {dailyRequestsCount} gerações</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-greatek-dark-blue mb-2">Qual o tema do post?</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => handleTopicChange(e.target.value)}
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
              <span className="text-xs font-normal text-gray-500 ml-2">- Deixe em "Auto" para identificação automática</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
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
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>
          )}

          <div className="pt-2">
            <SubmitButton
              onClick={handleGenerate}
              disabled={isLoading || !topic.trim()}
              className="w-full py-4 text-lg font-bold rounded-xl shadow-md hover:scale-[1.01] transition-transform"
            >
              {isLoading ? 'Otimizando para AEO++...' : '🚀 Gerar Post AEO++ Completo'}
            </SubmitButton>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-900 font-medium mb-2">
              ✨ <strong>v2.3 AEO++ (Answer Engine Optimization)</strong>
            </p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>🎯 Títulos em formato de PERGUNTA</li>
              <li>📌 Box "Resposta Rápida" destacado</li>
              <li>❓ FAQ com <strong>Acordeão Interativo</strong></li>
              <li>🔗 Links contextuais (até {MAX_LINKS_PER_POST})</li>
              <li>🎨 CTA único degradê Greatek (Zero duplicidade)</li>
              <li>✅ Sem estatísticas inventadas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostGenerator;
