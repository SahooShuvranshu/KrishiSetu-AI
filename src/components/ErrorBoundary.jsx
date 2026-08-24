import React from 'react';
import PropTypes from 'prop-types';
import { RefreshCw, AlertTriangle } from 'lucide-react';

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
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brutal-bg bg-agri-grid flex flex-col items-center justify-center p-4">
          <div className="bg-white border-4 border-black p-6 max-w-sm w-full shadow-brutal">
            <div className="flex items-center gap-3 mb-4 border-b-2 border-black pb-4">
              <AlertTriangle size={32} className="text-red-500" />
              <h1 className="font-black text-xl uppercase">Something Went Wrong</h1>
            </div>
            
            <div className="font-mono text-xs mb-4 bg-gray-100 p-3 border-2 border-black">
              <p className="font-bold uppercase text-gray-500 mb-1">Error:</p>
              <p className="text-red-600 break-all">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>

            <div className="font-mono text-xs mb-4 bg-gray-100 p-3 border-2 border-black">
              <p className="font-bold uppercase text-gray-500 mb-1">What happened:</p>
              <p>The app encountered an unexpected error. This could be due to:</p>
              <ul className="list-disc ml-4 mt-2">
                <li>Network connection issues</li>
                <li>Invalid API key configuration</li>
                <li>Browser compatibility problems</li>
              </ul>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="brutal-button w-full bg-brutal-neon text-black py-3 font-black uppercase flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
