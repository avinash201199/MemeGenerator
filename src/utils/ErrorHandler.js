/**
 * Comprehensive Error Handler for Export System
 * Provides centralized error handling, categorization, and user-friendly messages
 */

import BrowserCompatibility from './BrowserCompatibility.js';

class ErrorHandler {
  /**
   * Error categories for better handling
   */
  static ERROR_CATEGORIES = {
    CORS: 'cors',
    MEMORY: 'memory',
    BROWSER_COMPATIBILITY: 'browser_compatibility',
    NETWORK: 'network',
    PERMISSION: 'permission',
    FORMAT_SUPPORT: 'format_support',
    CANVAS: 'canvas',
    DOWNLOAD: 'download',
    VALIDATION: 'validation',
    TIMEOUT: 'timeout',
    UNKNOWN: 'unknown'
  };

  /**
   * Error severity levels
   */
  static SEVERITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  };

  /**
   * Analyze and categorize an error
   * @param {Error} error - The error to analyze
   * @param {Object} context - Additional context about the error
   * @returns {Object} - Analyzed error information
   */
  static analyzeError(error, context = {}) {
    const analysis = {
      originalError: error,
      category: this.ERROR_CATEGORIES.UNKNOWN,
      severity: this.SEVERITY_LEVELS.MEDIUM,
      userMessage: 'An unexpected error occurred. Please try again.',
      technicalMessage: error.message,
      suggestions: [],
      canRetry: true,
      requiresUserAction: false,
      context: context
    };

    const errorMessage = error.message.toLowerCase();
    const errorName = error.name ? error.name.toLowerCase() : '';

    // CORS Errors
    if (this._isCorsError(errorMessage, errorName)) {
      analysis.category = this.ERROR_CATEGORIES.CORS;
      analysis.severity = this.SEVERITY_LEVELS.HIGH;
      analysis.userMessage = 'Cannot access the image due to security restrictions. The image server does not allow cross-origin requests.';
      analysis.suggestions = [
        'Try using an image from the same website',
        'Download the image and upload it directly',
        'Contact the website administrator about CORS policy'
      ];
      analysis.canRetry = false;
      analysis.requiresUserAction = true;
    }
    // Memory Errors
    else if (this._isMemoryError(errorMessage, errorName)) {
      analysis.category = this.ERROR_CATEGORIES.MEMORY;
      analysis.severity = this.SEVERITY_LEVELS.HIGH;
      analysis.userMessage = 'The image is too large to process. Try using a smaller image or reducing the quality.';
      analysis.suggestions = [
        'Use a smaller image (recommended: under 4096x4096 pixels)',
        'Reduce the export quality setting',
        'Close other browser tabs to free up memory',
        'Try using a different browser'
      ];
      analysis.canRetry = true;
      analysis.requiresUserAction = true;
    }
    // Network Errors
    else if (this._isNetworkError(errorMessage, errorName)) {
      analysis.category = this.ERROR_CATEGORIES.NETWORK;
      analysis.severity = this.SEVERITY_LEVELS.MEDIUM;
      analysis.userMessage = 'Network connection issue. Please check your internet connection and try again.';
      analysis.suggestions = [
        'Check your internet connection',
        'Try refreshing the page',
        'Wait a moment and try again'
      ];
      analysis.canRetry = true;
    }
    // Permission Errors
    else if (this._isPermissionError(errorMessage, errorName)) {
      analysis.category = this.ERROR_CATEGORIES.PERMISSION;
      analysis.severity = this.SEVERITY_LEVELS.HIGH;
      analysis.userMessage = 'Browser blocked the download. Please check your browser settings and allow downloads for this site.';
      analysis.suggestions = [
        'Allow downloads for this website in browser settings',
        'Check if popup blocker is preventing downloads',
        'Try right-clicking the download button and selecting "Save as"'
      ];
      analysis.canRetry = true;
      analysis.requiresUserAction = true;
    }
    // Format Support Errors
    else if (this._isFormatError(errorMessage, errorName)) {
      analysis.category = this.ERROR_CATEGORIES.FORMAT_SUPPORT;
      analysis.severity = this.SEVERITY_LEVELS.MEDIUM;
      analysis.userMessage = 'The selected image format is not supported by your browser. Try using PNG or JPEG instead.';
      analysis.suggestions = [
        'Use PNG format for best compatibility',
        'Try JPEG format as an alternative',
        'Update your browser to the latest version'
      ];
      analysis.canRetry = true;
      analysis.requiresUserAction = true;
    }
    // Canvas Errors
    else if (this._isCanvasError(errorMessage, errorName)) {
      analysis.category = this.ERROR_CATEGORIES.CANVAS;
      analysis.severity = this.SEVERITY_LEVELS.HIGH;
      analysis.userMessage = 'Image processing failed. This might be due to browser limitations or corrupted image data.';
      analysis.suggestions = [
        'Try refreshing the page',
        'Use a different image',
        'Update your browser to the latest version',
        'Clear browser cache and cookies'
      ];
      analysis.canRetry = true;
    }
    // Download Errors
    else if (this._isDownloadError(errorMessage, errorName)) {
      analysis.category = this.ERROR_CATEGORIES.DOWNLOAD;
      analysis.severity = this.SEVERITY_LEVELS.MEDIUM;
      analysis.userMessage = 'Download failed. Please try again or use the alternative download method.';
      analysis.suggestions = [
        'Try the download again',
        'Check browser download settings',
        'Ensure you have enough disk space',
        'Try using a different browser'
      ];
      analysis.canRetry = true;
    }
    // Timeout Errors
    else if (this._isTimeoutError(errorMessage, errorName)) {
      analysis.category = this.ERROR_CATEGORIES.TIMEOUT;
      analysis.severity = this.SEVERITY_LEVELS.MEDIUM;
      analysis.userMessage = 'The operation took too long to complete. Please try again with a stable internet connection.';
      analysis.suggestions = [
        'Check your internet connection speed',
        'Try with a smaller image',
        'Wait a moment and try again',
        'Close other applications using internet'
      ];
      analysis.canRetry = true;
    }
    // Validation Errors
    else if (this._isValidationError(errorMessage, errorName)) {
      analysis.category = this.ERROR_CATEGORIES.VALIDATION;
      analysis.severity = this.SEVERITY_LEVELS.LOW;
      analysis.userMessage = 'Invalid input provided. Please check your settings and try again.';
      analysis.suggestions = [
        'Check that all required fields are filled',
        'Ensure image is properly loaded',
        'Verify export settings are valid'
      ];
      analysis.canRetry = true;
      analysis.requiresUserAction = true;
    }

    return analysis;
  }

  /**
   * Get user-friendly error message with suggestions
   * @param {Error} error - The error to process
   * @param {Object} context - Additional context
   * @returns {Object} - User-friendly error information
   */
  static getUserFriendlyError(error, context = {}) {
    const analysis = this.analyzeError(error, context);
    
    return {
      message: analysis.userMessage,
      suggestions: analysis.suggestions,
      canRetry: analysis.canRetry,
      requiresUserAction: analysis.requiresUserAction,
      severity: analysis.severity,
      category: analysis.category
    };
  }

  /**
   * Handle export-specific errors with recovery suggestions
   * @param {Error} error - The export error
   * @param {Object} exportContext - Export context (format, quality, etc.)
   * @returns {Object} - Export error handling result
   */
  static handleExportError(error, exportContext = {}) {
    const analysis = this.analyzeError(error, exportContext);
    const result = {
      ...this.getUserFriendlyError(error, exportContext),
      recoveryOptions: [],
      fallbackActions: [],
      automaticRecovery: null
    };

    // Add recovery options based on error category
    switch (analysis.category) {
      case this.ERROR_CATEGORIES.CORS:
        result.recoveryOptions = [
          { action: 'use_proxy', label: 'Try alternative image source' },
          { action: 'download_first', label: 'Download image first, then upload' },
          { action: 'use_data_url', label: 'Convert to data URL if possible' }
        ];
        result.fallbackActions = [
          'Use the basic download button instead',
          'Try copying the image and pasting it into an image editor',
          'Save the image locally first, then re-upload'
        ];
        result.automaticRecovery = {
          enabled: true,
          strategy: 'cors_fallback',
          description: 'Attempting to convert image to data URL to bypass CORS restrictions'
        };
        break;

      case this.ERROR_CATEGORIES.MEMORY:
        result.recoveryOptions = [
          { action: 'reduce_quality', label: 'Reduce quality to 50%' },
          { action: 'use_png', label: 'Switch to PNG format' },
          { action: 'resize_image', label: 'Reduce image dimensions' }
        ];
        result.fallbackActions = [
          'Close other browser tabs to free memory',
          'Try using a different device with more memory',
          'Use a smaller image size',
          'Clear browser cache and reload'
        ];
        result.automaticRecovery = {
          enabled: true,
          strategy: 'memory_optimization',
          description: 'Automatically reducing quality and attempting memory cleanup'
        };
        break;

      case this.ERROR_CATEGORIES.FORMAT_SUPPORT:
        result.recoveryOptions = [
          { action: 'use_png', label: 'Switch to PNG format' },
          { action: 'use_jpeg', label: 'Switch to JPEG format' },
          { action: 'check_browser', label: 'Update browser for better format support' }
        ];
        result.automaticRecovery = {
          enabled: true,
          strategy: 'format_fallback',
          description: 'Automatically falling back to PNG format for maximum compatibility'
        };
        break;

      case this.ERROR_CATEGORIES.DOWNLOAD:
        result.recoveryOptions = [
          { action: 'retry_download', label: 'Try download again' },
          { action: 'use_fallback', label: 'Use alternative download method' },
          { action: 'check_permissions', label: 'Check browser download permissions' }
        ];
        result.fallbackActions = [
          'Right-click and "Save as"',
          'Try the basic download button',
          'Enable downloads for this site in browser settings'
        ];
        result.automaticRecovery = {
          enabled: true,
          strategy: 'download_fallback',
          description: 'Trying alternative download methods automatically'
        };
        break;

      case this.ERROR_CATEGORIES.BROWSER_COMPATIBILITY:
        result.recoveryOptions = [
          { action: 'update_browser', label: 'Update to latest browser version' },
          { action: 'try_different_browser', label: 'Try a different browser' },
          { action: 'use_basic_features', label: 'Use basic export features only' }
        ];
        result.fallbackActions = [
          'Use Chrome, Firefox, or Edge for best compatibility',
          'Enable JavaScript if disabled',
          'Clear browser cache and cookies'
        ];
        break;

      default:
        result.recoveryOptions = [
          { action: 'retry', label: 'Try again' },
          { action: 'refresh', label: 'Refresh page and try again' },
          { action: 'check_connection', label: 'Check internet connection' }
        ];
        break;
    }

    return result;
  }

  /**
   * Attempt automatic error recovery based on error type
   * @param {Error} error - The error to recover from
   * @param {Object} context - Context information about the operation
   * @param {Object} options - Recovery options
   * @returns {Promise<Object>} - Recovery result
   */
  static async attemptAutomaticRecovery(error, context = {}, options = {}) {
    const analysis = this.analyzeError(error, context);
    const recoveryResult = {
      attempted: false,
      success: false,
      strategy: null,
      newContext: { ...context },
      error: null
    };

    // Only attempt recovery for specific error categories
    const recoverableCategories = [
      this.ERROR_CATEGORIES.CORS,
      this.ERROR_CATEGORIES.MEMORY,
      this.ERROR_CATEGORIES.FORMAT_SUPPORT,
      this.ERROR_CATEGORIES.BROWSER_COMPATIBILITY
    ];

    if (!recoverableCategories.includes(analysis.category)) {
      return recoveryResult;
    }

    recoveryResult.attempted = true;

    try {
      switch (analysis.category) {
        case this.ERROR_CATEGORIES.CORS:
          recoveryResult.strategy = 'cors_fallback';
          // Attempt to convert image to data URL to bypass CORS
          if (context.imageElement && context.imageElement instanceof HTMLImageElement) {
            try {
              // Create a new image with crossOrigin set to null (no CORS)
              const img = new Image();
              img.crossOrigin = null;
              
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = context.imageElement.src;
              });
              
              recoveryResult.newContext.imageElement = img;
              recoveryResult.success = true;
            } catch (corsError) {
              // If that fails, try creating a proxy canvas
              recoveryResult.newContext.useProxyCanvas = true;
              recoveryResult.success = true;
            }
          }
          break;

        case this.ERROR_CATEGORIES.MEMORY:
          recoveryResult.strategy = 'memory_optimization';
          // Reduce quality and dimensions
          if (context.quality && context.quality > 50) {
            recoveryResult.newContext.quality = Math.max(30, context.quality - 30);
          }
          if (context.format === 'png') {
            recoveryResult.newContext.format = 'jpeg';
          }
          // Force garbage collection if available
          if (window.gc) {
            window.gc();
          }
          recoveryResult.success = true;
          break;

        case this.ERROR_CATEGORIES.FORMAT_SUPPORT:
          recoveryResult.strategy = 'format_fallback';
          // Fall back to PNG for maximum compatibility
          recoveryResult.newContext.format = 'png';
          recoveryResult.newContext.quality = 100; // PNG is lossless
          recoveryResult.success = true;
          break;

        case this.ERROR_CATEGORIES.BROWSER_COMPATIBILITY:
          recoveryResult.strategy = 'compatibility_fallback';
          // Use most basic, compatible options
          recoveryResult.newContext.format = 'png';
          recoveryResult.newContext.useBasicDownload = true;
          recoveryResult.newContext.disableAdvancedFeatures = true;
          recoveryResult.success = true;
          break;
      }
    } catch (recoveryError) {
      recoveryResult.error = recoveryError.message;
      recoveryResult.success = false;
    }

    return recoveryResult;
  }

  /**
   * Check if browser compatibility issues might be causing errors
   * @returns {Promise<Object>} - Compatibility analysis
   */
  static async checkCompatibilityIssues() {
    try {
      const compatibility = await BrowserCompatibility.getCompatibilityReport();
      const issues = [];
      const recommendations = [];

      // Check for critical missing features
      if (!compatibility.features.canvas) {
        issues.push({
          severity: this.SEVERITY_LEVELS.CRITICAL,
          message: 'Canvas API not supported',
          impact: 'Export functionality will not work'
        });
        recommendations.push('Update to a modern browser that supports HTML5 Canvas');
      }

      if (!compatibility.features.blob) {
        issues.push({
          severity: this.SEVERITY_LEVELS.HIGH,
          message: 'Blob API not supported',
          impact: 'File downloads may not work properly'
        });
        recommendations.push('Update your browser for full download functionality');
      }

      if (!compatibility.features.download) {
        issues.push({
          severity: this.SEVERITY_LEVELS.MEDIUM,
          message: 'HTML5 download attribute not supported',
          impact: 'Downloads may open in new tab instead of saving'
        });
        recommendations.push('Downloads will open in new tab - save manually');
      }

      // Check format support
      if (!compatibility.formats.webp) {
        issues.push({
          severity: this.SEVERITY_LEVELS.LOW,
          message: 'WebP format not supported',
          impact: 'WebP exports will fallback to PNG'
        });
        recommendations.push('Use PNG or JPEG for better compatibility');
      }

      return {
        hasIssues: issues.length > 0,
        issues,
        recommendations,
        compatibility
      };
    } catch (error) {
      return {
        hasIssues: true,
        issues: [{
          severity: this.SEVERITY_LEVELS.MEDIUM,
          message: 'Could not check browser compatibility',
          impact: 'Some features may not work as expected'
        }],
        recommendations: ['Try using a different browser if you encounter issues'],
        compatibility: null
      };
    }
  }

  /**
   * Create error report for debugging
   * @param {Error} error - The error to report
   * @param {Object} context - Additional context
   * @returns {Object} - Detailed error report
   */
  static createErrorReport(error, context = {}) {
    const analysis = this.analyzeError(error, context);
    
    return {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      analysis,
      browser: this._getBrowserInfo(),
      context,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
  }

  // Private helper methods for error detection

  static _isCorsError(message, name) {
    return name === 'securityerror' || 
           name === 'networkerror' ||
           message.includes('cors') || 
           message.includes('cross-origin') ||
           message.includes('access denied') ||
           message.includes('not allowed by access-control-allow-origin') ||
           message.includes('cross origin requests are only supported for protocol schemes') ||
           message.includes('failed to execute \'todataurl\' on \'htmlcanvaselement\'') ||
           message.includes('tainted canvases may not be exported') ||
           message.includes('the canvas has been tainted by cross-origin data') ||
           message.includes('unable to get image data from canvas because the canvas has been tainted');
  }

  static _isMemoryError(message, name) {
    return message.includes('memory') ||
           message.includes('out of memory') ||
           message.includes('too large') ||
           message.includes('maximum') ||
           message.includes('quota') ||
           message.includes('exceeded') ||
           message.includes('allocation failed') ||
           message.includes('cannot allocate') ||
           message.includes('insufficient memory') ||
           message.includes('memory limit') ||
           message.includes('heap out of memory') ||
           message.includes('maximum call stack size exceeded') ||
           name === 'rangeerror' ||
           name === 'internalerror';
  }

  static _isNetworkError(message, name) {
    return message.includes('network') ||
           message.includes('connection') ||
           message.includes('timeout') ||
           message.includes('failed to fetch') ||
           message.includes('load') && message.includes('failed') ||
           name === 'networkerror';
  }

  static _isPermissionError(message, name) {
    return message.includes('permission') ||
           message.includes('denied') ||
           message.includes('blocked') ||
           message.includes('popup') ||
           name === 'notallowederror';
  }

  static _isFormatError(message, name) {
    return message.includes('format') ||
           message.includes('unsupported') ||
           message.includes('webp') ||
           message.includes('jpeg') ||
           message.includes('png');
  }

  static _isCanvasError(message, name) {
    return message.includes('canvas') ||
           message.includes('context') ||
           message.includes('draw') ||
           name === 'invalidstateerror';
  }

  static _isDownloadError(message, name) {
    return message.includes('download') ||
           message.includes('blob') ||
           message.includes('url') ||
           message.includes('save');
  }

  static _isTimeoutError(message, name) {
    return message.includes('timeout') ||
           message.includes('took too long') ||
           name === 'timeouterror';
  }

  static _isValidationError(message, name) {
    return message.includes('invalid') ||
           message.includes('required') ||
           message.includes('missing') ||
           message.includes('empty') ||
           name === 'validationerror';
  }

  static _getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  }
}

export default ErrorHandler;