import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Terjadi kesalahan saat memuat halaman ini.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[FazuraStream ErrorBoundary]', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] bg-bg-primary text-text-primary flex items-center justify-center p-4">
          <div className="max-w-md w-full p-7 rounded-3xl bg-surface border border-border-subtle text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white font-heading">
                Oops! Halaman Mengalami Gangguan
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {this.state.errorMessage}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/25 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Muat Ulang
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-secondary text-text-primary text-xs sm:text-sm font-semibold border border-border-subtle flex items-center justify-center gap-2 transition-colors"
              >
                <Home className="w-4 h-4" />
                Ke Beranda
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
