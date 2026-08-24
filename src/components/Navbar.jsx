import React from 'react';
import PropTypes from 'prop-types';
import { Camera, Map, Leaf, Home } from 'lucide-react';

Navbar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

export default function Navbar({ activeTab, setActiveTab, t }) {
  const tabs = [
    { id: 'home', icon: <Home size={22} />, label: t('home') || 'Home' },
    { id: 'scan', icon: <Camera size={22} />, label: t('cropDoctor') },
    { id: 'advisory', icon: <Leaf size={22} />, label: t('farmAdvice') },
    { id: 'network', icon: <Map size={22} />, label: t('alerts') },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t-4 border-black z-50 shadow-[0_-4px_0_0_#000]">
      <div className="flex justify-around items-stretch h-[68px] max-w-lg mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full border-r-2 border-black last:border-r-0 transition-all duration-150 ${
              activeTab === tab.id 
                ? 'bg-brutal-neon text-black font-black shadow-[inset_0_4px_0_0_#000]' 
                : 'bg-white text-gray-500 hover:bg-gray-100 font-bold active:bg-gray-200'
            }`}
          >
            <div className={`transition-transform duration-150 ${
              activeTab === tab.id 
                ? 'scale-110 drop-shadow-[1px_1px_0_rgba(0,0,0,1)]' 
                : 'scale-100'
            }`}>
              {tab.icon}
            </div>
            <span className="text-[9px] mt-1 font-mono uppercase tracking-wider text-center">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
