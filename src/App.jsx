import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Settings, Info, X, HardDrive, Languages, Github, ExternalLink, Moon, Sun, Bell, BellOff, Trash2, Smartphone } from 'lucide-react';
import Navbar from './components/Navbar';
import StatusBadge from './components/StatusBadge';
import FocusTrap from './components/FocusTrap';
import { useApp } from './context/AppContext';
import { useToast } from './components/Toast.jsx';

// Lazy load tab components for faster initial load
const HomeTab = lazy(() => import('./components/HomeTab'));
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
  const {
    t, isOnline, isDark, geminiKey, saveGeminiKey, modelDownloaded, downloading,
    downloadModel, removeModel, appLanguage, changeLanguage, toggleTheme, notifications,
    toggleNotifications, autoDetect, toggleAutoDetect, clearAllData
  } = useApp();
  const toast = useToast();

  const [isSplashing, setIsSplashing] = useState(!sessionStorage.getItem('krishisetu_splashed'));
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

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

    window.addEventListener('keydown', handleEscapeKey);

    return () => {
      clearTimeout(splashTimer);
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isSplashing, handleEscapeKey]);

  if (isSplashing) {
    return (
      <div className="fixed inset-0 z-[100] bg-brutal-bg bg-agri-grid flex flex-col items-center justify-center p-4">
        <div className="relative animate-bounce">
          <div className="absolute inset-0 bg-brutal-neon translate-x-3 translate-y-3 border-4 border-black"></div>
          <div className="relative bg-white border-4 border-black p-6 flex flex-col items-center justify-center shadow-brutal-lg">
             <div className="w-16 h-16 bg-brutal-green text-white border-4 border-black mb-3 flex items-center justify-center rotate-2 shadow-brutal">
                <span className="text-3xl">🚜</span>
             </div>
             <h1 className="text-4xl font-black uppercase tracking-tighter text-center leading-none">
               Krishi<br/>Setu
             </h1>
          </div>
        </div>
        <div className="absolute bottom-8 flex flex-col items-center">
           <div className="flex gap-1.5 mb-1.5">
             <div className="w-3 h-3 bg-black animate-ping rounded-none border-2 border-white"></div>
             <div className="w-3 h-3 bg-black animate-ping rounded-none border-2 border-white" style={{ animationDelay: '200ms' }}></div>
             <div className="w-3 h-3 bg-black animate-ping rounded-none border-2 border-white" style={{ animationDelay: '400ms' }}></div>
           </div>
           <p className="font-mono font-black uppercase tracking-widest text-[10px] bg-black text-brutal-neon px-2 py-0.5 border-2 border-black">
             SYSTEM BOOT...
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-16 font-sans relative flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-brutal-bg bg-agri-grid text-black'
    }`}>
      <div className={`h-4 w-full bg-brutal-neon bg-tractor-tread border-b-4 ${isDark ? 'border-gray-700' : 'border-black'}`}></div>
      <header className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-black'} border-b-4 px-2 py-1.5 sticky top-0 z-40 flex justify-between items-center shadow-brutal mb-2 transition-colors`}>
        <div className="flex items-center gap-1.5">
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tighter uppercase leading-none">{t('appTitle')}</h1>
            <p className={`font-mono text-[8px] font-black px-1.5 py-0.5 mt-0.5 inline-block border uppercase ${
              isDark ? 'bg-brutal-neon text-black border-brutal-neon' : 'bg-black text-brutal-neon border-black'
            }`}>
              {t('appSubtitle')}
            </p>
          </div>
          <StatusBadge isOnline={isOnline} />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setShowInfo(true)}
            className={`p-1.5 border-2 ${isDark ? 'bg-gray-700 border-gray-600 hover:bg-brutal-neon hover:text-black' : 'bg-gray-100 border-black hover:bg-brutal-neon'} shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all`}
            aria-label="About Project"
          >
            <Info size={16} />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className={`p-1.5 border-2 ${isDark ? 'bg-gray-700 border-gray-600 hover:bg-brutal-neon hover:text-black' : 'bg-gray-100 border-black hover:bg-brutal-neon'} shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all`}
            aria-label="App Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in" role="dialog" aria-modal="true" aria-label="About Project">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowInfo(false)} />
          <FocusTrap>
            <div className={`${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-black'} border-4 w-[calc(100%-1rem)] sm:w-full sm:max-w-sm max-h-[90vh] relative shadow-brutal-neon overflow-hidden flex flex-col transition-colors z-10`}>
              <div className={`px-4 py-3 border-b-2 ${isDark ? 'border-gray-600' : 'border-black'} flex-shrink-0 flex items-center justify-between`}>
                <h2 className="font-black text-lg uppercase">About Project</h2>
                <button onClick={() => setShowInfo(false)} className="p-1.5 border-2 border-black bg-red-500 text-white active:scale-95"><X size={18} /></button>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                <div className="font-mono text-sm">
                  <p className="font-bold uppercase text-gray-500 mb-1">Project Name:</p>
                  <p className="text-base font-black bg-brutal-green p-2 border-2 border-black mb-3">Krishi Setu AI</p>
                  <p className="font-bold uppercase text-gray-500 mb-1">Team Name:</p>
                  <p className="text-base font-black bg-brutal-neon p-2 border-2 border-black mb-3">Crystal Studio Labs</p>
                  <p className="font-bold uppercase text-gray-500 mb-1">Hackathon:</p>
                  <p className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-2 border-2 ${isDark ? 'border-gray-600' : 'border-black'} mb-3`}>Google AI Hackathon 2026: Code for Communities</p>
                  <p className="font-bold uppercase text-gray-500 mb-1">About:</p>
                  <p className={`text-xs leading-relaxed ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-black'} border-2 p-3 mb-4`}>Krishi Setu is an offline-first, multilingual AI plant pathologist and localized broadcast network, designed entirely for remote Indian farming communities.</p>
                  <div className="flex gap-3">
                    <a href="https://sahooshuvranshu.is-a.dev/KrishiSetu-AI/" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 bg-brutal-neon text-black border-2 border-black hover:bg-white transition-all font-bold uppercase text-sm shadow-brutal-xl active:shadow-none active:translate-x-1 active:translate-y-1"><ExternalLink size={16} /> Showcase</a>
                    <a href="https://github.com/SahooShuvranshu/KrishiSetu-AI" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-all font-bold uppercase text-sm shadow-brutal-xl active:shadow-none active:translate-x-1 active:translate-y-1"><Github size={16} /> Source</a>
                  </div>
                </div>
              </div>
            </div>
          </FocusTrap>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in" role="dialog" aria-modal="true" aria-label="App Settings">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowSettings(false)} />
          <FocusTrap>
            <div className={`${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-black'} border-4 w-[calc(100%-1rem)] sm:w-full sm:max-w-sm max-h-[90vh] relative shadow-brutal-neon transition-colors overflow-hidden flex flex-col z-10`}>
              <div className={`flex-shrink-0 px-4 py-3 border-b-2 ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-black'} flex items-center justify-between`}>
                <h2 className="font-black text-lg uppercase">{t('settings')}</h2>
                <button onClick={() => setShowSettings(false)} className="p-1.5 border-2 border-black bg-red-500 text-white active:scale-95"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {/* API Key */}
                <div className={`border-2 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-black bg-gray-50'} p-3 mb-3 font-mono text-xs`}>
                  <h3 className="font-bold uppercase text-gray-500 mb-2">Cloud AI API Key</h3>
                  <div className="flex gap-2 mb-1">
                    <input type="password" value={geminiKey} onChange={(e) => saveGeminiKey(e.target.value)} placeholder="Paste Gemini API Key..." className={`w-full p-2 border-2 ${isDark ? 'border-gray-600 bg-gray-600 text-white' : 'border-black'} focus:outline-none focus:bg-brutal-neon font-sans text-sm`} />
                    <button onClick={() => { saveGeminiKey(geminiKey); toast.success('API Key Saved!', 'Settings'); }} className="bg-black text-white px-3 py-2 font-bold uppercase border-2 border-black hover:bg-brutal-neon hover:text-black transition-colors whitespace-nowrap text-sm">Save</button>
                  </div>
                  <p className="text-[10px] text-green-400 font-bold uppercase mt-1">🔒 Session-only, never saved to disk</p>
                </div>
                {/* Language */}
                <div className={`border-2 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-black bg-gray-50'} p-3 mb-3 font-mono text-xs`}>
                  <h3 className="font-bold uppercase text-gray-500 mb-2 flex items-center gap-2"><Languages size={14} /> {t('selectLanguage')}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => changeLanguage('en')} className={`py-2 px-2 border-2 border-black font-black uppercase text-xs ${appLanguage === 'en' ? 'bg-brutal-neon' : isDark ? 'bg-gray-600' : 'bg-white'}`}>English</button>
                    <button onClick={() => changeLanguage('or')} className={`py-2 px-2 border-2 border-black font-black uppercase text-xs ${appLanguage === 'or' ? 'bg-brutal-neon' : isDark ? 'bg-gray-600' : 'bg-white'}`}>ଓଡ଼ିଆ</button>
                    <button onClick={() => changeLanguage('hi')} className={`py-2 px-2 border-2 border-black font-black uppercase text-xs ${appLanguage === 'hi' ? 'bg-brutal-neon' : isDark ? 'bg-gray-600' : 'bg-white'}`}>हिन्दी</button>
                  </div>
                </div>
                {/* Model */}
                <div className={`border-2 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-black bg-gray-50'} p-3 mb-3 font-mono text-xs`}>
                  <h3 className="font-bold uppercase text-gray-500 mb-2">{t('offlineModel')}</h3>
                  <p className="mb-3 leading-relaxed">{t('modelDesc')}</p>
                  {modelDownloaded ? (
                    <div className="flex flex-col gap-2">
                      <span className="flex items-center gap-2 text-green-400 font-bold bg-green-900 p-2 border border-green-600"><HardDrive size={14} /> {t('modelInstalled')}</span>
                      <button onClick={removeModel} className="bg-red-500 text-white py-2 px-3 border-2 border-black font-black uppercase text-xs">{t('deleteModel')}</button>
                    </div>
                  ) : isOnline ? (
                    <button onClick={downloadModel} disabled={downloading} className="w-full bg-brutal-neon text-black py-2 px-3 border-2 border-black font-black uppercase text-xs">{downloading ? t('downloading') : t('download')}</button>
                  ) : (
                    <label className="w-full bg-yellow-400 text-black py-2 px-3 border-2 border-black font-black uppercase text-xs cursor-pointer block">Select Model File(s)<input type="file" accept=".json,.bin" className="hidden" multiple onChange={(e) => { if (e.target.files.length > 0) { downloadModel(); } }} /></label>
                  )}
                </div>
                {/* Preferences */}
                <div className={`border-2 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-black bg-gray-50'} p-3 mb-3 font-mono text-xs`}>
                  <h3 className="font-bold uppercase text-gray-500 mb-2">{t('preferences') || 'Preferences'}</h3>
                  {/* Theme */}
                  <div className={`flex items-center justify-between py-3 border-b ${isDark ? 'border-gray-600' : 'border-black'}`}>
                    <div className="flex items-center gap-2">{isDark ? <Moon size={16} /> : <Sun size={16} />}<span className="font-bold uppercase text-sm">{isDark ? 'Dark Mode' : 'Light Mode'}</span></div>
                    <button onClick={toggleTheme} className="px-4 py-2 border-2 border-black bg-brutal-neon font-black text-sm uppercase active:scale-95">{isDark ? '🌙' : '☀️'}</button>
                  </div>
                  {/* Notifications */}
                  <div className={`flex items-center justify-between py-3 border-b ${isDark ? 'border-gray-600' : 'border-black'}`}>
                    <div className="flex items-center gap-2">{notifications ? <Bell size={16} /> : <BellOff size={16} />}<span className="font-bold uppercase text-sm">{t('notifications') || 'Notifications'}</span></div>
                    <button onClick={toggleNotifications} className={`w-12 h-7 border-2 border-black relative transition-colors ${notifications ? 'bg-brutal-neon' : 'bg-gray-400'}`}><div className={`w-5 h-5 bg-black absolute top-0.5 transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
                  </div>
                  {/* Auto-detect */}
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2"><Smartphone size={16} /><span className="font-bold uppercase text-sm">{t('autoDetectLocation') || 'Auto-detect Zone'}</span></div>
                    <button onClick={toggleAutoDetect} className={`w-12 h-7 border-2 border-black relative transition-colors ${autoDetect ? 'bg-brutal-neon' : 'bg-gray-400'}`}><div className={`w-5 h-5 bg-black absolute top-0.5 transition-transform ${autoDetect ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
                  </div>
                </div>
                {/* App Info */}
                <div className={`border-2 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-black bg-gray-50'} p-3 mb-3 font-mono text-xs`}>
                  <h3 className="font-bold uppercase text-gray-500 mb-2">{t('appInfo') || 'App Info'}</h3>
                  <div className="flex justify-between py-1"><span className="text-gray-400">Version</span><span className="font-bold">1.0.0</span></div>
                  <div className="flex justify-between py-1"><span className="text-gray-400">Build</span><span className="font-bold">Production</span></div>
                  <div className={`flex justify-between py-1 border-t ${isDark ? 'border-gray-600' : 'border-black'} mt-2 pt-2`}><span className="text-gray-400">Storage</span><span className="font-bold">{(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB</span></div>
                </div>
                {/* Danger Zone */}
                <div className="border-2 border-red-500 p-3 bg-red-900/30 font-mono text-xs mb-3">
                  <h3 className="font-bold uppercase text-red-400 mb-2">{t('dangerZone') || 'Danger Zone'}</h3>
                  <button onClick={clearAllData} className="w-full bg-red-500 text-white p-2 border-2 border-black font-bold uppercase flex items-center justify-center gap-2 hover:bg-red-600 active:scale-95"><Trash2 size={14} /> {t('clearAllData') || 'Clear All Data'}</button>
                </div>
              </div>
            </div>
          </FocusTrap>
        </div>
      )}

      <main className="px-2 max-w-sm mx-auto w-full">
        <Suspense fallback={<TabLoader />}>
          <Routes>
            <Route path="/" element={<HomeTab />} />
            <Route path="/scan" element={<CameraScan />} />
            <Route path="/advisory" element={<SoilAdvisory />} />
            <Route path="/network" element={<StateTelemetryMap />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      <Navbar />
    </div>
  );
}

export default App;