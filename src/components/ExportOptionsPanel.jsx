import React, { useState, useEffect, useCallback } from 'react';
import FormatSelector from './FormatSelector';
import QualitySlider from './QualitySlider';
import FileSizeEstimator from './FileSizeEstimator';
import ExportButton from './ExportButton';
import NotificationSystem, { useNotifications } from './NotificationSystem';
import LoadingOverlay from './LoadingOverlay';
import ExportProcessor from '../utils/ExportProcessor';
import ErrorHandler from '../utils/ErrorHandler';
import CanvasConverter from '../utils/CanvasConverter';
import PerformanceMonitor from '../utils/PerformanceMonitor';
import PerformanceOptimizer from '../utils/PerformanceOptimizer';

const ExportOptionsPanel = ({ 
  memeImageSrc = null, 
  isVisible = true,
  onExport = null 
}) => {
  // State management for format, quality, and export status
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [quality, setQuality] = useState(80);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [exportProgress, setExportProgress] = useState(null);

  // Notification system
  const {
    notifications,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading
  } = useNotifications();

  // Initialize performance optimizations on component mount
  useEffect(() => {
    // Initialize canvas cache cleanup
    CanvasConverter.initializeCacheCleanup();
    
    // Initialize blob URL cleanup
    ExportProcessor.initializeBlobUrlCleanup();
    
    // Initialize performance optimizer
    PerformanceOptimizer.initializeMonitoring({
      interval: 5000, // Monitor every 5 seconds
      trackMemory: true,
      trackTiming: true
    });
    
    // Start performance monitoring in development
    if (process.env.NODE_ENV === 'development') {
      PerformanceMonitor.startMonitoring({
        trackMemory: true,
        trackTiming: true,
        memoryCheckInterval: 10000 // Check every 10 seconds
      });
    }

    // Cleanup on unmount
    return () => {
      PerformanceOptimizer.stopMonitoring();
      
      if (process.env.NODE_ENV === 'development') {
        PerformanceMonitor.stopMonitoring();
      }
    };
  }, []);

  // Reset error when meme changes and ensure state synchronization
  useEffect(() => {
    setExportError(null);
    // Reset export state when new meme is loaded
    setIsExporting(false);
  }, [memeImageSrc]);

  // Ensure quality slider visibility updates when format changes
  useEffect(() => {
    // Reset quality to default when switching to PNG (since it's not used)
    if (selectedFormat === 'png') {
      setQuality(80); // Reset to default but won't be used
    }
  }, [selectedFormat]);

  // Handle format change
  const handleFormatChange = useCallback((format) => {
    setSelectedFormat(format);
    setExportError(null);
  }, []);

  // Handle quality change
  const handleQualityChange = useCallback((newQuality) => {
    setQuality(newQuality);
    setExportError(null);
  }, []);

  // Handle export process with comprehensive feedback and error handling
  const handleExport = useCallback(async (format, qualityValue) => {
    if (!memeImageSrc) {
      const errorMsg = 'No meme available to export';
      setExportError(errorMsg);
      showError(errorMsg, {
        title: 'Export Failed',
        actions: [{
          label: 'Generate Meme First',
          onClick: () => {
            // Could scroll to meme generator or show help
            showInfo('Please generate a meme first, then try exporting again.');
          }
        }]
      });
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setExportProgress(0);
    setLoadingMessage('Preparing export...');

    // Show loading notification
    const loadingNotificationId = showLoading('Preparing your meme for export...', {
      title: 'Exporting Meme'
    });

    try {
      // Step 1: Validate browser compatibility
      setLoadingMessage('Checking browser compatibility...');
      setExportProgress(10);
      
      const compatibilityIssues = await ErrorHandler.checkCompatibilityIssues();
      if (compatibilityIssues.hasIssues) {
        const criticalIssues = compatibilityIssues.issues.filter(
          issue => issue.severity === ErrorHandler.SEVERITY_LEVELS.CRITICAL
        );
        
        if (criticalIssues.length > 0) {
          throw new Error('Browser compatibility issue: ' + criticalIssues[0].message);
        }
        
        // Show warnings for non-critical issues
        compatibilityIssues.issues.forEach(issue => {
          if (issue.severity === ErrorHandler.SEVERITY_LEVELS.HIGH) {
            showWarning(issue.message, {
              title: 'Compatibility Warning',
              autoHide: false
            });
          }
        });
      }

      // Step 2: Generate filename
      setLoadingMessage('Generating filename...');
      setExportProgress(20);
      
      const filenameOptions = {
        includeQuality: format !== 'png',
        quality: qualityValue,
        includeUniqueId: true
      };
      const filename = ExportProcessor.generateFilename(format, null, filenameOptions);
      
      // Step 3: Process image
      setLoadingMessage('Processing image...');
      setExportProgress(40);
      
      // Step 4: Convert and export
      setLoadingMessage('Converting to ' + format.toUpperCase() + '...');
      setExportProgress(60);
      
      // Perform the export using the current state values
      const result = await ExportProcessor.exportMeme(memeImageSrc, format, qualityValue, filename);
      
      setExportProgress(90);
      setLoadingMessage('Starting download...');
      
      // Remove loading notification
      removeNotification(loadingNotificationId);
      
      // Check if export was successful
      if (!result.success || !result.downloadSuccess) {
        throw new Error(result.error || 'Export failed');
      }
      
      setExportProgress(100);
      setLoadingMessage('Export complete!');
      
      // Show success notification with details
      const fileSizeFormatted = result.fileSize > 1024 * 1024 
        ? `${(result.fileSize / (1024 * 1024)).toFixed(1)} MB`
        : `${(result.fileSize / 1024).toFixed(0)} KB`;
      
      showSuccess(`Successfully exported as ${format.toUpperCase()}`, {
        title: 'Export Complete',
        message: `File: ${result.filename} (${fileSizeFormatted})`,
        actions: [{
          label: 'Export Another',
          primary: true,
          onClick: () => {
            // Could trigger another export or show format options
            showInfo('You can change format and quality settings above to export another version.');
          }
        }]
      });
      
      // Call parent callback if provided with current state
      if (onExport) {
        onExport(format, qualityValue);
      }
      
    } catch (error) {
      console.error('Export failed:', error);
      
      // Remove loading notification
      removeNotification(loadingNotificationId);
      
      // Use ErrorHandler to get user-friendly error information
      const errorInfo = ErrorHandler.handleExportError(error, {
        format,
        quality: qualityValue,
        imageSource: memeImageSrc
      });
      
      // Set local error state
      setExportError(errorInfo.message);
      
      // Show error notification with recovery options
      const errorActions = errorInfo.recoveryOptions.map(option => ({
        label: option.label,
        onClick: () => {
          switch (option.action) {
            case 'reduce_quality':
              setQuality(50);
              showInfo('Quality reduced to 50%. Try exporting again.');
              break;
            case 'use_png':
              setSelectedFormat('png');
              showInfo('Switched to PNG format. Try exporting again.');
              break;
            case 'use_jpeg':
              setSelectedFormat('jpeg');
              showInfo('Switched to JPEG format. Try exporting again.');
              break;
            case 'retry':
              // Retry the same export
              setTimeout(() => handleExport(format, qualityValue), 1000);
              break;
            default:
              showInfo(option.label);
          }
        }
      }));

      // Add fallback action
      if (errorInfo.fallbackActions.length > 0) {
        errorActions.push({
          label: 'Show Alternatives',
          onClick: () => {
            showInfo(errorInfo.fallbackActions.join(' • '), {
              title: 'Alternative Options',
              autoHide: false
            });
          }
        });
      }
      
      showError(errorInfo.message, {
        title: 'Export Failed',
        actions: errorActions,
        autoHide: false
      });
      
      throw error; // Re-throw for ExportButton to handle
    } finally {
      setIsExporting(false);
      setExportProgress(null);
      setLoadingMessage('');
    }
  }, [memeImageSrc, onExport, showSuccess, showError, showWarning, showInfo, showLoading, removeNotification]);

  // Component lifecycle and cleanup
  useEffect(() => {
    // Cleanup function for when component unmounts
    return () => {
      setIsExporting(false);
      setExportError(null);
    };
  }, []);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  // CSS for responsive design matching existing component patterns
  const responsiveCSS = `
    .export-options-panel {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      border: 1px solid #e2e8f0;
      margin-top: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      transition: all 0.3s ease;
    }

    .export-options-header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e2e8f0;
    }

    .export-options-header-icon {
      font-size: 20px;
      color: #667eea;
      margin-right: 12px;
    }

    .export-options-header-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #4a5568;
      margin: 0;
    }

    .export-options-placeholder {
      text-align: center;
      padding: 40px 20px;
      color: #a0aec0;
      font-size: 1.1rem;
      font-style: italic;
      border: 3px dashed #e2e8f0;
      border-radius: 12px;
    }

    .export-options-placeholder-icon {
      margin-bottom: 12px;
      display: block;
      color: #a0aec0;
    }

    .export-options-error {
      background: #fed7d7;
      color: #c53030;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .export-options-disabled {
      position: relative;
      opacity: 0.6;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .export-options-content {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    /* Responsive breakpoints matching existing patterns */
    @media (max-width: 1024px) {
      .export-options-panel {
        max-width: 800px;
        margin: 20px auto 0;
      }
    }

    @media (max-width: 768px) {
      .export-options-panel {
        padding: 20px;
        border-radius: 16px;
        margin-top: 16px;
      }

      .export-options-header-title {
        font-size: 1.25rem;
      }

      .export-options-placeholder {
        padding: 30px 15px;
        font-size: 1rem;
      }
    }

    @media (max-width: 480px) {
      .export-options-panel {
        padding: 16px;
        border-radius: 12px;
        margin: 16px 10px 0;
      }

      .export-options-header {
        margin-bottom: 20px;
        padding-bottom: 12px;
      }

      .export-options-header-icon {
        font-size: 18px;
        margin-right: 8px;
      }

      .export-options-header-title {
        font-size: 1.125rem;
      }

      .export-options-placeholder {
        padding: 25px 15px;
        font-size: 0.9rem;
      }

      .export-options-placeholder-icon {
        margin-bottom: 8px;
      }

      .export-options-error {
        padding: 12px;
        font-size: 13px;
        gap: 6px;
      }
    }
  `;

  const styles = {
    container: {
      background: 'white',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      border: '1px solid #e2e8f0',
      marginTop: '20px',
      // Responsive padding
      '@media (max-width: 768px)': {
        padding: '20px',
        borderRadius: '16px'
      }
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '2px solid #e2e8f0',
      // Responsive header
      '@media (max-width: 480px)': {
        marginBottom: '20px',
        paddingBottom: '12px'
      }
    },
    headerIcon: {
      fontSize: '20px',
      color: '#667eea',
      marginRight: '12px',
      // Responsive icon size
      '@media (max-width: 480px)': {
        fontSize: '18px',
        marginRight: '8px'
      }
    },
    headerTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#4a5568',
      margin: 0,
      // Responsive title
      '@media (max-width: 480px)': {
        fontSize: '16px'
      }
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0' // Individual components handle their own margins
    },
    errorMessage: {
      background: '#fed7d7',
      color: '#c53030',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      // Responsive error message
      '@media (max-width: 480px)': {
        padding: '10px 12px',
        fontSize: '13px',
        gap: '6px'
      }
    },
    disabledOverlay: {
      position: 'relative',
      opacity: 0.6,
      pointerEvents: 'none',
      transition: 'opacity 0.3s ease'
    },
    placeholderMessage: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#a0aec0',
      fontSize: '16px',
      fontStyle: 'italic',
      // Responsive placeholder
      '@media (max-width: 480px)': {
        padding: '30px 15px',
        fontSize: '14px'
      }
    },
    placeholderIcon: {
      marginBottom: '12px',
      display: 'block',
      // Responsive placeholder icon
      '@media (max-width: 480px)': {
        marginBottom: '8px'
      }
    }
  };

  // Show placeholder when no meme is available
  if (!memeImageSrc) {
    return (
      <>
        <style>{responsiveCSS}</style>
        <div className="export-options-panel">
          <div className="export-options-header">
            <i className="fas fa-download export-options-header-icon"></i>
            <h3 className="export-options-header-title">Export Options</h3>
          </div>
          <div className="export-options-placeholder">
            <i className="fas fa-image fa-2x export-options-placeholder-icon"></i>
            Generate a meme to access export options
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{responsiveCSS}</style>
      <div className="export-options-panel">
        <div className="export-options-header">
          <i className="fas fa-download export-options-header-icon"></i>
          <h3 className="export-options-header-title">Export Options</h3>
        </div>

        {exportError && (
          <div className="export-options-error">
            <i className="fas fa-exclamation-triangle"></i>
            {exportError}
          </div>
        )}

        <div className={isExporting ? "export-options-content export-options-disabled" : "export-options-content"}>
          {/* Format Selector - always visible when meme is available */}
          <FormatSelector
            selectedFormat={selectedFormat}
            onFormatChange={handleFormatChange}
            disabled={isExporting}
          />

          {/* Quality Slider - conditional rendering based on format selection */}
          <QualitySlider
            quality={quality}
            onQualityChange={handleQualityChange}
            visible={selectedFormat !== 'png'}
            disabled={isExporting}
          />

          {/* File Size Estimator - updates based on format and quality changes */}
          <FileSizeEstimator
            format={selectedFormat}
            quality={quality}
            imageData={memeImageSrc}
          />

          {/* Export Button - integrates all state and triggers export */}
          <ExportButton
            onExport={handleExport}
            disabled={!memeImageSrc || isExporting}
            format={selectedFormat}
            quality={quality}
            isExporting={isExporting}
          />
        </div>
      </div>

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onDismiss={removeNotification}
        position="top-right"
        autoHideDuration={5000}
      />

      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={isExporting}
        message={loadingMessage}
        progress={exportProgress}
        type="export"
        canCancel={false}
      />
    </>
  );
};

export default ExportOptionsPanel;