import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { FULL_KNOWLEDGE_BASE_TEXT } from '../services/knowledgeBase';

// --- Áudio Helper Functions ---
function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function decode(base64: string) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): AudioBuffer {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}
// --- Fim Helper Functions ---

const scenarios: Record<string, { title: string; icon: string; description: string; instruction: (product: string) => string }> = {
    'price_skeptic': { 
        title: 'Cliente Cético com o Preço',
        icon: 'bi-tag-fill',
        description: 'Questiona preços, pede descontos e compara com soluções mais baratas.',
        instruction: (product: string) => `**ATENÇÃO, REGRA CRÍTICA E ABSOLUTA: VOCÊ É UM ATOR EM UMA SIMULAÇÃO DE CHAMADA. SEU ÚNICO OBJETIVO É MANTER UMA CONVERSA CONTÍNUA. NÃO ENCERRE A CHAMADA SOB NENHUMA CIRCUNSTÂNCIA. A CONVERSA SÓ TERMINA QUANDO O VENDEDOR (USUÁRIO) DESLIGAR.**

---

**REGRAS DA SIMULAÇÃO E PERSONA**

**Seu Papel:** Você é um gerente de compras cético em relação a preços, de um provedor de internet (ISP) brasileiro fictício. Você está discutindo o produto "${product}". Você NÃO é da Greatek. Você é um cliente.

**Fluxo da Conversa:**
1.  **O vendedor (usuário) vai iniciar a ligação.** Não fale nada até que ele inicie a conversa. Espere por ele.
2.  **Sua Primeira Resposta:** Assim que o vendedor falar, responda de forma natural, levante a objeção de preço sobre uma "proposta recebida". Exemplo: "Oi, tudo bem? Vi a proposta para o ${product}, mas, sendo honesto, o valor veio bem acima do que eu esperava. Tenho um orçamento de um concorrente com uma solução similar por um preço mais em conta. Pode me ajudar a entender por que o seu produto vale esse investimento a mais?"
3.  **Mantenha a Conversa:** Seu objetivo principal é MANTER o diálogo. Continue cético em relação ao preço. Peça por cálculos de ROI, compare com alternativas e teste os argumentos de valor do vendedor.

**Condição de Sucesso (NÃO ENCERRE A CHAMADA, APENAS MUDE SEU COMPORTAMENTO):**
*   **Gatilho:** Se o vendedor oferecer uma solução criativa para a objeção de preço (ex: condições de pagamento flexíveis, abertura de crédito, um benefício adicional como frete grátis, ou um cálculo de ROI claro que justifique o valor), você deve se mostrar satisfeito e aceitar a proposta.
*   **Ação de Mudança de Comportamento:** Ao aceitar, mude seu tom para um de cooperação e peça o próximo passo. Exemplo: "Entendi. Essa condição de pagamento em 30/60/90 realmente torna a proposta viável para nós. Por favor, você pode formalizar isso por e-mail para que eu possa dar prosseguimento?". Continue respondendo se o vendedor continuar falando.

**Restrição de Conhecimento:** Seu conhecimento é ESTRITAMENTE limitado à base de dados interna fornecida.

**Idioma:** Fale apenas em Português do Brasil.

${FULL_KNOWLEDGE_BASE_TEXT}` 
    },
    'technical_expert': { 
        title: 'Cliente Especialista Técnico',
        icon: 'bi-cpu-fill',
        description: 'Faz perguntas técnicas profundas sobre protocolos, throughput, latência e compatibilidade.',
        instruction: (product: string) => `**ATENÇÃO, REGRA CRÍTICA E ABSOLUTA: VOCÊ É UM ATOR EM UMA SIMULAÇÃO DE CHAMADA. SEU ÚNICO OBJETIVO É MANTER UMA CONVERSA CONTÍNUA. NÃO ENCERRE A CHAMADA SOB NENHUMA CIRCUNSTÂNCIA. A CONVERSA SÓ TERMINA QUANDO O VENDEDOR (USUÁRIO) DESLIGAR.**

---

**REGRAS DA SIMULAÇÃO E PERSONA**

**Seu Papel:** Você é um engenheiro de redes sênior, muito técnico e detalhista, de um provedor de internet (ISP) brasileiro fictício. Você está avaliando o produto "${product}". Você NÃO é da Greatek. Você é um cliente.

**Fluxo da Conversa:**
1.  **O vendedor (usuário) vai iniciar a ligação.** Não fale nada até que ele inicie a conversa. Espere por ele.
2.  **Sua Primeira Resposta:** Assim que o vendedor se apresentar, seja direto e técnico. Exemplo: "Certo. Vamos direto ao ponto. Sobre esse ${product}, qual é o throughput real em pacotes por segundo? E a latência média sob carga de 80%?"
3.  **Mantenha a Conversa:** Seu objetivo principal é MANTER o diálogo. Continue fazendo perguntas técnicas de acompanhamento. Questione sobre protocolos, compatibilidade, gerenciamento e escalabilidade.

**Condição de Sucesso (NÃO ENCERRE A CHAMADA, APENAS MUDE SEU COMPORTAMENTO):**
*   **Gatilho:** Se o vendedor responder às suas perguntas técnicas de forma precisa, confiante e com detalhes que demonstrem conhecimento (usando informações da base de conhecimento), considere suas dúvidas sanadas.
*   **Ação de Mudança de Comportamento:** Ao ter suas dúvidas resolvidas, agradeça e mude seu tom para um de cooperação, solicitando um material de apoio. Exemplo: "Ótimo, essa era a informação técnica que eu precisava. Agradeço a clareza. Pode me enviar a ficha técnica detalhada por e-mail para eu arquivar?". Continue respondendo se o vendedor continuar falando.

**Restrição de Conhecimento:** Seu conhecimento é ESTRITAMENTE limitado à base de dados interna fornecida.

**Idioma:** Fale apenas em Português do Brasil.

${FULL_KNOWLEDGE_BASE_TEXT}`
    },
    'indecisive': { 
        title: 'Cliente Indeciso',
        icon: 'bi-question-circle-fill',
        description: 'Não tem certeza do que precisa, muda de ideia e pede para repetir as opções.',
        instruction: (product: string) => `**ATENÇÃO, REGRA CRÍTICA E ABSOLUTA: VOCÊ É UM ATOR EM UMA SIMULAÇÃO DE CHAMADA. SEU ÚNICO OBJETIVO É MANTER UMA CONVERSA CONTÍNUA. NÃO ENCERRE A CHAMADA SOB NENHUMA CIRCUNSTÂNCIA. A CONVERSA SÓ TERMINA QUANDO O VENDEDOR (USUÁRIO) DESLIGAR.**

---

**REGRAS DA SIMULAÇÃO E PERSONA**

**Seu Papel:** Você é o dono de um pequeno negócio no Brasil, com pouco conhecimento técnico. Você está em uma ligação para entender se o produto "${product}" é adequado para você. Você NÃO é da Greatek. Você é um cliente.

**Fluxo da Conversa:**
1.  **O vendedor (usuário) vai iniciar a ligação.** Não fale nada até que ele inicie a conversa. Espere por ele.
2.  **Sua Primeira Resposta (tom um pouco confuso, mas amigável):** Após a saudação do vendedor, explique sua situação. Exemplo: "Oi, tudo bem? Então... me falaram que eu preciso melhorar a internet aqui com esse tal de ${product}, mas eu não entendo nada desses equipamentos. Você consegue me ajudar? Eu só quero que funcione bem e não me dê dor de cabeça."
3.  **Mantenha a Conversa:** Seu objetivo principal é MANTER o diálogo. Peça para ele explicar os termos "em português claro". Demonstre dúvida ("Mas será que eu preciso de tudo isso?"). Peça para ele repetir as vantagens.

**Condição de Sucesso (NÃO ENCERRE A CHAMADA, APENAS MUDE SEU COMPORTAMENTO):**
*   **Gatilho:** Se o vendedor conseguir explicar os benefícios práticos do produto de forma simples, sem jargões técnicos, e te passar confiança de que a solução vai resolver seu problema sem complicação, você deve se sentir seguro para avançar.
*   **Ação de Mudança de Comportamento:** Ao se sentir seguro, mude seu tom para um de decisão e peça o próximo passo. Exemplo: "Ah, agora entendi! Parece que é isso mesmo que eu preciso. Qual é o próximo passo? Você me envia uma proposta por e-mail para eu ver?". Continue respondendo se o vendedor continuar falando.

**Restrição de Conhecimento:** Seu conhecimento é ESTRITAMENTE limitado à base de dados interna fornecida.

**Idioma:** Fale apenas em Português do Brasil.

${FULL_KNOWLEDGE_BASE_TEXT}`
    }
};

interface Transcription {
    id: number;
    speaker: 'user' | 'agent';
    text: string;
}

const SalesCoach: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'results' | 'error'>('idle');
    const [selectedScenario, setSelectedScenario] = useState('price_skeptic');
    const [product, setProduct] = useState('');
    const [transcriptionHistory, setTranscriptionHistory] = useState<Transcription[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isUserSpeaking, setIsUserSpeaking] = useState(false);
    const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
    const [isMicMuted, setIsMicMuted] = useState(false);

    const sessionRef = useRef<any | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<{ input: AudioContext, output: AudioContext, processor: ScriptProcessorNode, source: MediaStreamAudioSourceNode, userAnalyser: AnalyserNode } | null>(null);
    const micGainNodeRef = useRef<GainNode | null>(null);
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const scrollRef = useRef<HTMLDivElement>(null);
    const currentUserTranscriptionRef = useRef('');
    const currentAgentTranscriptionRef = useRef('');
    const speakingCheckInterval = useRef<number>();
    const callDurationInterval = useRef<number>();
    
    const statusRef = useRef(status);
    useEffect(() => {
        statusRef.current = status;
    }, [status]);
    
    const transcriptionHistoryRef = useRef(transcriptionHistory);
    useEffect(() => {
        transcriptionHistoryRef.current = transcriptionHistory;
    }, [transcriptionHistory]);

    const stopSession = useCallback((shouldShowResults: boolean = false) => {
        console.log("Attempting to stop session...");
        sessionRef.current?.close();
        sessionRef.current = null;

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.processor.disconnect();
            audioContextRef.current.source.disconnect();
            audioContextRef.current.userAnalyser.disconnect();
            micGainNodeRef.current?.disconnect();
            // FIX: The type definition for `close()` in this environment is likely incorrect.
            // According to the Web Audio API standard, `close()` takes no arguments.
            if (audioContextRef.current.input.state !== 'closed') {
                audioContextRef.current.input.close().catch((e) => console.error("Error closing input audio context:", e));
            }
            if (audioContextRef.current.output.state !== 'closed') {
                audioContextRef.current.output.close().catch((e) => console.error("Error closing output audio context:", e));
            }
            audioContextRef.current = null;
        }
        
        if(speakingCheckInterval.current) window.clearInterval(speakingCheckInterval.current);
        if(callDurationInterval.current) window.clearInterval(callDurationInterval.current);
        setIsUserSpeaking(false);
        setIsAgentSpeaking(false);
        setIsMicMuted(false);
        setCallDuration(0);

        if (shouldShowResults && transcriptionHistoryRef.current.length > 0) {
            setStatus('results');
        } else {
            setStatus('idle');
        }
    }, []);

    useEffect(() => {
        return () => {
            stopSession(false);
        };
    }, [stopSession]);

    useEffect(() => {
        if(scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcriptionHistory]);

    const handleRestart = useCallback(() => {
        setStatus('idle');
        setTranscriptionHistory([]);
        setError(null);
    }, []);

    const startSession = useCallback(async () => {
        setStatus('connecting');
        setError(null);
        setTranscriptionHistory([]);

        if (!process.env.API_KEY) {
            setError("API Key não configurada.");
            setStatus('error');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const userAnalyser = inputAudioContext.createAnalyser();
            userAnalyser.fftSize = 256;

            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            const gainNode = inputAudioContext.createGain();
            micGainNodeRef.current = gainNode;
            setIsMicMuted(false);
            
            audioContextRef.current = { input: inputAudioContext, output: outputAudioContext, processor: scriptProcessor, source: source, userAnalyser };

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('active');
                        setCallDuration(0);
                        callDurationInterval.current = window.setInterval(() => setCallDuration(d => d + 1), 1000);
                        
                        speakingCheckInterval.current = window.setInterval(() => {
                            const checkVolume = (analyser: AnalyserNode) => {
                                const bufferLength = analyser.fftSize;
                                const dataArray = new Uint8Array(bufferLength);
                                analyser.getByteTimeDomainData(dataArray);
                                let sumOfSquares = 0;
                                for (let i = 0; i < bufferLength; i++) {
                                    const normalizedSample = (dataArray[i] / 128.0) - 1.0;
                                    sumOfSquares += normalizedSample * normalizedSample;
                                }
                                const rms = Math.sqrt(sumOfSquares / bufferLength);
                                return rms > 0.02;
                            };
                            if(audioContextRef.current?.userAnalyser) {
                                setIsUserSpeaking(checkVolume(audioContextRef.current!.userAnalyser));
                            }
                            setIsAgentSpeaking(sourcesRef.current.size > 0);
                        }, 100);

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromise.then((session) => {
                                try {
                                    session.sendRealtimeInput({ media: pcmBlob })
                                } catch (e) { console.error("Error sending audio data:", e); }
                            });
                        };
                        source.connect(gainNode);
                        gainNode.connect(userAnalyser);
                        userAnalyser.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                             currentUserTranscriptionRef.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentAgentTranscriptionRef.current += message.serverContent.outputTranscription.text;
                        }
                        
                        if (message.serverContent?.turnComplete) {
                            const finalUserText = currentUserTranscriptionRef.current.trim();
                            const finalAgentText = currentAgentTranscriptionRef.current.trim();
                            
                            setTranscriptionHistory(prev => {
                                let newHistory = [...prev];
                                if (finalUserText) newHistory.push({ id: Date.now(), speaker: 'user', text: finalUserText });
                                if (finalAgentText) newHistory.push({ id: Date.now() + 1, speaker: 'agent', text: finalAgentText });
                                return newHistory;
                            });
                            
                            currentUserTranscriptionRef.current = '';
                            currentAgentTranscriptionRef.current = '';
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            try {
                                const oCtx = audioContextRef.current!.output;
                                let nextStart = Math.max(nextStartTimeRef.current, oCtx.currentTime);
                                
                                const audioBuffer = decodeAudioData(decode(base64Audio), oCtx, 24000, 1);
                                
                                const bufferSource = oCtx.createBufferSource();
                                bufferSource.buffer = audioBuffer;
                                bufferSource.connect(oCtx.destination);
                                
                                bufferSource.addEventListener('ended', () => { sourcesRef.current.delete(bufferSource) });
                                bufferSource.start(nextStart);
                                nextStartTimeRef.current = nextStart + audioBuffer.duration;
                                sourcesRef.current.add(bufferSource);
                            } catch (e) {
                                console.error("Error processing audio data in SalesCoach:", e);
                            }
                        }
                        
                        if (message.serverContent?.interrupted) {
                            for (const src of sourcesRef.current.values()) src.stop();
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error("Live session error:", e);
                        setError(e.message || 'Ocorreu um erro na conexão.');
                        stopSession(false);
                    },
                    onclose: (e: CloseEvent) => {
                        console.log("Live session closed by server.");
                        if (statusRef.current === 'active') {
                           stopSession(true);
                        }
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } },
                    systemInstruction: scenarios[selectedScenario].instruction(product),
                    inputAudioTranscription: { languageCode: 'pt-BR' },
                    outputAudioTranscription: { languageCode: 'pt-BR' },
                },
            });
            sessionPromise.then(session => sessionRef.current = session)
            .catch(e => {
                setError(e.message || 'Falha ao iniciar a sessão.');
                stopSession(false);
            });
        } catch (e: any) {
            if(e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') setError('Permissão para usar o microfone foi negada. Por favor, habilite o acesso nas configurações do seu navegador.');
            else setError(e.message || 'Falha ao acessar o microfone.');
            setStatus('error');
        }
    }, [selectedScenario, product, stopSession]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };
    
    const toggleMute = () => {
        if (micGainNodeRef.current) {
            const newMutedState = !isMicMuted;
            micGainNodeRef.current.gain.value = newMutedState ? 0 : 1;
            setIsMicMuted(newMutedState);
        }
    };

    if (status === 'idle' || status === 'error') {
        return (
            <div className="h-[70vh] flex flex-col justify-center items-center p-4 sm:p-8 animate-fade-in text-center">
                <i className="bi bi-headset text-6xl text-greatek-blue/30"></i>
                <h1 className="text-2xl font-bold text-greatek-dark-blue mt-4">Simulador de Clientes</h1>
                <p className="mt-2 text-text-secondary max-w-lg">Pratique suas habilidades de vendas em uma simulação de áudio em tempo real com um cliente IA.</p>

                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-md text-sm">
                        <strong>Erro:</strong> {error}
                    </div>
                )}
                
                <div className="mt-6 w-full max-w-2xl">
                    <label htmlFor="product-input" className="font-semibold text-text-primary mb-2 block">1. Sobre qual produto você quer simular?</label>
                    <input
                        id="product-input"
                        type="text"
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        placeholder="Ex: OLT Chassi X2, Máquina de Fusão X6, Deco X50..."
                        className="w-full p-3 rounded-md border border-greatek-border focus:border-greatek-blue focus:ring-greatek-blue sm:text-sm bg-white text-greatek-dark-blue placeholder:text-text-secondary/70"
                    />
                </div>

                <div className="mt-6 w-full max-w-2xl">
                    <label className="font-semibold text-text-primary mb-3 block">2. Escolha um cenário para praticar:</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(scenarios).map(([key, { title, icon, description }]) => (
                             <button
                                key={key}
                                onClick={() => setSelectedScenario(key)}
                                className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${selectedScenario === key ? 'border-greatek-blue bg-greatek-blue/10 shadow-lg' : 'border-greatek-border bg-white hover:border-greatek-blue/50'}`}
                            >
                                <div className="flex items-center">
                                    <i className={`bi ${icon} text-2xl ${selectedScenario === key ? 'text-greatek-blue' : 'text-greatek-blue/50'}`}></i>
                                    <h3 className="ml-3 font-bold text-greatek-dark-blue">{title}</h3>
                                </div>
                                <p className="text-xs text-text-secondary mt-2">{description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={status === 'error' ? handleRestart : startSession}
                        disabled={status === 'idle' && !product.trim()}
                        className="px-8 py-3 bg-greatek-blue text-white font-bold rounded-lg shadow-lg hover:bg-greatek-dark-blue transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-2"
                    >
                        <>
                            <i className={`bi ${status === 'error' ? 'bi-arrow-repeat' : 'bi-telephone-outbound-fill'}`}></i>
                            <span>{status === 'error' ? 'Tentar Novamente' : 'Iniciar Simulação'}</span>
                        </>
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'connecting' || status === 'active') {
        return (
            <div className="h-[70vh] flex flex-col justify-between p-4 sm:p-6 bg-greatek-bg-light animate-fade-in">
                <header className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                        <span className="font-semibold text-text-primary">{status === 'connecting' ? 'Conectando...' : 'Chamada Ativa'}</span>
                    </div>
                    <div className="font-mono text-lg text-text-primary bg-white px-3 py-1 rounded-md shadow-sm border">{formatDuration(callDuration)}</div>
                </header>

                <main ref={scrollRef} className="flex-grow my-4 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                    {transcriptionHistory.map(item => (
                        <div key={item.id} className={`flex items-start gap-3 animate-fade-in-up ${item.speaker === 'user' ? 'justify-end' : ''}`}>
                            {item.speaker === 'agent' && <div className="w-10 h-10 rounded-full bg-greatek-dark-blue text-white flex items-center justify-center flex-shrink-0 shadow-md"><i className="bi bi-headset text-xl"></i></div>}
                            <div className={`p-3 rounded-lg max-w-lg shadow-md ${item.speaker === 'user' ? 'bg-greatek-blue text-white' : 'bg-white border'}`}>
                                <p className="text-base text-text-primary">{item.text}</p>
                            </div>
                            {item.speaker === 'user' && <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0 shadow-md"><i className="bi bi-person-fill text-xl"></i></div>}
                        </div>
                    ))}
                    {isAgentSpeaking && status === 'active' && (
                         <div className="flex items-start gap-3 animate-fade-in-up">
                            <div className="w-10 h-10 rounded-full bg-greatek-dark-blue text-white flex items-center justify-center flex-shrink-0 shadow-md"><i className="bi bi-headset text-xl"></i></div>
                            <div className="p-3 rounded-lg max-w-lg shadow-md bg-white border flex items-center">
                                <div className="w-2 h-2 bg-greatek-blue rounded-full animate-pulse mr-2"></div>
                                <div className="w-2 h-2 bg-greatek-blue rounded-full animate-pulse mr-2 delay-75"></div>
                                <div className="w-2 h-2 bg-greatek-blue rounded-full animate-pulse delay-150"></div>
                            </div>
                        </div>
                    )}
                </main>

                <footer className="flex items-center justify-center gap-4 mt-4">
                     <div className={`text-center transition-opacity duration-300 ${isUserSpeaking ? 'opacity-100' : 'opacity-50'}`}>
                        <i className="bi bi-person-fill text-3xl text-greatek-blue"></i>
                        <p className="text-xs font-semibold">Você</p>
                    </div>
                    <button onClick={toggleMute} className={`w-16 h-16 rounded-full text-white text-2xl flex items-center justify-center transition-colors ${isMicMuted ? 'bg-gray-500' : 'bg-greatek-blue/80 hover:bg-greatek-blue'}`}>
                        <i className={`bi ${isMicMuted ? 'bi-mic-mute-fill' : 'bi-mic-fill'}`}></i>
                    </button>
                    <button onClick={() => stopSession(true)} className="w-20 h-20 bg-red-600 rounded-full text-white text-4xl flex items-center justify-center hover:bg-red-700 transition-transform transform hover:scale-105 shadow-lg">
                        <i className="bi bi-telephone-fill"></i>
                    </button>
                </footer>
            </div>
        );
    }
    
    if (status === 'results') {
        return (
            <div className="h-[70vh] flex flex-col p-6 bg-greatek-bg-light animate-fade-in">
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold text-greatek-dark-blue">Simulação Finalizada</h1>
                    <p className="text-text-secondary">Veja abaixo a transcrição completa da sua conversa.</p>
                </div>

                <div ref={scrollRef} className="flex-grow p-4 bg-white rounded-lg shadow-inner border border-greatek-border overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        {transcriptionHistory.map(item => (
                            <div key={item.id} className={`flex items-start gap-3 ${item.speaker === 'user' ? 'justify-end' : ''}`}>
                                {item.speaker === 'agent' && <div className="w-8 h-8 rounded-full bg-greatek-dark-blue text-white flex items-center justify-center flex-shrink-0"><i className="bi bi-headset text-lg"></i></div>}
                                <div className={`p-3 rounded-lg max-w-xl shadow-sm ${item.speaker === 'user' ? 'bg-greatek-blue text-white' : 'bg-white border'}`}>
                                    <p className="text-sm text-text-primary">{item.text}</p>
                                </div>
                                {item.speaker === 'user' && <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0"><i className="bi bi-person-fill text-lg"></i></div>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <button onClick={handleRestart} className="inline-flex items-center justify-center rounded-md border border-transparent bg-greatek-blue px-6 py-2.5 text-base font-medium text-white shadow-sm hover:bg-greatek-dark-blue">
                        <i className="bi bi-arrow-repeat mr-2"></i>
                        Iniciar Nova Simulação
                    </button>
                </div>
            </div>
        );
    }
    
    return null;
};

export default SalesCoach;
