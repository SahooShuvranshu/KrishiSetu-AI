import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import KrishiSetuLogo from './KrishiSetuLogo';

/**
 * KrishiSetu AI - High Performance Neo-Brutalist Splash Screen
 * Features smooth progress loading, system boot telemetry, and fluid fade-out transition.
 */
export default function SplashScreen({ onFinish, duration = 2400 }) {
  const [progress, setProgress] = useState(10);
  const [statusText, setStatusText] = useState('BOOTING OFFLINE RUNTIME...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Step 1: Initialize Engine
    const t1 = setTimeout(() => {
      setProgress(45);
      setStatusText('INITIALIZING TENSORFLOW.JS...');
    }, 600);

    // Step 2: Verify Offline Storage & Models
    const t2 = setTimeout(() => {
      setProgress(80);
      setStatusText('VERIFYING OPFS CACHED WEIGHTS...');
    }, 1300);

    // Step 3: Grid Ready
    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('100% OFFLINE GRID READY');
    }, 1900);

    // Step 4: Trigger Smooth Fade-Out
    const t4 = setTimeout(() => {
      setIsFadingOut(true);
    }, duration - 300);

    // Step 5: Unmount and hand off to main UI
    const t5 = setTimeout(() => {
      if (onFinish) onFinish();
    }, duration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [duration, onFinish]);

  return (
    <div
      onClick={onFinish}
      className={`fixed inset-0 z-[100] bg-[#0A0F14] bg-agri-grid flex flex-col items-center justify-center p-6 select-none transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="dialog"
      aria-label="App Initialization"
    >
      {/* Central Branding Card */}
      <div className="relative flex flex-col items-center max-w-sm w-full">
        {/* Glow Halo behind Tractor Logo */}
        <div className="absolute top-1/4 w-36 h-36 bg-[#CCFF00] rounded-full blur-3xl opacity-15 pointer-events-none" />

        {/* Vector Tractor Logo with gentle pulsing elevation */}
        <div className="relative mb-5 transition-transform duration-500 ease-out hover:scale-105">
          <KrishiSetuLogo size={84} />
        </div>

        {/* Brand Title */}
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white text-center leading-none mb-1">
          Krishi<span className="text-[#CCFF00]">Setu</span> AI
        </h1>

        {/* Subtitle Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#121820] border border-black shadow-[2px_2px_0px_#000] rounded-md mb-6">
          <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
          <span className="font-mono text-[9px] font-black uppercase tracking-wider text-white">
            Odisha Farmer Network
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-64 max-w-full bg-[#121820] border-2 border-black rounded-lg p-1 shadow-[3px_3px_0px_#000] mb-3">
          <div
            className="h-2 bg-[#CCFF00] rounded-md transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Telemetry Status Line */}
        <div className="flex items-center justify-between w-64 max-w-full font-mono text-[10px] text-gray-400">
          <span className="truncate tracking-wide text-gray-300 font-bold">{statusText}</span>
          <span className="font-mono text-[#CCFF00] font-black ml-2">{progress}%</span>
        </div>
      </div>

      {/* Footer Tag & Skip Prompt */}
      <div className="absolute bottom-6 flex flex-col items-center gap-1.5">
        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-500">
          100% Client-Side Neural Engine • Tap anywhere to start
        </p>
      </div>
    </div>
  );
}

SplashScreen.propTypes = {
  onFinish: PropTypes.func.isRequired,
  duration: PropTypes.number
};
