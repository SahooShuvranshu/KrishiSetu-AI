import React from 'react';
import PropTypes from 'prop-types';

ScanAnimation.propTypes = {
  isActive: PropTypes.bool.isRequired,
  message: PropTypes.string
};

export default function ScanAnimation({ isActive, message = 'SCANNING...' }) {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-40 overflow-hidden bg-black/90">
      {/* Scanning line animation */}
      <div className="absolute inset-0">
        {/* Horizontal scan line */}
        <div 
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brutal-neon to-transparent"
          style={{
            animation: 'scanLine 2s ease-in-out infinite',
            boxShadow: '0 0 20px 10px rgba(204, 255, 0, 0.3)'
          }}
        />
        
        {/* Corner brackets */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-brutal-neon" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-brutal-neon" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-brutal-neon" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-brutal-neon" />
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(204, 255, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(204, 255, 0, 0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
      </div>
      
      {/* Status text */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <div className="inline-block bg-black border-2 border-brutal-neon px-6 py-3">
          <p className="font-mono text-brutal-neon text-sm tracking-widest uppercase animate-pulse">
            {message}
          </p>
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-2 h-2 bg-brutal-neon animate-ping" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-brutal-neon animate-ping" style={{ animationDelay: '200ms' }} />
            <div className="w-2 h-2 bg-brutal-neon animate-ping" style={{ animationDelay: '400ms' }} />
          </div>
        </div>
      </div>
      
      {/* CSS Animation */}
      <style>{`
        @keyframes scanLine {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}
