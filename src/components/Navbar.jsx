import React from 'react';
import { NavLink } from 'react-router-dom';
import { Camera, Leaf, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { t } = useApp();

  const tabs = [
    { id: 'home', to: '/', icon: <Home size={22} />, label: t('home') || 'Home' },
    { id: 'scan', to: '/scan', icon: <Camera size={22} />, label: t('cropDoctor') },
    { id: 'advisory', to: '/advisory', icon: <Leaf size={22} />, label: t('farmAdvice') },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t-4 border-black z-40 shadow-brutal-top">
      <div className="flex justify-around items-stretch h-[56px] max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.to}
            end={tab.id === 'home'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full border-r-2 border-black last:border-r-0 transition-all duration-150 ${
                isActive
                  ? 'bg-brutal-neon text-black font-black shadow-brutal-inset-top'
                  : 'bg-white text-gray-500 hover:bg-gray-100 font-bold active:bg-gray-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`transition-transform duration-150 ${
                  isActive ? 'scale-110 drop-shadow-brutal' : 'scale-100'
                }`}>
                  {tab.icon}
                </div>
                <span className="text-[8px] mt-0.5 font-mono uppercase tracking-wider text-center leading-none">
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}