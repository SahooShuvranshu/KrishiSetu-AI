import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Share2, WifiOff, X } from 'lucide-react';
import { diagnoseCropLeaf } from '../services/gemini';
import { readApiKey } from '../services/apiKeys';
import { runInBrowserVisionInference } from '../services/modelStorageService';
import { speakText } from '../services/voice';
import { saveImage, getImage, deleteImage } from '../services/imageStorage';
import { GEMINI_TIMEOUT, MODEL_INFERENCE_TIMEOUT, MAX_SCAN_HISTORY } from '../config/constants';
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

// Reject after `ms` so that no analysis path can leave the screen spinning.
// The timer is always cleared, so a fast result does not keep it alive.
const withTimeout = (promise, ms) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('ANALYSIS_TIMEOUT')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

// Resolve only once the photo really decoded - a broken file must not hang.
const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('IMAGE_LOAD_FAILED'));
  img.src = src;
});

export default function CameraScan() {
  const { isOnline, appLanguage, t } = useApp();
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('general');
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

  // Shown as a chip on the result so the user can see which crop context was
  // actually given to the model.
  const selectedCropOption = cropOptions.find((c) => c.id === selectedCrop) || cropOptions[0];
  const currentCropName = selectedCropOption.name[appLanguage] || selectedCropOption.name.en;

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
  // If only a stray photo is stored (e.g. after an interrupted share),
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
      let usedCloud = false;

      // The on-device model. Needs its own, longer budget: the first run has to
      // load and warm up the TF.js model before it can predict anything.
      const runDeviceModel = async () => {
        const img = await loadImage(base64Image);
        // selectedCrop is the context the model cannot get from a photo: with it,
        // only that crop's classes are considered.
        const offline = await withTimeout(
          runInBrowserVisionInference(img, selectedCrop, appLanguage),
          MODEL_INFERENCE_TIMEOUT
        );
        return offline.status === 'not_a_leaf'
          ? { disease: t('notALeafTitle'), treatment: t('notALeafAdvice'), status: 'not_a_leaf' }
          : offline;
      };

      // Cloud is an upgrade, not a dependency. Previously "online" meant
      // "Gemini or nothing", so a missing key, an exhausted quota or a flaky
      // connection turned a perfectly good on-device diagnosis into an error
      // screen - which is backwards for an offline-first app. Every cloud
      // failure now falls back to the model already on the device, and a
      // device without a key never asks the cloud at all.
      if (isOnline && readApiKey('gemini')) {
        try {
          // Timeout so a hung request can never leave the screen stuck on "scanning"
          diagnosis = await withTimeout(diagnoseCropLeaf(base64Image, appLanguage), GEMINI_TIMEOUT);
          usedCloud = true;
        } catch (cloudErr) {
          console.warn('Cloud diagnosis failed, using the on-device model instead', cloudErr);
          diagnosis = await runDeviceModel();
        }
      } else {
        diagnosis = await runDeviceModel();
      }
      if (scanId !== scanIdRef.current) return; // user moved on - ignore stale result
      const res = {
        source: usedCloud ? 'Cloud AI' : t('offlineModel'),
        disease: diagnosis.disease,
        treatment: diagnosis.treatment,
        status: diagnosis.status || 'ok',
        confidence: typeof diagnosis.confidence === 'number' ? diagnosis.confidence : null
      };
      setResult(res);
      saveLastResult(res);
    } catch (error) {
      if (scanId !== scanIdRef.current) return;
      const failed = (diseaseKey, treatmentKey, source) => {
        const res = { source, disease: t(diseaseKey), treatment: t(treatmentKey) };
        setResult(res);
        saveLastResult(res);
      };

      if (error.message === 'MODEL_NOT_INSTALLED') {
        failed('modelNotInstalled', 'modelNotInstalledAdvice', 'System');
      } else if (error.message === 'CROP_NOT_IN_MODEL') {
        failed('cropNotInModel', 'cropNotInModelAdvice', 'System');
      } else if (error.message === 'IMAGE_LOAD_FAILED') {
        failed('photoUnreadable', 'photoUnreadableAdvice', t('errorLabel'));
      } else if (error.message === 'ANALYSIS_TIMEOUT') {
        failed('analysisTimeout', 'analysisTimeoutAdvice', t('errorLabel'));
      } else {
        failed('analysisFailed', 'analysisFailedAdvice', t('errorLabel'));
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
        status: result.status || 'ok',
        confidence: result.confidence === undefined ? null : result.confidence,
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

  const handleShare = async () => {
    if (!result) return;
    const shareText = `${t('diagnosisLabel')}: ${result.disease}\n\n${t('advice')}: ${result.treatment}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: t('shareDialogTitle'), text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.info(t('copied'), t('copiedTitle'));
      }
      // Get ready for the next photo automatically after a successful share
      await clearScan();
    } catch (error) {
      // User dismissed the share sheet (AbortError) - keep the result visible
      if (error && error.name !== 'AbortError') {
        console.warn('Share failed', error);
        toast.error(t('shareFailed'), t('share'));
      }
    }
  };

  return (
    <div className="flex flex-col gap-2.5 animate-fade-in pb-10 bg-crosshatch">
      {!isOnline && (
        <div className="bg-yellow-100 border-2 border-yellow-500 p-2 flex items-center gap-2">
          <WifiOff size={16} className="text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-black text-[10px] uppercase text-yellow-800">{t('offlineModeActive')}</p>
            <p className="font-mono text-[8px] text-yellow-700">{t('usingLocalAi')}</p>
          </div>
        </div>
      )}

      {!imagePreview && (
        <div className="flex flex-col gap-2.5 mt-2">
          <div className="bg-white border-2 border-black p-2">
            <p className="font-mono text-[9px] uppercase text-gray-500 mb-1.5 flex items-center gap-1.5">
            <span className="bg-black text-brutal-neon border border-black px-1.5 leading-tight">1</span>
            {t('selectCrop')}
          </p>
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
            <p className="font-mono text-[8px] text-gray-500 mt-1.5 leading-snug">{t('cropHint')}</p>
          </div>

          <p className="font-mono text-[9px] uppercase text-gray-500 flex items-center gap-1.5 mt-1">
            <span className="bg-black text-brutal-neon border border-black px-1.5 leading-tight">2</span>
            {t('takePhotoInstruction')}
          </p>

          <label
            className="brutal-button bg-brutal-neon text-black p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer border-2 border-black shadow-brutal text-sm uppercase tracking-wider"
            aria-label={t('openCamera')}
          >
            <Camera size={28} />
            {t('openCamera')}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} aria-hidden="true" />
          </label>

          <label
            className="brutal-button bg-white text-black p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer border-2 border-black shadow-brutal text-sm uppercase tracking-wider"
            aria-label={t('uploadPhoto')}
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
        // Once a diagnosis exists the photo shrinks to a strip: a full-height
        // preview above the result pushed the actual answer off the screen.
        <div className={`relative border-2 border-black bg-black overflow-hidden ${
          result ? 'h-36 shadow-brutal-sm' : 'aspect-[3/4] shadow-brutal-hover'
        }`}>
          <img
            src={imagePreview}
            alt={t('cropFieldAlt')}
            className={`w-full h-full ${result ? 'object-cover opacity-90' : 'object-contain'}`}
          />

          {/* Always-visible exit button so the user is never stuck on a photo */}
          <button
            onClick={clearScan}
            className="absolute top-2 right-2 z-50 bg-red-500 text-white border-2 border-black p-1.5 shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            aria-label={t('newPhoto')}
            title={t('newPhoto')}
          >
            <X size={16} />
          </button>

          {!result && <ScanAnimation isActive={loading} message={t('checkingCrop')} />}

          {result && (
            <span className="absolute bottom-0 left-0 bg-black/80 text-brutal-neon font-mono text-[8px] uppercase px-1.5 py-0.5 border-t-2 border-r-2 border-black">
              {currentCropName}
            </span>
          )}
        </div>
      )}

      {result && (
        <div className="brutal-box p-3 bg-brutal-green text-white border-2 border-black">
          <div className="flex justify-between items-start mb-2 border-b-2 border-black pb-1.5">
            <h3 className="font-black text-sm uppercase tracking-tighter leading-none">
              {result.disease}
            </h3>
            <span className="bg-black text-brutal-neon font-mono text-[8px] px-1.5 py-0.5 font-bold whitespace-nowrap">
              {result.source}{result.confidence !== null && result.confidence !== undefined ? ` · ${Math.round(result.confidence * 100)}%` : ''}
            </span>
          </div>

          {result.status === 'uncertain' && (
            <div className="mb-2 bg-yellow-100 border-2 border-yellow-500 p-1.5">
              <p className="font-black text-[9px] uppercase text-yellow-800">{t('lowConfidenceTitle')}</p>
              <p className="font-mono text-[8px] text-yellow-700 leading-snug">{t('lowConfidenceAdvice')}</p>
            </div>
          )}

          <div className="mb-3 font-mono font-bold text-[10px] text-black bg-white p-2 border-2 border-black whitespace-pre-line leading-relaxed">
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

          <button onClick={handleShare} className="w-full bg-brutal-neon text-black py-2 text-[10px] font-black border-2 border-black flex justify-center items-center uppercase">
            <Share2 size={12} className="mr-1" /> {t('share') || 'Share'}
          </button>
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
              <div key={entry.id} className="bg-white border-2 border-black p-2 cursor-pointer hover:bg-gray-50" onClick={() => setResult({ source: entry.source, disease: entry.disease, treatment: entry.treatment, status: entry.status || 'ok', confidence: entry.confidence === undefined ? null : entry.confidence })}>
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
