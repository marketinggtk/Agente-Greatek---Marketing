
import React, { useState, useMemo } from 'react';
import { BlogPostPackage } from '../types';
import { useAppStore } from '../store/useAppStore';

interface CopyButtonProps {
    text: string;
    label?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ text, label = 'Copiar' }) => {
    const [copied, setCopied] = useState(false);
    const { showToast } = useAppStore();

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            showToast('Copiado para a área de transferência!', 'success');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1 px-2 rounded-md transition-colors border border-gray-300"
        >
            {copied ? <i className="bi bi-check-lg text-green-500"></i> : <i className="bi bi-clipboard"></i>}
            <span className='ml-1.5'>{copied ? 'Copiado!' : label}</span>
        </button>
    );
};

const BlogPostViewer: React.FC<{ data: BlogPostPackage }> = ({ data }) => {
    const { showToast } = useAppStore();
    const [htmlCopied, setHtmlCopied] = useState(false);

    const filteredSections = useMemo(() => {
        if (!data?.sections || !Array.isArray(data.sections)) return [];
        return data.sections.filter(section => {
            const heading = section.heading?.toLowerCase().trim() || '';
            return heading !== 'conclusão' && heading !== 'conclusao' && heading !== 'conclusion';
        });
    }, [data]);

    const fullPostHtml = useMemo(() => {
        if (!data) return '';
        const sectionsHtml = filteredSections.map(sec => 
            `<h2>${sec.heading}</h2>\n${sec.content}`
        ).join('\n\n');

        return `
<h1>${data.title}</h1>
${data.introduction}

${sectionsHtml}

<h2>Conclusão</h2>
${data.conclusion}

<p>&nbsp;</p>
${data.cta_html}
        `.trim();
    }, [data, filteredSections]);

    const handleCopyHtml = () => {
        navigator.clipboard.writeText(fullPostHtml).then(() => {
            setHtmlCopied(true);
            showToast('Código HTML copiado para a área de transferência!', 'success');
            setTimeout(() => setHtmlCopied(false), 3000);
        });
    };

    if (!data) return null;

    return (
        <div className="bg-greatek-bg-light border border-greatek-border rounded-lg shadow-sm animate-fade-in p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2">
                    <article className="bg-white p-6 sm:p-10 rounded-lg shadow-lg border border-gray-200">
                        {/* Post Header */}
                        <header className="pb-6 border-b border-gray-200">
                            {data.category && (
                                <span className="inline-block bg-greatek-blue/10 text-greatek-blue text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
                                    {data.category}
                                </span>
                            )}
                            <h1 className="text-3xl lg:text-4xl font-extrabold text-greatek-dark-blue leading-tight">
                                {data.title}
                            </h1>
                        </header>

                        {/* Introduction */}
                        <div className="text-lg lg:text-xl italic text-text-primary my-8 border-l-4 border-greatek-blue pl-4">
                             <div dangerouslySetInnerHTML={{ __html: data.introduction }} />
                        </div>

                        {/* Post Body */}
                        <div className="prose prose-lg max-w-none prose-p:text-text-primary prose-p:leading-relaxed prose-li:text-text-primary prose-headings:font-bold prose-headings:text-greatek-dark-blue prose-strong:text-greatek-dark-blue prose-ul:list-disc prose-ul:pl-5">
                            {filteredSections.map((section, index) => (
                                <React.Fragment key={index}>
                                    <h2 className="!text-2xl !mt-12 !mb-4">{section.heading}</h2>
                                    {/* Render HTML content directly for list support */}
                                    <div dangerouslySetInnerHTML={{ __html: section.content }} />
                                </React.Fragment>
                            ))}

                            <h2 className="!text-2xl !mt-12 !mb-4">Conclusão</h2>
                            <div dangerouslySetInnerHTML={{ __html: data.conclusion }} />
                        </div>
                        
                        {/* CTA Button */}
                        <footer className="mt-12 pt-8 border-t border-gray-200 flex justify-center">
                            <div className="not-prose" dangerouslySetInnerHTML={{ __html: data.cta_html }} />
                        </footer>
                    </article>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-4 lg:sticky lg:top-4 h-fit">
                    
                    {/* NEW: Category Card in Sidebar */}
                    {data.category && (
                        <div className="bg-white p-4 rounded-lg border border-greatek-border shadow-sm">
                            <h3 className="text-base font-semibold text-text-primary flex items-center mb-2">
                               <i className="bi bi-folder-fill mr-3 text-lg text-greatek-blue"></i>
                               Categoria do Blog
                            </h3>
                            <div className="flex justify-between items-center p-2.5 bg-greatek-bg-light rounded-md">
                                <span className="text-sm font-medium text-greatek-dark-blue">{data.category}</span>
                                <CopyButton text={data.category} />
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-4 rounded-lg border border-greatek-border shadow-sm">
                        <h3 className="text-base font-semibold text-text-primary flex items-center mb-3">
                           <i className="bi bi-wordpress mr-3 text-lg text-greatek-blue"></i>
                           Publicar no WordPress
                        </h3>
                        <p className="text-xs text-text-secondary mb-3">
                            Revise o conteúdo gerado. Se estiver aprovado, copie o código HTML e cole no editor de código do seu post no WordPress.
                        </p>
                        <button
                            onClick={handleCopyHtml}
                            className="w-full flex items-center justify-center space-x-1.5 text-sm font-semibold bg-greatek-blue hover:bg-greatek-dark-blue text-white py-2 px-3 rounded-md transition-colors"
                        >
                            {htmlCopied ? <i className="bi bi-check-lg"></i> : <i className="bi bi-clipboard-check-fill"></i>}
                            <span>{htmlCopied ? 'HTML Copiado!' : 'Copiar HTML para WordPress'}</span>
                        </button>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-greatek-border shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-base font-semibold text-text-primary flex items-center">
                               <i className="bi bi-tags-fill mr-3 text-lg text-greatek-blue"></i>
                               Tags (Palavras-chave)
                            </h3>
                            <CopyButton text={data.seo_tags.join(', ')} label="Copiar Todas"/>
                        </div>
                        <p className="text-xs text-text-secondary mb-3">Use estas tags para melhorar a busca e o SEO do seu post.</p>
                        <div className="flex flex-wrap gap-1.5">
                            {data.seo_tags.map((tag, index) => (
                                <span key={index} className="text-xs bg-greatek-blue/10 text-greatek-blue font-medium px-2 py-1 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-greatek-border">
                        <h3 className="text-base font-semibold text-text-primary flex items-center mb-3">
                           <i className="bi bi-google mr-3 text-lg text-greatek-blue"></i>
                           Otimização (SEO)
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <label className="font-semibold text-xs text-text-secondary/80">Título SEO</label>
                                <div className="flex justify-between items-center p-2 bg-greatek-bg-light rounded">
                                    <p className="text-text-secondary pr-2">{data.seo_title}</p>
                                    <CopyButton text={data.seo_title} />
                                </div>
                            </div>
                             <div>
                                <label className="font-semibold text-xs text-text-secondary/80">Meta Descrição</label>
                                <div className="flex justify-between items-start p-2 bg-greatek-bg-light rounded">
                                    <p className="text-text-secondary pr-2">{data.seo_meta_description}</p>
                                    <CopyButton text={data.seo_meta_description} />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {data.related_products && data.related_products.length > 0 && (
                        <div className="bg-white p-4 rounded-lg border border-greatek-border">
                            <h3 className="text-base font-semibold text-text-primary flex items-center mb-3">
                                <i className="bi bi-box-seam-fill mr-3 text-lg text-greatek-blue"></i>
                                Produtos Relacionados
                            </h3>
                            <div className="space-y-2">
                                {data.related_products.map((prod, index) => (
                                    <div key={index} className="p-2 bg-greatek-bg-light rounded">
                                        <p className="font-semibold text-sm text-greatek-dark-blue">{prod.name}</p>
                                        {prod.code && <p className="text-xs text-text-secondary">Código: {prod.code}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlogPostViewer;
