
import React, { useState } from 'react';
import { PresentationPackage } from '../types';
import { generatePresentationPdf } from '../services/presentationPdfGenerator';
import Modal from './ui/Modal';

interface PresentationViewerProps {
    data: PresentationPackage;
}

const parseMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(Boolean);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={index}>{part.slice(1, -1)}</em>;
        }
        return part;
    });
};

const SlideContent: React.FC<{ slide: PresentationPackage['slides'][0] }> = ({ slide }) => {
    switch(slide.slide_type) {
        case 'key_metrics':
            const metrics = slide.content.metrics || [];
            return (
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    {metrics.map((metric: any, index: number) => (
                        <div key={index} className="p-4 bg-greatek-blue/10 rounded-lg text-center">
                            <p className="text-3xl font-bold text-greatek-dark-blue">{metric.value}</p>
                            <p className="text-sm text-text-secondary">{metric.label}</p>
                        </div>
                    ))}
                </div>
            )
        case 'three_column_cards':
             const cards = slide.content.cards || [];
             return (
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    {cards.map((card: any, index: number) => (
                        <div key={index} className="p-4 bg-white rounded-lg border border-greatek-border">
                            <h4 className="font-bold text-greatek-dark-blue">{card.title}</h4>
                            <p className="text-sm text-text-secondary mt-1">{parseMarkdown(card.description)}</p>
                        </div>
                    ))}
                </div>
             );
        case 'table_slide':
            const { headers = [], rows = [] } = slide.content;
            return (
                <div className="mt-4 overflow-x-auto border border-greatek-border rounded-lg">
                    <table className="min-w-full divide-y divide-greatek-border text-sm">
                        <thead className="bg-greatek-bg-light">
                            <tr>
                                {headers.map((header: string, hIdx: number) => (
                                    <th key={hIdx} className="px-4 py-2 text-left font-semibold text-greatek-dark-blue">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-greatek-border">
                            {rows.map((row: string[], rIdx: number) => (
                                <tr key={rIdx} className="hover:bg-greatek-bg-light/50">
                                    {row.map((cell: string, cIdx: number) => (
                                        <td key={cIdx} className="px-4 py-2 text-text-secondary">{parseMarkdown(cell)}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        default:
            const contentArray = Array.isArray(slide.content) ? slide.content : [String(slide.content)];
            return (
                <ul className="list-disc pl-5 mt-4 space-y-2 text-text-secondary">
                    {contentArray.map((item, index) => (
                       <li key={index}>{parseMarkdown(item)}</li>
                    ))}
                </ul>
            );
    }
};


const PresentationViewer: React.FC<PresentationViewerProps> = ({ data }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="p-6 bg-greatek-bg-light border border-greatek-border rounded-lg text-center animate-fade-in">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-greatek-blue/10">
                    <i className="bi bi-file-slides-fill text-3xl text-greatek-blue"></i>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-greatek-dark-blue">Roteiro da Apresentação Gerado</h3>
                <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
                    O agente criou um roteiro completo para a apresentação "{data.presentation_title}".
                </p>
                <div className="mt-6">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-greatek-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-greatek-dark-blue focus:outline-none focus:ring-2 focus:ring-greatek-blue focus:ring-offset-2"
                    >
                        <i className="bi bi-box-arrow-up-right mr-2"></i>
                        Visualizar Roteiro
                    </button>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={data.presentation_title}
            >
                <div className="space-y-4">
                    <div className="p-4 bg-greatek-bg-light rounded-lg border border-greatek-border text-center">
                        <p className="text-sm text-text-secondary">Público-alvo: <strong>{data.target_audience}</strong></p>
                         <button
                            onClick={() => generatePresentationPdf(data)}
                            className="mt-3 flex items-center justify-center mx-auto gap-2 text-xs font-semibold text-white bg-greatek-blue px-3 py-1.5 rounded-md hover:bg-greatek-dark-blue transition-colors"
                        >
                            <i className="bi bi-file-earmark-pdf-fill"></i>
                            Salvar em PDF
                        </button>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto space-y-6 p-2 custom-scrollbar">
                        {data.slides.map((slide, index) => (
                            <div key={slide.id} className="p-4 border border-greatek-border rounded-lg shadow-sm bg-white">
                                <span className="text-xs font-semibold text-greatek-blue bg-greatek-blue/10 px-2 py-0.5 rounded-full">Slide {index + 1}</span>
                                <h3 className="text-lg font-bold text-greatek-dark-blue mt-2">{slide.title}</h3>
                                
                                <SlideContent slide={slide} />

                                {slide.summary && (
                                    <p className="text-sm italic text-text-secondary mt-4 pt-4 border-t border-dashed border-greatek-border">
                                        {parseMarkdown(slide.summary)}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default PresentationViewer;