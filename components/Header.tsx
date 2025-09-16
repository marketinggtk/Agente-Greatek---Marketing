import React from 'react';

interface HeaderProps {
    onAdminClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdminClick }) => {
    return (
        <header className="bg-greatek-dark-blue p-4 text-white shadow-lg sticky top-0 z-20">
            <div className="container mx-auto flex items-center justify-between">
                <span className="font-semibold text-lg sm:text-xl whitespace-nowrap">
                    Agente de Marketing 1.0 - Greatek
                </span>
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