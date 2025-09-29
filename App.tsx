
import React, { useState, useEffect, useMemo } from 'react';
import { AppMode } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import InteractionPanel from './components/InteractionPanel';
import SplashScreen from './components/SplashScreen';
import AdminPanel from './components/AdminPanel';
import useAppStore from './store/useAppStore';
import AgentSelectionScreen from './components/AgentSelectionScreen';
import ChatDisplay from './components/ChatDisplay';
import Toast from './components/Toast';
import FeedbackInputModal from './components/FeedbackInputModal';
import { AGENTS } from './constants';
import GoalCalculator from './components/GoalCalculator';
import PresentationBuilder from './components/PresentationBuilder';

const App: React.FC = () => {
  const {
    activeConversationId,
    createNewConversation,
    toastInfo,
    hideToast,
    feedbackModalState,
  } = useAppStore();
  const conversations = useAppStore((state) => state.conversations);

  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsFadingOut(true), 2500);
    const hideTimer = setTimeout(() => setShowSplash(false), 3500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);
  
  const handleSelectAgent = (mode: AppMode) => {
    createNewConversation(mode);
  };

  const activeConversation = useMemo(() =>
    conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  );
  
  const agentInfo = useMemo(() => 
    AGENTS.find(a => a.mode === activeConversation?.mode),
    [activeConversation]
  );

  if (showSplash) {
    return <SplashScreen isFadingOut={isFadingOut} />;
  }
  
  const renderContent = () => {
    if (!activeConversationId) {
      return <AgentSelectionScreen onSelectAgent={handleSelectAgent} />;
    }

    const currentMode = activeConversation?.mode;
    const isToolMode = [AppMode.GOAL_CALCULATOR, AppMode.PRESENTATION_BUILDER].includes(currentMode as AppMode);

    const renderTool = () => {
        switch(currentMode) {
            case AppMode.GOAL_CALCULATOR:
                return <GoalCalculator />;
            case AppMode.PRESENTATION_BUILDER:
                return <PresentationBuilder />;
            default:
                return null;
        }
    }

    return (
        <div className="h-screen bg-greatek-blue font-sans flex flex-col animate-fade-in">
          <Header onAdminClick={() => setIsAdminPanelOpen(true)} onMenuClick={() => setIsSidebarOpen(true)} agentTitle={agentInfo?.title} />
          <div className="flex flex-grow container mx-auto p-2 sm:p-4 overflow-hidden">
            {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className="flex-grow flex flex-col md:ml-4 bg-white rounded-lg shadow-lg overflow-hidden border border-greatek-border">
              {isToolMode ? renderTool() : (
                <>
                  <ChatDisplay />
                  <InteractionPanel />
                </>
              )}
            </main>
          </div>
        </div>
    );
  };


  return (
    <>
      {/* Modals are always rendered so they can be opened from anywhere */}
      {toastInfo && (
        <Toast
          message={toastInfo.message}
          type={toastInfo.type}
          duration={toastInfo.duration}
          onClose={hideToast}
        />
      )}
      {feedbackModalState.isOpen && <FeedbackInputModal />}
      {isAdminPanelOpen && <AdminPanel onClose={() => setIsAdminPanelOpen(false)} />}
      
      {renderContent()}
    </>
  );
};

export default App;