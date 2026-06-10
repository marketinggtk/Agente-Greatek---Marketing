import React from 'react';

export const LoadingDots: React.FC = () => {
    return (
        <div className="flex gap-4 p-6 animate-pulse">
            <div className="w-3 h-3 bg-greatek-blue rounded-full"></div>
            <div className="w-3 h-3 bg-greatek-blue rounded-full [animation-delay:0.2s]"></div>
            <div className="w-3 h-3 bg-greatek-blue rounded-full [animation-delay:0.4s]"></div>
        </div>
    );
};
