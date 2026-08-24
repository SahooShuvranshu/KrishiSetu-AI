import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import { Settings, Info, X, HardDrive, Languages, Github } from 'lucide-react';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import { getTranslation } from './translations';

// Lazy load tab components for faster initial load
const CameraScan = lazy(() => import('./components/CameraScan'));
const SoilAdvisory = lazy(() => import('./components/SoilAdvisory'));
const StateTelemetryMap = lazy(() => import('./components/StateTelemetryMap'));

// Loading fallback for lazy components
const TabLoader = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p className="font-mono text-xs uppercase">Loading...</p>
    </div>
  </div>
);

function App() {
  const [isSplashing, setIsSplashing] = useState(!sessionStorage.getItem('krishisetu_splashed'));
  const [activeTab, setActiveTab] = useState('scan');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false); // Info Modal state
  const [modelDownloaded, setModelDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('krishisetu_gemini_key') || '');
  
  const [appLanguage, setAppLanguage] = useState(localStorage.getItem('krishisetu_lang') || 'en');
  
  const t = (key) => getTranslation(appLanguage, key);
  
  // Handle Escape key for modals
  const handleEscapeKey = useCallback((event) => {
    if (event.key === 'Escape') {
      if (showSettings) setShowSettings(false);
      if (showInfo) setShowInfo(false);
    }
  }, [showSettings, showInfo]);

  // Lock/unlock body scroll when modal is open
  useEffect(() => {
    if (showSettings || showInfo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showSettings, showInfo]);

  useEffect(() => {
    let splashTimer;
    if (isSplashing) {
      splashTimer = setTimeout(() => {
        setIsSplashing(false);
        sessionStorage.setItem('krishisetu_splashed', 'true');
      }, 2500);
    }
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('keydown', handleEscapeKey);
    
    if(localStorage.getItem('krishisetu_model_downloaded') === 'true') {
      setModelDownloaded(true);
    }

    return () => {
      clearTimeout(splashTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [handleEscapeKey]);

  const changeLanguage = (langCode) => {
    setAppLanguage(langCode);
    localStorage.setItem('krishisetu_lang', langCode);
  };

  const downloadModel = () => {
    setDownloading(true);
    setTimeout(() => {
      localStorage.setItem('krishisetu_model_downloaded', 'true');
      setModelDownloaded(true);
      setDownloading(false);
    }, 2000);
  };

  const removeModel = () => {
    localStorage.removeItem('krishisetu_model_downloaded');
    setModelDownloaded(false);
  };

  if (isSplashing) {
    return (
      <div className="fixed inset-0 z-[100] bg-brutal-bg bg-agri-grid flex flex-col items-center justify-center p-4">
        <div className="relative animate-bounce">
          <div className="absolute inset-0 bg-brutal-neon translate-x-3 translate-y-3 border-4 border-black"></div>
          <div className="relative bg-white border-4 border-black p-8 flex flex-col items-center justify-center shadow-brutal-lg">
             <div className="w-24 h-24 bg-brutal-green text-white border-4 border-black mb-4 flex items-center justify-center rotate-2 shadow-brutal">
                <span className="text-5xl">🚜</span>
             </div>
             <h1 className="text-6xl font-black uppercase tracking-tighter text-center leading-none">
               Krishi<br/>Setu
             </h1>
          </div>
        </div>
        <div className="absolute bottom-12 flex flex-col items-center">
           <div className="flex gap-2 mb-2">
             <div className="w-4 h-4 bg-black animate-ping rounded-none border-2 border-white"></div>
             <div className="w-4 h-4 bg-black animate-ping rounded-none border-2 border-white" style={{ animationDelay: '200ms' }}></div>
             <div className="w-4 h-4 bg-black animate-ping rounded-none border-2 border-white" style={{ animationDelay: '400ms' }}></div>
           </div>
           <p className="font-mono font-black uppercase tracking-widest text-xs bg-black text-brutal-neon px-2 py-1 border-2 border-black">
             SYSTEM BOOT...
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brutal-bg bg-agri-grid pb-24 font-sans text-black selection:bg-brutal-neon relative flex flex-col">
      <div className="h-4 w-full bg-brutal-neon bg-tractor-tread border-b-4 border-black"></div>
      <header className="bg-white border-b-4 border-black p-4 sticky top-0 z-40 flex justify-between items-center shadow-brutal mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">{t('appTitle')}</h1>
          <p className="font-mono text-[10px] font-black bg-black text-brutal-neon px-2 py-1 mt-1 inline-block border-2 border-black uppercase shadow-[2px_2px_0_0_#000]">
            {t('appSubtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Info Button */}
          <button 
            onClick={() => setShowInfo(true)}
            className="p-2 border-2 border-black bg-gray-100 hover:bg-brutal-neon shadow-[2px_2px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            aria-label="About Project"
          >
            <Info size={20} />
          </button>
          
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 border-2 border-black bg-gray-100 hover:bg-brutal-neon shadow-[2px_2px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            aria-label="App Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-label="About Project">
          <div className="bg-white border-4 border-black w-full max-w-sm p-4 relative shadow-[8px_8px_0_0_#00ff41]">
            <button 
              onClick={() => setShowInfo(false)}
              className="absolute top-2 right-2 p-1 border-2 border-black bg-red-500 text-white"
            >
              <X size={20} />
            </button>
            <h2 className="font-black text-2xl uppercase border-b-2 border-black pb-2 mb-4 mt-2">About Project</h2>
            <div className="font-mono text-sm">
              <p className="font-bold uppercase text-gray-500 mb-1">Project Name:</p>
              <p className="text-lg font-black bg-brutal-green p-2 border-2 border-black mb-3">Krishi Setu AI</p>
              
              <p className="font-bold uppercase text-gray-500 mb-1">Team Name:</p>
              <p className="text-lg font-black bg-brutal-neon p-2 border-2 border-black mb-3">Crystal Studio Labs</p>

              <p className="font-bold uppercase text-gray-500 mb-1">Hackathon:</p>
              <p className="bg-gray-100 p-2 border-2 border-black mb-4">Google AI Hackathon 2026: Code for Communities</p>

              <p className="font-bold uppercase text-gray-500 mb-1">About:</p>
              <p className="text-[11px] leading-relaxed bg-white border-2 border-black p-2">
                Krishi Setu is an offline-first, multilingual AI plant pathologist and localized broadcast network, designed entirely for remote Indian farming communities.
              </p>

              <a href="#" className="flex items-center justify-center gap-2 mt-4 p-3 bg-black text-white border-2 border-black hover:bg-white hover:text-black hover:shadow-brutal-hover transition-all font-bold uppercase text-sm w-full shadow-[4px_4px_0_0_#000]">
                <Github size={20} /> Source Code / Open Source
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-label="App Settings">
          <div className="bg-white border-4 border-black w-full max-w-sm p-4 relative shadow-[8px_8px_0_0_#00ff41]">
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-2 right-2 p-1 border-2 border-black bg-red-500 text-white"
            >
              <X size={20} />
            </button>
            <h2 className="font-black text-2xl uppercase border-b-2 border-black pb-2 mb-4 mt-2">{t('settings')}</h2>
            
            <div className="border-2 border-black p-3 bg-gray-50 mb-4 font-mono text-xs">
              <h3 className="font-bold uppercase text-gray-500 mb-2">Cloud AI API Key</h3>
              <div className="flex gap-2 mb-1">
                <input 
                  type="password" 
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="Paste Gemini API Key..." 
                  className="w-full p-2 border-2 border-black focus:outline-none focus:bg-brutal-neon text-black font-sans"
                />
                <button 
                  onClick={() => {
                    localStorage.setItem('krishisetu_gemini_key', geminiKey);
                    alert("API Key Saved Successfully!");
                  }}
                  className="bg-black text-white px-3 font-bold uppercase border-2 border-black hover:bg-brutal-neon hover:text-black transition-colors"
                >
                  Save
                </button>
              </div>
              <p className="text-[9px] text-green-700 font-bold uppercase mt-2">🔒 Stays on your device only</p>
            </div>

            <div className="border-2 border-black p-3 bg-gray-50 mb-4 font-mono text-xs">
              <h3 className="font-bold uppercase text-gray-500 mb-2 flex items-center gap-2">
                <Languages size={16} /> {t('selectLanguage')}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => changeLanguage('en')} className={`brutal-button py-2 uppercase ${appLanguage === 'en' ? 'bg-brutal-neon border-black' : 'bg-white border-gray-400'}`}>English</button>
                <button onClick={() => changeLanguage('or')} className={`brutal-button py-2 uppercase ${appLanguage === 'or' ? 'bg-brutal-neon border-black' : 'bg-white border-gray-400'}`}>ଓଡ଼ିଆ</button>
                <button onClick={() => changeLanguage('hi')} className={`brutal-button py-2 uppercase ${appLanguage === 'hi' ? 'bg-brutal-neon border-black' : 'bg-white border-gray-400'}`}>हिन्दी</button>
              </div>
            </div>

            <div className="border-2 border-black p-3 bg-gray-50 mb-4 font-mono text-xs">
              <h3 className="font-bold uppercase text-gray-500 mb-2">{t('offlineModel')}</h3>
              <p className="mb-3">{t('modelDesc')}</p>
              
              {modelDownloaded ? (
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-2 text-green-700 font-bold bg-green-100 p-2 border border-black">
                    <HardDrive size={16} /> {t('modelInstalled')}
                  </span>
                  <button onClick={removeModel} className="brutal-button bg-red-500 text-white py-2 uppercase">
                    {t('deleteModel')}
                  </button>
                </div>
              ) : isOnline ? (
                <button 
                  onClick={downloadModel}
                  disabled={downloading}
                  className="brutal-button w-full bg-brutal-neon text-black py-2 uppercase flex justify-center items-center gap-2"
                >
                  {downloading ? t('downloading') : t('download')}
                </button>
              ) : (
                <label className="brutal-button w-full bg-yellow-400 text-black py-2 uppercase flex justify-center items-center gap-2 cursor-pointer shadow-[2px_2px_0_0_#000] border-2 border-black hover:bg-black hover:text-white transition-all text-xs font-black">
                  Select Model File(s)
                  <input type="file" accept=".json,.bin" className="hidden" multiple onChange={(e) => {
                    if (e.target.files.length > 0) {
                      setDownloading(true);
                      setTimeout(() => {
                        localStorage.setItem('krishisetu_model_downloaded', 'true');
                        setModelDownloaded(true);
                        setDownloading(false);
                      }, 1000);
                    }
                  }} />
                </label>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="px-3 max-w-sm mx-auto w-full">
        <Suspense fallback={<TabLoader />}>
          {activeTab === 'scan' && <CameraScan isOnline={isOnline} appLanguage={appLanguage} t={t} />}
          {activeTab === 'advisory' && <SoilAdvisory t={t} appLanguage={appLanguage} isOnline={isOnline} />}
          {activeTab === 'network' && <StateTelemetryMap t={t} appLanguage={appLanguage} isOnline={isOnline} />}
        </Suspense>
      </main>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} t={t} />
    </div>
  );
}

export default App;
