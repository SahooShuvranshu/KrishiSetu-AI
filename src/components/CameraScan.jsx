import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Camera, Upload, RefreshCw, Share2 } from 'lucide-react';
import { diagnoseCropLeaf } from '../services/gemini';
import { runInBrowserVisionInference } from '../services/modelStorageService';
import { speakText } from '../services/voice';
import { broadcastAlert } from '../services/firebase';
import { saveImage, getImage, deleteImage } from '../services/imageStorage';
import ScanAnimation from './ScanAnimation';
import { useToast } from './Toast.jsx';

// Image compression utility
const compressImage = (base64, maxWidth = 512) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Only compress if image is larger than maxWidth
      if (img.width <= maxWidth) {
        resolve(base64);
        return;
      }
      const canvas = document.createElement('canvas');
      const ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = base64;
  });
};

CameraScan.propTypes = {
  isOnline: PropTypes.bool.isRequired,
  appLanguage: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired
};

export default function CameraScan({ isOnline, appLanguage, t }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('general');
  const toast = useToast();

  const cropOptions = [
    { id: 'general', icon: '🌱', name: { en: 'General', or: 'ସାଧାରଣ', hi: 'सामान्य' } },
    { id: 'paddy', icon: '🌾', name: { en: 'Paddy', or: 'ଧାନ', hi: 'धान' } },
    { id: 'cotton', icon: '🏵️', name: { en: 'Cotton', or: 'କପା', hi: 'कपाहा' } },
    { id: 'tomato', icon: '🍅', name: { en: 'Tomato', or: 'ଟମାଟୋ', hi: 'टमाटर' } },
    { id: 'potato', icon: '🥔', name: { en: 'Potato', or: 'ଆଳୁ', hi: 'आलू' } },
    { id: 'maize', icon: '🌽', name: { en: 'Maize', or: 'ମକା', hi: 'मक्का' } }
  ];

  // Load scan history from IndexedDB
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = JSON.parse(localStorage.getItem('krishisetu_scan_history') || '[]');
        setScanHistory(history);
      } catch (e) {
        setScanHistory([]);
      }
    };
    loadHistory();
  }, []);

  // Load last scan image from IndexedDB
  useEffect(() => {
    const loadLastScan = async () => {
      const savedImage = await getImage('last_scan');
      if (savedImage) {
        setImagePreview(savedImage);
      }
    };
    loadLastScan();
  }, []);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        let base64String = reader.result;
        // Compress image before storing and analyzing
        base64String = await compressImage(base64String);
        setImagePreview(base64String);
        // Save to IndexedDB (no size limit)
        await saveImage('last_scan', base64String);
        analyzeImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64Image) => {
    setLoading(true);
    setResult(null);
    try {
      if (isOnline) {
        const diagnosis = await diagnoseCropLeaf(base64Image, appLanguage);
        setResult({
          source: 'Cloud AI',
          disease: diagnosis.disease,
          treatment: diagnosis.treatment
        });
      } else {
        const img = new Image();
        img.src = base64Image;
        await new Promise(resolve => img.onload = resolve);
        
        const diagnosis = await runInBrowserVisionInference(img);
        setResult({
          source: t('offlineModel'),
          disease: diagnosis.disease,
          treatment: diagnosis.treatment
        });
      }
    } catch (error) {
      if (error.message === "MODEL_NOT_INSTALLED") {
        setResult({
          source: 'System',
          disease: 'Model Not Installed',
          treatment: 'Please go to Settings (gear icon) and download the Offline AI Model to scan photos without internet.'
        });
      } else {
        setResult({
          source: 'Error',
          disease: 'Analysis Failed',
          treatment: 'Please check your connection or switch to Offline mode in settings.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const clearScan = async () => {
    // Save to history before clearing
    if (result) {
      const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        disease: result.disease,
        treatment: result.treatment,
        source: result.source,
        thumbnail: imagePreview ? imagePreview.substring(0, 100) + '...' : null
      };
      const newHistory = [historyEntry, ...scanHistory].slice(0, 20); // Keep last 20
      setScanHistory(newHistory);
      localStorage.setItem('krishisetu_scan_history', JSON.stringify(newHistory));
    }
    setImagePreview(null);
    setResult(null);
    await deleteImage('last_scan');
  };

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem('krishisetu_scan_history');
  };

  const handleBroadcastAlert = async () => {
    if (!result) return;
    
    // Get device location if available
    let lat = 20.2961; // Default: Odisha center
    let lng = 85.8245;
    
    try {
      if (navigator.geolocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000
          });
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      }
    } catch (error) {
      console.warn('GPS not available, using default location');
    }
    
    const newAlert = {
      origin: "Your Farm (Local)",
      target: "Nearby Districts",
      lat: lat,
      lng: lng,
      pest: result.disease.replace(/\(.*\)/, '').trim(),
      crop: "Local Crop",
      severity: "High",
      advice: "Automated AI Warning: A local farmer just detected this pest. Inspect crops immediately."
    };
    
    // Broadcast via Firebase (or localStorage fallback)
    await broadcastAlert(newAlert);
    toast.success(t('broadcastSuccess'), 'Alert Sent');
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-10 bg-crosshatch">
      
      {!imagePreview && (
        <div className="flex flex-col gap-4 mt-4">
          {/* Crop Selection */}
          <div className="bg-white border-2 border-black p-3">
            <p className="font-mono text-[10px] uppercase text-gray-500 mb-2">{t('selectCrop') || 'Select Crop Type'}:</p>
            <div className="grid grid-cols-3 gap-2">
              {cropOptions.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCrop(crop.id)}
                  className={`p-2 border-2 border-black text-center transition-all ${
                    selectedCrop === crop.id 
                      ? 'bg-brutal-neon shadow-[2px_2px_0_0_#000]' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl block">{crop.icon}</span>
                  <span className="font-black text-[9px] uppercase block mt-1">{crop.name[appLanguage] || crop.name.en}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="font-mono text-xs uppercase text-gray-600 text-center">{t('takePhotoInstruction')}</p>
          
          <label 
            className="brutal-button bg-brutal-neon text-black p-6 flex flex-col items-center justify-center gap-2 cursor-pointer border-2 border-black shadow-brutal text-lg uppercase tracking-wider"
            aria-label="Open camera to take photo"
          >
            <Camera size={40} />
            {t('openCamera')}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={handleImageSelect}
              aria-hidden="true"
            />
          </label>

          <label 
            className="brutal-button bg-white text-black p-6 flex flex-col items-center justify-center gap-2 cursor-pointer border-2 border-black shadow-brutal text-lg uppercase tracking-wider"
            aria-label="Upload photo from gallery"
          >
            <Upload size={40} />
            {t('uploadPhoto')}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageSelect}
              aria-hidden="true"
            />
          </label>

          {/* Tips */}
          <div className="bg-yellow-50 border-2 border-yellow-400 p-3">
            <p className="font-black text-xs uppercase mb-1">{t('scanTips') || '📸 Scan Tips:'}</p>
            <ul className="font-mono text-[10px] text-gray-700 space-y-1">
              <li>• {t('tip1') || 'Take close-up photo of affected leaf'}</li>
              <li>• {t('tip2') || 'Ensure good lighting'}</li>
              <li>• {t('tip3') || 'Include multiple leaves if possible'}</li>
            </ul>
          </div>
        </div>
      )}

      {imagePreview && (
        <div className="relative border-2 border-black shadow-brutal-hover bg-black aspect-[3/4] overflow-hidden">
          <img src={imagePreview} alt="Scan Preview" className="w-full h-full object-contain" />
          
          <ScanAnimation isActive={loading} message={t('checkingCrop')} />
        </div>
      )}

      {result && (
        <div className="brutal-box p-4 bg-brutal-green border-2 border-black">
          <div className="flex justify-between items-start mb-3 border-b-2 border-black pb-2">
            <h3 className="font-black text-lg uppercase tracking-tighter leading-none">
              {result.disease}
            </h3>
            <span className="bg-black text-brutal-neon font-mono text-[9px] px-2 py-1 font-bold rounded-sm">
              {result.source}
            </span>
          </div>
          
          <div className="mb-4 font-mono font-bold text-xs bg-white p-3 border-2 border-black whitespace-pre-line leading-relaxed">
            <h4 className="uppercase text-[10px] text-gray-500 mb-2 border-b border-gray-300 pb-1">{t('advice')}:</h4>
            {result.treatment}
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button 
              onClick={() => speakText(result.treatment, appLanguage)}
              className="brutal-button bg-black text-brutal-neon py-3 text-sm font-black border-2 border-black flex justify-center items-center uppercase"
            >
              {t('playAudio')}
            </button>
            <button 
              onClick={clearScan}
              className="brutal-button bg-white text-black py-3 text-sm font-black border-2 border-black flex justify-center items-center uppercase"
            >
              {t('newPhoto')}
            </button>
          </div>
          
          {/* BROADCAST + SHARE BUTTONS */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button 
              onClick={handleBroadcastAlert}
              className="brutal-button bg-red-500 text-white py-3 text-sm font-black border-2 border-black flex justify-center items-center uppercase shadow-[4px_4px_0_0_#000]"
            >
              {t('broadcastAlert')}
            </button>
            <button 
              onClick={async () => {
                const shareText = `Krishi Setu AI Diagnosis:\n${result.disease}\n\nAdvice:\n${result.treatment}`;
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: 'Krishi Setu - Crop Diagnosis',
                      text: shareText
                    });
                  } catch (e) {
                    // User cancelled share
                  }
                } else {
                  // Fallback: copy to clipboard
                  await navigator.clipboard.writeText(shareText);
                  toast.info('Diagnosis copied to clipboard!', 'Copied');
                }
              }}
              className="brutal-button bg-brutal-neon text-black py-3 text-sm font-black border-2 border-black flex justify-center items-center uppercase"
            >
              <Share2 size={16} className="mr-1" /> {t('share') || 'Share'}
            </button>
          </div>
        </div>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && !result && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-black text-sm uppercase">{t('recentScans') || 'Recent Scans'}</h3>
            <button
              onClick={clearHistory}
              className="text-xs font-bold text-red-500 underline"
            >
              {t('clearHistory') || 'Clear'}
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {scanHistory.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="brutal-box bg-white border-2 p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  setResult({
                    source: entry.source,
                    disease: entry.disease,
                    treatment: entry.treatment
                  });
                }}
              >
                <div className="flex justify-between items-start">
                  <span className="font-black text-xs uppercase">{entry.disease}</span>
                  <span className="text-[9px] font-mono text-gray-500">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-gray-600 mt-1 truncate">
                  {entry.source}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
