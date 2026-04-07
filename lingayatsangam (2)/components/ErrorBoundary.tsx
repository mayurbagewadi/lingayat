import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import * as Sentry from '@sentry/react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary catches JavaScript errors anywhere in the child component tree.
 * Prevents white screen of death and allows graceful error recovery.
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<State> {
    // Update state so next render shows error UI (actual error details set in componentDidCatch)
    return { hasError: true };
  }

  componentDidCatch(_error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('Error caught by boundary:', _error);
    console.error('Component stack:', errorInfo.componentStack);

    // Store error info for display
    this.setState({
      error: _error,
      errorInfo
    });

    // Send to Sentry for error tracking
    Sentry.captureException(_error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      },
      level: 'error'
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {/* Error Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border-2 border-red-100 dark:border-red-900/30">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-black text-center text-gray-900 dark:text-white mb-2">
                Oops! Something Went Wrong
              </h1>

              {/* Error Message */}
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                We encountered an unexpected error. Our team has been notified and we're working on a fix.
              </p>

              {/* Error Details (Dev Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <p className="text-xs font-mono text-red-700 dark:text-red-300 break-words">
                    <strong>Error:</strong> {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                        Stack Trace (Click to expand)
                      </summary>
                      <pre className="text-xs text-red-600 dark:text-red-400 mt-2 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.resetError}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Try Again
                </button>

                <a
                  href="/"
                  className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Home size={18} />
                  Go to Home
                </a>
              </div>

              {/* Support Message */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
                If the problem persists, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
