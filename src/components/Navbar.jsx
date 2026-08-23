import React from 'react';
import { Camera, Map, Leaf } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, t }) {
  const tabs = [
    { id: 'scan', icon: <Camera size={24} />, label: t('cropDoctor') },
    { id: 'advisory', icon: <Leaf size={24} />, label: t('farmAdvice') },
    { id: 'network', icon: <Map size={24} />, label: t('alerts') },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t-8 border-black z-50 shadow-[0_-4px_0_0_rgba(0,0,0,1)]">
      <div className="flex justify-around items-stretch h-[72px] max-w-lg mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-full border-r-4 border-black last:border-r-0 transition-all ${
              activeTab === tab.id 
                ? 'bg-brutal-neon text-black font-black border-b-8 border-b-black shadow-[inset_0_4px_0_0_#000]' 
                : 'bg-white text-gray-500 hover:bg-soil-gray font-bold border-b-8 border-b-transparent'
            }`}
          >
            <div className={`${activeTab === tab.id ? '-translate-y-1 scale-110 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]' : 'scale-100'} transition-transform duration-200`}>
              {tab.icon}
            </div>
            <span className="text-[10px] mt-1 font-mono uppercase tracking-widest text-center px-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
