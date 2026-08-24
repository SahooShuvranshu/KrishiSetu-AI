import React from 'react';
import PropTypes from 'prop-types';
import { Wifi, WifiOff } from 'lucide-react';

StatusBadge.propTypes = {
  isOnline: PropTypes.bool.isRequired
};

export default function StatusBadge({ isOnline }) {
  return (
    <div 
      className={`flex items-center gap-1 px-2 py-1 border-2 border-black font-mono text-[10px] font-black uppercase ${
        isOnline 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white animate-pulse'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi size={12} />
          <span>ONLINE</span>
        </>
      ) : (
        <>
          <WifiOff size={12} />
          <span>OFFLINE</span>
        </>
      )}
    </div>
  );
}
