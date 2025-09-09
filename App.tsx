import React, { useState, useCallback } from 'react';
import { AppMode, PageOptimizationPackage } from './types';
import Header from './components/Header';
import Tabs from './components/Tabs';
import InteractionPanel from './components/InteractionPanel';
import { runGeminiQuery } from './services/geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.PAGE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<PageOptimizationPackage | string | null>(null);

  const handleQuerySubmit = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setResponse(null);
    try {
      const result = await runGeminiQuery(mode, prompt);
      setResponse(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Ocorreu um erro: ${err.message}`);
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [mode]);

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    setResponse(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-greatek-bg-light font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col">
        <Tabs currentMode={mode} setMode={handleModeChange} />
        <InteractionPanel
          mode={mode}
          isLoading={isLoading}
          error={error}
          response={response}
          onSubmit={handleQuerySubmit}
        />
      </main>
    </div>
  );
};

export default App;