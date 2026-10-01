import React from 'react';
import PropTypes from 'prop-types';
import { RefreshCw, AlertTriangle } from 'lucide-react';

// English fallbacks keep this usable outside AppProvider (main.jsx mounts one
// without `t`, so a crash in <App> itself is still caught).
const FALLBACK = {
  errorTitle: 'Something Went Wrong',
  errorLabel: 'Error:',
  unknownError: 'Unknown error',
  whatHappenedLabel: 'What happened:',
  errorCauseIntro: 'The app hit an unexpected error. This could be due to:',
  errorCauseNetwork: 'A network connection problem',
  errorCauseKey: 'An invalid API key',
  errorCauseBrowser: 'A browser compatibility problem',
  reloadApp: 'Reload App'
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const t = (key) => (this.props.t ? this.props.t(key) : FALLBACK[key] || key);

    return (
      <div className="min-h-screen bg-brutal-bg bg-agri-grid flex flex-col items-center justify-center p-4">
        <div className="bg-white border-4 border-black p-6 max-w-sm w-full shadow-brutal">
          <div className="flex items-center gap-3 mb-4 border-b-2 border-black pb-4">
            <AlertTriangle size={32} className="text-red-500" />
            <h1 className="font-black text-xl uppercase">{t('errorTitle')}</h1>
          </div>

          <div className="font-mono text-xs mb-4 bg-gray-100 p-3 border-2 border-black">
            <p className="font-bold uppercase text-gray-500 mb-1">{t('errorLabel')}</p>
            <p className="text-red-600 break-all">
              {this.state.error?.message || t('unknownError')}
            </p>
          </div>

          <div className="font-mono text-xs mb-4 bg-gray-100 p-3 border-2 border-black">
            <p className="font-bold uppercase text-gray-500 mb-1">{t('whatHappenedLabel')}</p>
            <p>{t('errorCauseIntro')}</p>
            <ul className="list-disc ml-4 mt-2">
              <li>{t('errorCauseNetwork')}</li>
              <li>{t('errorCauseKey')}</li>
              <li>{t('errorCauseBrowser')}</li>
            </ul>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="brutal-button w-full bg-brutal-neon text-black py-3 font-black uppercase flex items-center justify-center gap-2"
          >
            <RefreshCw size={20} />
            {t('reloadApp')}
          </button>
        </div>
      </div>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  t: PropTypes.func
};

export default ErrorBoundary;
