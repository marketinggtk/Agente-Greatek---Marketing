
import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppMode } from '../types';

const GENERAL_MESSAGES = [
    "Consultando base de conhecimento...",
    "Estruturando a resposta...",
    "Refinando o conteúdo...",
    "Finalizando..."
];

const SEARCH_MESSAGES = [
    "Analisando concorrentes na web...",
    "Comparando especificações técnicas...",
    "Identificando diferenciais competitivos...",
    "Compilando relatório de mercado..."
];

const JSON_MESSAGES = [
    "Analisando estrutura da página...",
    "Verificando tags SEO...",
    "Gerando sugestões de otimização...",
    "Formatando pacote JSON..."
];

const IMAGEN_MESSAGES = [
    "Interpretando prompt visual...",
    "Configurando parâmetros de difusão...",
    "Gerando imagem de alta resolução...",
    "Aplicando filtros finais..."
];

const DynamicLoader: React.FC = () => {
    const { activeConversationId, conversations } = useAppStore();
    const [message, setMessage] = useState(GENERAL_MESSAGES[0]);
    
    const activeConversation = useMemo(() => 
        conversations.find(c => c.id === activeConversationId), 
    [conversations, activeConversationId]);

    const currentMode = activeConversation?.mode;

    useEffect(() => {
        let messagesToShow = GENERAL_MESSAGES;
        if (currentMode === AppMode.MARKET_INTEL || currentMode === AppMode.LEAD_HUNTER || currentMode === AppMode.CUSTOMER_DOSSIER) {
            messagesToShow = SEARCH_MESSAGES;
        } else if (currentMode === AppMode.PAGE) {
            messagesToShow = JSON_MESSAGES;
        } else if (currentMode === AppMode.IMAGE_ADS) {
            messagesToShow = IMAGEN_MESSAGES;
        }

        setMessage(messagesToShow[0]);

        const interval = setInterval(() => {
            setMessage(prev => {
                const currentIndex = messagesToShow.indexOf(prev);
                const nextIndex = (currentIndex + 1) % messagesToShow.length;
                return messagesToShow[nextIndex];
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [currentMode]);

    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 w-fit animate-fade-in">
            <div className="flex space-x-1">
                <div className="w-2 h-2 bg-greatek-blue rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-greatek-blue rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-greatek-blue rounded-full animate-bounce"></div>
            </div>
            <span className="text-sm font-medium text-text-secondary">{message}</span>
        </div>
    );
};

export default DynamicLoader;
