import React from 'react';
import { Camera, Map, Leaf } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, t }) {
  const tabs = [
    { id: 'scan', icon: <Camera size={24} />, label: t('cropDoctor') },
    { id: 'advisory', icon: <Leaf size={24} />, label: t('farmAdvice') },
    { id: 'network', icon: <Map size={24} />, label: t('alerts') },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t-4 border-black z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-full border-r-2 border-black last:border-r-0 transition-all ${
              activeTab === tab.id 
                ? 'bg-brutal-neon text-black font-black' 
                : 'text-gray-500 hover:bg-gray-100 font-bold'
            }`}
          >
            <div className={`${activeTab === tab.id ? 'animate-bounce' : ''}`}>
              {tab.icon}
            </div>
            <span className="text-[10px] mt-1 font-mono uppercase tracking-wider text-center px-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
