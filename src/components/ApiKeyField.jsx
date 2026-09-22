import React, { useState, useEffect } from 'react';
import { KeyRound, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { describeKey, maskKey } from '../services/apiKeys';

/**
 * One API key field, stored on the user's device.
 *
 * The value is only written when Save is pressed - not on every keystroke, which
 * is what the old single field did (a write to storage per character).
 */
export default function ApiKeyField({ id, labelKey, hintKey, placeholder = 'AIza...', onSaved }) {
  const { t, isDark, geminiKey, mapsKey, saveGeminiKey, saveMapsKey, removeApiKey } = useApp();
  const stored = id === 'gemini' ? geminiKey : mapsKey;

  const [draft, setDraft] = useState(stored);

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
          <button
            type="button"
            onClick={handleRemove}
            className="text-[10px] font-bold uppercase text-red-600 flex items-center gap-1 hover:underline"
          >
            <Trash2 size={11} /> {t('remove')}
          </button>
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
