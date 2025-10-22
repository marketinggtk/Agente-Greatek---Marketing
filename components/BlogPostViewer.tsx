import React, { useState, useMemo } from 'react';
import { BlogPostPackage } from '../types';
import { useAppStore } from '../store/useAppStore';

// Reusable CopyButton component for consistency
const CopyButton: React.FC<{ text: string, label?: string }> = ({ text, label = 'Copiar' }) => {
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

// Helper function to parse inline markdown elements like **bold** and *italic*.
const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
    const parts = text.split(regex);

    return parts.filter(part => part).map((part, index) => {
        if (!part) return null;
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={index}>{part.slice(1, -1)}</em>;
        }
        return part;
    });
};

const SimpleMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const elements = useMemo(() => {
        if (!content) return [];
        const lines = content.split('\n');
        const elements: React.ReactElement[] = [];
        let listItems: string[] = [];

        const flushList = () => {
            if (listItems.length > 0) {
                elements.push(
                    <ul key={`list-${elements.length}`}>
                        {listItems.map((item, idx) => (
                            <li key={idx}>{parseInlineMarkdown(item)}</li>
                        ))}
                    </ul>
                );
                listItems = [];
            }
        };

        lines.forEach((line, i) => {
            if (line.trim().match(/^(\*|-)\s/)) {
                listItems.push(line.trim().substring(2));
            } else {
                flushList();
                if (line.trim()) {
                    elements.push(<p key={`p-${i}`}>{parseInlineMarkdown(line)}</p>);
                }
            }
        });

        flushList();
        return elements;
    }, [content]);

    return <>{elements}</>;
};


const BlogPostViewer: React.FC<{ data: BlogPostPackage }> = ({ data }) => {
    const { createImageAdFromPrompt, showToast } = useAppStore();

    // Function to convert simple markdown from agent to HTML for WordPress
    const markdownToHtml = (text: string) => {
        if (!text) return '';
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');

        const blocks = html.split('\n').map(line => line.trim()).filter(line => line);
        let inList = false;
        let finalHtml = '';

        blocks.forEach(block => {
            if (block.startsWith('- ')) {
                if (!inList) {
                    finalHtml += '<ul>\n';
                    inList = true;
                }
                finalHtml += `  <li>${block.substring(2)}</li>\n`;
            } else {
                if (inList) {
                    finalHtml += '</ul>\n';
                    inList = false;
                }
                finalHtml += `<p>${block}</p>\n`;
            }
        });

        if (inList) {
            finalHtml += '</ul>\n';
        }
        return finalHtml;
    };

    const fullPostHtml = useMemo(() => {
        const sectionsHtml = data.sections.map(sec => 
            `<h2>${sec.heading}</h2>\n${markdownToHtml(sec.content)}`
        ).join('\n');

        return `
<h1>${data.title}</h1>
${markdownToHtml(data.introduction)}
${sectionsHtml}
<h2>Conclusão</h2>
${markdownToHtml(data.conclusion)}
<p>&nbsp;</p>
${data.cta_html}
        `.trim().replace(/^\s*\n/gm, "");
    }, [data]);

    const [htmlCopied, setHtmlCopied] = useState(false);

    const handleCopyHtml = () => {
        navigator.clipboard.writeText(fullPostHtml).then(() => {
            setHtmlCopied(true);
            showToast('Código HTML copiado para a área de transferência!', 'success');
            setTimeout(() => setHtmlCopied(false), 3000);
        });
    };

    return (
        <div className="bg-greatek-bg-light border border-greatek-border rounded-lg shadow-sm animate-fade-in p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2">
                    <article className="bg-white p-6 sm:p-10 rounded-lg shadow-lg border border-gray-200">
                        {/* Post Header */}
                        <header className="pb-6 border-b border-gray-200">
                            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                                {data.title}
                            </h1>
                        </header>

                        {/* Introduction */}
                        <p className="text-lg lg:text-xl italic text-gray-600 my-8 border-l-4 border-greatek-blue pl-4">
                            {data.introduction}
                        </p>

                        {/* Post Body with Prose styling */}
                        <div className="prose prose-lg max-w-none prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-headings:font-bold prose-headings:text-gray-900 prose-strong:text-gray-900">
                            {data.sections.map((section, index) => (
                                <React.Fragment key={index}>
                                    <h2 className="!text-2xl !mt-12 !mb-4">{section.heading}</h2>
                                    <SimpleMarkdownRenderer content={section.content} />
                                </React.Fragment>
                            ))}

                            <h2 className="!text-2xl !mt-12 !mb-4">Conclusão</h2>
                            <SimpleMarkdownRenderer content={data.conclusion} />
                        </div>
                        
                        {/* CTA Button */}
                        <footer className="mt-12 pt-8 border-t border-gray-200 flex justify-center">
                            <div className="not-prose" dangerouslySetInnerHTML={{ __html: data.cta_html }} />
                        </footer>
                    </article>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-4 lg:sticky lg:top-4 h-fit">
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

                    <div className="bg-gradient-to-br from-greatek-blue to-greatek-dark-blue text-white p-4 rounded-lg shadow-lg">
                        <h3 className="text-base font-semibold flex items-center mb-2">
                            <i className="bi bi-image-fill mr-3 text-lg"></i>
                            Imagem de Destaque
                        </h3>
                        <p className="text-sm italic text-white/80 mb-4 line-clamp-3">"{data.image_prompt_suggestion}"</p>
                        <button 
                            onClick={() => createImageAdFromPrompt(data.image_prompt_suggestion)}
                            className="flex items-center justify-center w-full px-4 py-2 text-sm font-bold text-greatek-dark-blue bg-white rounded-lg hover:bg-greatek-bg-light transition-colors transform hover:scale-105">
                            <i className="bi bi-magic mr-2"></i>
                            Gerar Imagem
                        </button>
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