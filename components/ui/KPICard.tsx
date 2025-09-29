
import React from 'react';
import { KPIData } from '../../types';

const KPICard: React.FC<KPIData> = ({ title, value, icon, description }) => {
    return (
        <div className="p-4 bg-white border border-greatek-border rounded-lg shadow-sm flex items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-greatek-blue/10 text-greatek-blue">
                <i className={`bi ${icon} text-xl`}></i>
            </div>
            <div className="ml-4">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{title}</p>
                <p className="font-bold text-greatek-dark-blue text-2xl">{value}</p>
                {description && <p className="text-xs text-text-secondary/80 mt-1">{description}</p>}
            </div>
        </div>
    );
};

export default KPICard;
