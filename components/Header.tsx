import React from 'react';

interface HeaderProps {
    onMenuClick: () => void;
    agentTitle?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, agentTitle }) => {
    const title = "Agente Greatek 2026";

    return (
        <header className="bg-greatek-dark-blue p-4 text-white shadow-lg sticky top-0 z-20">
            <div className="relative w-full max-w-7xl mx-auto px-6 flex items-center justify-center min-h-[40px]">
                {/* Menu Button (Mobile) - Left aligned absolutely */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 md:hidden">
                    <button 
                        onClick={onMenuClick} 
                        className="text-white/80 hover:text-white transition-colors p-1" 
                        aria-label="Abrir menu"
                    >
                        <i className="bi bi-list text-2xl"></i>
                    </button>
                </div>

                {/* Centered Title */}
                <div className="flex flex-col items-center justify-center text-center px-8">
                    <h1 className="font-semibold text-lg sm:text-xl tracking-wide select-none">
                        {title}
                    </h1>
                    {agentTitle && (
                        <p className="font-normal text-xs text-white/70 tracking-normal mt-0.5" title={agentTitle}>
                            {agentTitle}
                        </p>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;