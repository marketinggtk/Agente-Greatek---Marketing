import React from 'react';

interface SplashScreenProps {
  isFadingOut: boolean;
}

const asciiLines = [
  'GREATEK:// INIT SYSTEM 0101 1010 0110',
  '>>>> CARREGANDO PORTFOLIO_TECNICO',
  '//// ISP_SOLUTIONS NETWORK_READY',
  '0101 1100 0011 1010  GREATEK_AI',
  'CONNECTING SALES + MARKETING + TELECOM',
  '▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒',
  'AGENTE_GREATEK // ONLINE // SECURE',
  'DATA FLOW: PRODUTOS | CAMPANHAS | TREINAMENTO',
];

const SplashScreen: React.FC<SplashScreenProps> = ({ isFadingOut }) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden
        bg-[#083561]
        transition-opacity duration-500
        ${isFadingOut ? 'opacity-0' : 'opacity-100'}
      `}
      aria-label="Tela de carregamento do Agente Greatek"
      role="status"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0081cc_0%,#083561_42%,#041f39_100%)]" />

      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#63B8E7]/15 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#0081cc]/15 blur-3xl" />

      <div className="absolute inset-0 opacity-[0.10] overflow-hidden pointer-events-none select-none">
        <div className="ascii-drift flex flex-col gap-5 px-8 py-10 font-mono text-[11px] md:text-sm leading-none tracking-[0.25em] text-[#D9ECF7]">
          {Array.from({ length: 18 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="whitespace-nowrap"
              style={{
                transform: `translateX(${rowIndex % 2 === 0 ? '-8%' : '-2%'})`,
              }}
            >
              {asciiLines[rowIndex % asciiLines.length]}
              {'     '}
              {asciiLines[(rowIndex + 3) % asciiLines.length]}
              {'     '}
              {asciiLines[(rowIndex + 5) % asciiLines.length]}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,53,97,0.15),rgba(8,53,97,0.65))]" />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/15 shadow-lg backdrop-blur-sm">
          <span className="text-white font-black text-xl">G</span>
        </div>

        <p className="text-sm md:text-base font-semibold tracking-[0.35em] uppercase text-[#D9ECF7]/80">
          Bem-vindos ao
        </p>

        <h1 className="mt-3 text-4xl md:text-6xl font-black tracking-tight text-white">
          Agente Greatek
        </h1>

        <div className="mt-5 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 backdrop-blur-sm">
          <p className="font-mono text-[10px] md:text-xs tracking-[0.25em] uppercase text-[#D9ECF7]/75">
            Inicializando inteligência comercial...
          </p>
        </div>

        <div className="mt-8 h-1.5 w-52 overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-1/2 rounded-full bg-white/80 animate-[splash-loading_1.2s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

