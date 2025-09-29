
import React, { useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import { AppMode } from '../types';

const GENERAL_MESSAGES = [
    "Analisando sua solicitação...",
    "Consultando a base de conhecimento...",
    "Processando as informações...",
    "Estruturando a resposta...",
    "Quase pronto...",
];

const SEARCH_MESSAGES = [
    "Analisando seu pedido de busca...",
    "Pesquisando informações na web...",
    "Compilando os dados mais recentes...",
    "Gerando o relatório de inteligência...",
];

const JSON_MESSAGES = [
    "Interpretando os requisitos...",
    "Construindo a estrutura de dados...",
    "Validando o formato do relatório...",
    "Gerando o pacote de otimização...",
];

const DynamicLoader: React.FC = () => {
    const { conversations, activeConversationId } = useAppStore();
    const [message, setMessage] = useState(GENERAL_MESSAGES[0]);
    
    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const currentMode = activeConversation?.mode;

    useEffect(() => {
        let messagesToShow = GENERAL_MESSAGES;
        if (currentMode && [AppMode.MARKET_INTEL, AppMode.VIGIA].includes(currentMode)) {
            messagesToShow = SEARCH_MESSAGES;
        } else if (currentMode && [AppMode.PAGE, AppMode.INSTRUCTOR].includes(currentMode)) {
            messagesToShow = JSON_MESSAGES;
        }

        setMessage(messagesToShow[0]);
        let messageIndex = 0;
        
        const intervalId = setInterval(() => {
            messageIndex = (messageIndex + 1) % messagesToShow.length;
            setMessage(messagesToShow[messageIndex]);
        }, 2500); // Change message every 2.5 seconds

        return () => clearInterval(intervalId);
    }, [currentMode]);

    return (
        <div className="flex flex-col items-start p-3 bg-white border border-greatek-border rounded-xl rounded-bl-none shadow-sm">
            <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
            <p className="mt-2 text-sm font-medium text-text-secondary transition-opacity duration-500">
                {message}
            </p>
        </div>
    );
};

export default DynamicLoader;
