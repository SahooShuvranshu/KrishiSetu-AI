import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MapPin } from 'lucide-react';
import { getSoilData } from '../multilingual_data';

SoilAdvisory.propTypes = {
  t: PropTypes.func.isRequired,
  appLanguage: PropTypes.string.isRequired,
  isOnline: PropTypes.bool.isRequired
};

export default function SoilAdvisory({ t, appLanguage, isOnline }) {
  const [selectedSoil, setSelectedSoil] = useState(0);
  const [locating, setLocating] = useState(false);
  const [liveWeather, setLiveWeather] = useState(null);
  
  const soilData = getSoilData(appLanguage);
  
  // Real-time Season Detection based on actual Month
  const getSeason = () => {
    const m = new Date().getMonth();
    if (m >= 5 && m <= 9) return { en: 'Kharif (Monsoon)', or: 'ଖରିଫ (ବର୍ଷା)', hi: 'खरीफ (मानसून)' };
    if (m >= 10 || m <= 2) return { en: 'Rabi (Winter)', or: 'ରବି (ଶୀତ)', hi: 'रबी (सर्दी)' };
    return { en: 'Zaid (Summer)', or: 'ଜୈଦ (ଗ୍ରୀଷ୍ମ)', hi: 'ज़ैद (गर्मी)' };
  };
  const currentSeason = getSeason()[appLanguage] || getSeason()['en'];

  useEffect(() => {
    if (!isOnline) {
      setLiveWeather(null);
      return;
    }
    const zone = soilData[selectedSoil];
    if (zone && zone.lat) {
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${zone.lat}&longitude=${zone.lng}&current_weather=true`)
        .then(res => res.json())
        .then(data => {
          if (data.current_weather) {
            setLiveWeather(data.current_weather);
          }
        })
        .catch(err => console.error("Weather API Error:", err));
    }
  }, [selectedSoil, isOnline]);
  
  const autoDetectLocation = () => {
    setLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocating(false);
          const lat = position.coords.latitude;
          if (lat < 20.0) {
            setSelectedSoil(1); // Coastal
          } else if (lat > 21.5) {
            setSelectedSoil(0); // Northern
          } else {
            setSelectedSoil(3); // Western
          }
          alert(t('gpsSuccess'));
        },
        (error) => {
          setLocating(false);
          alert("Demo Mode: GPS signal weak indoors. Auto-selecting nearest zone anyway.");
          setSelectedSoil(1);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLocating(false);
      alert("GPS not supported.");
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-8">
      <div className="bg-black text-white p-3 border-2 border-black shadow-brutal-hover flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tighter">{t('farmAdvice')}</h2>
        </div>
        <MapPin size={24} className="text-brutal-green" strokeWidth={2} />
      </div>
      
      <button 
        onClick={autoDetectLocation}
        disabled={locating}
        className="brutal-button bg-blue-500 text-white font-black p-3 border-2 border-black uppercase text-sm shadow-[4px_4px_0_0_#000]"
      >
        {locating ? "..." : t('autoDetectGps')}
      </button>

      <div className="brutal-box p-3 bg-white border-2">
        <label className="font-mono font-bold text-[10px] uppercase mb-1 block">{t('selectZone')}:</label>
        <select 
          className="w-full p-2 pr-8 border-2 border-black font-bold uppercase text-sm bg-brutal-bg focus:outline-none appearance-none cursor-pointer bg-no-repeat bg-[length:1.5em_1.5em] bg-[right_0.5rem_center]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")` }}
          value={selectedSoil}
          onChange={(e) => setSelectedSoil(parseInt(e.target.value))}
        >
          {soilData.map((data, idx) => (
            <option key={idx} value={idx}>{data.zone}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-3">
        <div className="brutal-box bg-brutal-green p-0 border-2 overflow-hidden">
          
          {isOnline && soilData[selectedSoil].imgUrl && (
            <div className="w-full h-32 border-b-2 border-black overflow-hidden bg-black">
              <img 
                src={soilData[selectedSoil].imgUrl} 
                alt="Crop Field" 
                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.display = 'none'; }}
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          )}

          <div className="bg-black text-white p-2 px-3 flex justify-between items-center">
            <h3 className="font-black text-sm uppercase tracking-wider truncate mr-2">{soilData[selectedSoil].soil}</h3>
          </div>
          
          <div className="p-3 grid gap-3 bg-white border-b-2 border-black font-mono text-xs">
            <div className="flex flex-col border-b border-black pb-1">
              <span className="font-bold uppercase text-[10px] text-gray-500 mb-1">{t('zone')}</span>
              <span className="font-bold text-[11px] leading-tight text-black">
                {soilData[selectedSoil].zone}
              </span>
            </div>
            
            <div>
              <span className="font-bold uppercase block mb-1 text-[10px] text-gray-500">CROPS:</span>
              <div className="flex flex-wrap gap-1">
                {soilData[selectedSoil].crops.map((crop, cIdx) => (
                  <span key={cIdx} className="bg-brutal-bg border border-black px-2 py-1 font-bold uppercase text-[10px]">
                    {crop}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 bg-yellow-100 border border-black p-2">
                 <span className="font-bold uppercase block text-[9px] text-gray-600 mb-1">Current Season</span>
                 <span className="font-black text-xs text-black">{currentSeason}</span>
              </div>
              {liveWeather && (
                <div className="flex-1 bg-blue-100 border border-black p-2 relative overflow-hidden">
                   <div className="absolute top-0 right-0 bg-blue-500 text-white text-[8px] font-black px-1 uppercase animate-pulse">LIVE</div>
                   <span className="font-bold uppercase block text-[9px] text-gray-600 mb-1">Zone Weather</span>
                   <span className="font-black text-xs text-black">{liveWeather.temperature}°C, {liveWeather.windspeed}km/h wind</span>
                </div>
              )}
            </div>
            
            <div className="mt-1">
              <span className="font-bold uppercase block mb-1 text-[10px] text-green-700">{t('advice')}:</span>
              <div className="bg-green-50 p-2 border border-black mb-2">
                <span className="font-bold text-[11px] text-blue-700 block mb-1">
                  {soilData[selectedSoil].rotCurrent} &rarr; {soilData[selectedSoil].rotNext}
                </span>
                <span className="text-[11px] block leading-relaxed text-gray-700">
                  {soilData[selectedSoil].rotReason}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
