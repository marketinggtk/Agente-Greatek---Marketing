import React from 'react';

interface HeaderProps {
    onAdminClick: () => void;
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdminClick, onMenuClick }) => {
    return (
        <header className="bg-greatek-dark-blue p-4 text-white shadow-lg sticky top-0 z-20">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onMenuClick} className="md:hidden text-white/80 hover:text-white transition-colors" aria-label="Abrir menu">
                        <i className="bi bi-list text-2xl"></i>
                    </button>
                    <span className="font-semibold text-base sm:text-xl whitespace-nowrap">
                        Agente Greatek 1.0
                    </span>
                </div>
                <button
                    onClick={onAdminClick}
                    className="text-white/80 hover:text-white transition-colors"
                    aria-label="Painel do Administrador"
                >
                    <i className="bi bi-gear-fill text-xl"></i>
                </button>
            </div>
        </header>
    );
};

export default Header;