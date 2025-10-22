


import React from 'react';
import { PageOptimizationPackage, MarketIntelReport, Message, TrainingKitReport, AppMode, isPageOptimizationPackage, isImageAdPackage, ImageAdPackage, isContentPackage, isPresentationPackage, isCustomerDossier, CustomerDossier, isBlogPostPackage } from '../types';
import JsonViewer from './JsonViewer';
import MarkdownViewer from './MarkdownViewer';
import MarketIntelViewer from './MarketIntelViewer';
import TrainingKitViewer from './TrainingKitViewer';
import ComplexResponseViewer from './ComplexResponseViewer';
import ImageAdViewer from './ImageAdViewer';
import ContentPackageViewer from './ContentPackageViewer';
import BlogPostViewer from './BlogPostViewer';
import PresentationViewer from './PresentationViewer';
import CustomerDossierViewer from './CustomerDossierViewer';


interface ResponseDisplayProps {
  message: Message;
  mode: AppMode;
  isLastMessage: boolean;
  onUpscale?: () => void;
  onRegenerate?: () => void;
}

function isMarketIntelReport(response: any): response is MarketIntelReport {
    return response && typeof response === 'object' && 'comparison_points' in response && 'greatek_product_name' in response;
}

function isTrainingKitReport(response: any): response is TrainingKitReport {
    return response && typeof response === 'object' && 'product_name' in response && 'knowledge_quiz' in response;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ message, mode, isLastMessage, onUpscale, onRegenerate }) => {
    const { content } = message;

    if (isImageAdPackage(content)) {
        return <ImageAdViewer data={content} onUpscale={onUpscale} onRegenerate={onRegenerate} />;
    }
    
    if (isPresentationPackage(content)) {
        return <PresentationViewer data={content} />;
    }

    if (isMarketIntelReport(content)) {
        return <MarketIntelViewer data={content} />;
    }

    if (isCustomerDossier(content)) {
        return <CustomerDossierViewer data={content} />;
    }
    
    if (isTrainingKitReport(content)) {
        return <TrainingKitViewer data={content} />;
    }
    
    if (isContentPackage(content)) {
        return <ContentPackageViewer data={content} />;
    }

    if (isBlogPostPackage(content)) {
        return <BlogPostViewer data={content} />;
    }

    if (isPageOptimizationPackage(content)) {
        return <ComplexResponseViewer data={content} mode={mode} />;
    }
    
    if (typeof content === 'object' && content !== null) {
        return <JsonViewer data={content} />;
    }
    
    if (typeof content === 'string') {
        return <MarkdownViewer content={content} mode={mode} isLastMessage={isLastMessage} />;
    }

    return null;
};

export default ResponseDisplay;