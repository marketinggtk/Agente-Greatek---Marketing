
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { PgrSeller } from '../types';
import Modal from './ui/Modal';

const PgrLoginScreen: React.FC = () => {
    const { pgrSellers, loginPgr, showToast } = useAppStore();
    const [selectedSeller, setSelectedSeller] = useState<PgrSeller | null>(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const sortedSellers = useMemo(() => {
        const admin = pgrSellers.find(s => s.id === 'admin');
        const sellers = pgrSellers.filter(s => s.id !== 'admin').sort((a, b) => a.name.localeCompare(b.name));
        return admin ? [admin, ...sellers] : sellers;
    }, [pgrSellers]);

    const handleSellerSelect = (seller: PgrSeller) => {
        setSelectedSeller(seller);
        setError('');
        setPassword('');
    };

    const handleLogin = () => {
        if (!selectedSeller) return;
        
        if (password === selectedSeller.password) {
            loginPgr(selectedSeller.id);
            showToast(`Bem-vindo, ${selectedSeller.name}!`, 'success');
            handleCloseModal();
        } else {
            setError('Senha incorreta. Tente novamente.');
        }
    };

    const handleCloseModal = () => {
        setSelectedSeller(null);
        setPassword('');
        setError('');
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 bg-greatek-bg-light/50 overflow-y-auto custom-scrollbar animate-fade-in">
            <div className="text-center mb-8">
                <i className="bi bi-award-fill text-5xl text-greatek-blue/30 mx-auto mb-2"></i>
                <h1 className="text-xl sm:text-2xl font-bold text-greatek-dark-blue">Calculadora de PGR Individual</h1>
                <p className="text-sm sm:text-base text-text-secondary mt-1">Selecione seu nome para acessar suas metas.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 max-w-4xl mx-auto w-full">
                {sortedSellers.map(seller => {
                    const isAdmin = seller.id === 'admin';
                    return (
                        <button
                            key={seller.id}
                            onClick={() => handleSellerSelect(seller)}
                            className={`group flex flex-col items-center justify-center p-4 rounded-xl shadow-sm border aspect-square transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-lg ${
                                isAdmin
                                ? 'bg-greatek-dark-blue text-white border-greatek-blue/50 hover:border-greatek-blue'
                                : 'bg-white border-gray-200 hover:border-greatek-blue'
                            }`}
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 border-2 border-transparent group-hover:scale-110 transition-transform ${
                                isAdmin ? 'bg-white/10 group-hover:border-white/20' : 'bg-greatek-blue/10 group-hover:border-greatek-blue/20'
                            }`}>
                                <i className={`bi ${isAdmin ? 'bi-gear-fill' : 'bi-person-fill'} text-3xl ${isAdmin ? 'text-white' : 'text-greatek-blue'}`}></i>
                            </div>
                            <span className={`font-semibold text-sm text-center ${isAdmin ? 'text-white' : 'text-greatek-dark-blue'}`}>{seller.name}</span>
                        </button>
                    )
                })}
            </div>

            <Modal
                isOpen={!!selectedSeller}
                onClose={handleCloseModal}
                title={`Login - ${selectedSeller?.name}`}
            >
                <div className="p-4 text-center">
                    <p className="text-text-secondary mb-4">Por favor, insira sua senha para continuar.</p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        autoFocus
                        className="w-full max-w-xs mx-auto p-3 text-center rounded-md border-transparent shadow-sm focus:border-greatek-blue focus:ring-greatek-blue text-lg bg-[#e9e9e9] text-black placeholder:text-gray-500"
                        placeholder="••••••"
                    />
                    {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
                    <div className="mt-6">
                         <button
                            onClick={handleLogin}
                            className="w-full max-w-xs mx-auto inline-flex items-center justify-center rounded-md border border-transparent bg-greatek-blue px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-greatek-dark-blue focus:outline-none focus:ring-2 focus:ring-greatek-blue focus:ring-offset-2"
                        >
                            Acessar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PgrLoginScreen;
