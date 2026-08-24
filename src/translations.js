import { translateText } from './services/translation';

// Static translations for offline use
const staticTranslations = {
  en: {
    appTitle: "Krishi Setu",
    appSubtitle: "Odisha Farmer Network",
    settings: "App Settings",
    selectLanguage: "Select Language",
    offlineModel: "Offline AI Model",
    modelDesc: "Download the crop scanner to your phone to use it without internet (15MB).",
    download: "DOWNLOAD NOW",
    downloading: "DOWNLOADING...",
    deleteModel: "Delete Model",
    modelInstalled: "MODEL INSTALLED",
    cropDoctor: "CROP DOCTOR",
    farmAdvice: "FARM ADVICE",
    alerts: "ALERTS",
    takePhotoInstruction: "Take a photo of the sick leaf",
    openCamera: "OPEN CAMERA",
    uploadPhoto: "UPLOAD PHOTO",
    checkingCrop: "CHECKING CROP...",
    advice: "Advice",
    playAudio: "Play Audio",
    newPhoto: "New Photo",
    selectZone: "SELECT ZONE",
    zone: "ZONE",
    communityAlerts: "Community Alerts",
    liveWarnings: "LIVE WARNINGS",
    targetCrop: "Target Crop",
    risk: "Risk",
    broadcastAlert: "BROADCAST TO NETWORK",
    broadcastSuccess: "Alert successfully broadcasted to nearby farmers!",
    autoDetectGps: "📍 AUTO-DETECT GPS",
    gpsSuccess: "GPS Locked! Auto-selecting nearest zone...",
    recentScans: "Recent Scans",
    clearHistory: "Clear",
    share: "Share",
    weather: "Weather",
    currentWeather: "Current Weather",
    forecast: "3-Day Forecast",
    cropCalendar: "Crop Calendar",
    odishaGuide: "Odisha Planting Guide",
    currentSeason: "Current",
    marketPrices: "Market Prices",
    mandiPrices: "Mandi Prices (INR/Quintal)",
    lastUpdated: "Last updated",
    cachedPrices: "Cached prices",
    varieties: "varieties",
    availableAt: "Available at",
    priceDisclaimer: "Prices are indicative. Contact local mandi for actual rates.",
    heatWarning: "High temperature - irrigate crops early morning",
    coldWarning: "Low temperature - protect seedlings from frost",
    windWarning: "Strong winds - secure tall crops and structures",
    goodWeather: "Good weather for field work",
    offlineMode: "Weather offline",
    loading: "Loading weather..."
  },
  or: {
    appTitle: "କୃଷିସେତୁ",
    appSubtitle: "ଓଡ଼ିଶା କୃଷକ ନେଟୱାର୍କ",
    settings: "ଆପ୍ ସେଟିଂସ୍",
    selectLanguage: "ଭାଷା ବାଛନ୍ତୁ",
    offlineModel: "ଅଫଲାଇନ୍ ଏଆଇ ମଡେଲ୍",
    modelDesc: "ଇଣ୍ଟରନେଟ୍ ବିନା ବ୍ୟବହାର କରିବାକୁ ଆପଣଙ୍କ ଫୋନରେ ଫସଲ ସ୍କାନର୍ ଡାଉନଲୋଡ୍ କରନ୍ତୁ (୧୫ ଏମବି) |",
    download: "ଡାଉନଲୋଡ୍ କରନ୍ତୁ",
    downloading: "ଡାଉନଲୋଡ୍ ହେଉଛି...",
    deleteModel: "ମଡେଲ୍ ଡିଲିଟ୍ କରନ୍ତୁ",
    modelInstalled: "ମଡେଲ୍ ଇନଷ୍ଟଲ୍ ହୋଇଛି",
    cropDoctor: "ଫସଲ ଡାକ୍ତର",
    farmAdvice: "କୃଷି ପରାମର୍ଶ",
    alerts: "ସତର୍କ ସୂଚନା",
    takePhotoInstruction: "ରୋଗାକ୍ରାନ୍ତ ପତ୍ରର ଫଟୋ ନିଅନ୍ତୁ",
    openCamera: "କ୍ୟାମେରା ଖୋଲନ୍ତୁ",
    uploadPhoto: "ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ",
    checkingCrop: "ଯାଞ୍ଚ କରାଯାଉଛି...",
    advice: "ପରାମର୍ଶ",
    playAudio: "ଅଡିଓ ଶୁଣନ୍ତୁ",
    newPhoto: "ନୂଆ ଫଟୋ",
    selectZone: "ଅଞ୍ଚଳ ବାଛନ୍ତୁ",
    zone: "ଅଞ୍ଚଳ",
    communityAlerts: "ସମ୍ପ୍ରଦାୟ ସତର୍କ ସୂଚନା",
    liveWarnings: "ଲାଇଭ୍ ସତର୍କତା",
    targetCrop: "ପ୍ରଭାବିତ ଫସଲ",
    risk: "ବିପଦ",
    broadcastAlert: "ନେଟୱାର୍କକୁ ପଠାନ୍ତୁ",
    broadcastSuccess: "ନିକଟସ୍ଥ କୃଷକମାନଙ୍କୁ ସତର୍କ ସୂଚନା ପଠାଗଲା!",
    autoDetectGps: "📍 ଲୋକେସନ୍ ଖୋଜନ୍ତୁ",
    gpsSuccess: "ଲୋକେସନ୍ ମିଳିଲା! ଅଞ୍ଚଳ ବଛାଯାଉଛି...",
    recentScans: "ଶେଷ ସ୍କାନ",
    clearHistory: "ସଫା କରନ୍ତୁ",
    share: "ଶେୟାର",
    weather: "ପାଗ",
    currentWeather: "ବର୍ତ୍ତମାନର ପାଗ",
    forecast: "୩-ଦିନ ପୂର୍ବାନୁମାନ",
    cropCalendar: "ଫସଲ କ୍ୟାଲେଣ୍ଡର",
    odishaGuide: "ଓଡ଼ିଶା ରୋପଣ ଗାଇଡ୍",
    currentSeason: "ବର୍ତ୍ତମାନ",
    marketPrices: "ବଜାର ଦାମ",
    mandiPrices: "ମଣ୍ଡି ଦାମ (INR/କ୍ୱିଣ୍ଟାଲ)",
    lastUpdated: "ଶେଷ ଅପଡେଟ",
    cachedPrices: "କ୍ୟାଚ୍ ଦାମ",
    varieties: "ପ୍ରକାର",
    availableAt: "ଉପଲବ୍ଧ",
    priceDisclaimer: "ଦାମ ସୂଚନାତ୍ମକ। ପ୍ରକୃତ ଦାମ ପାଇଁ ସ୍ଥାନୀୟ ମଣ୍ଡି ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ।",
    heatWarning: "ଅଧିକ ତାପମାନ - ସକାଳେ ଫସଲକୁ ଜଳ ଦିଅନ୍ତୁ",
    coldWarning: "କମ୍ ତାପମାନ - ଚାରାକୁ ଥଣ୍ଡାରୁ ରକ୍ଷା କରନ୍ତୁ",
    windWarning: "ଜୋରାଟି ପବନ - ଲମ୍ବା ଫସଲ ବାନ୍ଧନ୍ତୁ",
    goodWeather: "ଖେତ କାମ ପାଇଁ ଭଲ ପାଗ",
    offlineMode: "ପାଗ ଅଫଲାଇନ୍",
    loading: "ପାଗ ଲୋଡୁଛି..."
  },
  hi: {
    appTitle: "कृषिसेतु",
    appSubtitle: "ओडिशा किसान नेटवर्क",
    settings: "ऐप सेटिंग्स",
    selectLanguage: "भाषा चुनें",
    offlineModel: "ऑफ़लाइन एआई मॉडल",
    modelDesc: "बिना इंटरनेट के उपयोग करने के लिए फसल स्कैनर डाउनलोड करें (15MB)।",
    download: "अभी डाउनलोड करें",
    downloading: "डाउनलोड हो रहा है...",
    deleteModel: "मॉडल हटाएं",
    modelInstalled: "मॉडल इंस्टॉल हो गया",
    cropDoctor: "फसल डॉक्टर",
    farmAdvice: "कृषि सलाह",
    alerts: "चेतावनियाँ",
    takePhotoInstruction: "बीमार पत्ते की फोटो लें",
    openCamera: "कैमरा खोलें",
    uploadPhoto: "फोटो अपलोड करें",
    checkingCrop: "जांच हो रही है...",
    advice: "सलाह",
    playAudio: "ऑडियो सुनें",
    newPhoto: "नई फोटो",
    selectZone: "क्षेत्र चुनें",
    zone: "क्षेत्र",
    communityAlerts: "सामुदायिक चेतावनियाँ",
    liveWarnings: "लाइव चेतावनियाँ",
    targetCrop: "प्रभावित फसल",
    risk: "जोखिम",
    broadcastAlert: "नेटवर्क पर भेजें",
    broadcastSuccess: "आसपास के किसानों को चेतावनी भेजी गई!",
    autoDetectGps: "📍 जीपीएस खोजें",
    gpsSuccess: "जीपीएस मिल गया! क्षेत्र चुना जा रहा है...",
    recentScans: "हाल की स्कैन",
    clearHistory: "साफ़ करें",
    share: "शेयर",
    weather: "मौसम",
    currentWeather: "वर्तमान मौसम",
    forecast: "3-दिन का पूर्वानुमान",
    cropCalendar: "फसल कैलेंडर",
    odishaGuide: "ओडिशा रोपण गाइड",
    currentSeason: "वर्तमान",
    marketPrices: "बाजार भाव",
    mandiPrices: "मंडी भाव (INR/क्विंटल)",
    lastUpdated: "अंतिम अपडेट",
    cachedPrices: "कैश्ड भाव",
    varieties: "किस्में",
    availableAt: "उपलब्ध",
    priceDisclaimer: "भाव संकेतात्मक हैं। वास्तविक दरों के लिए स्थानीय मंडी से संपर्क करें।",
    heatWarning: "अधिक तापमान - सुबह फसल को पानी दें",
    coldWarning: "कम तापमान - पौधों को ठंड से बचाएं",
    windWarning: "तेज हवा - लंबी फसलों को बांधें",
    goodWeather: "खेत के काम के लिए अच्छा मौसम",
    offlineMode: "मौसम ऑफ़लाइन",
    loading: "मौसम लोड हो रहा है..."
  }
};

/**
 * Get translation for a key
 * Uses static translations for offline, can use Translation API for dynamic text
 * 
 * @param {string} lang - Language code
 * @param {string} key - Translation key
 * @returns {string} - Translated text
 */
export const getTranslation = (lang, key) => {
  return staticTranslations[lang]?.[key] || staticTranslations['en']?.[key] || key;
};

/**
 * Translate dynamic text (for AI responses, etc.)
 * Uses Google Translation API when online, falls back to original text
 * 
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language
 * @param {string} sourceLang - Source language (default: en)
 * @returns {Promise<string>} - Translated text
 */
export const translateDynamicText = async (text, targetLang, sourceLang = 'en') => {
  return await translateText(text, targetLang, sourceLang);
};

export default {
  translations: staticTranslations,
  getTranslation,
  translateDynamicText
};
