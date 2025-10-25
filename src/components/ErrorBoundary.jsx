import React from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors in the export system and provides fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now() + Math.random()
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Export system error caught by boundary:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report error to monitoring service if available
    if (window.reportError) {
      window.reportError(error, {
        component: 'ExportSystem',
        errorInfo: errorInfo,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorBoundaryCSS = `
        .error-boundary {
          background: white;
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          border: 1px solid #fed7d7;
          margin-top: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .error-boundary-icon {
          font-size: 48px;
          color: #e53e3e;
          margin-bottom: 20px;
        }

        .error-boundary-title {
          font-size: 24px;
          font-weight: 600;
          color: #2d3748;
          margin: 0 0 16px 0;
        }

        .error-boundary-message {
          font-size: 16px;
          color: #4a5568;
          margin: 0 0 24px 0;
          line-height: 1.6;
        }

        .error-boundary-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .error-boundary-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .error-boundary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .error-boundary-button-secondary {
          background: none;
          color: #4a5568;
          border: 2px solid #e2e8f0;
        }

        .error-boundary-button-secondary:hover {
          background: #f7fafc;
          border-color: #cbd5e0;
          box-shadow: none;
        }

        .error-boundary-details {
          margin-top: 24px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
          text-align: left;
          font-size: 12px;
          color: #718096;
          max-height: 200px;
          overflow-y: auto;
        }

        .error-boundary-details-toggle {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          font-size: 14px;
          text-decoration: underline;
          margin-top: 16px;
        }

        .error-boundary-suggestions {
          background: #e6fffa;
          border: 1px solid #81e6d9;
          border-radius: 8px;
          padding: 16px;
          margin-top: 20px;
          text-align: left;
        }

        .error-boundary-suggestions-title {
          font-weight: 600;
          color: #234e52;
          margin: 0 0 8px 0;
          font-size: 14px;
        }

        .error-boundary-suggestions-list {
          margin: 0;
          padding-left: 20px;
          color: #285e61;
          font-size: 13px;
        }

        .error-boundary-suggestions-list li {
          margin-bottom: 4px;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .error-boundary {
            padding: 30px 20px;
            border-radius: 16px;
          }

          .error-boundary-icon {
            font-size: 40px;
          }

          .error-boundary-title {
            font-size: 20px;
          }

          .error-boundary-message {
            font-size: 15px;
          }

          .error-boundary-actions {
            flex-direction: column;
            align-items: center;
          }

          .error-boundary-button {
            width: 100%;
            max-width: 200px;
          }
        }

        @media (max-width: 480px) {
          .error-boundary {
            padding: 24px 16px;
            margin: 16px 10px 0;
          }

          .error-boundary-icon {
            font-size: 36px;
          }

          .error-boundary-title {
            font-size: 18px;
          }

          .error-boundary-message {
            font-size: 14px;
          }
        }
      `;

      return (
        <>
          <style>{errorBoundaryCSS}</style>
          <div className="error-boundary" role="alert">
            <div className="error-boundary-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            
            <h2 className="error-boundary-title">
              Export System Error
            </h2>
            
            <p className="error-boundary-message">
              Something went wrong with the export system. This is usually a temporary issue.
            </p>

            <div className="error-boundary-suggestions">
              <div className="error-boundary-suggestions-title">
                Try these solutions:
              </div>
              <ul className="error-boundary-suggestions-list">
                <li>Click "Try Again" to retry the operation</li>
                <li>Refresh the page if the problem persists</li>
                <li>Try using a different browser or device</li>
                <li>Check your internet connection</li>
                <li>Clear your browser cache and cookies</li>
              </ul>
            </div>

            <div className="error-boundary-actions">
              <button 
                className="error-boundary-button"
                onClick={this.handleRetry}
              >
                <i className="fas fa-redo"></i> Try Again
              </button>
              
              <button 
                className="error-boundary-button error-boundary-button-secondary"
                onClick={this.handleReload}
              >
                <i className="fas fa-refresh"></i> Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <>
                <button 
                  className="error-boundary-details-toggle"
                  onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                >
                  {this.state.showDetails ? 'Hide' : 'Show'} Error Details
                </button>
                
                {this.state.showDetails && (
                  <div className="error-boundary-details">
                    <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                    <br /><br />
                    <strong>Stack Trace:</strong>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;