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
    <div className="flex flex-col gap-2.5 animate-fade-in pb-8 bg-dots">
      {/* Hero Section */}
      <div className="bg-black text-white p-3 border-2 border-black shadow-brutal relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-brutal-neon opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-brutal-neon text-black border-2 border-black flex items-center justify-center text-2xl shadow-[3px_3px_0_0_#ccff00]">
              🚜
            </div>
            <div>
              <h1 className="text-xl font-black uppercase leading-none">{t('appTitle')}</h1>
              <p className="font-mono text-[8px] text-brutal-neon mt-0.5">{t('appSubtitle')}</p>
            </div>
          </div>
          <StatusBadge isOnline={isOnline} />
        </div>
      </div>

      {/* Offline Status */}
      <div className={`border-2 border-black p-2.5 ${isOnline ? 'bg-green-100' : 'bg-yellow-100'}`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 border-2 border-black ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}>
            {isOnline ? <Wifi size={16} className="text-white" /> : <WifiOff size={16} className="text-white" />}
          </div>
          <div className="flex-1">
            <p className="font-black text-xs uppercase">
              {isOnline ? '🟢 Online Mode' : '🔴 Offline Mode'}
            </p>
            <p className="font-mono text-[9px] text-gray-600">
              {isOnline ? 'Full AI available.' : 'AI runs locally. No internet needed.'}
            </p>
          </div>
        </div>
      </div>

      {/* Model Status */}
      <div className={`border-2 border-black p-2.5 ${modelReady ? 'bg-brutal-neon' : 'bg-white'}`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 border-2 border-black ${modelReady ? 'bg-black text-brutal-neon' : 'bg-gray-200'}`}>
            {modelReady ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          </div>
          <div className="flex-1">
            <p className="font-black text-xs uppercase">
              {modelReady ? '✅ AI Model Ready' : '⚠️ AI Model Not Installed'}
            </p>
            <p className="font-mono text-[9px] text-gray-600">
              {modelReady ? 'Cached. Works offline.' : 'Settings → Download Model.'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-1.5">
        {features.map((feature, idx) => (
          <button
            key={idx}
            onClick={feature.action}
            className="bg-white border-2 border-black p-2.5 flex flex-col items-center gap-1.5 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-[2px_2px_0_0_#000] relative"
          >
            {feature.badge && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center border border-black">
                {feature.badge}
              </span>
            )}
            <div className={`${feature.color} p-2 border-2 border-black`}>
              {feature.icon}
            </div>
            <span className="font-black text-[9px] uppercase text-center leading-tight">{feature.title}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0_0_#000] text-center">
          <Cpu size={16} className="mx-auto mb-0.5 text-brutal-green" />
          <p className="font-black text-sm">{modelReady ? '✓' : '✗'}</p>
          <p className="font-mono text-[7px] text-gray-500 uppercase">AI Model</p>
        </div>
        <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0_0_#000] text-center">
          <Camera size={16} className="mx-auto mb-0.5 text-blue-500" />
          <p className="font-black text-sm">{scanCount}</p>
          <p className="font-mono text-[7px] text-gray-500 uppercase">Scans</p>
        </div>
        <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0_0_#000] text-center">
          <HardDrive size={16} className="mx-auto mb-0.5 text-purple-500" />
          <p className="font-black text-sm">3</p>
          <p className="font-mono text-[7px] text-gray-500 uppercase">Languages</p>
        </div>
      </div>

      {/* How Offline Works */}
      <div className="bg-white border-2 border-black p-2.5">
        <h3 className="font-black text-xs uppercase mb-2 flex items-center gap-1.5">
          <span className="text-sm">🔌</span> How Offline Works
        </h3>
        <div className="space-y-1.5">
          {[
            'AI model downloads to your phone once (15MB)',
            'Model runs in browser - no server needed',
            'Photos never leave your device - 100% private',
            'Alerts queue locally, sync when online'
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="bg-brutal-neon text-black text-[8px] font-black px-1.5 py-0.5 border border-black shrink-0">{i+1}</span>
              <p className="font-mono text-[9px] text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="flex gap-1.5">
        <a href="https://sahooshuvranshu.is-a.dev/KrishiSetu-AI/" target="_blank" rel="noopener noreferrer" className="flex-1 bg-white border-2 border-black p-2 flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors shadow-[2px_2px_0_0_#000]">
          <ExternalLink size={12} />
          <span className="font-black text-[10px] uppercase">{t('showcase') || 'Showcase'}</span>
        </a>
        <a href="https://github.com/SahooShuvranshu/KrishiSetu-AI" target="_blank" rel="noopener noreferrer" className="flex-1 bg-white border-2 border-black p-2 flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors shadow-[2px_2px_0_0_#000]">
          <Github size={12} />
          <span className="font-black text-[10px] uppercase">{t('source') || 'Source'}</span>
        </a>
      </div>
    </div>
  );
}
