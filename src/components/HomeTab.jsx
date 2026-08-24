import React from 'react';
import PropTypes from 'prop-types';
import { Camera, Leaf, Map, Wifi, WifiOff, Github, ExternalLink } from 'lucide-react';
import StatusBadge from './StatusBadge';

HomeTab.propTypes = {
  t: PropTypes.func.isRequired,
  appLanguage: PropTypes.string.isRequired,
  isOnline: PropTypes.bool.isRequired,
  setActiveTab: PropTypes.func.isRequired
};

export default function HomeTab({ t, appLanguage, isOnline, setActiveTab }) {
  const features = [
    {
      icon: <Camera size={24} />,
      title: t('cropDoctor'),
      desc: { en: 'AI-powered crop disease detection', or: 'ଏଆଇ ଫସଲ ରୋଗ ଚିହ୍ନଟ', hi: 'एआई फसल रोग पहचान' },
      action: () => setActiveTab('scan'),
      color: 'bg-brutal-neon'
    },
    {
      icon: <Leaf size={24} />,
      title: t('farmAdvice'),
      desc: { en: 'Weather, calendar & market prices', or: 'ପାଗ, କ୍ୟାଲେଣ୍ଡର ଏବଂ ବଜାର ଦାମ', hi: 'मौसम, कैलेंडर और बाजार भाव' },
      action: () => setActiveTab('advisory'),
      color: 'bg-green-500'
    },
    {
      icon: <Map size={24} />,
      title: t('alerts'),
      desc: { en: 'Real-time disease alerts map', or: 'ରିଅଲ-ଟାଇମ୍ ରୋଗ ସତର୍କ ମାନଚିତ୍ର', hi: 'रियल-टाइम रोग चेतावनी मानचित्र' },
      action: () => setActiveTab('network'),
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-8 bg-dots">
      {/* Hero Section */}
      <div className="bg-black text-white p-6 border-2 border-black shadow-brutal relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brutal-neon opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-brutal-neon text-black border-2 border-black flex items-center justify-center text-3xl shadow-[4px_4px_0_0_#ccff00]">
              🚜
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase leading-none">{t('appTitle')}</h1>
              <p className="font-mono text-[10px] text-brutal-neon mt-1">{t('appSubtitle')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <StatusBadge isOnline={isOnline} />
            <span className="font-mono text-[9px] text-gray-400">
              {new Date().toLocaleDateString(appLanguage === 'hi' ? 'hi-IN' : appLanguage === 'or' ? 'or-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>

          <p className="font-mono text-xs text-gray-300 leading-relaxed">
            {appLanguage === 'hi' 
              ? 'भारतीय किसानों के लिए बना ऑफलाइन AI फसल रोग विशेषज्ञ। बिना इंटरनेट के काम करता है।'
              : appLanguage === 'or'
              ? 'ଭାରତୀୟ କୃଷକମାନଙ୍କ ପାଇଁ ନିର୍ମିତ ଅଫଲାଇନ୍ ଏଆଇ ଫସଲ ରୋଗ ବିଶେଷଜ୍ଞ। ବିନା ଇଣ୍ଟରନେଟରେ କାମ କରେ।'
              : 'Offline-first AI crop pathologist built for Indian farmers. Works without internet.'
            }
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        {features.map((feature, idx) => (
          <button
            key={idx}
            onClick={feature.action}
            className="bg-white border-2 border-black p-3 flex flex-col items-center gap-2 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-[2px_2px_0_0_#000]"
          >
            <div className={`${feature.color} p-2 border-2 border-black`}>
              {feature.icon}
            </div>
            <span className="font-black text-[10px] uppercase text-center">{feature.title}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white border-2 border-black p-3 shadow-[2px_2px_0_0_#000]">
          <p className="font-mono text-[9px] text-gray-500 uppercase">{t('supportedLanguages') || 'Languages'}</p>
          <p className="font-black text-xl">3</p>
          <p className="font-mono text-[9px] text-gray-600">EN • OR • HI</p>
        </div>
        <div className="bg-white border-2 border-black p-3 shadow-[2px_2px_0_0_#000]">
          <p className="font-mono text-[9px] text-gray-500 uppercase">{t('cropsSupported') || 'Crops'}</p>
          <p className="font-black text-xl">5+</p>
          <p className="font-mono text-[9px] text-gray-600">{t('paddyCotton') || 'Paddy, Cotton...'}</p>
        </div>
      </div>

      {/* Offline Info */}
      <div className={`border-2 border-black p-3 ${isOnline ? 'bg-green-50' : 'bg-yellow-50'}`}>
        <div className="flex items-center gap-2 mb-2">
          {isOnline ? <Wifi size={16} className="text-green-600" /> : <WifiOff size={16} className="text-yellow-600" />}
          <span className="font-black text-xs uppercase">
            {isOnline ? (t('onlineMode') || 'Online Mode') : (t('offlineMode') || 'Offline Mode')}
          </span>
        </div>
        <p className="font-mono text-[10px] text-gray-600">
          {isOnline 
            ? (t('onlineDesc') || 'Full AI diagnosis available. Weather and market data updating.')
            : (t('offlineDesc') || 'Basic diagnosis available. Weather and prices may be outdated.')
          }
        </p>
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
