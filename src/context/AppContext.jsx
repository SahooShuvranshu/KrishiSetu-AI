import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getTranslation } from '../translations';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [appLanguage, setAppLanguage] = useState(localStorage.getItem('krishisetu_lang') || 'en');
  const [theme, setTheme] = useState(localStorage.getItem('krishisetu_theme') || 'default');
  const [notifications, setNotifications] = useState(localStorage.getItem('krishisetu_notifications') !== 'false');
  const [autoDetect, setAutoDetect] = useState(localStorage.getItem('krishisetu_autodetect') !== 'false');
  const [geminiKey, setGeminiKey] = useState(sessionStorage.getItem('krishisetu_gemini_key') || '');
  const [modelDownloaded, setModelDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Online/offline listeners + model status check
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (localStorage.getItem('krishisetu_model_downloaded') === 'true') {
      setModelDownloaded(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const t = useCallback((key) => getTranslation(appLanguage, key), [appLanguage]);

  const changeLanguage = useCallback((langCode) => {
    setAppLanguage(langCode);
    localStorage.setItem('krishisetu_lang', langCode);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('krishisetu_theme', newTheme);
      return newTheme;
    });
  }, []);

  const toggleNotifications = useCallback(() => {
    setNotifications((prev) => {
      localStorage.setItem('krishisetu_notifications', (!prev).toString());
      return !prev;
    });
  }, []);

  const toggleAutoDetect = useCallback(() => {
    setAutoDetect((prev) => {
      localStorage.setItem('krishisetu_autodetect', (!prev).toString());
      return !prev;
    });
  }, []);

  const saveGeminiKey = useCallback((key) => {
    setGeminiKey(key);
    // sessionStorage (not localStorage) so the key never persists on disk
    sessionStorage.setItem('krishisetu_gemini_key', key);
  }, []);

  const downloadModel = useCallback(() => {
    setDownloading(true);
    setTimeout(() => {
      localStorage.setItem('krishisetu_model_downloaded', 'true');
      setModelDownloaded(true);
      setDownloading(false);
    }, 2000);
  }, []);

  const removeModel = useCallback(() => {
    localStorage.removeItem('krishisetu_model_downloaded');
    setModelDownloaded(false);
  }, []);

  const clearAllData = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all app data?')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  }, []);

  const value = useMemo(() => ({
    t,
    isOnline,
    appLanguage,
    theme,
    isDark: theme === 'dark',
    notifications,
    autoDetect,
    geminiKey,
    modelDownloaded,
    downloading,
    changeLanguage,
    toggleTheme,
    toggleNotifications,
    toggleAutoDetect,
    saveGeminiKey,
    downloadModel,
    removeModel,
    clearAllData
  }), [
    t, isOnline, appLanguage, theme, notifications, autoDetect, geminiKey,
    modelDownloaded, downloading, changeLanguage, toggleTheme, toggleNotifications,
    toggleAutoDetect, saveGeminiKey, downloadModel, removeModel, clearAllData
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