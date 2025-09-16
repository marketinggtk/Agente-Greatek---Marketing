


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

const App: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    createNewConversation,
    submitQuery,
  } = useAppStore();

  const activeConversation = useMemo(() => 
    conversations.find(c => c.id === activeConversationId),
    [conversations, activeConversationId]
  );

  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

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

  if (showSplash) {
    return <SplashScreen isFadingOut={isFadingOut} />;
  }

  if (!activeConversationId) {
    return <AgentSelectionScreen onSelectAgent={handleSelectAgent} />;
  }

  return (
    <div className="h-screen bg-greatek-bg-light font-sans flex flex-col animate-fade-in">
       {isAdminPanelOpen && <AdminPanel onClose={() => setIsAdminPanelOpen(false)} />}
      <Header onAdminClick={() => setIsAdminPanelOpen(true)} />
      <div className="flex flex-grow container mx-auto p-4 md:p-6 lg:p-8 overflow-hidden">
        <Sidebar />
        <main className="flex-grow flex flex-col ml-4 bg-white rounded-lg shadow-lg overflow-hidden border border-greatek-border">
          <ChatDisplay />
          <InteractionPanel onSubmit={submitQuery} />
        </main>
      </div>
    </div>
  );
};

export default App;