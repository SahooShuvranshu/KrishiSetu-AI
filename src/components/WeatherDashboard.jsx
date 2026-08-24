import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Cloud, Droplets, Wind, Thermometer, Sun, CloudRain } from 'lucide-react';
import { ODISHA_CENTER } from '../config/constants';

WeatherDashboard.propTypes = {
  t: PropTypes.func.isRequired,
  appLanguage: PropTypes.string.isRequired,
  isOnline: PropTypes.bool.isRequired,
  zone: PropTypes.object
};

// Weather code descriptions
const WEATHER_CODES = {
  0: { en: 'Clear Sky', or: 'ସ୍ଵଚ୍ଛ ଆକାଶ', hi: 'साफ आसमान', icon: Sun },
  1: { en: 'Mainly Clear', or: 'ମୁଖ୍ୟତଃ ସ୍ଵଚ୍ଛ', hi: 'मुख्यतः साफ', icon: Sun },
  2: { en: 'Partly Cloudy', or: 'ଆଂଶିକ ମେଘାଚ୍ଛନ୍ନ', hi: 'आंशिक बादल', icon: Cloud },
  3: { en: 'Overcast', or: 'ମେଘାଚ୍ଛନ୍ନ', hi: 'बादल', icon: Cloud },
  45: { en: 'Foggy', or: 'କୁହୁଡ଼ି', hi: 'कोहरा', icon: Cloud },
  51: { en: 'Light Drizzle', or: 'ହାଲୁକା ଗର୍ଜନ', hi: 'हल्की बूंदाबांदी', icon: CloudRain },
  61: { en: 'Slight Rain', or: 'ସାମାନ୍ୟ ବୃଷ୍ଟି', hi: 'हल्की बारिश', icon: CloudRain },
  63: { en: 'Moderate Rain', or: 'ମଧ୍ୟମ ବୃଷ୍ଟି', hi: 'मध्यम बारिश', icon: CloudRain },
  65: { en: 'Heavy Rain', or: 'ଭାରୀ ବୃଷ୍ଟି', hi: 'भारी बारिश', icon: CloudRain },
  80: { en: 'Rain Showers', or: 'ବୃଷ୍ଟି', hi: 'बारिश', icon: CloudRain },
  95: { en: 'Thunderstorm', or: 'ବଜ୍ରପାତ', hi: 'तूफान', icon: CloudRain }
};

export default function WeatherDashboard({ t, appLanguage, isOnline, zone }) {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lat = zone?.lat || ODISHA_CENTER.lat;
  const lng = zone?.lng || ODISHA_CENTER.lng;

  useEffect(() => {
    if (!isOnline) {
      setWeather(null);
      setForecast([]);
      return;
    }

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch current weather + 3-day forecast
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Asia/Kolkata&forecast_days=4`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.current_weather) {
          setWeather(data.current_weather);
        }
        
        if (data.daily) {
          setForecast(data.daily.time.map((day, i) => ({
            date: new Date(day).toLocaleDateString(appLanguage === 'hi' ? 'hi-IN' : appLanguage === 'or' ? 'or-IN' : 'en-IN', { weekday: 'short', day: 'numeric' }),
            maxTemp: data.daily.temperature_2m_max[i],
            minTemp: data.daily.temperature_2m_min[i],
            precipitation: data.daily.precipitation_sum[i],
            weatherCode: data.daily.weathercode[i]
          })));
        }
      } catch (err) {
        setError('Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lng, isOnline, appLanguage]);

  if (!isOnline) {
    return (
      <div className="brutal-box bg-gray-100 p-4 border-2 border-black">
        <div className="flex items-center gap-2 text-gray-500">
          <Cloud size={20} />
          <span className="font-mono text-xs uppercase">{t('offlineMode') || 'Weather offline'}</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="brutal-box bg-blue-50 p-4 border-2 border-black animate-pulse">
        <span className="font-mono text-xs uppercase text-blue-600">{t('loading') || 'Loading weather...'}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brutal-box bg-red-50 p-4 border-2 border-black">
        <span className="font-mono text-xs uppercase text-red-600">{error}</span>
      </div>
    );
  }

  if (!weather) return null;

  const weatherInfo = WEATHER_CODES[weather.weathercode] || WEATHER_CODES[0];
  const WeatherIcon = weatherInfo.icon;

  return (
    <div className="flex flex-col gap-3 bg-dots">
      {/* Current Weather */}
      <div className="brutal-box bg-gradient-to-br from-blue-600 to-blue-800 text-white p-4 border-2 border-black shadow-brutal">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-mono text-[10px] uppercase opacity-80 mb-1">{t('currentWeather') || 'Current Weather'}</p>
            <div className="flex items-center gap-3">
              <WeatherIcon size={32} className="text-yellow-300" />
              <div>
                <p className="font-black text-3xl leading-none">{Math.round(weather.temperature)}°C</p>
                <p className="font-mono text-xs opacity-90">{weatherInfo[appLanguage] || weatherInfo.en}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs opacity-80">
              <Wind size={14} />
              <span>{weather.windspeed} km/h</span>
            </div>
            <div className="flex items-center gap-1 text-xs opacity-80 mt-1">
              <span>💨 {weather.winddirection}°</span>
            </div>
          </div>
        </div>
        
        {/* Farm Tips based on weather */}
        <div className="bg-white/20 p-2 rounded text-xs font-mono">
          {weather.temperature > 35 ? (
            <p>⚠️ {t('heatWarning') || 'High temperature - irrigate crops early morning'}</p>
          ) : weather.temperature < 10 ? (
            <p>❄️ {t('coldWarning') || 'Low temperature - protect seedlings from frost'}</p>
          ) : weather.windspeed > 30 ? (
            <p>💨 {t('windWarning') || 'Strong winds - secure tall crops and structures'}</p>
          ) : (
            <p>✅ {t('goodWeather') || 'Good weather for field work'}</p>
          )}
        </div>
      </div>

      {/* 3-Day Forecast */}
      {forecast.length > 0 && (
        <div className="brutal-box bg-white p-3 border-2 border-black">
          <p className="font-mono text-[10px] uppercase text-gray-500 mb-2">{t('forecast') || '3-Day Forecast'}</p>
          <div className="grid grid-cols-3 gap-2">
            {forecast.slice(0, 3).map((day, idx) => {
              const DayIcon = WEATHER_CODES[day.weatherCode]?.icon || Cloud;
              return (
                <div key={idx} className="text-center p-2 bg-brutal-bg border border-black">
                  <p className="font-mono text-[9px] uppercase font-bold">{day.date}</p>
                  <DayIcon size={20} className="mx-auto my-1 text-blue-600" />
                  <p className="font-black text-sm">{Math.round(day.maxTemp)}°</p>
                  <p className="font-mono text-[10px] text-gray-500">↓{Math.round(day.minTemp)}°</p>
                  {day.precipitation > 0 && (
                    <p className="font-mono text-[9px] text-blue-600">💧{day.precipitation}mm</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
