import React from 'react';
import PropTypes from 'prop-types';
import { Wifi, WifiOff } from 'lucide-react';

StatusBadge.propTypes = {
  isOnline: PropTypes.bool.isRequired
};

export default function StatusBadge({ isOnline }) {
  return (
    <div 
      className={`flex items-center gap-0.5 px-1.5 py-0.5 border-2 border-black font-mono text-[8px] font-black uppercase ${
        isOnline 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white animate-pulse'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi size={10} />
          <span>ON</span>
        </>
      ) : (
        <>
          <WifiOff size={10} />
          <span>OFF</span>
        </>
      )}
    </div>
  );
}
