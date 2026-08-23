import React, { useState, useEffect } from 'react';
import { Camera, Upload, RefreshCw } from 'lucide-react';
import { diagnoseCropLeaf } from '../services/gemini';
import { runInBrowserVisionInference } from '../services/modelStorageService';
import { speakText } from '../services/voice';

export default function CameraScan({ isOnline, appLanguage, t }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const savedImage = localStorage.getItem('krishisetu_last_scan');
    if (savedImage) {
      setImagePreview(savedImage);
    }
  }, []);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        try {
          localStorage.setItem('krishisetu_last_scan', base64String);
        } catch (e) {
          console.warn("Storage full");
        }
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

  const clearScan = () => {
    setImagePreview(null);
    setResult(null);
    localStorage.removeItem('krishisetu_last_scan');
  };

  const broadcastAlert = () => {
    if (!result) return;
    const newAlert = {
      origin: "Your Farm (Local)",
      target: "Nearby Districts",
      lat: 20.29, // Default approx location
      lng: 85.82,
      pest: result.disease.replace(/\(.*\)/, '').trim(),
      crop: "Local Crop",
      severity: "High",
      advice: "Automated AI Warning: A local farmer just detected this pest. Inspect crops immediately."
    };
    const existing = JSON.parse(localStorage.getItem('krishisetu_alerts') || '[]');
    localStorage.setItem('krishisetu_alerts', JSON.stringify([newAlert, ...existing]));
    alert(t('broadcastSuccess'));
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-10">
      
      {!imagePreview && (
        <div className="flex flex-col gap-4 mt-4">
          <p className="font-mono text-xs uppercase text-gray-600 text-center mb-2">{t('takePhotoInstruction')}</p>
          
          <label className="brutal-button bg-brutal-neon text-black p-6 flex flex-col items-center justify-center gap-2 cursor-pointer border-2 border-black shadow-brutal text-lg uppercase tracking-wider">
            <Camera size={40} />
            {t('openCamera')}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={handleImageSelect}
            />
          </label>

          <label className="brutal-button bg-white text-black p-6 flex flex-col items-center justify-center gap-2 cursor-pointer border-2 border-black shadow-brutal text-lg uppercase tracking-wider">
            <Upload size={40} />
            {t('uploadPhoto')}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageSelect}
            />
          </label>
        </div>
      )}

      {imagePreview && (
        <div className="relative border-2 border-black shadow-brutal-hover bg-black aspect-[3/4] overflow-hidden">
          <img src={imagePreview} alt="Scan Preview" className="w-full h-full object-contain" />
          
          {loading && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 text-brutal-neon font-mono">
              <RefreshCw size={32} className="animate-spin mb-3" />
              <p className="text-sm uppercase tracking-widest">{t('checkingCrop')}</p>
            </div>
          )}
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
          
          {/* BROADCAST BUTTON */}
          <button 
            onClick={broadcastAlert}
            className="brutal-button w-full bg-red-500 text-white py-3 text-sm font-black border-2 border-black flex justify-center items-center uppercase mt-2 shadow-[4px_4px_0_0_#000]"
          >
            {t('broadcastAlert')}
          </button>
        </div>
      )}
    </div>
  );
}
