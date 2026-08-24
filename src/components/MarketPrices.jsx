import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

MarketPrices.propTypes = {
  t: PropTypes.func.isRequired,
  appLanguage: PropTypes.string.isRequired,
  isOnline: PropTypes.bool.isRequired
};

// Simulated market prices for Odisha (in INR per quintal)
// In production, this would come from data.gov.in API
const MARKET_DATA = {
  paddy: {
    name: { en: 'Paddy (Dhan)', or: 'ଧାନ', hi: 'धान' },
    icon: '🌾',
    varieties: [
      { name: 'Common', price: 2183, change: 0 },
      { name: 'Grade A', price: 2220, change: 15 },
      { name: 'Fine', price: 2350, change: -10 }
    ],
    mandis: ['Cuttack', 'Bhubaneswar', 'Sambalpur']
  },
  wheat: {
    name: { en: 'Wheat', or: 'ଗହମ', hi: 'गेहूं' },
    icon: '🌾',
    varieties: [
      { name: 'Common', price: 2275, change: 25 },
      { name: 'Grade A', price: 2350, change: 0 }
    ],
    mandis: ['Cuttack', 'Balasore']
  },
  maize: {
    name: { en: 'Maize (Maka)', or: 'ମକା', hi: 'मक्का' },
    icon: '🌽',
    varieties: [
      { name: 'Yellow', price: 1950, change: -20 },
      { name: 'White', price: 2050, change: 10 }
    ],
    mandis: ['Cuttack', 'Angul']
  },
  groundnut: {
    name: { en: 'Groundnut', or: 'ଚିନିଗୁଡ଼', hi: 'मूंगफली' },
    icon: '🥜',
    varieties: [
      { name: 'Bold', price: 5800, change: 50 },
      { name: 'Java', price: 6200, change: 0 }
    ],
    mandis: ['Ganjam', 'Cuttack']
  },
  cotton: {
    name: { en: 'Cotton', or: 'କପା', hi: 'कपाहा' },
    icon: '🏵️',
    varieties: [
      { name: 'Medium Staple', price: 6620, change: 30 },
      { name: 'Long Staple', price: 7150, change: 0 }
    ],
    mandis: ['Kalahandi', 'Nuapada']
  },
  turmeric: {
    name: { en: 'Turmeric', or: 'ହଳଦୀ', hi: 'हल्दी' },
    icon: '🟡',
    varieties: [
      { name: 'Finger', price: 12500, change: 200 },
      { name: 'Bulb', price: 11800, change: -100 }
    ],
    mandis: ['Cuttack', 'Ganjam']
  }
};

const PriceChange = ({ change }) => {
  if (change > 0) return <TrendingUp size={12} className="text-green-600" />;
  if (change < 0) return <TrendingDown size={12} className="text-red-600" />;
  return <Minus size={12} className="text-gray-400" />;
};

export default function MarketPrices({ t, appLanguage, isOnline }) {
  const [prices, setPrices] = useState(MARKET_DATA);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);

  // In production, fetch from data.gov.in API
  const refreshPrices = async () => {
    setLoading(true);
    // Simulated API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add small random fluctuations to simulate live data
    const updated = { ...prices };
    Object.keys(updated).forEach(crop => {
      updated[crop] = {
        ...updated[crop],
        varieties: updated[crop].varieties.map(v => ({
          ...v,
          price: v.price + Math.floor(Math.random() * 50 - 25),
          change: Math.floor(Math.random() * 60 - 30)
        }))
      };
    });
    
    setPrices(updated);
    setLastUpdated(new Date());
    setLoading(false);
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshPrices, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3 bg-grid">
      <div className="bg-black text-white p-3 border-2 border-black shadow-brutal-hover flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tighter">{t('marketPrices') || 'Market Prices'}</h2>
          <p className="font-mono text-[10px] text-brutal-neon">{t('mandiPrices') || 'Mandi Prices (INR/Quintal)'}</p>
        </div>
        <button 
          onClick={refreshPrices}
          disabled={loading}
          className="p-2 hover:bg-white/20 transition-colors"
          aria-label="Refresh prices"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Last Updated */}
      <div className="flex justify-between items-center px-2">
        <span className="font-mono text-[9px] text-gray-500 uppercase">
          {t('lastUpdated') || 'Last updated'}: {lastUpdated.toLocaleTimeString()}
        </span>
        {!isOnline && (
          <span className="font-mono text-[9px] text-orange-600 uppercase">
            {t('cachedPrices') || 'Cached prices'}
          </span>
        )}
      </div>

      {/* Crop Price Cards */}
      <div className="grid gap-2">
        {Object.entries(prices).map(([cropKey, crop]) => (
          <div 
            key={cropKey}
            className="brutal-box bg-white border-2 border-black cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setSelectedCrop(selectedCrop === cropKey ? null : cropKey)}
          >
            <div className="p-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{crop.icon}</span>
                <div>
                  <p className="font-black text-sm">{crop.name[appLanguage] || crop.name.en}</p>
                  <p className="font-mono text-[9px] text-gray-500">
                    {crop.varieties.length} {t('varieties') || 'varieties'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-lg">₹{crop.varieties[0].price.toLocaleString()}</p>
                <div className="flex items-center gap-1 justify-end">
                  <PriceChange change={crop.varieties[0].change} />
                  <span className={`font-mono text-[10px] ${crop.varieties[0].change > 0 ? 'text-green-600' : crop.varieties[0].change < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {crop.varieties[0].change > 0 ? '+' : ''}{crop.varieties[0].change}
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedCrop === cropKey && (
              <div className="border-t-2 border-black p-3 bg-brutal-bg">
                {/* All Varieties */}
                <div className="mb-3">
                  <p className="font-mono text-[9px] uppercase text-gray-500 mb-2">{t('varieties') || 'Varieties'}:</p>
                  {crop.varieties.map((v, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-200 last:border-0">
                      <span className="font-mono text-xs font-bold">{v.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm">₹{v.price.toLocaleString()}</span>
                        <div className="flex items-center gap-0.5">
                          <PriceChange change={v.change} />
                          <span className={`font-mono text-[9px] ${v.change > 0 ? 'text-green-600' : v.change < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {v.change > 0 ? '+' : ''}{v.change}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Available Mandis */}
                <div>
                  <p className="font-mono text-[9px] uppercase text-gray-500 mb-1">{t('availableAt') || 'Available at'}:</p>
                  <div className="flex flex-wrap gap-1">
                    {crop.mandis.map((mandi, idx) => (
                      <span key={idx} className="bg-white border border-black px-2 py-0.5 font-mono text-[10px]">
                        {mandi}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-2 border-yellow-400 p-2 text-center">
        <p className="font-mono text-[9px] text-yellow-700 uppercase">
          ⚠️ {t('priceDisclaimer') || 'Prices are indicative. Contact local mandi for actual rates.'}
        </p>
      </div>
    </div>
  );
}
