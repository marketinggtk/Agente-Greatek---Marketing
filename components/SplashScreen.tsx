import React from 'react';
import { ShaderAnimation } from './ui/shader-animation';

interface SplashScreenProps {
  isFadingOut: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isFadingOut }) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity ${isFadingOut ? 'animate-fade-out' : 'animate-fade-in'}`}
    >
      <ShaderAnimation />
      <div className="absolute pointer-events-none z-10 flex flex-col items-center text-center text-white animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight whitespace-pre-wrap">
          Bem-vindos ao
        </h1>
        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter whitespace-pre-wrap mt-2">
          Agente Greatek
        </h2>
      </div>
    </div>
  );
};

export default SplashScreen;
