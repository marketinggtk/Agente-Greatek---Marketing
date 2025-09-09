import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-greatek-dark-blue p-4 text-white shadow-lg sticky top-0 z-20">
            <div className="container mx-auto flex items-center justify-start">
                <span className="font-semibold text-lg sm:text-xl whitespace-nowrap">
                    Agente de Marketing 1.0 - Greatek
                </span>
            </div>
        </header>
    );
};

export default Header;
