import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Camera, Leaf, Map, Wifi, WifiOff, Github, ExternalLink, Cpu, HardDrive, CheckCircle, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';

HomeTab.propTypes = {
  t: PropTypes.func.isRequired,
  appLanguage: PropTypes.string.isRequired,
  isOnline: PropTypes.bool.isRequired,
  setActiveTab: PropTypes.func.isRequired
};

export default function HomeTab({ t, appLanguage, isOnline, setActiveTab }) {
  const [modelReady, setModelReady] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [pendingAlerts, setPendingAlerts] = useState(0);

  useEffect(() => {
    // Check model status
    setModelReady(localStorage.getItem('krishisetu_model_downloaded') === 'true');
    // Get scan count
    const history = JSON.parse(localStorage.getItem('krishisetu_scan_history') || '[]');
    setScanCount(history.length);
    // Get pending alerts
    const alerts = JSON.parse(localStorage.getItem('krishisetu_alerts') || '[]');
    setPendingAlerts(alerts.filter(a => a.status === 'pending').length);
  }, []);

  const features = [
    {
      icon: <Camera size={28} />,
      title: t('cropDoctor'),
      desc: { en: 'AI crop disease detection', or: 'ଏଆଇ ଫସଲ ରୋଗ ଚିହ୍ନଟ', hi: 'एआई फसल रोग पहचान' },
      action: () => setActiveTab('scan'),
      color: 'bg-brutal-neon',
      badge: modelReady ? '✓' : '⚡'
    },
    {
      icon: <Leaf size={28} />,
      title: t('farmAdvice'),
      desc: { en: 'Weather, calendar & prices', or: 'ପାଗ, କ୍ୟାଲେଣ୍ଡର ଏବଂ ଦାମ', hi: 'मौसम, कैलेंडर और भाव' },
      action: () => setActiveTab('advisory'),
      color: 'bg-green-500',
      badge: null
    },
    {
      icon: <Map size={28} />,
      title: t('alerts'),
      desc: { en: 'Disease alerts network', or: 'ରୋଗ ସତର୍କ ନେଟୱାର୍କ', hi: 'रोग चेतावनी नेटवर्क' },
      action: () => setActiveTab('network'),
      color: 'bg-red-500',
      badge: pendingAlerts > 0 ? pendingAlerts : null
    }
  ];

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-8 bg-dots">
      {/* Hero Section - Offline First Focus */}
      <div className="bg-black text-white p-5 border-2 border-black shadow-brutal relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-brutal-neon opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-brutal-green opacity-10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 bg-brutal-neon text-black border-2 border-black flex items-center justify-center text-4xl shadow-[4px_4px_0_0_#ccff00]">
              🚜
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase leading-none">{t('appTitle')}</h1>
              <p className="font-mono text-[10px] text-brutal-neon mt-1">{t('appSubtitle')}</p>
            </div>
          </div>
          
          <StatusBadge isOnline={isOnline} />
        </div>
      </div>

      {/* Offline Status Banner */}
      <div className={`border-2 border-black p-4 ${isOnline ? 'bg-green-100' : 'bg-yellow-100'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 border-2 border-black ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}>
            {isOnline ? <Wifi size={20} className="text-white" /> : <WifiOff size={20} className="text-white" />}
          </div>
          <div className="flex-1">
            <p className="font-black text-sm uppercase">
              {isOnline ? '🟢 Online Mode' : '🔴 Offline Mode'}
            </p>
            <p className="font-mono text-[10px] text-gray-600 mt-1">
              {isOnline 
                ? 'Full AI available. Syncing data in background...'
                : 'AI model runs locally. No internet needed for diagnosis.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Model Status */}
      <div className={`border-2 border-black p-4 ${modelReady ? 'bg-brutal-neon' : 'bg-white'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 border-2 border-black ${modelReady ? 'bg-black text-brutal-neon' : 'bg-gray-200'}`}>
            {modelReady ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          </div>
          <div className="flex-1">
            <p className="font-black text-sm uppercase">
              {modelReady ? '✅ AI Model Ready' : '⚠️ AI Model Not Installed'}
            </p>
            <p className="font-mono text-[10px] text-gray-600 mt-1">
              {modelReady 
                ? 'TensorFlow.js model cached. Works offline.'
                : 'Go to Settings → Download Model for offline diagnosis.'
              }
            </p>
          </div>
          {!modelReady && (
            <button 
              onClick={() => setActiveTab('home')}
              className="bg-brutal-neon text-black px-3 py-2 border-2 border-black font-black text-xs uppercase"
            >
              Install
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        {features.map((feature, idx) => (
          <button
            key={idx}
            onClick={feature.action}
            className="bg-white border-2 border-black p-4 flex flex-col items-center gap-2 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-[2px_2px_0_0_#000] relative"
          >
            {feature.badge && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center border border-black">
                {feature.badge}
              </span>
            )}
            <div className={`${feature.color} p-3 border-2 border-black`}>
              {feature.icon}
            </div>
            <span className="font-black text-[10px] uppercase text-center">{feature.title}</span>
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border-2 border-black p-3 shadow-[2px_2px_0_0_#000] text-center">
          <Cpu size={20} className="mx-auto mb-1 text-brutal-green" />
          <p className="font-black text-lg">{modelReady ? '✓' : '✗'}</p>
          <p className="font-mono text-[8px] text-gray-500 uppercase">AI Model</p>
        </div>
        <div className="bg-white border-2 border-black p-3 shadow-[2px_2px_0_0_#000] text-center">
          <Camera size={20} className="mx-auto mb-1 text-blue-500" />
          <p className="font-black text-lg">{scanCount}</p>
          <p className="font-mono text-[8px] text-gray-500 uppercase">Scans</p>
        </div>
        <div className="bg-white border-2 border-black p-3 shadow-[2px_2px_0_0_#000] text-center">
          <HardDrive size={20} className="mx-auto mb-1 text-purple-500" />
          <p className="font-black text-lg">3</p>
          <p className="font-mono text-[8px] text-gray-500 uppercase">Languages</p>
        </div>
      </div>

      {/* How Offline Works */}
      <div className="bg-white border-2 border-black p-4">
        <h3 className="font-black text-sm uppercase mb-3 flex items-center gap-2">
          <span className="text-xl">🔌</span> How Offline Works
        </h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="bg-brutal-neon text-black text-[10px] font-black px-2 py-0.5 border border-black">1</span>
            <p className="font-mono text-[10px] text-gray-600">AI model downloads to your phone once (15MB)</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-brutal-neon text-black text-[10px] font-black px-2 py-0.5 border border-black">2</span>
            <p className="font-mono text-[10px] text-gray-600">Model runs in browser - no server needed</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-brutal-neon text-black text-[10px] font-black px-2 py-0.5 border border-black">3</span>
            <p className="font-mono text-[10px] text-gray-600">Photos never leave your device - 100% private</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-brutal-neon text-black text-[10px] font-black px-2 py-0.5 border border-black">4</span>
            <p className="font-mono text-[10px] text-gray-600">Alerts queue locally, sync when online</p>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="flex gap-2">
        <a
          href="https://sahooshuvranshu.is-a.dev/KrishiSetu-AI/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-white border-2 border-black p-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-[2px_2px_0_0_#000]"
        >
          <ExternalLink size={16} />
          <span className="font-black text-xs uppercase">{t('showcase') || 'Showcase'}</span>
        </a>
        <a
          href="https://github.com/SahooShuvranshu/KrishiSetu-AI"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-white border-2 border-black p-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-[2px_2px_0_0_#000]"
        >
          <Github size={16} />
          <span className="font-black text-xs uppercase">{t('source') || 'Source'}</span>
        </a>
      </div>
    </div>
  );
}
