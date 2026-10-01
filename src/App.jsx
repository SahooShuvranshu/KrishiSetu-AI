import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Settings, Info, X, HardDrive, Languages, Github, ExternalLink, Moon, Sun, Trash2, Smartphone, KeyRound, ShieldCheck } from 'lucide-react';
import Navbar from './components/ui/Navbar';
import ApiKeyField from './components/ui/ApiKeyField';
import ErrorBoundary from './components/ui/ErrorBoundary';
import StatusBadge from './components/ui/StatusBadge';
import FocusTrap from './components/ui/FocusTrap';
import KrishiSetuLogo from './components/ui/KrishiSetuLogo';
import SplashScreen from './components/ui/SplashScreen';
import { useApp } from './context/AppContext';
import { useToast } from './components/ui/Toast.jsx';
import { formatBytes } from './services/storageService';

// Lazy load tab components for faster initial load
const HomeTab = lazy(() => import('./components/views/HomeTab'));
const CameraScan = lazy(() => import('./components/views/CameraScan'));
const SoilAdvisory = lazy(() => import('./components/views/SoilAdvisory'));

// Loading fallback for lazy components
const TabLoader = ({ t }) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p className="font-mono text-xs uppercase">{t('loadingApp')}</p>
    </div>
  </div>
);

function App() {
  const {
    t, isOnline, isDark, modelDownloaded, downloading,
    modelProgress, modelError, storageInfo, downloadModel, installModelFiles,
    removeModel, clearModelError, appLanguage, changeLanguage, toggleTheme,
    autoDetect, toggleAutoDetect, clearAllData
  } = useApp();
  const toast = useToast();

  // The key fields write themselves to device storage; this is only the
  // confirmation, so the user can see something happened.
  const handleKeyChange = useCallback((result) => {
    if (result === 'saved') toast.success(t('keySaved'), t('settings'));
    else toast.info(t('keyRemoved'), t('settings'));
  }, [toast, t]);

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

  const handleFinishSplash = useCallback(() => {
    setIsSplashing(false);
    sessionStorage.setItem('krishisetu_splashed', 'true');
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleEscapeKey);
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [handleEscapeKey]);

  if (isSplashing) {
    return <SplashScreen onFinish={handleFinishSplash} duration={2400} />;
  }

  return (
    <div className={`min-h-screen pb-16 font-sans relative flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-brutal-bg bg-agri-grid text-black'
    }`}>
      <div className={`h-4 w-full bg-brutal-neon bg-tractor-tread border-b-4 ${isDark ? 'border-gray-700' : 'border-black'}`}></div>
      <header className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-black'} border-b-4 px-2 py-1.5 sticky top-0 z-40 flex justify-between items-center shadow-brutal mb-2 transition-colors`}>
        <div className="flex items-center gap-2">
          <KrishiSetuLogo size={32} />
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
            aria-label={t('aboutTitle')}
          >
            <Info size={16} />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className={`p-1.5 border-2 ${isDark ? 'bg-gray-700 border-gray-600 hover:bg-brutal-neon hover:text-black' : 'bg-gray-100 border-black hover:bg-brutal-neon'} shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all`}
            aria-label={t('settings')}
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in" role="dialog" aria-modal="true" aria-label={t('aboutTitle')}>
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowInfo(false)} />
          <FocusTrap>
            <div className={`${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-black'} border-4 w-[calc(100%-1rem)] sm:w-full sm:max-w-sm max-h-[90vh] relative shadow-brutal-neon overflow-hidden flex flex-col transition-colors z-10`}>
              <div className={`px-4 py-3 border-b-2 ${isDark ? 'border-gray-600' : 'border-black'} flex-shrink-0 flex items-center justify-between`}>
                <h2 className="font-black text-lg uppercase">{t('aboutTitle')}</h2>
                <button onClick={() => setShowInfo(false)} className="p-1.5 border-2 border-black bg-red-500 text-white active:scale-95"><X size={18} /></button>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                <div className="font-mono text-sm">
                  <p className="font-bold uppercase text-gray-500 mb-1">{t('projectNameLabel')}</p>
                  <p className="text-base font-black bg-brutal-green text-white p-2 border-2 border-black mb-3">Krishi Setu AI</p>
                  <p className="font-bold uppercase text-gray-500 mb-1">{t('teamNameLabel')}</p>
                  <p className="text-base font-black bg-brutal-neon p-2 border-2 border-black mb-1">Crystal Studio Labs</p>
                  <div className={`p-2 border-2 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-black bg-gray-50'} mb-3 text-[11px] leading-tight flex flex-col gap-1`}>
                    <a href="https://github.com/SahooShuvranshu" target="_blank" rel="noopener noreferrer" className="font-bold hover:underline text-blue-600 dark:text-blue-400">👤 Shuvransu Sekhar Sahoo (Lead Architect)</a>
                    <a href="https://github.com/SnehalMoharana" target="_blank" rel="noopener noreferrer" className="font-bold hover:underline text-blue-600 dark:text-blue-400">👤 Snehal Kumar Moharana (Frontend &amp; Agronomy)</a>
                    <a href="https://github.com/Subhankar101" target="_blank" rel="noopener noreferrer" className="font-bold hover:underline text-blue-600 dark:text-blue-400">👤 Subhankar Mohapatra (UX &amp; Speech)</a>
                    <a href="https://github.com/Pruthiraj2007" target="_blank" rel="noopener noreferrer" className="font-bold hover:underline text-blue-600 dark:text-blue-400">👤 Pruthiraj Lenka (Research &amp; Radar)</a>
                  </div>
                  <p className="font-bold uppercase text-gray-500 mb-1">{t('hackathonLabel')}</p>
                  <p className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-2 border-2 ${isDark ? 'border-gray-600' : 'border-black'} mb-3`}>Build with AI: Code for Communities - Second Edition</p>
                  <p className="font-bold uppercase text-gray-500 mb-1">{t('trackThemeLabel')}</p>
                  <p className={`text-xs font-bold ${isDark ? 'bg-gray-700' : 'bg-yellow-100'} p-2 border-2 ${isDark ? 'border-gray-600' : 'border-black'} mb-3`}>{t('trackThemeValue')}</p>
                  <p className="font-bold uppercase text-gray-500 mb-1">{t('aboutLabel')}</p>
                  <p className={`text-xs leading-relaxed ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-black'} border-2 p-3 mb-4`}>{t('aboutBody')}</p>
                  <div className="flex gap-3">
                    <a href="https://sahooshuvranshu.is-a.dev/KrishiSetu-AI/" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 bg-brutal-neon text-black border-2 border-black hover:bg-white transition-all font-bold uppercase text-sm shadow-brutal-xl active:shadow-none active:translate-x-1 active:translate-y-1"><ExternalLink size={16} /> {t('showcase')}</a>
                    <a href="https://github.com/SahooShuvranshu/KrishiSetu-AI" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-all font-bold uppercase text-sm shadow-brutal-xl active:shadow-none active:translate-x-1 active:translate-y-1"><Github size={16} /> {t('source')}</a>
                  </div>
                </div>
              </div>
            </div>
          </FocusTrap>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in" role="dialog" aria-modal="true" aria-label={t('settings')}>
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowSettings(false)} />
          <FocusTrap>
            <div className={`${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-black'} border-4 w-[calc(100%-1rem)] sm:w-full sm:max-w-sm max-h-[90vh] relative shadow-brutal-neon transition-colors overflow-hidden flex flex-col z-10`}>
              <div className={`flex-shrink-0 px-4 py-3 border-b-2 ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-black'} flex items-center justify-between`}>
                <h2 className="font-black text-lg uppercase">{t('settings')}</h2>
                <button onClick={() => setShowSettings(false)} className="p-1.5 border-2 border-black bg-red-500 text-white active:scale-95"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {/* API keys. Entered by the user, stored on their own device, and
                    never bundled with the app. */}
                <div className={`border-2 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-black bg-gray-50'} p-3 mb-3 font-mono text-xs`}>
                  <h3 className="font-bold uppercase text-gray-500 mb-2 flex items-center gap-1.5">
                    <KeyRound size={14} /> {t('apiKeysSection')}
                  </h3>
                  <ApiKeyField id="gemini" labelKey="geminiKeyLabel" hintKey="geminiKeyHint" onSaved={handleKeyChange} />
                  <ApiKeyField id="maps" labelKey="mapsKeyLabel" hintKey="mapsKeyHint" onSaved={handleKeyChange} />
                  <p className="text-[10px] text-green-600 font-bold leading-snug flex items-start gap-1">
                    <ShieldCheck size={12} className="shrink-0 mt-0.5" /> {t('keysDeviceNote')}
                  </p>
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
                  ) : (isOnline || downloading) ? (
                    // `|| downloading` pins this branch while a download runs:
                    // a mid-download network blip used to morph the button into
                    // the offline file-picker, which looked like the button
                    // reverting for no reason.
                    <div className="flex flex-col gap-1.5">
                      <button onClick={downloadModel} disabled={downloading} className="w-full bg-brutal-neon text-black py-2 px-3 border-2 border-black font-black uppercase text-xs">{downloading ? t('downloading') : t('download')}</button>
                      {downloading && (
                        <div className="w-full bg-gray-300 border-2 border-black h-3" role="progressbar" aria-valuenow={modelProgress} aria-valuemin="0" aria-valuemax="100">
                          <div className="bg-brutal-neon h-full transition-all" style={{ width: modelProgress + '%' }} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className="w-full bg-yellow-400 text-black py-2 px-3 border-2 border-black font-black uppercase text-xs cursor-pointer block">
                      {t('selectModelFiles') || 'Select Model File(s)'}
                      <input
                        type="file"
                        accept=".json,.bin"
                        className="hidden"
                        multiple
                        onChange={(e) => { if (e.target.files && e.target.files.length > 0) installModelFiles(e.target.files); e.target.value = ''; }}
                      />
                    </label>
                  )}

                  {modelError && (
                    <div className="mt-2 bg-red-100 border-2 border-red-500 p-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-black text-[10px] uppercase text-red-700">{t('modelInstallFailed') || 'Install failed'}</p>
                        <button onClick={clearModelError} aria-label="Dismiss" className="text-red-700 font-black text-xs leading-none px-1 active:scale-95">✕</button>
                      </div>
                      <p className="font-mono text-[9px] text-red-700 leading-snug break-words">{modelError}</p>
                    </div>
                  )}

                  {storageInfo && (
                    <p className="mt-2 font-mono text-[9px] text-gray-500 leading-snug">
                      {t('storageStatus')}: {formatBytes(storageInfo.usage)}
                      {storageInfo.quota ? ' / ' + formatBytes(storageInfo.quota) : ''}
                      {' - '}
                      {storageInfo.persisted ? t('storagePersisted') : t('storageBestEffort')}
                    </p>
                  )}
                </div>
                {/* Preferences */}
                <div className={`border-2 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-black bg-gray-50'} p-3 mb-3 font-mono text-xs`}>
                  <h3 className="font-bold uppercase text-gray-500 mb-2">{t('preferences') || 'Preferences'}</h3>
                  {/* Theme */}
                  <div className={`flex items-center justify-between py-3 border-b ${isDark ? 'border-gray-600' : 'border-black'}`}>
                    <div className="flex items-center gap-2">{isDark ? <Moon size={16} /> : <Sun size={16} />}<span className="font-bold uppercase text-sm">{isDark ? t('darkMode') : t('lightMode')}</span></div>
                    <button onClick={toggleTheme} className="px-4 py-2 border-2 border-black bg-brutal-neon font-black text-sm uppercase active:scale-95">{isDark ? '🌙' : '☀️'}</button>
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
                  <div className="flex justify-between py-1"><span className="text-gray-400">{t('versionLabel')}</span><span className="font-bold">1.0.0</span></div>
                  <div className="flex justify-between py-1"><span className="text-gray-400">{t('buildLabel')}</span><span className="font-bold">{t('productionLabel')}</span></div>
                  <div className={`flex justify-between py-1 border-t ${isDark ? 'border-gray-600' : 'border-black'} mt-2 pt-2`}><span className="text-gray-400">{t('storageLabel')}</span><span className="font-bold">{(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB</span></div>
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
        <ErrorBoundary t={t}>
        <Suspense fallback={<TabLoader t={t} />}>
          <Routes>
            <Route path="/" element={<HomeTab />} />
            <Route path="/scan" element={<CameraScan />} />
            <Route path="/advisory" element={<SoilAdvisory />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </main>

      <Navbar />
    </div>
  );
}

export default App;