import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrainingModule } from '../types/trainingModule';
import { ModuleHeader } from './ModuleHeader';
import { InfoTab } from './InfoTab';
import { FaqTab } from './FaqTab';
import { ChatTab } from './ChatTab';
import { ProductModelSelector } from './ProductModelSelector';
import { useTrainingChat } from '../hooks/useTrainingChat';
import { TabId } from '../constants/tabs';

interface ModuleViewProps {
    module: TrainingModule;
    onBack: () => void;
}

export const ModuleView: React.FC<ModuleViewProps> = ({ module, onBack }) => {
    const [activeTab, setActiveTab] = useState<TabId>('info');
    const [selectedModelTitle, setSelectedModelTitle] = useState<string | undefined>(undefined);
    
    // Create an updated module object that includes the current selection
    const currentModule = {
        ...module,
        selectedModelTitle
    };

    const { messages, input, setInput, isLoading, sendMessage } = useTrainingChat(currentModule);

    const handleTabChange = (tabId: TabId) => {
        setActiveTab(tabId);
    };

    const handleSendMessage = (customInput?: string) => {
        sendMessage(customInput);
    };

    const handleAskInChat = (question?: string) => {
        setActiveTab('chat');
        if (question) {
            sendMessage(question);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0 }} 
            className="flex-grow flex flex-col h-full bg-white overflow-hidden"
        >
            <ModuleHeader 
                module={module} 
                activeTab={activeTab} 
                onBack={onBack} 
                onTabChange={handleTabChange} 
            />
            
            <div className="flex-grow overflow-hidden relative bg-gray-50/50">
                <div className="h-full overflow-y-auto p-6 md:p-12">
                    <div className="max-w-5xl mx-auto h-full space-y-8">
                        {/* Only show selector if models exist and we are in Info or Chat tab */}
                        {module.models && (activeTab === 'info' || activeTab === 'chat') && (
                            <ProductModelSelector 
                                models={module.models}
                                selectedModelTitle={selectedModelTitle}
                                onSelectModel={setSelectedModelTitle}
                            />
                        )}

                        <AnimatePresence mode="wait">
                            {activeTab === 'chat' ? (
                                <ChatTab 
                                    key="chat-tab"
                                    messages={messages}
                                    input={input}
                                    setInput={setInput}
                                    isLoading={isLoading}
                                    onSendMessage={handleSendMessage}
                                    module={currentModule}
                                />
                            ) : activeTab === 'faq' ? (
                                <FaqTab 
                                    key="faq-tab"
                                    faqs={module.faqs} 
                                    onAskInChat={handleAskInChat} 
                                    module={currentModule}
                                    isLoading={isLoading}
                                />
                            ) : (
                                <InfoTab 
                                    key="info-tab"
                                    module={currentModule} 
                                    onGoToChat={handleAskInChat}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
