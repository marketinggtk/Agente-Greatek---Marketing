import React, { useState } from 'react';
import Modal from './ui/Modal';
import SalesCoach from './SalesCoach';
import TrainingCoach from './TrainingCoach';
import { useAppStore } from '../store/useAppStore';
import { AppMode } from '../types';

const ControlPanel: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const { createNewConversation } = useAppStore();
    const [isSalesCoachOpen, setIsSalesCoachOpen] = useState(false);
    const [isTrainingCoachOpen, setIsTrainingCoachOpen] = useState(false);

    const handleOpenDossierGenerator = () => {
        createNewConversation(AppMode.CUSTOMER_DOSSIER);
        onClose();
    };

    return (
        <>
            <Modal isOpen={true} onClose={onClose} title="Painel de Controle">
                <div className="space-y-6">
                    <div>
                        <h4 className="text-lg font-semibold text-greatek-dark-blue">Recursos em Teste</h4>
                        <p className="text-sm text-text-secondary mt-1">
                            Experimente novas funcionalidades que estão em desenvolvimento.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => setIsSalesCoachOpen(true)}
                            className="group p-4 border border-greatek-border rounded-lg text-left hover:bg-greatek-bg-light hover:border-greatek-blue transition-all"
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-lg bg-greatek-blue/10 flex items-center justify-center">
                                    <i className="bi bi-headset text-xl text-greatek-blue"></i>
                                </div>
                                <h5 className="ml-3 font-bold text-greatek-dark-blue">Simulador de Clientes</h5>
                            </div>
                            <p className="text-xs text-text-secondary mt-2">
                                Pratique suas habilidades de vendas em uma simulação de áudio em tempo real com um cliente IA.
                            </p>
                        </button>

                        <button
                            onClick={() => setIsTrainingCoachOpen(true)}
                            className="group p-4 border border-greatek-border rounded-lg text-left hover:bg-greatek-bg-light hover:border-greatek-blue transition-all"
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-lg bg-greatek-blue/10 flex items-center justify-center">
                                    <i className="bi bi-clipboard-data-fill text-xl text-greatek-blue"></i>
                                </div>
                                <h5 className="ml-3 font-bold text-greatek-dark-blue">Coach de Treinamento</h5>
                            </div>
                            <p className="text-xs text-text-secondary mt-2">
                                Treine suas respostas a um cliente e receba uma avaliação detalhada da sua performance.
                            </p>
                        </button>

                        <button
                            onClick={handleOpenDossierGenerator}
                            className="group p-4 border border-greatek-border rounded-lg text-left hover:bg-greatek-bg-light hover:border-greatek-blue transition-all"
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-lg bg-greatek-blue/10 flex items-center justify-center">
                                    <i className="bi bi-person-vcard-fill text-xl text-greatek-blue"></i>
                                </div>
                                <h5 className="ml-3 font-bold text-greatek-dark-blue">Gerador de Dossiê</h5>
                            </div>
                            <p className="text-xs text-text-secondary mt-2">
                                Pesquise uma empresa e crie um dossiê com notícias, insights e ganchos de conversa.
                            </p>
                        </button>
                        
                    </div>
                </div>
            </Modal>
            
            {isSalesCoachOpen && (
                <Modal 
                    isOpen={isSalesCoachOpen}
                    onClose={() => setIsSalesCoachOpen(false)}
                    title="Coach de Vendas - Simulador de Clientes"
                    size="large"
                >
                    <SalesCoach />
                </Modal>
            )}

            {isTrainingCoachOpen && (
                <Modal 
                    isOpen={isTrainingCoachOpen}
                    onClose={() => setIsTrainingCoachOpen(false)}
                    title="Coach de Treinamento - Avaliação de Performance"
                    size="large"
                >
                    <TrainingCoach />
                </Modal>
            )}
            
        </>
    );
};

export default ControlPanel;