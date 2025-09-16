
import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import { sendFeedbackEmail } from '../services/emailService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'userInfo' | 'feedbackText' | 'success'>('userInfo');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('userInfo');
        setName('');
        setEmail('');
        setSuggestion('');
        setError('');
        setIsSending(false);
      }, 300); // Delay reset to allow for closing animation
    }
  }, [isOpen]);
  
  const handleContinue = () => {
    if (!name.trim() || !email.trim()) {
      setError('Por favor, preencha seu nome e e-mail.');
      return;
    }
    // Simple email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Por favor, insira um e-mail válido.');
        return;
    }
    setError('');
    setStep('feedbackText');
  };
  
  const handleSend = async () => {
    if (!suggestion.trim()) {
      setError('Por favor, escreva sua sugestão.');
      return;
    }
    setError('');
    setIsSending(true);

    try {
      await sendFeedbackEmail({ name, email, suggestion });
      setStep('success');
    } catch (e) {
      setError('Ocorreu um erro ao enviar a sugestão. Tente novamente.');
    } finally {
      setIsSending(false);
    }
  };
  
  const renderContent = () => {
    switch (step) {
      case 'userInfo':
        return (
          <div className="space-y-4 animate-fade-in">
            <p className="text-sm text-text-secondary">
              Para começar, por favor, nos informe seu nome e e-mail.
            </p>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary">Nome</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-transparent shadow-sm focus:border-greatek-blue focus:ring-greatek-blue sm:text-sm p-2 bg-greatek-border text-text-primary placeholder:text-text-secondary"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">E-mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-transparent shadow-sm focus:border-greatek-blue focus:ring-greatek-blue sm:text-sm p-2 bg-greatek-border text-text-primary placeholder:text-text-secondary"
                placeholder="seu.email@exemplo.com"
              />
            </div>
            {error && <p className="text-red-600 text-xs text-center">{error}</p>}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleContinue}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-greatek-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-greatek-dark-blue focus:outline-none focus:ring-2 focus:ring-greatek-blue focus:ring-offset-2"
              >
                Continuar
              </button>
            </div>
          </div>
        );
      case 'feedbackText':
        return (
            <div className="space-y-4 animate-fade-in">
                <p className="text-sm text-text-secondary">
                  Ótimo! Agora, conte-nos sua ideia. O que você gostaria de ver ou o que podemos melhorar?
                </p>
                <div>
                  <label htmlFor="suggestion" className="block text-sm font-medium text-text-primary sr-only">Sua sugestão</label>
                  <textarea
                    id="suggestion"
                    rows={6}
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    className="mt-1 block w-full rounded-md border-transparent shadow-sm focus:border-greatek-blue focus:ring-greatek-blue sm:text-sm p-2 bg-greatek-border text-text-primary placeholder:text-text-secondary"
                    placeholder="Digite sua sugestão aqui..."
                  />
                </div>
                 {error && <p className="text-red-600 text-xs text-center">{error}</p>}
                <div className="pt-2 flex justify-between items-center">
                    <button onClick={() => setStep('userInfo')} className="text-sm text-text-secondary hover:text-text-primary disabled:opacity-50" disabled={isSending}>Voltar</button>
                    <button
                        onClick={handleSend}
                        disabled={isSending}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-greatek-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-greatek-dark-blue focus:outline-none focus:ring-2 focus:ring-greatek-blue focus:ring-offset-2 disabled:bg-gray-400"
                    >
                        {isSending ? 'Enviando...' : 'Enviar Sugestão'}
                    </button>
                </div>
            </div>
        );
      case 'success':
        return (
            <div className="text-center p-8 animate-fade-in">
                <i className="bi bi-check-circle-fill text-6xl text-green-500 mx-auto"></i>
                <h3 className="mt-4 text-xl font-semibold text-greatek-dark-blue">Obrigado!</h3>
                <p className="mt-2 text-text-secondary">
                  Sua sugestão foi enviada com sucesso e é muito importante para nós!
                </p>
                 <div className="mt-6">
                    <button
                        onClick={onClose}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-text-primary shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-greatek-blue focus:ring-offset-2"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova ideia / Sugestão de melhoria"
    >
      {renderContent()}
    </Modal>
  );
};

export default FeedbackModal;