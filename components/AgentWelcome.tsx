
import React from 'react';
import { AppMode } from '../types';
import { MODE_DESCRIPTIONS, AGENTS } from '../constants';

interface AgentWelcomeProps {
  mode: AppMode;
}

const AgentWelcome: React.FC<AgentWelcomeProps> = ({ mode }) => {
  const agentInfo = AGENTS.find(agent => agent.mode === mode);
  const modeInfo = MODE_DESCRIPTIONS[mode];

  if (!agentInfo || !modeInfo) return null;

  const { iconClass } = agentInfo;
  const { title, description, example } = modeInfo;

  return (
    <div className="h-full flex flex-col justify-center items-center text-center p-8 animate-fade-in">
      <div className="max-w-2xl">
        <i className={`bi ${iconClass} text-6xl text-greatek-blue/30 mx-auto mb-4`}></i>
        <h2 className="text-2xl font-bold text-greatek-dark-blue">{title}</h2>
        <p className="mt-3 text-base text-text-secondary">{description}</p>
        <div className="mt-6 text-sm bg-greatek-bg-light p-4 rounded-lg border border-greatek-border">
          <p className="font-semibold text-greatek-dark-blue text-left">Exemplo de uso:</p>
          <p className="text-text-secondary mt-2 font-mono text-left bg-greatek-border/40 p-3 rounded">{example}</p>
        </div>
      </div>
    </div>
  );
};

export default AgentWelcome;
