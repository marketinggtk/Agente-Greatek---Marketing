import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const STEPS = [
    "Lendo o dossiê técnico",
    "Organizando argumentos comerciais",
    "Montando resposta consultiva"
];

export const ConsultantThinking: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => (prev + 1) % STEPS.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="max-w-[70%] bg-transparent flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 bg-greatek-blue/5 rounded-xl flex items-center justify-center text-greatek-blue">
                            <i className="bi bi-gear-fill animate-spin-slow text-xl"></i>
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold text-greatek-blue uppercase tracking-widest text-[10px] mb-1">
                            Consultor Greatek analisando...
                        </p>
                        <div className="h-4 overflow-hidden relative w-48">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={currentStep}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -10, opacity: 0 }}
                                    className="text-[10px] font-medium text-slate-400 uppercase tracking-tight absolute inset-0"
                                >
                                    {STEPS[currentStep]}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
