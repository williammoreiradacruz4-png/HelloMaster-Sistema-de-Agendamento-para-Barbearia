import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import logoHelloMaster from '../assets/hellomaster.png';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      id="screen-splash"
      className="fixed inset-0 bg-neutral-900 flex flex-col items-center justify-center z-50 text-white transition-opacity duration-500"
    >
      <div className="mb-6 max-w-[280px] px-4 animate-pulse">
        <img
          src={logoHelloMaster}
          alt="HelloMaster Logo"
          className="w-full h-auto object-contain drop-shadow-md"
        />
      </div>
      <div className="w-24 bg-neutral-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full w-full rounded-full"
          style={{ animation: 'loading 3s ease-in-out infinite' }}
        />
      </div>
      <p className="text-gray-400 text-xs mt-3 tracking-widest font-light uppercase">
        Iniciando Ecossistema SaaS
      </p>

      {/* Botão de atalho para entrar direto */}
      <button
        onClick={onFinish}
        className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60 text-xs transition-colors cursor-pointer"
      >
        <span>Entrar direto</span>
        <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
      </button>
    </div>
  );
};

