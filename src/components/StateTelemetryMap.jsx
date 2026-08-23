import React, { useState, useEffect, useRef } from 'react';
import { Bell, MapPin } from 'lucide-react';
import { getTelemetryData } from '../multilingual_data';

export default function StateTelemetryMap({ t, appLanguage, isOnline }) {
  const [alerts, setAlerts] = useState([]);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    const baseData = getTelemetryData(appLanguage);
    const localAlerts = JSON.parse(localStorage.getItem('krishisetu_alerts') || '[]');
    setAlerts([...localAlerts, ...baseData]);
  }, [appLanguage]);

  // Leaflet Dynamic Map Loader
  useEffect(() => {
    if (!isOnline || alerts.length === 0 || !mapRef.current) return;

    const initMap = async () => {
      // 1. Inject Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // 2. Inject Leaflet JS
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.head.appendChild(script);
        await new Promise(r => script.onload = r);
      }

      // 3. Initialize Map
      if (window.L && mapRef.current) {
        if (mapInstance.current) {
          mapInstance.current.remove();
        }

        const map = window.L.map(mapRef.current).setView([20.2376, 84.2700], 6); // Odisha Center
        
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);

        // 4. Add alert markers
        alerts.forEach(alert => {
          if (alert.lat && alert.lng) {
            const marker = window.L.marker([alert.lat, alert.lng]).addTo(map);
            marker.bindPopup(`<b>${alert.pest}</b><br>${alert.crop}`);
          }
        });
        
        mapInstance.current = map;
      }
    };

    initMap();
  }, [isOnline, alerts, appLanguage]);

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-8">
      
      <div className="bg-black text-white p-3 border-2 border-black shadow-brutal-hover flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tighter">{t('communityAlerts')}</h2>
        </div>
        <Bell size={24} className="text-brutal-neon animate-pulse" strokeWidth={2} />
      </div>

      {isOnline && (
        <div className="brutal-box border-2 border-black p-1 bg-white">
          <div ref={mapRef} className="w-full h-48 bg-gray-200 border-2 border-black z-0">
             {/* Map renders here */}
          </div>
        </div>
      )}

      <div className="bg-white p-3 border-2 border-black font-mono text-xs">
        <p className="font-bold text-red-600 mb-1 flex items-center gap-2">
          <MapPin size={14} /> {t('liveWarnings')}
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        {alerts.map((alert, idx) => (
          <div key={idx} className="brutal-box bg-white border-2 p-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-black uppercase text-sm">{alert.pest}</span>
                <span className="block text-[10px] font-mono text-gray-500 mt-1 uppercase">{t('targetCrop')}: {alert.crop}</span>
              </div>
              <span className={`px-2 py-1 text-[9px] font-black uppercase border border-black ${
                alert.severity === 'High' || alert.severity === 'ଉଚ୍ଚ' || alert.severity === 'उच्च' 
                ? 'bg-red-500 text-white' : 
                alert.severity === 'Moderate' || alert.severity === 'ମଧ୍ୟମ' || alert.severity === 'मध्यम'
                ? 'bg-yellow-400 text-black' : 
                'bg-green-400 text-black'
              }`}>
                {alert.severity} {t('risk')}
              </span>
            </div>
            
            <div className="flex items-center gap-2 font-mono text-[10px] bg-gray-100 p-1 border border-black mb-3">
              <span className="font-bold text-blue-700">{alert.origin}</span>
              <span className="text-gray-400">→</span>
              <span className="font-bold text-red-700">{alert.target}</span>
            </div>
            
            <p className="font-mono text-[11px] font-bold text-gray-800 leading-relaxed bg-red-50 p-2 border border-red-200">
              {alert.advice}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
