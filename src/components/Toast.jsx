import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

// Toast context
const ToastContext = React.createContext();

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// Toast types
const TOAST_TYPES = {
  success: { icon: CheckCircle, bg: 'bg-green-600', border: 'border-green-800' },
  error: { icon: AlertTriangle, bg: 'bg-red-600', border: 'border-red-800' },
  info: { icon: Info, bg: 'bg-blue-600', border: 'border-blue-800' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-500', border: 'border-yellow-700' }
};

// Single Toast component
function Toast({ toast, onRemove }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const typeConfig = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
  const Icon = typeConfig.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRemoving(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={`flex items-start gap-3 p-3 border-2 border-black shadow-brutal ${typeConfig.bg} text-white max-w-sm w-full transition-all duration-300 ${
        isRemoving ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
    >
      <Icon size={20} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {toast.title && (
          <p className="font-black text-sm uppercase">{toast.title}</p>
        )}
        <p className="font-mono text-xs opacity-90">{toast.message}</p>
      </div>
      <button
        onClick={() => {
          setIsRemoving(true);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="flex-shrink-0 p-1 hover:bg-white/20 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Toast Provider
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Convenience methods
  const toast = {
    success: (message, title) => addToast({ type: 'success', message, title }),
    error: (message, title) => addToast({ type: 'error', message, title }),
    info: (message, title) => addToast({ type: 'info', message, title }),
    warning: (message, title) => addToast({ type: 'warning', message, title })
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ToastProvider;
