

import React, { useState } from 'react';
import Modal from './ui/Modal';
import TrainingCoach from './TrainingCoach';
import LeadHunter from './LeadHunter';
import { useAppStore } from '../store/useAppStore';
import { AppMode } from '../types';

const ControlPanel: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const { createNewConversation } = useAppStore();
    const [isTrainingCoachOpen, setIsTrainingCoachOpen] = useState(false);
    const [isLeadHunterOpen, setIsLeadHunterOpen] = useState(false);

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
                            onClick={() => setIsLeadHunterOpen(true)}
                            className="group p-4 border border-greatek-border rounded-lg text-left hover:bg-greatek-bg-light hover:border-greatek-blue transition-all bg-greatek-blue/5"
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-lg bg-greatek-blue text-white flex items-center justify-center shadow-md">
                                    <i className="bi bi-crosshair text-xl"></i>
                                </div>
                                <h5 className="ml-3 font-bold text-greatek-dark-blue">Caçador de Leads</h5>
                            </div>
                            <p className="text-xs text-text-secondary mt-2">
                                Encontre e qualifique novos clientes (ISPs, Integradores) usando inteligência de busca na web.
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

            {isLeadHunterOpen && (
                <Modal 
                    isOpen={isLeadHunterOpen}
                    onClose={() => setIsLeadHunterOpen(false)}
                    title="Caçador de Leads & Inteligência de Mercado"
                    size="large"
                >
                    <LeadHunter />
                </Modal>
            )}
        </>
    );
};

export default ControlPanel;
