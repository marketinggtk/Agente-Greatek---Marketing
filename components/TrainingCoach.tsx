
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { getTrainingAnalysis } from '../services/geminiService';
import { TrainingAnalysisReport } from '../types';
import { FULL_KNOWLEDGE_BASE_TEXT } from '../services/knowledgeBase';
import { generateTrainingReportPdf } from '../services/pdfGenerator';

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

// FIX: Make decodeAudioData async and return a Promise<AudioBuffer> to align with modern Web Audio API practices and the library's examples. This prevents potential blocking and handles audio processing correctly.
async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
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
    'technical_doubts': { 
        title: 'Cliente com Dúvidas Técnicas',
        icon: 'bi-cpu-fill',
        description: 'Um cliente potencial com dúvidas sobre performance e compatibilidade do produto.',
        instruction: (product: string) => `**ATENÇÃO, REGRA CRÍTICA E ABSOLUTA: VOCÊ É UM ATOR EM UMA SIMULAÇÃO DE CHAMADA. SEU ÚNICO OBJETIVO É MANTER UMA CONVERSA CONTÍNUA. NÃO ENCERRE A CHAMADA SOB NENHUMA CIRCUNSTÂNCIA. A CONVERSA SÓ TERMINA QUANDO O VENDEDOR (USUÁRIO) DESLIGAR.**\n\n---\n\n**REGRAS DA SIMULAÇÃO E PERSONA**\n\n**Seu Papel:** Você é um engenheiro de redes sênior, muito técnico e detalhista, de um provedor de internet (ISP) brasileiro fictício. Você está avaliando o produto "${product}". Você NÃO é da Greatek. Você é um cliente.\n\n**Fluxo da Conversa:**\n1.  **O vendedor (usuário) vai iniciar a ligação.** Não fale nada até que ele inicie a conversa. Espere por ele.\n2.  **Sua Primeira Resposta:** Assim que o vendedor falar, seja direto e técnico. Exemplo da sua primeira fala: "Certo, vamos direto ao ponto. Sobre esse ${product}, qual é o throughput real em pacotes por segundo? E qual a latência média sob carga de 80%? Preciso de dados concretos."\n3.  **Mantenha a Conversa:** Seu objetivo principal é MANTER o diálogo. Continue fazendo perguntas técnicas de acompanhamento. Questione sobre protocolos, compatibilidade, gerenciamento e escalabilidade. Seu trabalho é testar o conhecimento do vendedor.\n\n**Restrição de Conhecimento:** Seu conhecimento é ESTRITAMENTE limitado à base de dados interna fornecida.\n\n**Idioma:** Fale apenas em Português do Brasil.\n\n${FULL_KNOWLEDGE_BASE_TEXT}` 
    },
    'price_objection': { 
        title: 'Cliente com Objeção de Preço',
        icon: 'bi-tag-fill',
        description: 'Um cliente que acha a solução cara e precisa ser convencido do valor agregado.',
        instruction: (product: string) => `**ATENÇÃO, REGRA CRÍTICA E ABSOLUTA: VOCÊ É UM ATOR EM UMA SIMULAÇÃO DE CHAMADA. SEU ÚNICO OBJETIVO É MANTER UMA CONVERSA CONTÍNUA. NÃO ENCERRE A CHAMADA SOB NENHUMA CIRCUNSTÂNCIA. A CONVERSA SÓ TERMINA QUANDO O VENDEDOR (USUÁRIO) DESLIGAR.**\n\n---\n\n**REGRAS DA SIMULAÇÃO E PERSONA**\n        \n**Seu Papel:** Você é um gerente de compras focado em custos, de um provedor de internet brasileiro. Você está discutindo o produto "${product}" com um vendedor (o usuário). Você NÃO é da Greatek. Você é um cliente.\n\n**Fluxo da Conversa:**\n1.  **O vendedor (usuário) vai iniciar a ligação.** Não fale nada até que ele inicie a conversa. Espere por ele.\n2.  **Sua Primeira Resposta:** Assim que o vendedor falar, levante imediatamente sua objeção sobre o preço. Exemplo da sua primeira fala: "Olá. Recebi sua proposta para o ${product}, mas para ser sincero, o preço está bem acima do que eu esperava. Por que ele é tão mais caro que as outras opções no mercado?".\n3.  **Mantenha a Conversa:** Seu objetivo principal é MANTER o diálogo. Continue cético em relação ao preço. Peça por cálculos de ROI, compare com alternativas e teste os argumentos de valor do vendedor.\n\n**Restrição de Conhecimento:** Seu conhecimento é ESTRITAMENTE limitado à base de dados interna fornecida.\n\n**Idioma:** Fale apenas em Português do Brasil.\n\n${FULL_KNOWLEDGE_BASE_TEXT}`
    },
    'simple_doubts': {
        title: 'Cliente Iniciante',
        icon: 'bi-info-circle-fill',
        description: 'Um cliente com pouco conhecimento técnico, fazendo perguntas básicas sobre o produto.',
        instruction: (product: string) => `**ATENÇÃO, REGRA CRÍTICA E ABSOLUTA: VOCÊ É UM ATOR EM UMA SIMULAÇÃO DE CHAMADA. SEU ÚNICO OBJETIVO É MANTER UMA CONVERSA CONTÍNUA. NÃO ENCERRE A CHAMADA SOB NENHUMA CIRCUNSTÂNCIA. A CONVERSA SÓ TERMINA QUANDO O VENDEDOR (USUÁRIO) DESLIGAR.**\n\n---\n\n**REGRAS DA SIMULAÇÃO E PERSONA**\n\n**Seu Papel:** Você é o dono de um pequeno negócio no Brasil, com pouco conhecimento técnico. Você está em uma ligação para entender se o produto "${product}" é adequado para você. Você NÃO é da Greatek. Você é um cliente.\n\n**Fluxo da Conversa:**\n1.  **O vendedor (usuário) vai iniciar a ligação.** Não fale nada até que ele inicie a conversa. Espere por ele.\n2.  **Sua Primeira Resposta:** Assim que o vendedor falar, peça ajuda de forma simples. Exemplo da sua primeira fala: "Oi, obrigado por ligar. Eu não entendo muito de tecnologia, você pode me explicar de forma simples para que serve esse ${product} e como ele pode me ajudar?".\n3.  **Mantenha a Conversa:** Seu objetivo principal é MANTER o diálogo. Faça perguntas básicas. Peça para o vendedor explicar termos técnicos de forma simples. Foque nos benefícios práticos.\n\n**Restrição de Conhecimento:** Seu conhecimento é ESTRITAMENTE limitado à base de dados interna fornecida.\n\n**Idioma:** Fale apenas em Português do Brasil.\n\n${FULL_KNOWLEDGE_BASE_TEXT}`
    }
};

interface Transcription {
    id: number;
    speaker: 'user' | 'agent';
    text: string;
}

const TrainingCoach: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'analyzing' | 'results' | 'error'>('idle');
    const [selectedScenario, setSelectedScenario] = useState('technical_doubts');
    const [product, setProduct] = useState('');
    const [transcriptionHistory, setTranscriptionHistory] = useState<Transcription[]>([]);
    const [analysisResult, setAnalysisResult] = useState<TrainingAnalysisReport | null>(null);
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

    useEffect(() => {
        if(scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcriptionHistory]);

    const handleAnalysis = useCallback(async () => {
        setStatus('analyzing');
        const transcriptText = transcriptionHistoryRef.current.map(t => `${t.speaker === 'user' ? 'Vendedor' : 'Cliente'}: ${t.text}`).join('\n\n');
        
        if (!transcriptText.trim()) {
            setError("Nenhuma conversa foi gravada para análise.");
            setStatus('error');
            return;
        }

        try {
            const result = await getTrainingAnalysis(transcriptText);
            setAnalysisResult(result);
            setStatus('results');
        } catch (e: any) {
            console.error("Analysis failed:", e);
            setError(e.message || "Ocorreu um erro ao analisar sua performance.");
            setStatus('error');
        }
    }, []);
    
    const stopSession = useCallback((shouldAnalyze: boolean = false) => {
        console.log("Attempting to stop session...");
        sessionRef.current?.close();
        sessionRef.current = null;

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (audioContextRef.current) {
            // FIX: The `disconnect` method on AudioNode should be called without arguments to disconnect all outputs. The error "Expected 1 arguments, but got 0" is misleading; the issue is passing `0` as an argument.
            audioContextRef.current.processor.disconnect();
            audioContextRef.current.source.disconnect();
            audioContextRef.current.userAnalyser.disconnect();
            micGainNodeRef.current?.disconnect();
            if (audioContextRef.current.input.state !== 'closed') {
                audioContextRef.current.input.close();
            }
            if (audioContextRef.current.output.state !== 'closed') {
                audioContextRef.current.output.close();
            }
            audioContextRef.current = null;
        }
        
        if(speakingCheckInterval.current) window.clearInterval(speakingCheckInterval.current);
        if(callDurationInterval.current) window.clearInterval(callDurationInterval.current);
        setIsUserSpeaking(false);
        setIsAgentSpeaking(false);
        setIsMicMuted(false);
        setCallDuration(0);

        if (shouldAnalyze) {
            handleAnalysis();
        } else {
            setStatus('idle');
        }
    }, [handleAnalysis]);

    useEffect(() => {
        return () => {
            if (sessionRef.current) {
                stopSession(false);
            }
        };
    }, [stopSession]);

    const startSession = useCallback(async () => {
        setStatus('connecting');
        setError(null);
        setTranscriptionHistory([]);
        setAnalysisResult(null);

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
                            if (audioContextRef.current?.userAnalyser) {
                                setIsUserSpeaking(checkVolume(audioContextRef.current.userAnalyser));
                            }
                            setIsAgentSpeaking(sourcesRef.current.size > 0);
                        }, 100);

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromise.then((session) => {
                                try {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                } catch (e) { console.error("Error sending audio data:", e); }
                            });
                        };
                        source.connect(gainNode);
                        gainNode.connect(userAnalyser);
                        userAnalyser.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    // FIX: The onmessage callback must be async to correctly handle the awaited audio decoding.
                    onmessage: async (message: LiveServerMessage) => {
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
                                if (finalAgentText) newHistory.push({ id: Date.now(), speaker: 'agent', text: finalAgentText });
                                if (finalUserText) newHistory.push({ id: Date.now() + 1, speaker: 'user', text: finalUserText });
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
                                // FIX: Awaiting the decodeAudioData function is necessary as it now returns a Promise.
                                const audioBuffer = await decodeAudioData(decode(base64Audio), oCtx, 24000, 1);
                                const bufferSource = oCtx.createBufferSource();
                                bufferSource.buffer = audioBuffer;
                                bufferSource.connect(oCtx.destination);
                                bufferSource.addEventListener('ended', () => {
                                    sourcesRef.current.delete(bufferSource)
                                });
                                bufferSource.start(nextStart);
                                nextStartTimeRef.current = nextStart + audioBuffer.duration;
                                sourcesRef.current.add(bufferSource);
                            } catch (e) {
                                console.error("Error processing audio data:", e);
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
                        setError('Ocorreu um erro na conexão com o agente. Verifique sua rede e tente novamente.');
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
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
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

    const handleRestart = () => {
        setStatus('idle');
        setAnalysisResult(null);
        setTranscriptionHistory([]);
        setError(null);
    };

    const handleExportReport = () => {
        if (analysisResult) {
            generateTrainingReportPdf(analysisResult, product);
        }
    };

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
                <i className="bi bi-clipboard-data-fill text-6xl text-greatek-blue/30"></i>
                <h1 className="text-2xl font-bold text-greatek-dark-blue mt-4">Coach de Treinamento</h1>
                <p className="mt-2 text-text-secondary max-w-lg">Simule uma conversa com um cliente, treine suas respostas e receba uma avaliação detalhada da sua performance.</p>

                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-md text-sm">
                        <strong>Erro:</strong> {error}
                    </div>
                )}
                
                <div className="mt-6 w-full max-w-2xl">
                    <label htmlFor="product-input" className="font-semibold text-text-primary mb-2 block">1. Sobre qual produto você quer treinar?</label>
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
                    <label className="font-semibold text-text-primary mb-3 block">2. Escolha um cenário de treinamento:</label>
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
                        disabled={(status === 'idle' && !product.trim())}
                        className="px-8 py-3 bg-greatek-blue text-white font-bold rounded-lg shadow-lg hover:bg-greatek-dark-blue transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-2"
                    >
                        
                        <>
                            <i className={`bi ${status === 'error' ? 'bi-arrow-repeat' : 'bi-telephone-outbound-fill'}`}></i>
                            <span>{status === 'error' ? 'Tentar Novamente' : 'Iniciar Treinamento'}</span>
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
                    {isAgentSpeaking && (
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
                        <i className="bi bi-stop-circle-fill"></i>
                    </button>
                </footer>
            </div>
        );
    }

    if (status === 'analyzing') {
         return (
            <div className="h-[70vh] flex flex-col justify-center items-center p-8 text-center animate-fade-in">
                <div className="w-12 h-12 border-4 border-greatek-blue/20 border-t-greatek-blue rounded-full animate-spin"></div>
                <p className="mt-4 text-base font-medium text-text-secondary">Avaliando sua performance...</p>
                <p className="mt-1 text-sm text-text-secondary/80">O Coach está analisando os argumentos e a condução da conversa.</p>
            </div>
        );
    }

    if (status === 'results' && analysisResult) {
        const scoreColor = analysisResult.score >= 8 ? 'text-green-600' : analysisResult.score >= 5 ? 'text-yellow-600' : 'text-red-600';
        return (
            <div className="h-[70vh] overflow-y-auto custom-scrollbar p-6 bg-greatek-bg-light animate-fade-in">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-greatek-dark-blue">Relatório de Performance</h1>
                        <p className="text-text-secondary">Análise da sua simulação como vendedor.</p>
                    </div>

                     <div className="mt-6">
                        <h2 className="text-xl font-bold text-greatek-dark-blue mb-2">Transcrição da Conversa</h2>
                         <div ref={scrollRef} className="p-4 bg-white rounded-lg shadow-inner border border-greatek-border overflow-y-auto max-h-48 custom-scrollbar">
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
                    </div>

                    <div className="mt-6 p-6 bg-white rounded-lg shadow-lg border border-greatek-border flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-shrink-0">
                            <div className={`w-32 h-32 rounded-full border-8 ${scoreColor.replace('text-', 'border-')} flex items-center justify-center`}>
                                <span className={`text-5xl font-bold ${scoreColor}`}>{analysisResult.score.toFixed(0)}</span>
                            </div>
                            <div className="text-center font-semibold text-text-secondary mt-2">Nota Final</div>
                        </div>
                        <div className="flex-grow text-center md:text-left">
                            <h2 className="font-bold text-lg text-greatek-dark-blue">Resumo do Coach</h2>
                            <p className="text-sm text-text-secondary mt-1">{analysisResult.summary}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="p-4 bg-white rounded-lg border border-greatek-border">
                            <h3 className="font-semibold text-green-700 flex items-center"><i className="bi bi-check-circle-fill mr-2"></i>Pontos Fortes</h3>
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-text-secondary">
                                {analysisResult.strengths.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                        <div className="p-4 bg-white rounded-lg border border-greatek-border">
                            <h3 className="font-semibold text-yellow-700 flex items-center"><i className="bi bi-exclamation-triangle-fill mr-2"></i>Pontos a Melhorar</h3>
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-text-secondary">
                                {analysisResult.areas_for_improvement.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h2 className="text-xl font-bold text-greatek-dark-blue mb-3">Sugestões Estratégicas</h2>
                        <div className="space-y-4">
                            {analysisResult.suggested_arguments.map((arg, i) => (
                                <div key={i} className="p-4 bg-greatek-blue/10 rounded-lg border-l-4 border-greatek-blue">
                                    <h4 className="font-semibold text-greatek-dark-blue">{arg.title}</h4>
                                    <p className="text-sm text-text-secondary mt-1">{arg.explanation}</p>
                                </div>
                            ))}
                            {analysisResult.objection_handling.map((obj, i) => (
                                <div key={i} className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                                    <h4 className="font-semibold text-red-800">Como Contornar: "{obj.objection}"</h4>
                                    <p className="text-sm text-text-secondary mt-1">{obj.suggestion}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                         <button onClick={handleRestart} className="w-full sm:w-auto px-6 py-2 bg-white text-greatek-dark-blue border border-greatek-border font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                            Fazer Novo Treinamento
                        </button>
                         <button
                            onClick={handleExportReport}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-greatek-blue text-white font-semibold rounded-lg hover:bg-greatek-dark-blue transition-colors"
                        >
                            <i className="bi bi-file-earmark-pdf-fill"></i>
                            Exportar Relatório
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    return null;
};

export default TrainingCoach;
