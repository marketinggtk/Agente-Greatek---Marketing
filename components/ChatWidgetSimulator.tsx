
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { FULL_KNOWLEDGE_BASE_TEXT } from '../services/knowledgeBase';
import { useAppStore } from '../store/useAppStore';

// Configuração segura para demonstração (Em produção, isso ficaria no Backend)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface WidgetMessage {
    role: 'user' | 'model';
    text: string;
    isButton?: boolean; // Se for true, renderiza como botão/link especial
    linkUrl?: string;
}

interface LeadData {
    name: string;
    email: string;
    phone: string;
    cnpj: string;
    productInterest: string;
}

type LeadStep = 'idle' | 'name' | 'email' | 'phone' | 'cnpj' | 'finished';

const WIDGET_SYSTEM_PROMPT = `
Você é o Assistente Virtual do site oficial da Greatek.
Seu objetivo é atuar como um "Pré-vendedor Nível 1" e Suporte Básico.

**REGRAS ESTRUTURAIS DE RESPOSTA (OBRIGATÓRIO):**
1.  **SEJA CONCISO:** O chat é pequeno. Responda em frases curtas.
2.  **DIVIDA SUAS FALAS:** Se a resposta for longa, use o separador "|||".

**SUAS DIRETRIZES DE CONTEÚDO:**
1.  **Dúvidas Técnicas:** Use a base de conhecimento para responder sobre produtos (OLTs, Roteadores, Máquinas de Fusão).
2.  **INTENÇÃO DE COMPRA (CRÍTICO):**
    *   Se o usuário perguntar "preço", "cotação", "falar com vendedor", "onde comprar" ou demonstrar interesse comercial...
    *   **NÃO** forneça preços ou links de WhatsApp diretamente.
    *   **IDENTIFIQUE O PRODUTO** em questão.
    *   **RETORNE APENAS O COMANDO:** \`[START_LEAD_CAPTURE: Nome do Produto Identificado]\`
    *   *Exemplo:* O usuário diz "Quanto custa a Fusionadora X6?". Você responde APENAS: \`[START_LEAD_CAPTURE: Máquina de Fusão X6]\`.
    *   O sistema cuidará da coleta de dados a partir desse comando.

3.  **Triagem:** Se for suporte técnico complexo, diga para contatar o suporte especializado.

${FULL_KNOWLEDGE_BASE_TEXT}
`;

export const ChatWidgetSimulator: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<WidgetMessage[]>([
        { role: 'model', text: 'Olá! 👋 Bem-vindo à Greatek.' },
        { role: 'model', text: 'Sou sua inteligência artificial. Como posso te ajudar hoje?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Lead Capture State
    const [leadStep, setLeadStep] = useState<LeadStep>('idle');
    const [leadData, setLeadData] = useState<LeadData>({ name: '', email: '', phone: '', cnpj: '', productInterest: '' });

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping, isOpen]);

    const addMessage = (role: 'user' | 'model', text: string, isButton = false, linkUrl = '') => {
        setMessages(prev => [...prev, { role, text, isButton, linkUrl }]);
    };

    const processLeadFlow = async (userInput: string) => {
        // Simulating typing delay for natural feel
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 600));
        setIsTyping(false);

        switch (leadStep) {
            case 'name':
                setLeadData(prev => ({ ...prev, name: userInput }));
                setLeadStep('email');
                addMessage('model', `Obrigado, ${userInput.split(' ')[0]}. Para enviarmos a proposta, qual é o seu **e-mail** corporativo?`);
                break;

            case 'email':
                setLeadData(prev => ({ ...prev, email: userInput }));
                setLeadStep('phone');
                addMessage('model', 'Perfeito. E qual é o seu **telefone** (WhatsApp) para contato?');
                break;

            case 'phone':
                setLeadData(prev => ({ ...prev, phone: userInput }));
                setLeadStep('cnpj');
                addMessage('model', 'Certo. Por fim, precisamos do **CNPJ** da sua empresa para verificar as condições comerciais.');
                break;

            case 'cnpj':
                const finalData = { ...leadData, cnpj: userInput };
                setLeadData(finalData);
                setLeadStep('idle'); // Reset flow or set to 'finished'

                // Construct the full WhatsApp Message
                const waMessage = `Olá, me chamo ${finalData.name}, meu e-mail é ${finalData.email}, meu CNPJ é ${finalData.cnpj} e meu melhor numero para contato é ${finalData.phone}. Vim pelo widget do site da Greatek e queria mais informações sobre preço do produto ${finalData.productInterest}.`;
                
                const waLink = `https://wa.me/5512992218852?text=${encodeURIComponent(waMessage)}`;

                addMessage('model', 'Tudo certo! Recebemos seus dados.');
                addMessage('model', `Clique abaixo para falar com um consultor especialista sobre ${finalData.productInterest}:`);
                addMessage('model', 'Falar com Consultor Agora', true, waLink);
                break;
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        addMessage('user', userMsg);

        // --- INTERCEPT FOR LEAD FLOW ---
        if (leadStep !== 'idle') {
            await processLeadFlow(userMsg);
            return;
        }
        // -------------------------------

        setIsTyping(true);

        try {
            const history = messages
                .filter(m => !m.isButton) // Filter out button messages from history context
                .map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));
            
            history.push({ role: 'user', parts: [{ text: userMsg }] });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: history,
                config: {
                    systemInstruction: WIDGET_SYSTEM_PROMPT,
                }
            });

            const replyFull = response.text || "Desculpe, tive um problema de conexão.";

            // Check for Lead Capture Command
            if (replyFull.includes('[START_LEAD_CAPTURE:')) {
                const match = replyFull.match(/\[START_LEAD_CAPTURE: (.*?)\]/);
                const product = match ? match[1] : 'Produto Greatek';
                
                setLeadData(prev => ({ ...prev, productInterest: product }));
                setLeadStep('name');
                
                setIsTyping(false);
                addMessage('model', `Excelente escolha! O ${product} é um ótimo equipamento.`);
                
                // Small delay before asking name
                setIsTyping(true);
                await new Promise(resolve => setTimeout(resolve, 800));
                setIsTyping(false);
                addMessage('model', 'Para prosseguirmos com uma cotação personalizada, qual é o seu **nome**?');
                return;
            }
            
            // Standard Reply Processing
            const replyParts = replyFull.split('|||').map(p => p.trim()).filter(p => p);

            for (const part of replyParts) {
                setIsTyping(true);
                const typingDelay = Math.min(Math.max(part.length * 30, 800), 2500);
                await new Promise(resolve => setTimeout(resolve, typingDelay));

                setIsTyping(false);
                addMessage('model', part);
                
                if (replyParts.indexOf(part) < replyParts.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 300)); 
                }
            }

        } catch (error) {
            console.error("Widget Error:", error);
            setIsTyping(false);
            addMessage('model', "Ops! Nossos sistemas estão momentaneamente indisponíveis.");
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans flex flex-col items-end">
            
            {!isOpen && (
                <div className="relative group">
                    <div className="absolute bottom-full mb-2 right-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Simular Widget do Site
                    </div>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-16 h-16 bg-greatek-blue text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-200 border-4 border-white"
                    >
                        <i className="bi bi-chat-dots-fill text-3xl"></i>
                    </button>
                </div>
            )}

            {isOpen && (
                <div className="w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-fade-in-up">
                    <div className="bg-greatek-dark-blue p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                    <i className="bi bi-robot text-xl"></i>
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-greatek-dark-blue rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Agente Greatek</h3>
                                <p className="text-xs text-white/70">
                                    {leadStep !== 'idle' ? 'Coletando dados...' : 'Online agora'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
                                <i className="bi bi-dash-lg"></i>
                            </button>
                            <button onClick={onClose} className="hover:bg-red-500/80 p-1 rounded transition-colors" title="Encerrar Simulação">
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                    </div>

                    <div className="flex-grow bg-gray-50 p-4 overflow-y-auto custom-scrollbar" ref={scrollRef}>
                        <div className="space-y-4">
                            <div className="text-center text-xs text-gray-400 my-2">Hoje</div>
                            
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                    {msg.isButton ? (
                                        <a 
                                            href={msg.linkUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="bg-green-500 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:bg-green-600 transition-colors flex items-center gap-2 text-sm w-full justify-center transform hover:scale-105"
                                        >
                                            <i className="bi bi-whatsapp text-lg"></i>
                                            {msg.text}
                                        </a>
                                    ) : (
                                        <div 
                                            className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                                            ${msg.role === 'user' 
                                                ? 'bg-greatek-blue text-white rounded-br-none' 
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                            }`}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-3 bg-white border-t border-gray-100">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-greatek-blue/50 transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={leadStep === 'cnpj' ? "Digite apenas números..." : "Digite sua mensagem..."}
                                className="flex-grow bg-transparent text-sm focus:outline-none text-gray-700"
                                disabled={isTyping}
                                autoFocus
                            />
                            <button 
                                onClick={handleSendMessage}
                                disabled={!input.trim() || isTyping}
                                className="text-greatek-blue hover:text-greatek-dark-blue disabled:opacity-50 transition-colors"
                            >
                                <i className="bi bi-send-fill"></i>
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-[10px] text-gray-400">Powered by Greatek AI</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
