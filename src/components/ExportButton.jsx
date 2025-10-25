import React, { useState } from 'react';

const ExportButton = ({ 
  onExport, 
  disabled = false, 
  format = 'png',
  quality = 80,
  isExporting = false 
}) => {
  const [exportStatus, setExportStatus] = useState('idle'); // idle, exporting, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleExportClick = async () => {
    if (disabled || isExporting) return;

    try {
      setExportStatus('exporting');
      setErrorMessage('');
      
      await onExport(format, quality);
      
      setExportStatus('success');
      
      // Reset to idle after showing success
      setTimeout(() => {
        setExportStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      
      // Don't show error message here since parent component handles notifications
      // Just show brief error state
      setErrorMessage('Export failed - see notification above');
      
      // Reset to idle after showing error
      setTimeout(() => {
        setExportStatus('idle');
        setErrorMessage('');
      }, 3000);
    }
  };

  const getButtonText = () => {
    switch (exportStatus) {
      case 'exporting':
        return 'Exporting...';
      case 'success':
        return 'Downloaded!';
      case 'error':
        return 'Export Failed';
      default:
        return `Export as ${format.toUpperCase()}`;
    }
  };

  const getButtonIcon = () => {
    switch (exportStatus) {
      case 'exporting':
        return 'fas fa-spinner fa-spin';
      case 'success':
        return 'fas fa-check';
      case 'error':
        return 'fas fa-exclamation-triangle';
      default:
        return 'fas fa-download';
    }
  };

  const getButtonColor = () => {
    switch (exportStatus) {
      case 'success':
        return {
          background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
          borderColor: '#38a169'
        };
      case 'error':
        return {
          background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
          borderColor: '#e53e3e'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderColor: '#667eea'
        };
    }
  };

  // CSS for responsive design
  const responsiveCSS = `
    .export-button-container {
      margin-bottom: 16px;
    }

    .export-button {
      color: white;
      border: 2px solid;
      padding: 14px 24px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      min-height: 52px;
      font-family: inherit;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .export-button:hover:not(.export-button-disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .export-button:active:not(.export-button-disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .export-button-disabled {
      opacity: 0.6;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }

    .export-button-default {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: #667eea;
    }

    .export-button-success {
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
      border-color: #38a169;
    }

    .export-button-error {
      background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
      border-color: #e53e3e;
    }

    .export-button-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .export-button-quality-info {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
    }

    .export-button-error-message {
      margin-top: 8px;
      padding: 12px;
      background: #fed7d7;
      color: #c53030;
      border-radius: 6px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Responsive breakpoints */
    @media (max-width: 768px) {
      .export-button {
        padding: 12px 20px;
        font-size: 15px;
        min-height: 48px;
        gap: 8px;
      }

      .export-button-quality-info {
        font-size: 11px;
      }

      .export-button-error-message {
        padding: 10px;
        font-size: 13px;
        gap: 6px;
      }
    }

    @media (max-width: 480px) {
      .export-button {
        padding: 12px 16px;
        font-size: 14px;
        min-height: 44px;
        border-radius: 10px;
      }

      .export-button-content {
        gap: 1px;
      }

      .export-button-quality-info {
        font-size: 10px;
      }

      .export-button-error-message {
        padding: 8px 10px;
        font-size: 12px;
        gap: 4px;
      }
    }
  `;

  const getButtonClasses = () => {
    const baseClasses = ['export-button'];
    
    if (disabled || isExporting) {
      baseClasses.push('export-button-disabled');
    }

    switch (exportStatus) {
      case 'success':
        baseClasses.push('export-button-success');
        break;
      case 'error':
        baseClasses.push('export-button-error');
        break;
      default:
        baseClasses.push('export-button-default');
        break;
    }

    return baseClasses.join(' ');
  };

  const styles = {
    container: {
      marginBottom: '16px'
    }
  };

  return (
    <>
      <style>{responsiveCSS}</style>
      <div className="export-button-container" style={styles.container}>
        <button
          className={getButtonClasses()}
          onClick={handleExportClick}
          disabled={disabled || isExporting}
          aria-label={`Export meme as ${format.toUpperCase()}${format !== 'png' ? ` at ${quality}% quality` : ''}`}
        >
          <i className={getButtonIcon()}></i>
          <div className="export-button-content">
            <div>{getButtonText()}</div>
            {exportStatus === 'idle' && format !== 'png' && (
              <div className="export-button-quality-info">Quality: {quality}%</div>
            )}
          </div>
        </button>
        
        {errorMessage && (
          <div className="export-button-error-message">
            <i className="fas fa-exclamation-circle"></i>
            {errorMessage}
          </div>
        )}
      </div>
    </>
  );
};

export default ExportButton;