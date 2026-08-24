import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Bell, MapPin } from 'lucide-react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { getTelemetryData } from '../multilingual_data';
import { listenAlerts } from '../services/firebase';

// Odisha center coordinates
const ODISHA_CENTER = {
  lat: 20.2961,
  lng: 85.8245
};

const mapContainerStyle = {
  width: '100%',
  height: '300px'
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false
};

StateTelemetryMap.propTypes = {
  t: PropTypes.func.isRequired,
  appLanguage: PropTypes.string.isRequired,
  isOnline: PropTypes.bool.isRequired
};

export default function StateTelemetryMap({ t, appLanguage, isOnline }) {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [unsubscribe, setUnsubscribe] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Filter alerts by severity
  const filteredAlerts = filterSeverity === 'all' 
    ? alerts 
    : alerts.filter(a => a.severity?.toLowerCase() === filterSeverity);

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: ['places']
  });

  // Load alerts from Firebase and local storage
  useEffect(() => {
    const baseData = getTelemetryData(appLanguage);
    
    // Try Firebase real-time listener
    const unsub = listenAlerts((firebaseAlerts) => {
      // Merge Firebase alerts with base data
      const allAlerts = [...firebaseAlerts, ...baseData];
      setAlerts(allAlerts);
    });
    
    setUnsubscribe(() => unsub);
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []); // Run once on mount - appLanguage is passed to getTelemetryData inside

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-8 bg-diagonal">
      
      <div className="bg-black text-white p-3 border-2 border-black shadow-brutal-hover flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tighter">{t('communityAlerts')}</h2>
        </div>
        <Bell size={24} className="text-brutal-neon animate-pulse" strokeWidth={2} />
      </div>

      {isOnline && (
        <div className="brutal-box border-2 border-black p-1 bg-white">
          {loadError ? (
            <div className="w-full h-48 bg-gray-200 border-2 border-black flex items-center justify-center">
              <p className="text-red-500 font-bold text-sm">Error loading Google Maps</p>
            </div>
          ) : !isLoaded ? (
            <div className="w-full h-48 bg-gray-200 border-2 border-black flex items-center justify-center">
              <p className="text-gray-500 font-bold text-sm">Loading Maps...</p>
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={ODISHA_CENTER}
              zoom={7}
              options={mapOptions}
            >
              {/* Alert markers */}
              {alerts.map((alert, idx) => (
                alert.lat && alert.lng && (
                  <Marker
                    key={alert.id || idx}
                    position={{ lat: alert.lat, lng: alert.lng }}
                    onClick={() => setSelectedAlert(alert)}
                    icon={{
                      url: alert.severity === 'High' || alert.severity === 'ଉଚ୍ଚ' || alert.severity === 'उच्च'
                        ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                        : alert.severity === 'Moderate' || alert.severity === 'ମଧ୍ୟମ' || alert.severity === 'मध्यम'
                        ? 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                        : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                      scaledSize: { width: 32, height: 32 }
                    }}
                  />
                )
              ))}
              
              {/* Info window for selected marker */}
              {selectedAlert && (
                <InfoWindow
                  position={{ lat: selectedAlert.lat, lng: selectedAlert.lng }}
                  onCloseClick={() => setSelectedAlert(null)}
                >
                  <div className="p-2">
                    <p className="font-bold text-sm">{selectedAlert.pest}</p>
                    <p className="text-xs text-gray-600">{selectedAlert.crop}</p>
                    <p className="text-xs mt-1">Severity: {selectedAlert.severity}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          )}
        </div>
      )}

      <div className="bg-white p-3 border-2 border-black font-mono text-xs">
        <p className="font-bold text-red-600 mb-1 flex items-center gap-2">
          <MapPin size={14} /> {t('liveWarnings')}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterSeverity('all')}
          className={`flex-1 p-2 border-2 border-black font-black text-[10px] uppercase ${filterSeverity === 'all' ? 'bg-black text-white' : 'bg-white'}`}
        >
          {t('allAlerts') || 'All'} ({alerts.length})
        </button>
        <button
          onClick={() => setFilterSeverity('high')}
          className={`flex-1 p-2 border-2 border-black font-black text-[10px] uppercase ${filterSeverity === 'high' ? 'bg-red-500 text-white' : 'bg-white'}`}
        >
          🔴 {t('high') || 'High'}
        </button>
        <button
          onClick={() => setFilterSeverity('moderate')}
          className={`flex-1 p-2 border-2 border-black font-black text-[10px] uppercase ${filterSeverity === 'moderate' ? 'bg-yellow-400' : 'bg-white'}`}
        >
          🟡 {t('moderate') || 'Moderate'}
        </button>
        <button
          onClick={() => setFilterSeverity('low')}
          className={`flex-1 p-2 border-2 border-black font-black text-[10px] uppercase ${filterSeverity === 'low' ? 'bg-green-500 text-white' : 'bg-white'}`}
        >
          🟢 {t('low') || 'Low'}
        </button>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        {filteredAlerts.map((alert, idx) => (
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
