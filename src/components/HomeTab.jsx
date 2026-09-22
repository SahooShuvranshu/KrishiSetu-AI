import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Leaf, Wifi, WifiOff, Github, ExternalLink, Cpu, CheckCircle, AlertCircle, Languages, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function HomeTab() {
  const { t, isOnline, modelDownloaded } = useApp();
  const navigate = useNavigate();
  const [scanCount, setScanCount] = useState(0);

  // Read the flag from context, not from localStorage: the context derives it
  // from the files actually present on the device, so this card now updates the
  // moment a model is installed or deleted instead of on the next page load.
  const modelReady = modelDownloaded;

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('krishisetu_scan_history') || '[]');
    setScanCount(history.length);
  }, []);

  const offlineSteps = [
    t('stepDownloadModel'),
    t('stepRunsInBrowser'),
    t('stepPhotosPrivate'),
    t('stepPickCrop')
  ];

  return (
    <div className="flex flex-col gap-2.5 animate-fade-in pb-8 bg-dots">
      {/* Hero. The app header above already carries the title and the online
          badge, so this block exists to push the one action that matters. */}
      <div className="bg-black text-white p-3 border-2 border-black shadow-brutal relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-brutal-neon opacity-10 rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-brutal-neon text-black border-2 border-black flex items-center justify-center text-xl">
              🚜
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-black uppercase leading-none truncate">{t('appTitle')}</h1>
              <p className="font-mono text-[8px] text-brutal-neon mt-0.5 truncate">{t('appSubtitle')}</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/scan')}
            className="w-full bg-brutal-neon text-black border-2 border-black p-2.5 flex items-center gap-2.5 active:translate-x-0.5 active:translate-y-0.5 transition-transform shadow-brutal-sm"
          >
            <span className="bg-black text-brutal-neon p-2 border-2 border-black shrink-0">
              <Camera size={20} />
            </span>
            <span className="text-left min-w-0 flex-1">
              <span className="font-black text-sm uppercase block leading-none">{t('cropDoctor')}</span>
              <span className="font-mono text-[9px] block mt-0.5 truncate">{t('takePhotoInstruction')}</span>
            </span>
            <ChevronRight size={18} className="shrink-0" />
          </button>
        </div>
      </div>

      {/* One strip for both states instead of two full-width cards: they were
          taking more vertical space than the actions did. */}
      <div className="grid grid-cols-2 bg-white border-2 border-black shadow-brutal-sm">
        <div className="p-2 flex items-center gap-2">
          <span className={`p-1.5 border-2 border-black shrink-0 ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}>
            {isOnline ? <Wifi size={14} className="text-white" /> : <WifiOff size={14} className="text-white" />}
          </span>
          <span className="min-w-0">
            <span className="font-black text-[10px] uppercase block leading-tight truncate">
              {isOnline ? t('onlineMode') : t('offlineStatus')}
            </span>
            <span className="font-mono text-[8px] text-gray-600 block leading-tight truncate">
              {isOnline ? t('statusOnlineDesc') : t('statusOfflineDesc')}
            </span>
          </span>
        </div>

        <button
          onClick={() => navigate('/scan')}
          className="p-2 flex items-center gap-2 text-left border-l-2 border-black active:bg-gray-100 transition-colors"
        >
          <span className={`p-1.5 border-2 border-black shrink-0 ${modelReady ? 'bg-brutal-neon' : 'bg-gray-200'}`}>
            {modelReady
              ? <CheckCircle size={14} className="text-black" />
              : <AlertCircle size={14} />}
          </span>
          <span className="min-w-0">
            <span className="font-black text-[10px] uppercase block leading-tight truncate">
              {modelReady ? t('aiModelReady') : t('aiModelMissing')}
            </span>
            <span className="font-mono text-[8px] text-gray-600 block leading-tight truncate">
              {modelReady ? t('modelCachedOffline') : t('modelInstallHint')}
            </span>
          </span>
        </button>
      </div>

      {/* Secondary action */}
      <button
        onClick={() => navigate('/advisory')}
        className="w-full bg-white border-2 border-black p-2.5 flex items-center gap-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-brutal-sm text-left"
      >
        <span className="bg-green-500 text-white p-1.5 border-2 border-black shrink-0">
          <Leaf size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="font-black text-[11px] uppercase block leading-none">{t('farmAdvice')}</span>
          <span className="font-mono text-[9px] text-gray-600 block mt-0.5 truncate">{t('advisoryDesc')}</span>
        </span>
        <ChevronRight size={18} className="shrink-0" />
      </button>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="bg-white border-2 border-black p-2 shadow-brutal-sm text-center">
          <Cpu size={14} className="mx-auto mb-0.5 text-brutal-green" />
          <p className="font-black text-sm">{modelReady ? '✓' : '✗'}</p>
          <p className="font-mono text-[7px] text-gray-500 uppercase leading-tight">{t('statAiModel')}</p>
        </div>
        <div className="bg-white border-2 border-black p-2 shadow-brutal-sm text-center">
          <Camera size={14} className="mx-auto mb-0.5 text-blue-500" />
          <p className="font-black text-sm">{scanCount}</p>
          <p className="font-mono text-[7px] text-gray-500 uppercase leading-tight">{t('statScans')}</p>
        </div>
        <div className="bg-white border-2 border-black p-2 shadow-brutal-sm text-center">
          <Languages size={14} className="mx-auto mb-0.5 text-purple-500" />
          <p className="font-black text-sm">3</p>
          <p className="font-mono text-[7px] text-gray-500 uppercase leading-tight">{t('statLanguages')}</p>
        </div>
      </div>

      {/* How offline works */}
      <div className="bg-white border-2 border-black p-2.5">
        <h3 className="font-black text-xs uppercase mb-2 flex items-center gap-1.5">
          <span className="text-sm">🔌</span> {t('howOfflineWorks')}
        </h3>
        <div className="space-y-1.5">
          {offlineSteps.map((text, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="bg-brutal-neon text-black text-[8px] font-black px-1.5 py-0.5 border border-black shrink-0">{i + 1}</span>
              <p className="font-mono text-[9px] text-gray-600 leading-snug">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="flex gap-1.5">
        <a href="https://sahooshuvranshu.is-a.dev/KrishiSetu-AI/" target="_blank" rel="noopener noreferrer" className="flex-1 bg-white border-2 border-black p-2 flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors shadow-brutal-sm">
          <ExternalLink size={12} />
          <span className="font-black text-[10px] uppercase">{t('showcase')}</span>
        </a>
        <a href="https://github.com/SahooShuvranshu/KrishiSetu-AI" target="_blank" rel="noopener noreferrer" className="flex-1 bg-white border-2 border-black p-2 flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors shadow-brutal-sm">
          <Github size={12} />
          <span className="font-black text-[10px] uppercase">{t('source')}</span>
        </a>
      </div>
    </div>
  );
}
