
import React from 'react';
import { AppMode } from '../types';
import { MODE_DESCRIPTIONS } from '../constants';

interface ModeDescriptionProps {
  mode: AppMode;
}

const ModeDescription: React.FC<ModeDescriptionProps> = ({ mode }) => {
  const { title, description, example } = MODE_DESCRIPTIONS[mode];

  return (
    <div className="h-full flex flex-col justify-center items-center text-center p-8 animate-fade-in">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-greatek-dark-blue">{title}</h2>
        <p className="mt-3 text-base text-text-secondary">{description}</p>
        <div className="mt-6 text-sm bg-greatek-border p-3 rounded-lg">
          <p className="font-semibold text-greatek-dark-blue">Como usar:</p>
          <p className="text-text-secondary mt-1 font-mono">{example}</p>
        </div>
      </div>
    </div>
  );
};

export default ModeDescription;