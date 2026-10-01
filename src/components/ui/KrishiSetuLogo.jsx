import React from 'react';
import PropTypes from 'prop-types';

/**
 * KrishiSetu AI (KSA) Master Logo
 * Bespoke Neo-Brutalist Vector Tractor Logo
 */
export default function KrishiSetuLogo({ size = 32, className = '', animated = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${animated ? 'animate-bounce' : ''} ${className}`}
      aria-label="KrishiSetu AI Tractor Logo"
    >
      {/* Neo-Brutalist Badge Background */}
      <rect x="7" y="7" width="88" height="88" rx="18" fill="#000000" />
      <rect x="4" y="4" width="88" height="88" rx="18" fill="#CCFF00" stroke="#000000" strokeWidth="4" />

      {/* Exhaust Pipe & Stack */}
      <path d="M68 42 L68 24 C68 21 71 19 74 21" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="68" cy="24" rx="2.5" ry="1.5" fill="#000000" />

      {/* Cab Roof */}
      <rect x="32" y="21" width="30" height="6" rx="2.5" fill="#000000" />

      {/* Cab Pillars & Windows */}
      <path d="M37 46 L40 26 L58 26 L60 46" stroke="#000000" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
      <polygon points="42,29 56,29 57,43 39,43" fill="#000000" fillOpacity="0.18" />

      {/* Rear Heavy Mudguard */}
      <path d="M12 60 C12 43 21 38 39 40" stroke="#000000" strokeWidth="7" strokeLinecap="round" />

      {/* Tractor Engine Hood & Chassis Body (Tractor Green) */}
      <path d="M39 43 L73 43 C77 43 79 46 80 49 L83 57 C84 61 81 65 77 65 L39 65 Z" fill="#14532D" stroke="#000000" strokeWidth="4" strokeLinejoin="round" />

      {/* Headlight Signal */}
      <polygon points="79,47 84,49 83,55 78,53" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />

      {/* Cooling Grille Accents */}
      <line x1="61" y1="48" x2="61" y2="56" stroke="#CCFF00" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="66" y1="48" x2="66" y2="56" stroke="#CCFF00" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="71" y1="48" x2="71" y2="56" stroke="#CCFF00" strokeWidth="2.5" strokeLinecap="round" />

      {/* Front Axle */}
      <rect x="68" y="62" width="10" height="5" fill="#000000" />

      {/* Rear Wheel */}
      <circle cx="32" cy="63" r="19" fill="#000000" />
      <circle cx="32" cy="63" r="13" fill="#CCFF00" stroke="#000000" strokeWidth="3.5" />
      <circle cx="32" cy="63" r="6" fill="#000000" />
      <circle cx="32" cy="63" r="2.5" fill="#CCFF00" />

      {/* Front Wheel */}
      <circle cx="75" cy="68" r="12" fill="#000000" />
      <circle cx="75" cy="68" r="7.5" fill="#CCFF00" stroke="#000000" strokeWidth="2.5" />
      <circle cx="75" cy="68" r="3" fill="#000000" />

      {/* Ground Furrow Line */}
      <line x1="14" y1="84" x2="86" y2="84" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="8 6" />
    </svg>
  );
}

KrishiSetuLogo.propTypes = {
  size: PropTypes.number,
  className: PropTypes.string,
  animated: PropTypes.bool
};
