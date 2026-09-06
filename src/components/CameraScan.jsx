import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Share2, WifiOff, X } from 'lucide-react';
import { diagnoseCropLeaf } from '../services/gemini';
import { runInBrowserVisionInference } from '../services/modelStorageService';
import { speakText } from '../services/voice';
import { broadcastAlert } from '../services/firebase';
import { saveImage, getImage, deleteImage } from '../services/imageStorage';
import { getCurrentPosition, DEFAULT_POSITION } from '../services/geolocation';
import { GEMINI_TIMEOUT, MAX_SCAN_HISTORY } from '../config/constants';
import ScanAnimation from './ScanAnimation';
import { useToast } from './Toast.jsx';
import { useApp } from '../context/AppContext';

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

export default function CameraScan() {
  const { isOnline, appLanguage, t } = useApp();
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('general');
  const [broadcasting, setBroadcasting] = useState(false);
  const toast = useToast();

  // Guards against state updates after the user starts a fresh scan
  const scanIdRef = useRef(0);

  const cropOptions = [
    { id: 'general', icon: '🌱', name: { en: 'General', or: 'ସାଧାରଣ', hi: 'सामान्य' } },
    { id: 'paddy', icon: '🌾', name: { en: 'Paddy', or: 'ଧାନ', hi: 'धान' } },
    { id: 'cotton', icon: '🏵️', name: { en: 'Cotton', or: 'କପା', hi: 'कपाहा' } },
    { id: 'tomato', icon: '🍅', name: { en: 'Tomato', or: 'ଟମାଟୋ', hi: 'टमाटर' } },
    { id: 'potato', icon: '🥔', name: { en: 'Potato', or: 'ଆଳୁ', hi: 'आलू' } },
    { id: 'maize', icon: '🌽', name: { en: 'Maize', or: 'ମକା', hi: 'मक्का' } }
  ];

  // Load scan history from localStorage
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

  // Restore a previous scan ONLY when both image and result exist.
  // If only a stray photo is stored (e.g. after an interrupted share/broadcast),
  // start fresh so the user is never stuck with a photo and no way forward.
  useEffect(() => {
    const loadLastScan = async () => {
      const [savedImage, savedResult] = await Promise.all([
        getImage('last_scan'),
        Promise.resolve(localStorage.getItem('krishisetu_last_result'))
      ]);
      if (savedImage && savedResult) {
        try {
          setImagePreview(savedImage);
          setResult(JSON.parse(savedResult));
        } catch (e) {
          // Corrupt stored result - fall through to fresh intake
        }
      } else if (savedImage) {
        // Orphaned photo (no saved result): delete it so the next visit is clean
        await deleteImage('last_scan');
      }
    };
    loadLastScan();
  }, []);

  const saveLastResult = (resultObj) => {
    localStorage.setItem('krishisetu_last_result', JSON.stringify(resultObj));
  };

  const handleImageSelect = (event) => {
    const file = event.target.files && event.target.files[0];
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
    // Allow re-selecting the same file for consecutive scans
    event.target.value = '';
  };

  const analyzeImage = async (base64Image) => {
    const scanId = ++scanIdRef.current;
    setLoading(true);
    setResult(null);
    try {
      let diagnosis;
      if (isOnline) {
        // Timeout so a hung request can never leave the screen stuck on "scanning"
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('ANALYSIS_TIMEOUT')), GEMINI_TIMEOUT)
        );
        diagnosis = await Promise.race([
          diagnoseCropLeaf(base64Image, appLanguage),
          timeoutPromise
        ]);
      } else {
        const img = new Image();
        img.src = base64Image;
        await new Promise(resolve => img.onload = resolve);

        diagnosis = await runInBrowserVisionInference(img);
      }
      if (scanId !== scanIdRef.current) return; // user moved on - ignore stale result
      const res = {
        source: isOnline ? 'Cloud AI' : t('offlineModel'),
        disease: diagnosis.disease,
        treatment: diagnosis.treatment
      };
      setResult(res);
      saveLastResult(res);
    } catch (error) {
      if (scanId !== scanIdRef.current) return;
      if (error.message === "MODEL_NOT_INSTALLED") {
        const res = {
          source: 'System',
          disease: 'Model Not Installed',
          treatment: 'Please go to Settings (gear icon) and download the Offline AI Model to scan photos without internet.'
        };
        setResult(res);
        saveLastResult(res);
      } else {
        const res = {
          source: 'Error',
          disease: error.message === 'ANALYSIS_TIMEOUT' ? 'Analysis Timed Out' : 'Analysis Failed',
          treatment: error.message === 'ANALYSIS_TIMEOUT'
            ? 'The analysis took too long. Check your internet connection and try again.'
            : 'Please check your connection or switch to Offline mode in settings.'
        };
        setResult(res);
        saveLastResult(res);
      }
    } finally {
      if (scanId === scanIdRef.current) {
        setLoading(false);
      }
    }
  };

  // Always return to a fresh intake screen (removes photo + result + stored image)
  const resetScan = async () => {
    scanIdRef.current++; // invalidate any in-flight analysis
    setLoading(false);
    setImagePreview(null);
    setResult(null);
    localStorage.removeItem('krishisetu_last_result');
    await deleteImage('last_scan');
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
      const newHistory = [historyEntry, ...scanHistory].slice(0, MAX_SCAN_HISTORY); // Keep last N
      setScanHistory(newHistory);
      localStorage.setItem('krishisetu_scan_history', JSON.stringify(newHistory));
    }
    await resetScan();
  };

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem('krishisetu_scan_history');
  };

  const handleBroadcastAlert = async () => {
    if (!result || broadcasting) return;
    setBroadcasting(true);
    try {
      // Get device location if available (debounced via geolocation service)
      let lat = DEFAULT_POSITION.lat; // Default: Odisha center
      let lng = DEFAULT_POSITION.lng;

      try {
        const position = await getCurrentPosition();
        lat = position.coords.latitude;
        lng = position.coords.longitude;
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
      const broadcastResult = await broadcastAlert(newAlert);
      toast.success(broadcastResult.queued ? t('broadcastQueued') || 'Alert queued - will sync when online' : t('broadcastSuccess'), 'Alert Sent');
      // Get ready for the next photo automatically after a successful broadcast
      await clearScan();
    } catch (error) {
      console.error('Broadcast failed', error);
      toast.error(t('broadcastFailed') || 'Broadcast failed. Try again.', 'Alert Error');
    } finally {
      setBroadcasting(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    const shareText = `Krishi Setu AI Diagnosis:\n${result.disease}\n\nAdvice:\n${result.treatment}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Krishi Setu - Crop Diagnosis', text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.info('Copied!', 'Copied');
      }
      // Get ready for the next photo automatically after a successful share
      await clearScan();
    } catch (error) {
      // User dismissed the share sheet (AbortError) - keep the result visible
      if (error && error.name !== 'AbortError') {
        console.warn('Share failed', error);
        toast.error('Share failed. Try again.', 'Share');
      }
    }
  };

  return (
    <div className="flex flex-col gap-2.5 animate-fade-in pb-10 bg-crosshatch">
      {!isOnline && (
        <div className="bg-yellow-100 border-2 border-yellow-500 p-2 flex items-center gap-2">
          <WifiOff size={16} className="text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-black text-[10px] uppercase text-yellow-800">Offline Mode Active</p>
            <p className="font-mono text-[8px] text-yellow-700">Using local AI model.</p>
          </div>
        </div>
      )}

      {!imagePreview && (
        <div className="flex flex-col gap-2.5 mt-2">
          <div className="bg-white border-2 border-black p-2">
            <p className="font-mono text-[9px] uppercase text-gray-500 mb-1.5">{t('selectCrop') || 'Select Crop Type'}:</p>
            <div className="grid grid-cols-3 gap-1.5">
              {cropOptions.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCrop(crop.id)}
                  className={`p-1.5 border-2 border-black text-center transition-all ${
                    selectedCrop === crop.id
                      ? 'bg-brutal-neon shadow-brutal-sm'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base block">{crop.icon}</span>
                  <span className="font-black text-[8px] uppercase block mt-0.5">{crop.name[appLanguage] || crop.name.en}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="font-mono text-xs uppercase text-gray-600 text-center">{t('takePhotoInstruction')}</p>

          <label
            className="brutal-button bg-brutal-neon text-black p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer border-2 border-black shadow-brutal text-sm uppercase tracking-wider"
            aria-label="Open camera to take photo"
          >
            <Camera size={28} />
            {t('openCamera')}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} aria-hidden="true" />
          </label>

          <label
            className="brutal-button bg-white text-black p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer border-2 border-black shadow-brutal text-sm uppercase tracking-wider"
            aria-label="Upload photo from gallery"
          >
            <Upload size={28} />
            {t('uploadPhoto')}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} aria-hidden="true" />
          </label>

          <div className="bg-yellow-50 border-2 border-yellow-400 p-2">
            <p className="font-black text-[10px] uppercase mb-1">{t('scanTips') || '📸 Scan Tips:'}</p>
            <ul className="font-mono text-[9px] text-gray-700 space-y-0.5">
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

          {/* Always-visible exit button so the user is never stuck on a photo */}
          <button
            onClick={clearScan}
            className="absolute top-2 right-2 z-50 bg-red-500 text-white border-2 border-black p-1.5 shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            aria-label={t('newPhoto') || 'Take a new photo'}
            title={t('newPhoto') || 'Take a new photo'}
          >
            <X size={16} />
          </button>

          <ScanAnimation isActive={loading} message={t('checkingCrop')} />
        </div>
      )}

      {result && (
        <div className="brutal-box p-3 bg-brutal-green border-2 border-black">
          <div className="flex justify-between items-start mb-2 border-b-2 border-black pb-1.5">
            <h3 className="font-black text-sm uppercase tracking-tighter leading-none">
              {result.disease}
            </h3>
            <span className="bg-black text-brutal-neon font-mono text-[8px] px-1.5 py-0.5 font-bold">
              {result.source}
            </span>
          </div>

          <div className="mb-3 font-mono font-bold text-[10px] bg-white p-2 border-2 border-black whitespace-pre-line leading-relaxed">
            <h4 className="uppercase text-[9px] text-gray-500 mb-1 border-b border-gray-300 pb-0.5">{t('advice')}:</h4>
            {result.treatment}
          </div>

          <div className="grid grid-cols-2 gap-1.5 mb-1.5">
            <button onClick={() => speakText(result.treatment, appLanguage)} className="bg-black text-brutal-neon py-2 text-[10px] font-black border-2 border-black flex justify-center items-center uppercase">
              {t('playAudio')}
            </button>
            <button onClick={clearScan} className="bg-white text-black py-2 text-[10px] font-black border-2 border-black flex justify-center items-center uppercase">
              {t('newPhoto')}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button onClick={handleBroadcastAlert} disabled={broadcasting} className="bg-red-500 text-white py-2 text-[10px] font-black border-2 border-black flex justify-center items-center uppercase shadow-brutal-md disabled:opacity-40">
              {broadcasting ? '...' : t('broadcastAlert')}
            </button>
            <button onClick={handleShare} className="bg-brutal-neon text-black py-2 text-[10px] font-black border-2 border-black flex justify-center items-center uppercase">
              <Share2 size={12} className="mr-1" /> {t('share') || 'Share'}
            </button>
          </div>
        </div>
      )}

      {scanHistory.length > 0 && !result && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-black text-xs uppercase">{t('recentScans') || 'Recent Scans'}</h3>
            <button onClick={clearHistory} className="text-[9px] font-bold text-red-500 underline">
              {t('clearHistory') || 'Clear'}
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {scanHistory.slice(0, 5).map((entry) => (
              <div key={entry.id} className="bg-white border-2 border-black p-2 cursor-pointer hover:bg-gray-50" onClick={() => setResult({ source: entry.source, disease: entry.disease, treatment: entry.treatment })}>
                <div className="flex justify-between items-start">
                  <span className="font-black text-[10px] uppercase">{entry.disease}</span>
                  <span className="text-[8px] font-mono text-gray-500">{new Date(entry.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-[8px] font-mono text-gray-600 truncate">{entry.source}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
