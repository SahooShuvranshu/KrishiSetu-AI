import React, { useState, useEffect } from 'react';
import { KeyRound, Trash2, ShieldCheck, AlertTriangle, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from './Toast.jsx';
import { describeKey, maskKey } from '../services/apiKeys';
// Error codes come from the SDK-free module, and the SDK itself is imported
// only when the user presses Test - otherwise the vendor SDK would land in the
// initial bundle instead of the lazy scan chunk.
import { CLOUD_ERROR_CODES } from '../services/geminiParsing';

/**
 * One API key field, stored on the user's device.
 *
 * The value is only written when Save is pressed - not on every keystroke, which
 * is what the old single field did (a write to storage per character).
 */
export default function ApiKeyField({ id, labelKey, hintKey, placeholder = 'AIza...', onSaved }) {
  const { t, isDark, isOnline, geminiKey, mapsKey, saveGeminiKey, saveMapsKey, removeApiKey } = useApp();
  const toast = useToast();
  const stored = id === 'gemini' ? geminiKey : mapsKey;

  const [draft, setDraft] = useState(stored);
  const [testing, setTesting] = useState(false);

  // Keep the field in step when the key is cleared elsewhere (Clear All Data).
  useEffect(() => {
    setDraft(stored);
  }, [stored]);

  const status = describeKey(stored);
  const dirty = draft.trim() !== stored;
  const malformed = dirty && draft.trim() !== '' && describeKey(draft) === 'malformed';

  const handleSave = () => {
    const saved = id === 'gemini' ? saveGeminiKey(draft) : saveMapsKey(draft);
    setDraft(saved);
    onSaved(saved ? 'saved' : 'removed');
  };

  const handleRemove = () => {
    removeApiKey(id);
    setDraft('');
    onSaved('removed');
  };

  // Ask Google directly whether the stored key works. A working key and a dead
  // one both look the same in the app (a silent fall back to the offline
  // model), so this is the only way for a user to tell them apart.
  const handleTest = async () => {
    setTesting(true);
    try {
      const { verifyGeminiKey } = await import('../services/gemini');
      await verifyGeminiKey(stored);
      toast.success(t('keyTestOk'), t('settings'));
    } catch (err) {
      const code = err && err.code;
      if (code === CLOUD_ERROR_CODES.keyRejected) toast.error(t('keyTestRejected'), t('settings'));
      else if (code === CLOUD_ERROR_CODES.quota) toast.info(t('keyTestQuota'), t('settings'));
      else toast.error(t('keyTestFailed'), t('settings'));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="mb-3">
      <label
        htmlFor={`key-${id}`}
        className="font-bold uppercase text-gray-500 mb-1 flex items-center gap-1.5 text-[10px]"
      >
        <KeyRound size={12} /> {t(labelKey)}
      </label>

      <div className="flex gap-2">
        <input
          id={`key-${id}`}
          type="password"
          autoComplete="off"
          spellCheck="false"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          className={`w-full min-w-0 p-2 border-2 border-black font-mono text-xs focus:outline-none focus:bg-brutal-neon ${
            isDark ? 'bg-gray-600 text-white' : 'bg-white'
          }`}
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty}
          className="bg-black text-white px-3 py-2 font-bold uppercase border-2 border-black hover:bg-brutal-neon hover:text-black transition-colors whitespace-nowrap text-xs disabled:opacity-40 disabled:hover:bg-black disabled:hover:text-white"
        >
          {t('save')}
        </button>
      </div>

      <p className="text-[10px] text-gray-600 mt-1 leading-snug">{t(hintKey)}</p>

      {status === 'valid' && !dirty && (
        <div className="flex items-center justify-between gap-2 mt-1.5">
          <span className="text-[10px] font-bold uppercase text-green-600 flex items-center gap-1">
            <ShieldCheck size={12} /> {t('keyStatusOnDevice')}: {maskKey(stored)}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {id === 'gemini' && isOnline && (
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="text-[10px] font-bold uppercase text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-50"
              >
                <Zap size={11} /> {testing ? t('downloading') : t('testKey')}
              </button>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="text-[10px] font-bold uppercase text-red-600 flex items-center gap-1 hover:underline"
            >
              <Trash2 size={11} /> {t('remove')}
            </button>
          </div>
        </div>
      )}

      {status === 'empty' && !dirty && (
        <span className="text-[10px] font-bold uppercase text-gray-500 mt-1.5 block">
          {t('keyStatusEmpty')}
        </span>
      )}

      {malformed && (
        <span className="text-[10px] font-bold text-yellow-700 mt-1.5 flex items-start gap-1 leading-snug">
          <AlertTriangle size={12} className="shrink-0 mt-0.5" /> {t('keyShapeWarning')}
        </span>
      )}
    </div>
  );
}
