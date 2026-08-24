import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';

CropCalendar.propTypes = {
  t: PropTypes.func.isRequired,
  appLanguage: PropTypes.string.isRequired
};

// Odisha crop calendar data
const CROP_CALENDAR = {
  kharif: {
    name: { en: 'Kharif (Monsoon)', or: 'ଖରିଫ (ବର୍ଷା)', hi: 'खरीफ (मानसून)' },
    months: { en: 'Jun - Oct', or: 'ଜୁନ - ଅକ୍ଟୋବର', hi: 'जून - अक्टूबर' },
    color: 'bg-blue-100',
    crops: [
      { name: { en: 'Paddy (Rice)', or: 'ଧାନ', hi: 'धान' }, icon: '🌾', tips: { en: 'Main crop of Odisha. Sow seeds in nurseries, transplant after 25-30 days.', or: 'ଓଡ଼ିଶାର ମୁଖ୍ୟ ଫସଲ। ନର୍ଷେରୀରେ ବୀଜ ବୁଣନ୍ତୁ, ୨୫-୩୦ ଦିନ ପରେ ରୋପଣ କରନ୍ତୁ।', hi: 'ओडिशा की मुख्य फसल। नर्सरी में बीज बोएं, 25-30 दिन बाद रोपण करें।' } },
      { name: { en: 'Maize', or: 'ମକା', hi: 'मक्का' }, icon: '🌽', tips: { en: 'Good for rotation. Requires well-drained soil.', or: 'ଚକ୍ରିୟ ଚାଷ ପାଇଁ ଭଲ। ଭଲ ଜଳ ନିକାସ ମାଟି ଆବଶ୍ୟକ।', hi: 'चक्रीय खेती के लिए अच्छा। अच्छी जल निकासी वाली मिट्टी चाहिए।' } },
      { name: { en: 'Cotton', or: 'କପା', hi: 'कपाहा' }, icon: '🏵️', tips: { en: 'Major cash crop. Needs warm weather and moderate rainfall.', or: 'ପ୍ରମୁଖ ନଗଦୀ ଫସଲ। ଉଷ୍ଣ ପାଗ ଏବଂ ମଧ୍ୟମ ବୃଷ୍ଟି ଆବଶ୍ୟକ।', hi: 'प्रमुख नकदी फसल। गर्म मौसम और मध्यम वर्षा चाहिए।' } },
      { name: { en: 'Groundnut', or: 'ଚିନିଗୁଡ଼', hi: 'मूंगफली' }, icon: '🥜', tips: { en: 'Fixes nitrogen in soil. Good for soil health.', or: 'ମାଟିରେ ନାଇଟ୍ରୋଜେନ ଫିକ୍ସ କରେ। ମାଟି ସ୍ୱାସ୍ଥ୍ୟ ପାଇଁ ଭଲ।', hi: 'मिट्टी में नाइट्रोजन ठीक करता है। मिट्टी स्वास्थ्य के लिए अच्छा।' } },
      { name: { en: 'Turmeric', or: 'ହଳଦୀ', hi: 'हल्दी' }, icon: '🟡', tips: { en: 'High-value spice crop. Plant rhizomes in raised beds.', or: 'ମୂଲ୍ୟବାନ ମସଲା ଫସଲ। ଉଚ୍ଚ ବେଡରେ କନ୍ଦ ରୋପଣ କରନ୍ତ��।', hi: 'उच्च मूल्य का मसाला फसल। ऊंची क्यारियों में कंद रोपें।' } }
    ]
  },
  rabi: {
    name: { en: 'Rabi (Winter)', or: 'ରବି (ଶୀତ)', hi: 'रबी (सर्दी)' },
    months: { en: 'Nov - Mar', or: 'ନଭେମ୍ବର - ମାର୍ଚ୍ଚ', hi: 'नवंबर - मार्च' },
    color: 'bg-green-100',
    crops: [
      { name: { en: 'Wheat', or: 'ଗହମ', hi: 'गेहूं' }, icon: '🌾', tips: { en: 'Sow after paddy harvest. Needs cool weather.', or: 'ଧାନ ଅମଳ ପରେ ବୁଣନ୍ତୁ। ଥଣ୍ଡା ପାଗ ଆବଶ୍ୟକ।', hi: 'धान की कटाई के बाद बोएं। ठंडा मौसम चाहिए।' } },
      { name: { en: 'Mustard', or: 'ସୋରିଷ', hi: 'सरसों' }, icon: '🌻', tips: { en: 'Oilseed crop. Good intercrop with wheat.', or: 'ତୈଳବୀଜ ଫସଲ। ଗହମ ସହ ଭଲ ଅନ୍ତଃଫସଲ।', hi: 'तिलहन फसल। गेहूं के साथ अच्छी अंतरफसल।' } },
      { name: { en: 'Chickpea', or: 'ଛୋଳି', hi: 'चना' }, icon: '🫘', tips: { en: 'Pulse crop. Fixes nitrogen. Low water requirement.', or: 'ଡାଲି ଫସଲ। ନାଇଟ୍ରୋଜେନ ଫିକ୍ସ କରେ। କମ୍ ପାଣି ଆବଶ୍ୟକ।', hi: 'दलहन फसल। नाइट्रोजन ठीक करता है। कम पानी चाहिए।' } },
      { name: { en: 'Vegetables', or: 'ପନିପରିବା', hi: 'सब्जियां' }, icon: '🥬', tips: { en: 'Tomato, brinjal, cauliflower. High income potential.', or: 'ଟମାଟୋ, ବାଇଗଣ, ଫୁଲ ଗୋବି। ଅଧିକ ଆୟ।', hi: 'टमाटर, बैंगन, फूलगोभी। अधिक आय।' } }
    ]
  },
  zaid: {
    name: { en: 'Zaid (Summer)', or: 'ଜୈଦ (ଗ୍ରୀଷ୍ମ)', hi: 'ज़ैद (गर्मी)' },
    months: { en: 'Mar - Jun', or: 'ମାର୍ଚ୍ଚ - ଜୁନ', hi: 'मार्च - जून' },
    color: 'bg-yellow-100',
    crops: [
      { name: { en: 'Watermelon', or: 'ତରଭୁଜ', hi: 'तरबूज' }, icon: '🍉', tips: { en: 'Summer fruit. Needs irrigation. High demand in market.', or: 'ଗ୍ରୀଷ୍ମ ଫଳ। ସିଞ୍ଚନ ଆବଶ୍ୟକ। ବଜାରରେ ଅଧିକ ଚାହିଦା।', hi: 'गर्मी का फल। सिंचन जरूरी। बाजार में अधिक मांग।' } },
      { name: { en: 'Cucumber', or: 'ଶଶା', hi: 'खीरा' }, icon: '🥒', tips: { en: 'Quick harvest crop. Regular watering needed.', or: 'ଶୀଘ୍ର ଅମଳ ଫସଲ। ନିୟମିତ ଜଳ ଆବଶ୍ୟକ।', hi: 'जल्दी कटाई वाली फसल। नियमित पानी चाहिए।' } },
      { name: { en: 'Moong Dal', or: 'ମୁଗ', hi: 'मूंग' }, icon: '🫘', tips: { en: 'Short duration pulse. Good for soil health.', or: 'ସ୍ୱଳ୍ପ ଅବଧି ଡାଲି। ମାଟି ସ୍ୱାସ୍ଥ୍ୟ ପାଇଁ ଭଲ।', hi: 'कम अवधि की दलहन। मिट्टी स्वास्थ्य के लिए अच्छी।' } }
    ]
  }
};

export default function CropCalendar({ t, appLanguage }) {
  const [expandedSeason, setExpandedSeason] = useState(null);

  // Get current season
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 5 && month <= 9) return 'kharif';
    if (month >= 10 || month <= 2) return 'rabi';
    return 'zaid';
  };

  const currentSeason = getCurrentSeason();

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-black text-white p-3 border-2 border-black shadow-brutal-hover flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tighter">{t('cropCalendar') || 'Crop Calendar'}</h2>
          <p className="font-mono text-[10px] text-brutal-green">{t('odishaGuide') || 'Odisha Planting Guide'}</p>
        </div>
        <Calendar size={24} className="text-brutal-neon" strokeWidth={2} />
      </div>

      {Object.entries(CROP_CALENDAR).map(([season, data]) => {
        const isExpanded = expandedSeason === season;
        const isCurrent = season === currentSeason;
        
        return (
          <div key={season} className={`brutal-box border-2 border-black ${isCurrent ? 'ring-2 ring-brutal-green' : ''}`}>
            <button
              onClick={() => setExpandedSeason(isExpanded ? null : season)}
              className={`w-full p-3 flex justify-between items-center ${data.color} ${isCurrent ? 'bg-brutal-green/20' : ''}`}
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm">{data.name[appLanguage] || data.name.en}</span>
                  {isCurrent && (
                    <span className="bg-black text-brutal-neon text-[9px] font-black px-2 py-0.5 uppercase">
                      {t('currentSeason') || 'Current'}
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] text-gray-600">{data.months[appLanguage] || data.months.en}</span>
              </div>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {isExpanded && (
              <div className="p-3 bg-white border-t-2 border-black">
                <div className="grid gap-2">
                  {data.crops.map((crop, idx) => (
                    <div key={idx} className="flex gap-3 p-2 bg-brutal-bg border border-black">
                      <span className="text-2xl">{crop.icon}</span>
                      <div className="flex-1">
                        <p className="font-black text-xs">{crop.name[appLanguage] || crop.name.en}</p>
                        <p className="font-mono text-[10px] text-gray-600 mt-1 leading-relaxed">
                          {crop.tips[appLanguage] || crop.tips.en}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
