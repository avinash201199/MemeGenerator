import React from 'react';

/**
 * Loading Overlay Component
 * Provides visual feedback during export operations with progress indication
 */
const LoadingOverlay = ({ 
  isVisible = false,
  message = 'Processing...',
  progress = null,
  canCancel = false,
  onCancel = null,
  type = 'export' // 'export', 'upload', 'processing'
}) => {
  if (!isVisible) {
    return null;
  }

  const getLoadingIcon = () => {
    switch (type) {
      case 'export':
        return 'fas fa-download';
      case 'upload':
        return 'fas fa-upload';
      case 'processing':
        return 'fas fa-cog';
      default:
        return 'fas fa-spinner';
    }
  };

  const getLoadingMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'export':
        return 'Exporting your meme...';
      case 'upload':
        return 'Uploading image...';
      case 'processing':
        return 'Processing image...';
      default:
        return 'Please wait...';
    }
  };

  const loadingCSS = `
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease-out;
    }

    .loading-content {
      background: white;
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      border: 1px solid #e2e8f0;
      max-width: 400px;
      width: 90%;
      animation: scaleIn 0.3s ease-out;
    }

    .loading-icon-container {
      position: relative;
      margin-bottom: 24px;
      display: inline-block;
    }

    .loading-icon {
      font-size: 48px;
      color: #667eea;
      animation: pulse 2s ease-in-out infinite;
    }

    .loading-spinner {
      position: absolute;
      top: -8px;
      left: -8px;
      right: -8px;
      bottom: -8px;
      border: 3px solid #e2e8f0;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-title {
      font-size: 20px;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 12px 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .loading-message {
      font-size: 16px;
      color: #4a5568;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    .loading-progress {
      margin-bottom: 24px;
    }

    .loading-progress-bar {
      width: 100%;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }

    .loading-progress-fill {
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 4px;
      transition: width 0.3s ease;
      position: relative;
    }

    .loading-progress-fill::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.4),
        transparent
      );
      animation: shimmer 2s ease-in-out infinite;
    }

    .loading-progress-text {
      font-size: 14px;
      color: #718096;
      margin-top: 8px;
      font-weight: 500;
    }

    .loading-progress-indeterminate .loading-progress-fill {
      width: 30% !important;
      animation: indeterminateProgress 2s ease-in-out infinite;
    }

    .loading-cancel {
      background: none;
      border: 2px solid #e2e8f0;
      color: #4a5568;
      padding: 10px 20px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .loading-cancel:hover {
      border-color: #cbd5e0;
      background: #f7fafc;
      transform: translateY(-1px);
    }

    .loading-cancel:active {
      transform: translateY(0);
    }

    .loading-steps {
      text-align: left;
      margin-bottom: 24px;
    }

    .loading-step {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      font-size: 14px;
      color: #4a5568;
    }

    .loading-step-icon {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      flex-shrink: 0;
    }

    .loading-step-completed .loading-step-icon {
      background: #48bb78;
      color: white;
    }

    .loading-step-active .loading-step-icon {
      background: #667eea;
      color: white;
      animation: pulse 2s ease-in-out infinite;
    }

    .loading-step-pending .loading-step-icon {
      background: #e2e8f0;
      color: #a0aec0;
    }

    .loading-step-completed {
      color: #2d3748;
    }

    .loading-step-active {
      color: #2d3748;
      font-weight: 500;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes scaleIn {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.7;
        transform: scale(1.05);
      }
    }

    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }

    @keyframes indeterminateProgress {
      0% {
        left: -30%;
      }
      100% {
        left: 100%;
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .loading-content {
        padding: 30px 24px;
        border-radius: 16px;
        max-width: 350px;
      }

      .loading-icon {
        font-size: 40px;
      }

      .loading-title {
        font-size: 18px;
      }

      .loading-message {
        font-size: 15px;
      }
    }

    @media (max-width: 480px) {
      .loading-content {
        padding: 24px 20px;
        border-radius: 12px;
        width: 95%;
      }

      .loading-icon {
        font-size: 36px;
      }

      .loading-title {
        font-size: 16px;
        margin-bottom: 8px;
      }

      .loading-message {
        font-size: 14px;
        margin-bottom: 20px;
      }

      .loading-cancel {
        padding: 8px 16px;
        font-size: 13px;
      }
    }
  `;

  return (
    <>
      <style>{loadingCSS}</style>
      <div className="loading-overlay" role="dialog" aria-modal="true" aria-labelledby="loading-title">
        <div className="loading-content">
          <div className="loading-icon-container">
            <i className={`${getLoadingIcon()} loading-icon`}></i>
            <div className="loading-spinner"></div>
          </div>
          
          <h3 id="loading-title" className="loading-title">
            {type === 'export' ? 'Exporting Meme' : 
             type === 'upload' ? 'Uploading Image' : 
             type === 'processing' ? 'Processing Image' : 'Loading'}
          </h3>
          
          <p className="loading-message">{getLoadingMessage()}</p>

          {progress !== null && (
            <div className="loading-progress">
              <div className={`loading-progress-bar ${progress < 0 ? 'loading-progress-indeterminate' : ''}`}>
                <div 
                  className="loading-progress-fill"
                  style={{ width: progress >= 0 ? `${Math.max(0, Math.min(100, progress))}%` : '30%' }}
                ></div>
              </div>
              {progress >= 0 && (
                <div className="loading-progress-text">
                  {Math.round(progress)}% complete
                </div>
              )}
            </div>
          )}

          {type === 'export' && (
            <div className="loading-steps">
              <div className="loading-step loading-step-completed">
                <div className="loading-step-icon">
                  <i className="fas fa-check"></i>
                </div>
                <span>Processing image</span>
              </div>
              <div className="loading-step loading-step-active">
                <div className="loading-step-icon">
                  <i className="fas fa-cog fa-spin"></i>
                </div>
                <span>Generating download file</span>
              </div>
              <div className="loading-step loading-step-pending">
                <div className="loading-step-icon">3</div>
                <span>Starting download</span>
              </div>
            </div>
          )}

          {canCancel && onCancel && (
            <button 
              className="loading-cancel"
              onClick={onCancel}
              aria-label="Cancel operation"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default LoadingOverlay;