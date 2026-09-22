import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getTranslation } from '../translations';
import {
  requestPersistentStorage,
  getStorageStatus,
  hasInstalledModel,
  saveModelFiles,
  deleteModelFiles,
  installModelFromFiles,
  parseModelManifest,
  isNonEmptyClassList
} from '../services/storageService';
import { unloadLocalModel } from '../services/modelStorageService';
import { readApiKey, writeApiKey, clearApiKey } from '../services/apiKeys';

const AppContext = createContext(null);

// Fetch with a real error for the "model not deployed yet" case. The previous
// downloadModel flipped a flag after a 2s timeout and claimed success over
// nothing, which made "MODEL INSTALLED" a lie.
const fetchChecked = async (url, as = 'text') => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('HTTP ' + response.status + ' for ' + url
      + (response.status === 404 ? ' - the model files are not on the server yet' : ''));
  }
  return as === 'buffer' ? response.arrayBuffer() : response.text();
};

export function AppProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [appLanguage, setAppLanguage] = useState(localStorage.getItem('krishisetu_lang') || 'en');
  const [theme, setTheme] = useState(localStorage.getItem('krishisetu_theme') || 'light');
  const [autoDetect, setAutoDetect] = useState(localStorage.getItem('krishisetu_autodetect') !== 'false');
  // User-supplied keys, read from this device only. The app ships with none.
  const [geminiKey, setGeminiKey] = useState(() => readApiKey('gemini'));
  const [mapsKey, setMapsKey] = useState(() => readApiKey('maps'));
  const [modelDownloaded, setModelDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [modelProgress, setModelProgress] = useState(0);
  const [modelError, setModelError] = useState('');
  const [storageInfo, setStorageInfo] = useState(null);

  // Online/offline listeners + model status check
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // The installed flag must mirror reality. A flag with no files on the device
    // is exactly what made the app claim "MODEL INSTALLED" over an empty folder.
    (async () => {
      const installed = await hasInstalledModel();
      if (installed === null) {
        // No OPFS in this browser - fall back to the stored flag.
        setModelDownloaded(localStorage.getItem('krishisetu_model_downloaded') === 'true');
      } else {
        setModelDownloaded(installed);
        if (installed) localStorage.setItem('krishisetu_model_downloaded', 'true');
        else localStorage.removeItem('krishisetu_model_downloaded');
      }
      setStorageInfo(await getStorageStatus());
    })();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Every dark-mode rule in index.css hangs off a `.dark` ancestor, so the class
  // has to live on <html>. Without this the overrides never matched and cards
  // stayed white inside the dark shell.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const t = useCallback((key) => getTranslation(appLanguage, key), [appLanguage]);

  const changeLanguage = useCallback((langCode) => {
    setAppLanguage(langCode);
    localStorage.setItem('krishisetu_lang', langCode);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('krishisetu_theme', newTheme);
      return newTheme;
    });
  }, []);

  const toggleAutoDetect = useCallback(() => {
    setAutoDetect((prev) => {
      localStorage.setItem('krishisetu_autodetect', (!prev).toString());
      return !prev;
    });
  }, []);

  // Keys are written to this device's storage so they survive a reload, and to
  // nothing else. There is no server to send them to.
  const saveApiKey = useCallback((id, value) => {
    const stored = writeApiKey(id, value);
    if (id === 'gemini') setGeminiKey(stored);
    if (id === 'maps') setMapsKey(stored);
    return stored;
  }, []);

  const saveGeminiKey = useCallback((key) => saveApiKey('gemini', key), [saveApiKey]);
  const saveMapsKey = useCallback((key) => saveApiKey('maps', key), [saveApiKey]);

  const removeApiKey = useCallback((id) => {
    clearApiKey(id);
    saveApiKey(id, '');
    if (id === 'gemini') setGeminiKey('');
    if (id === 'maps') setMapsKey('');
  }, [saveApiKey]);

  // Single place that updates both the flag and the real storage numbers.
  const markInstalled = useCallback(async (installed) => {
    setModelDownloaded(installed);
    if (installed) localStorage.setItem('krishisetu_model_downloaded', 'true');
    else localStorage.removeItem('krishisetu_model_downloaded');
    setStorageInfo(await getStorageStatus());
  }, []);

  // Real download: ask for persistent storage, fetch the manifest, fetch every
  // weight shard it names, write them all to OPFS, then verify by reading back.
  const downloadModel = useCallback(async () => {
    setDownloading(true);
    setModelProgress(0);
    setModelError('');
    try {
      await requestPersistentStorage();

      const manifestText = await fetchChecked('/model/model.json');
      const manifest = parseModelManifest(JSON.parse(manifestText));

      const classesText = await fetchChecked('/model/classes.json');
      if (!isNonEmptyClassList(JSON.parse(classesText))) {
        throw new Error('classes.json on the server is not a list of class names');
      }

      const entries = [
        { name: 'model.json', text: manifestText },
        { name: 'classes.json', text: classesText }
      ];
      for (let i = 0; i < manifest.shards.length; i += 1) {
        const buffer = await fetchChecked('/model/' + manifest.shards[i], 'buffer');
        entries.push({ name: manifest.shards[i], buffer });
        setModelProgress(Math.round(((i + 1) / (manifest.shards.length + 1)) * 100));
      }

      await saveModelFiles(entries);

      // Only claim success once the files can be read back off the device.
      if ((await hasInstalledModel()) !== true) {
        throw new Error('the model was written but could not be read back');
      }

      setModelProgress(100);
      unloadLocalModel();
      await markInstalled(true);
    } catch (err) {
      console.error('Model download failed', err);
      setModelError(String((err && err.message) || err));
      await markInstalled(false);
    } finally {
      setDownloading(false);
    }
  }, [markInstalled]);

  // Offline install from files the farmer picked by hand.
  const installModelFiles = useCallback(async (fileList) => {
    setDownloading(true);
    setModelError('');
    try {
      await requestPersistentStorage();
      await installModelFromFiles(fileList);
      if ((await hasInstalledModel()) !== true) {
        throw new Error('those files were written but could not be read back');
      }
      unloadLocalModel();
      await markInstalled(true);
    } catch (err) {
      console.error('Model install failed', err);
      setModelError(String((err && err.message) || err));
      await markInstalled(false);
    } finally {
      setDownloading(false);
    }
  }, [markInstalled]);

  const removeModel = useCallback(async () => {
    try {
      await deleteModelFiles();
    } catch (err) {
      console.warn('Could not delete the stored model', err);
    }
    unloadLocalModel();
    setModelProgress(0);
    setModelError('');
    await markInstalled(false);
  }, [markInstalled]);

  const clearAllData = useCallback(() => {
    if (window.confirm(getTranslation(appLanguage, 'confirmClearData'))) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  }, [appLanguage]);

  const value = useMemo(() => ({
    t,
    isOnline,
    appLanguage,
    theme,
    isDark: theme === 'dark',
    autoDetect,
    geminiKey,
    mapsKey,
    modelDownloaded,
    downloading,
    modelProgress,
    modelError,
    storageInfo,
    changeLanguage,
    toggleTheme,
    toggleAutoDetect,
    saveGeminiKey,
    saveMapsKey,
    removeApiKey,
    downloadModel,
    installModelFiles,
    removeModel,
    clearAllData
  }), [
    t, isOnline, appLanguage, theme, autoDetect, geminiKey, mapsKey,
    modelDownloaded, downloading, modelProgress, modelError, storageInfo,
    changeLanguage, toggleTheme, toggleAutoDetect,
    saveGeminiKey, saveMapsKey, removeApiKey,
    downloadModel, installModelFiles, removeModel, clearAllData
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

AppProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AppProvider;