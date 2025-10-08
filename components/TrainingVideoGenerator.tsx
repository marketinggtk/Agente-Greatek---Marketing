import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { generateTrainingScriptAndPrompts, generateVideo } from '../services/geminiService';
import { TrainingVideoPackage, TrainingScriptSection } from '../types';

type Status = 'idle' | 'scripting' | 'generating_clips' | 'composing' | 'done' | 'error';
type ProgressStep = 'scripting' | 'clips' | 'audio' | 'composing';

const TrainingVideoGenerator: React.FC = () => {
    const [productName, setProductName] = useState<string>('');
    const [status, setStatus] = useState<Status>('idle');
    const [progress, setProgress] = useState({ current: 0, total: 0, text: '', step: 'scripting' as ProgressStep });
    const [error, setError] = useState<string | null>(null);
    const [videoPackage, setVideoPackage] = useState<TrainingVideoPackage | null>(null);
    const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    // FIX: Specify the type of the Set to number to avoid type errors during iteration.
    const spokenIndices = useRef(new Set<number>());
    const clipStartTimes = useRef<number[]>([]);
    const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

    // Find and store the best pt-BR voice on component mount
    useEffect(() => {
        const getBestVoice = () => {
            const voices = speechSynthesis.getVoices();
            const ptBRVoices = voices.filter(v => v.lang === 'pt-BR');
            // Prioritize Google voices as they are often higher quality
            const googleVoice = ptBRVoices.find(v => v.name.includes('Google'));
            voiceRef.current = googleVoice || ptBRVoices[0] || null;
        };
        
        getBestVoice();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = getBestVoice;
        }
    }, []);

    const speak = useCallback((text: string, onEnd: () => void): number => {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        if (voiceRef.current) {
            utterance.voice = voiceRef.current;
        }
        utterance.onend = onEnd;
        speechSynthesis.speak(utterance);

        // Estimate duration, as the API doesn't provide it reliably
        const wordsPerSecond = 2;
        const estimatedDuration = (text.split(/\s+/).length / wordsPerSecond) * 1000;
        return estimatedDuration;
    }, []);

    const composeVideo = useCallback(async (pkg: TrainingVideoPackage) => {
        setStatus('composing');
        setProgress({ current: 0, total: pkg.script.length, text: 'Calculando durações da narração...', step: 'audio' });

        const durations = await Promise.all(
            pkg.script.map(section => 
                new Promise<number>(resolve => {
                    const utterance = new SpeechSynthesisUtterance(section.section_text);
                    // FIX: The `onend` event handler receives a SpeechSynthesisEvent, which has the `elapsedTime` property.
                    utterance.onend = (event) => resolve(event.elapsedTime > 0 ? event.elapsedTime : (section.section_text.length / 10) * 1000); // fallback estimation
                     // A trick to get duration without playing
                    utterance.volume = 0;
                    utterance.rate = 10; // Speak fast to get duration quickly
                    speak(utterance.text, () => {});
                    // This is not perfect, so we'll use a more robust estimation.
                    const estimatedDuration = Math.max(2, (section.section_text.length / 12)) * 1000; // ~12 chars/sec, min 2s
                    setTimeout(() => resolve(estimatedDuration), 10);
                })
            )
        );

        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setError('Não foi possível criar o contexto do canvas.');
            setStatus('error');
            return;
        }

        const videoElements = pkg.script.map(section => {
            const video = document.createElement('video');
            video.src = section.video_blob_url!;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            return video;
        });

        await Promise.all(videoElements.map(v => new Promise<void>(resolve => {
            v.oncanplaythrough = () => v.play().then(resolve).catch(() => resolve());
            v.load();
        })));
        
        const totalDuration = durations.reduce((acc, d) => acc + d/1000, 0);
        clipStartTimes.current = [0];
        for (let i = 0; i < durations.length - 1; i++) {
            clipStartTimes.current.push(clipStartTimes.current[i] + durations[i] / 1000);
        }

        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            setFinalVideoUrl(URL.createObjectURL(blob));
            setStatus('done');
        };
        recorder.start();

        let startTime = -1;
        const drawFrame = (time: number) => {
            if (startTime === -1) startTime = time;
            const elapsedTime = (time - startTime) / 1000;

            if (elapsedTime >= totalDuration) {
                recorder.stop();
                return;
            }
            
            setProgress({ current: Math.floor(elapsedTime), total: Math.ceil(totalDuration), text: 'Renderizando vídeo final...', step: 'composing' });

            const clipIndex = clipStartTimes.current.findIndex((st, i) => elapsedTime >= st && (i + 1 === clipStartTimes.current.length || elapsedTime < clipStartTimes.current[i + 1]));
            if (clipIndex === -1) { requestAnimationFrame(drawFrame); return; }

            const currentVideo = videoElements[clipIndex];
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(currentVideo, 0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, canvas.height - 150, canvas.width, 150);
            
            ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = 'white';
            ctx.fillText(pkg.product_name, 40, canvas.height - 100);
            
            ctx.font = '26px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            const text = pkg.script[clipIndex].section_text;
            const words = text.split(' ');
            let line = '';
            let y = canvas.height - 60;
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                if (ctx.measureText(testLine).width > canvas.width - 80 && n > 0) {
                    ctx.fillText(line, 40, y);
                    line = words[n] + ' ';
                    y += 35; 
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, 40, y);

            requestAnimationFrame(drawFrame);
        };
        requestAnimationFrame(drawFrame);
    }, [speak]);

    const handleGenerate = async () => {
        if (!productName) return;
        setStatus('scripting');
        setError(null);
        setFinalVideoUrl(null);
        setVideoPackage(null);
        setProgress({ current: 0, total: 4, text: 'Gerando roteiro do vídeo...', step: 'scripting' });

        try {
            const scriptPkg = await generateTrainingScriptAndPrompts(productName, '');
            setVideoPackage(scriptPkg);
            setStatus('generating_clips');
            setProgress({ ...progress, step: 'clips', text: 'Gerando clipes visuais...' });

            const generatedClipsPromises = scriptPkg.script.map((section, i) => {
                setProgress({ current: i + 1, total: scriptPkg.script.length, text: `Gerando clipe para: "${section.section_title}"...`, step: 'clips' });
                return generateVideo(section.visual_prompt).then(videoBlob => ({ ...section, video_blob_url: URL.createObjectURL(videoBlob) }));
            });

            const generatedClips = await Promise.all(generatedClipsPromises);
            
            const finalPkg = { ...scriptPkg, script: generatedClips };
            setVideoPackage(finalPkg);
            await composeVideo(finalPkg);

        } catch (e: any) {
            console.error("Video generation failed:", e);
            let friendlyMessage = "Ocorreu um erro desconhecido durante a geração do vídeo.";
            
            if (e && typeof e.message === 'string') {
                const message = e.message;
                // Check for common quota error messages directly in the string
                if (message.includes('429') || message.toLowerCase().includes('quota') || message.toLowerCase().includes('resource_exhausted')) {
                    friendlyMessage = "A cota de uso da API foi atingida. Por favor, verifique seu plano de faturamento ou tente novamente mais tarde.";
                } else {
                    // Try to extract a more specific reason from potential JSON inside the error.
                    const jsonMatch = message.match(/{[\s\S]*}/);
                    if (jsonMatch && jsonMatch[0]) {
                        try {
                            const errorObj = JSON.parse(jsonMatch[0]);
                            if (errorObj.error && errorObj.error.message) {
                                friendlyMessage = `Falha na API: ${errorObj.error.message}`;
                            } else {
                                friendlyMessage = message; // Fallback to the original message if JSON is weird
                            }
                        } catch (parseError) {
                             friendlyMessage = message; // Fallback if parsing fails
                        }
                    } else {
                        friendlyMessage = message; // Fallback if no JSON found
                    }
                }
            }
            
            setError(friendlyMessage);
            setStatus('error');
        }
    };

    const handlePlay = () => {
        speechSynthesis.cancel();
        spokenIndices.current.clear();
    };

    const handleSeeked = () => {
        speechSynthesis.cancel();
        spokenIndices.current.clear();
    };

    const handleTimeUpdate = useCallback(() => {
        if (!videoRef.current || !videoPackage) return;
        const currentTime = videoRef.current.currentTime;
        
        const clipIndex = clipStartTimes.current.findIndex((st, i) => 
            currentTime >= st && (i + 1 === clipStartTimes.current.length || currentTime < clipStartTimes.current[i + 1])
        );

        if (clipIndex > -1 && !spokenIndices.current.has(clipIndex)) {
            // Clear any previously spoken indices that are now in the future
            spokenIndices.current.forEach(idx => {
                if (idx > clipIndex) {
                    spokenIndices.current.delete(idx);
                }
            });

            speak(videoPackage.script[clipIndex].section_text, () => {});
            spokenIndices.current.add(clipIndex);
        }
    }, [videoPackage, speak]);

    const handleRestart = () => {
        setStatus('idle');
        setFinalVideoUrl(null);
        setVideoPackage(null);
        setProductName('');
        clipStartTimes.current = [];
        spokenIndices.current.clear();
        speechSynthesis.cancel();
    }

    const isLoading = ['scripting', 'generating_clips', 'composing', 'audio'].includes(status);
    
    if (isLoading) {
        const steps = [
            { id: 'scripting', name: 'Roteiro' },
            { id: 'clips', name: 'Clipes Visuais' },
            { id: 'audio', name: 'Narração' },
            { id: 'composing', name: 'Composição' }
        ];
        const currentStepIndex = steps.findIndex(s => s.id === progress.step);

        return (
            <div className="p-6 animate-fade-in">
                <h1 className="text-xl font-bold text-greatek-dark-blue text-center mb-6">Criando seu vídeo de treinamento...</h1>
                <nav aria-label="Progress">
                    <ol role="list" className="flex items-center">
                        {steps.map((step, stepIdx) => (
                            <li key={step.name} className={`relative flex-1 ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                                {stepIdx < currentStepIndex ? (
                                    <>
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="h-0.5 w-full bg-greatek-blue"></div>
                                        </div>
                                        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-greatek-blue">
                                            <i className="bi bi-check-lg text-white font-bold"></i>
                                        </span>
                                    </>
                                ) : stepIdx === currentStepIndex ? (
                                    <>
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="h-0.5 w-full bg-gray-200"></div>
                                        </div>
                                        <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-greatek-blue bg-white">
                                            <span className="h-2.5 w-2.5 rounded-full bg-greatek-blue animate-ping"></span>
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="h-0.5 w-full bg-gray-200"></div>
                                        </div>
                                        <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white"></span>
                                    </>
                                )}
                                <span className="absolute -bottom-6 w-max text-center text-xs font-semibold text-greatek-dark-blue">{step.name}</span>
                            </li>
                        ))}
                    </ol>
                </nav>
                <div className="text-center mt-12">
                    <p className="font-semibold text-greatek-dark-blue">{progress.text}</p>
                    {status === 'generating_clips' && <p className="text-sm text-text-secondary">Clipe {progress.current} de {progress.total}. Este processo pode levar alguns minutos...</p>}
                    {status === 'composing' && <p className="text-sm text-text-secondary">{progress.current}s / {progress.total}s</p>}
                </div>
                {videoPackage && (
                     <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {videoPackage.script.map((section, index) => (
                            <div key={index} className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm border border-gray-300">
                                {section.video_blob_url ? (
                                    <video src={section.video_blob_url} autoPlay loop muted className="w-full h-full object-cover" />
                                ) : (
                                    progress.step === 'clips' && progress.current === index + 1 ? (
                                        <div className="w-6 h-6 border-4 border-greatek-blue/20 border-t-greatek-blue rounded-full animate-spin"></div>
                                    ) : (
                                        <i className="bi bi-camera-reels text-3xl text-gray-400"></i>
                                    )
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-white text-[10px] text-center truncate font-semibold">{section.section_title}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    
    if (finalVideoUrl) {
         return (
            <div className="text-center animate-fade-in p-4">
                <h2 className="text-xl font-bold text-greatek-dark-blue">Seu vídeo de treinamento está pronto!</h2>
                <div className="relative max-w-3xl mx-auto mt-4">
                    <video 
                        ref={videoRef} 
                        src={finalVideoUrl} 
                        controls 
                        className="w-full rounded-lg shadow-2xl border-2 border-greatek-blue" 
                        onPlay={handlePlay}
                        onPause={() => speechSynthesis.cancel()}
                        onSeeked={handleSeeked}
                        onTimeUpdate={handleTimeUpdate}
                    />
                </div>
                <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 text-xs rounded-r-lg max-w-3xl mx-auto text-left">
                    <i className="bi bi-info-circle-fill mr-2"></i>
                    <strong>Atenção:</strong> A narração por voz é reproduzida em tempo real e **não** estará incluída no arquivo de vídeo baixado.
                </div>
                <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <a 
                        href={finalVideoUrl} 
                        download={`treinamento_${videoPackage?.product_name.replace(/[^a-z0-9]/gi, '_')}.webm`}
                        className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-greatek-blue px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-greatek-dark-blue"
                    >
                       <i className="bi bi-download mr-2"></i> Baixar Vídeo (sem áudio)
                    </a>
                    <button
                        onClick={handleRestart}
                        className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-greatek-border bg-white px-5 py-2.5 text-sm font-medium text-greatek-dark-blue shadow-sm hover:bg-greatek-bg-light"
                    >
                        <i className="bi bi-plus-circle mr-2"></i> Criar Novo Vídeo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="w-full max-w-2xl">
                <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                    <i className="bi bi-film text-6xl text-greatek-blue/20"></i>
                    <h1 className="text-2xl font-bold text-greatek-dark-blue mt-4">Gerador de Vídeo de Treinamento</h1>
                    <p className="mt-2 text-text-secondary max-w-2xl mx-auto">
                        A IA criará um roteiro, gerará clipes visuais e adicionará uma narração para criar um vídeo de treinamento completo sobre o produto que você escolher.
                    </p>
                    <div className="mt-6">
                        <input
                            id="product-input"
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="Digite o nome do produto aqui..."
                            className="w-full p-4 rounded-lg border-2 border-gray-300 text-center text-lg focus:border-greatek-blue focus:ring-greatek-blue transition"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={!productName.trim()}
                            className="mt-4 w-full inline-flex items-center justify-center rounded-md border border-transparent bg-greatek-blue px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-greatek-dark-blue focus:outline-none focus:ring-2 focus:ring-greatek-blue focus:ring-offset-2 disabled:bg-gray-400 transition-transform transform hover:scale-105"
                        >
                            <i className="bi bi-film mr-2"></i>
                            Gerar Vídeo
                        </button>
                    </div>
                </div>

                {status === 'error' && (
                    <div className="mt-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-md text-center max-w-xl">
                        <p className="font-semibold">Ocorreu um erro:</p>
                        <p className="text-sm">{error}</p>
                        <button onClick={handleRestart} className="mt-3 text-sm font-semibold text-greatek-dark-blue hover:underline">Tentar Novamente</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainingVideoGenerator;
