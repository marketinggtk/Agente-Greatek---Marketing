import React from 'react';
import Markdown from 'react-markdown';
import { normalizeConsultantMarkdown } from '../utils/normalizeConsultantMarkdown';

interface ConsultantResponseSectionsProps {
    content: string;
}

export const ConsultantResponseSections: React.FC<ConsultantResponseSectionsProps> = ({ content }) => {
    const normalized = normalizeConsultantMarkdown(content);

    // Split by Markdown level 2 headers (## Title), keeping the headers in the array
    const sections = normalized
        .split(/(?=^##\s)/gm)
        .map(section => section.trim())
        .filter(Boolean);

    // If no sections found (no ## at all or no content)
    if (sections.length === 0 || sections.every(s => !s.startsWith('## '))) {
        return (
            <div className="prose prose-sm md:prose-base max-w-none prose-p:text-slate-700">
                <Markdown>{content}</Markdown>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {sections.map((section, index) => {
                const isHeaderSection = section.startsWith('## ');
                
                if (!isHeaderSection) {
                    // Render intro text before any header
                    return (
                        <div key={`intro-${index}`} className="prose prose-sm md:prose-base max-w-none prose-p:text-slate-700 prose-p:font-medium">
                            <Markdown>{section}</Markdown>
                        </div>
                    );
                }

                const lines = section.split('\n');
                const headerLine = lines[0];
                const title = headerLine.replace(/^##\s+/, '').trim();
                const body = lines.slice(1).join('\n').trim();

                // During streaming, hide the section title if there is no content yet
                if (!body) return null;

                return (
                    <section 
                        key={`${title}-${index}`} 
                        className="group border-l-4 border-greatek-blue/10 hover:border-greatek-blue/30 pl-6 py-1 transition-colors"
                    >
                        <h3 className="mb-4 text-xs md:text-[13px] font-black uppercase tracking-[0.2em] text-greatek-dark-blue">
                            {title}
                        </h3>

                        <div className="prose prose-sm md:prose-base max-w-none 
                            prose-p:my-2 
                            prose-p:leading-relaxed 
                            prose-p:text-slate-600 
                            prose-p:font-medium 
                            prose-li:text-slate-600 
                            prose-li:font-medium 
                            prose-li:my-1.5 
                            prose-ul:my-4 
                            prose-ol:my-4 
                            prose-strong:font-bold 
                            prose-strong:text-greatek-blue 
                            prose-blockquote:border-l-greatek-blue 
                            prose-blockquote:bg-blue-50/50 
                            prose-blockquote:not-italic 
                            prose-blockquote:px-6 
                            prose-blockquote:py-4 
                            prose-blockquote:rounded-2xl 
                            prose-blockquote:text-blue-900
                            prose-blockquote:font-bold
                            prose-blockquote:my-6
                        ">
                            <Markdown>{body}</Markdown>
                        </div>
                    </section>
                );
            })}
        </div>
    );
};
