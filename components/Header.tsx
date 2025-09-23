import React from 'react';

interface HeaderProps {
    onAdminClick: () => void;
    onMenuClick: () => void;
    agentTitle?: string;
}

const Header: React.FC<HeaderProps> = ({ onAdminClick, onMenuClick, agentTitle }) => {
    const title = "Agente Greatek 1.0";

    return (
        <header className="bg-greatek-dark-blue p-4 text-white shadow-lg sticky top-0 z-20">
            <div className="container mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <button onClick={onMenuClick} className="md:hidden text-white/80 hover:text-white transition-colors flex-shrink-0" aria-label="Abrir menu">
                        <i className="bi bi-list text-2xl"></i>
                    </button>
                    {/* Title Container */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 min-w-0">
                        <span className="font-semibold text-base sm:text-xl whitespace-nowrap">
                            {title}
                        </span>
                        {agentTitle && (
                            <span className="font-normal text-sm text-white/70 truncate" title={agentTitle}>
                                {agentTitle}
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={onAdminClick}
                    className="text-white/80 hover:text-white transition-colors flex-shrink-0"
                    aria-label="Painel do Administrador"
                >
                    <i className="bi bi-gear-fill text-xl"></i>
                </button>
            </div>
        </header>
    );
};

export default Header;
