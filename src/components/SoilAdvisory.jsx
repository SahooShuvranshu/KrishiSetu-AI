import React, { useState, useEffect } from 'react';
import { MapPin, Cloud, Calendar, TrendingUp, LocateFixed, Loader } from 'lucide-react';
import { getSoilData } from '../multilingual_data';
import { getCurrentPosition } from '../services/geolocation';
import { useApp } from '../context/AppContext';
import { useToast } from './Toast.jsx';
import WeatherDashboard from './WeatherDashboard';
import CropCalendar from './CropCalendar';
import MarketPrices from './MarketPrices';
import DiseaseRiskMap from './DiseaseRiskMap';

const SUB_TABS = [
  { id: 'advisory', icon: null, active: 'bg-brutal-green text-black', label: 'advice' },
  { id: 'weather', icon: <Cloud size={11} />, active: 'bg-blue-500 text-white', label: 'weather' },
  { id: 'calendar', icon: <Calendar size={11} />, active: 'bg-green-500 text-white', label: 'cropCalendar' },
  { id: 'prices', icon: <TrendingUp size={11} />, active: 'bg-yellow-500 text-white', label: 'marketPrices' }
];

export default function SoilAdvisory() {
  const { t, appLanguage, isOnline } = useApp();
  const toast = useToast();
  const [selectedSoil, setSelectedSoil] = useState(0);
  const [locating, setLocating] = useState(false);
  const [liveWeather, setLiveWeather] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('advisory');

  const soilData = getSoilData(appLanguage);
  const currentZone = soilData[selectedSoil] || soilData[0];

  // Real-time season detection based on the actual month
  const getSeason = () => {
    const m = new Date().getMonth();
    if (m >= 5 && m <= 9) return { en: 'Kharif (Monsoon)', or: 'ଖରିଫ (ବର୍ଷା)', hi: 'खरीफ (मानसून)' };
    if (m >= 10 || m <= 2) return { en: 'Rabi (Winter)', or: 'ରବି (ଶୀତ)', hi: 'रबी (सर्दी)' };
    return { en: 'Zaid (Summer)', or: 'ଜୈଦ (ଗ୍ରୀଷ୍ମ)', hi: 'ज़ैद (गर्मी)' };
  };
  const currentSeason = getSeason()[appLanguage] || getSeason().en;

  useEffect(() => {
    if (!isOnline) {
      setLiveWeather(null);
      return;
    }
    // Derive the zone inside the effect and depend on primitives only.
    // Depending on `soilData` re-ran this on every render (getSoilData builds a
    // fresh array each call), and since the effect sets state that was an
    // endless refetch loop. The `cancelled` flag also stops a slow response for
    // a zone the farmer has already switched away from overwriting the current
    // one.
    let cancelled = false;
    const zone = getSoilData(appLanguage)[selectedSoil];
    if (!zone || !zone.lat) return undefined;

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${zone.lat}&longitude=${zone.lng}&current_weather=true`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.current_weather) {
          setLiveWeather(data.current_weather);
        }
      })
      .catch((err) => console.error('Weather API Error:', err));

    return () => { cancelled = true; };
  }, [selectedSoil, isOnline, appLanguage]);

  // Toast instead of window.alert: alert() blocks the page, cannot be styled,
  // and showed raw English text regardless of the app language.
  const autoDetectLocation = async () => {
    setLocating(true);
    try {
      const position = await getCurrentPosition();
      const lat = position.coords.latitude;
      if (lat < 20.0) {
        setSelectedSoil(1); // Coastal
      } else if (lat > 21.5) {
        setSelectedSoil(0); // Northern
      } else {
        setSelectedSoil(3); // Western
      }
      toast.success(t('gpsSuccess'), t('zone'));
    } catch (error) {
      if (error.message === 'GEOLOCATION_DEBOUNCED') {
        // Button mashed too quickly - keep the current zone, no toast spam
        return;
      }
      if (error.message === 'GEOLOCATION_UNSUPPORTED') {
        toast.error(t('gpsUnsupported'), t('gpsShort'));
        return;
      }
      toast.info(t('gpsWeakSignal'), t('gpsShort'));
      setSelectedSoil(1);
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 animate-fade-in pb-8 bg-grid">
      <div className="bg-black text-white p-2 border-2 border-black shadow-brutal-hover flex justify-between items-center">
        <h2 className="text-sm font-black uppercase tracking-tighter">{t('farmAdvice')}</h2>
        <MapPin size={18} className="text-brutal-green" strokeWidth={2} />
      </div>

      {/* The map sits directly under the header, on its own. */}
      <DiseaseRiskMap zone={currentZone} />

      {/* Location: zone picker and GPS in one row, so the controls stop taking
          two full-width blocks before any actual advice is visible. */}
      <div className="bg-white border-2 border-black p-2">
        <label
          htmlFor="zone-select"
          className="font-mono font-bold text-[9px] uppercase mb-1 block"
        >
          {t('zone')}
        </label>
        <div className="flex gap-1.5">
          <select
            id="zone-select"
            className="flex-1 min-w-0 p-1.5 pr-8 border-2 border-black font-bold uppercase text-[11px] bg-brutal-bg focus:outline-none appearance-none cursor-pointer bg-no-repeat bg-[length:1.2em_1.2em] bg-[right_0.4rem_center]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")` }}
            value={selectedSoil}
            onChange={(e) => setSelectedSoil(parseInt(e.target.value, 10))}
          >
            {soilData.map((data, idx) => (
              <option key={idx} value={idx}>{data.zone}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={autoDetectLocation}
            disabled={locating}
            title={t('useMyLocation')}
            aria-label={t('useMyLocation')}
            className="flex items-center gap-1 px-2.5 border-2 border-black bg-blue-500 text-white font-black uppercase text-[10px] whitespace-nowrap active:translate-x-0.5 active:translate-y-0.5 transition-transform disabled:opacity-60"
          >
            {locating ? <Loader size={12} className="animate-spin" /> : <LocateFixed size={12} />}
            {t('gpsShort')}
          </button>
        </div>
      </div>

      <div className="flex gap-1.5">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id)}
            aria-pressed={activeSubTab === tab.id}
            className={`flex-1 py-1.5 px-1 border-2 border-black font-black text-[9px] uppercase flex items-center justify-center gap-0.5 ${
              activeSubTab === tab.id ? tab.active : 'bg-white text-gray-500'
            }`}
          >
            {tab.icon} {t(tab.label)}
          </button>
        ))}
      </div>

      {activeSubTab === 'weather' && (
        <WeatherDashboard t={t} appLanguage={appLanguage} isOnline={isOnline} zone={currentZone} />
      )}

      {activeSubTab === 'calendar' && (
        <CropCalendar t={t} appLanguage={appLanguage} />
      )}

      {activeSubTab === 'prices' && (
        <MarketPrices t={t} appLanguage={appLanguage} isOnline={isOnline} />
      )}

      {activeSubTab === 'advisory' && (
        <div className="grid gap-2">
          <div className="bg-brutal-green p-0 border-2 border-black overflow-hidden">
            {isOnline && currentZone.imgUrl && (
              <div className="w-full h-24 border-b-2 border-black overflow-hidden bg-black">
                <img
                  src={currentZone.imgUrl}
                  alt={t('cropFieldAlt')}
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.display = 'none'; }}
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
            )}

            <div className="bg-black text-white p-1.5 px-2.5 flex justify-between items-center">
              <h3 className="font-black text-[11px] uppercase tracking-wider truncate mr-2">{currentZone.soil}</h3>
            </div>

            <div className="p-2 grid gap-2 bg-white border-b-2 border-black font-mono text-[10px]">
              <div className="flex flex-col border-b border-black pb-1">
                <span className="font-bold uppercase text-[9px] text-gray-500 mb-0.5">{t('zone')}</span>
                <span className="font-bold text-[10px] leading-tight text-black">{currentZone.zone}</span>
              </div>

              <div>
                <span className="font-bold uppercase block mb-0.5 text-[9px] text-gray-500">{t('cropsSupported')}:</span>
                <div className="flex flex-wrap gap-0.5">
                  {currentZone.crops.map((crop, cIdx) => (
                    <span key={cIdx} className="bg-brutal-bg border border-black px-1.5 py-0.5 font-bold uppercase text-[9px]">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-1.5">
                <div className="flex-1 bg-yellow-100 border border-black p-1.5">
                  <span className="font-bold uppercase block text-[8px] text-gray-600">{t('currentSeasonLabel')}</span>
                  <span className="font-black text-[10px] text-black">{currentSeason}</span>
                </div>
                {liveWeather && (
                  <div className="flex-1 bg-blue-100 border border-black p-1.5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-[7px] font-black px-0.5 uppercase animate-pulse">
                      {t('live')}
                    </div>
                    <span className="font-bold uppercase block text-[8px] text-gray-600">{t('zoneWeather')}</span>
                    <span className="font-black text-[10px] text-black">{liveWeather.temperature}°C</span>
                  </div>
                )}
              </div>

              <div className="mt-0.5">
                <span className="font-bold uppercase block mb-0.5 text-[9px] text-green-700">{t('advice')}:</span>
                <div className="bg-green-50 p-1.5 border border-black mb-1">
                  <span className="font-bold text-[10px] text-blue-700 block mb-0.5">
                    {currentZone.rotCurrent} &rarr; {currentZone.rotNext}
                  </span>
                  <span className="text-[9px] block leading-relaxed text-gray-700">
                    {currentZone.rotReason}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
