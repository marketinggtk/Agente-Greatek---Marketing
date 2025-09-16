



import React from 'react';
import { PageOptimizationPackage, MarketIntelReport, Message, TrainingKitReport, VigiaReport, NetworkArchitectureReport, AppMode, isPageOptimizationPackage } from '../types';
import JsonViewer from './JsonViewer';
import MarkdownViewer from './MarkdownViewer';
import MarketIntelViewer from './MarketIntelViewer';
import TrainingKitViewer from './TrainingKitViewer';
import VigiaReportViewer from './VigiaReportViewer';
import NetworkArchitectureViewer from './NetworkArchitectureViewer';
import ComplexResponseViewer from './ComplexResponseViewer';


interface ResponseDisplayProps {
  message: Message;
  mode: AppMode;
  isLastMessage: boolean;
}

function isMarketIntelReport(response: any): response is MarketIntelReport {
    return response && typeof response === 'object' && 'comparison_points' in response && 'greatek_product_name' in response;
}

function isTrainingKitReport(response: any): response is TrainingKitReport {
    return response && typeof response === 'object' && 'product_name' in response && 'knowledge_quiz' in response;
}

function isVigiaReport(response: any): response is VigiaReport {
    return response && typeof response === 'object' && 'monitoring_topic' in response && 'actionable_insight' in response;
}

function isNetworkArchitectureReport(response: any): response is NetworkArchitectureReport {
    return response && typeof response === 'object' && 'diagnosis' in response && 'benefit_simulation' in response;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ message, mode, isLastMessage }) => {
    const { content } = message;

    if (isMarketIntelReport(content)) {
        return <MarketIntelViewer data={content} />;
    }
    
    if (isTrainingKitReport(content)) {
        return <TrainingKitViewer data={content} />;
    }
    
    if (isVigiaReport(content)) {
        return <VigiaReportViewer data={content} />;
    }

    if (isNetworkArchitectureReport(content)) {
        return <NetworkArchitectureViewer data={content} />;
    }

    if (isPageOptimizationPackage(content)) {
        return <ComplexResponseViewer data={content} mode={mode} />;
    }
    
    if (typeof content === 'object' && content !== null) {
        // Fallback for any other object type
        return <JsonViewer data={content as PageOptimizationPackage} />;
    }
    
    if (typeof content === 'string') {
        return <MarkdownViewer content={content} mode={mode} isLastMessage={isLastMessage} />;
    }

    return null;
};

export default ResponseDisplay;