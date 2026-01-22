

import React from 'react';
import { PageOptimizationPackage, MarketIntelReport, Message, TrainingKitReport, AppMode, isPageOptimizationPackage, isImageAdPackage, ImageAdPackage, isContentPackage, isPresentationPackage, isCustomerDossier, CustomerDossier, isBlogPostPackage, isPortfolioSearchResult, isContentPlan } from '../types';
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
import PortfolioSearch from './PortfolioSearch';
import ContentCalendar from './ContentCalendar';


interface ResponseDisplayProps {
  message: Message;
  mode: AppMode;
  isLastMessage: boolean;
  onUpscale?: () => void;
  onRegenerate?: () => void;
}

function isMarketIntelReport(response: any): response is MarketIntelReport {
    // Check for the correct flat structure
    const isFlat = response && typeof response === 'object' && 'comparison_points' in response && 'greatek_product_name' in response;
    // Check for the incorrect nested structure the AI sometimes returns
    const isNested = response && typeof response === 'object' && response.relatorio_inteligencia_mercado;
    return isFlat || isNested;
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
    
    // Note: AppMode.CONTENT used to use ContentPackageViewer but now uses MarkdownViewer via string return.
    // We keep this check for backward compatibility with old history messages.
    if (isContentPackage(content)) {
        return <ContentPackageViewer data={content} />;
    }

    if (isBlogPostPackage(content)) {
        return <BlogPostViewer data={content} />;
    }

    if (isPageOptimizationPackage(content)) {
        return <ComplexResponseViewer data={content} mode={mode} />;
    }
    
    // Portfolio Search and Content Planner are handled by their own components usually, but as a fallback:
    if (isPortfolioSearchResult(content)) {
       return <JsonViewer data={content} />; 
    }

    if (isContentPlan(content)) {
       return <ContentCalendar plan={content} />;
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
