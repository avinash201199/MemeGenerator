/**
 * Export Processor Utility
 * Handles file downloads and filename generation for meme exports
 */

import CanvasConverter from './CanvasConverter.js';
import ErrorHandler from './ErrorHandler.js';
import BrowserCompatibility from './BrowserCompatibility.js';
import PerformanceOptimizer from './PerformanceOptimizer.js';

class ExportProcessor {
  // Static properties for blob URL management
  static _blobUrlRegistry = new Map();
  static _cleanupTimers = new Map();
  static _cleanupInterval = null;
  
  // Performance optimization properties
  static _maxBlobUrls = 50; // Maximum number of blob URLs to track
  static _memoryUsageLimit = 50 * 1024 * 1024; // 50MB limit for blob URLs
  static _currentMemoryUsage = 0;

  /**
   * Export meme with specified format and quality
   * @param {string|HTMLImageElement} imageSource - Image URL or element
   * @param {string} format - Export format ('png', 'jpeg', 'webp')
   * @param {number} quality - Quality level (0-100, converted to 0-1 internally)
   * @param {string} filename - Optional custom filename
   * @returns {Promise<Object>} - Export result with success status and details
   */
  static async exportMeme(imageSource, format = 'png', quality = 80, filename = null) {
    // Wrap the entire export process with performance tracking
    return PerformanceOptimizer.trackOperation('export_processing', async () => {
      return this._performExport(imageSource, format, quality, filename);
    }, { format, quality, hasFilename: !!filename });
  }

  /**
   * Internal export implementation
   * @private
   */
  static async _performExport(imageSource, format = 'png', quality = 80, filename = null) {
    const startTime = Date.now();
    const exportContext = { imageSource, format, quality, filename };
    
    try {
      // Validate inputs with detailed error messages
      if (!imageSource) {
        throw new Error('Image source is required for export');
      }

      if (typeof imageSource === 'string' && imageSource.trim() === '') {
        throw new Error('Image URL cannot be empty');
      }

      // Validate format
      const supportedFormats = ['png', 'jpeg', 'jpg', 'webp'];
      if (!supportedFormats.includes(format.toLowerCase())) {
        throw new Error(`Unsupported format: ${format}. Supported formats: ${supportedFormats.join(', ')}`);
      }

      // Validate quality
      if (typeof quality !== 'number' || quality < 0 || quality > 100) {
        throw new Error('Quality must be a number between 0 and 100');
      }

      // Check browser compatibility before starting
      const compatibility = this.checkBrowserCompatibility();
      if (!compatibility.canvas) {
        throw new Error('Canvas API not supported in this browser. Please update your browser.');
      }

      // Check format support
      const normalizedFormat = format.toLowerCase();
      if (normalizedFormat === 'webp' && !compatibility.formats.webp) {
        console.warn('WebP format not supported, falling back to PNG');
        format = 'png';
      }

      // Normalize quality to 0-1 range
      const normalizedQuality = Math.max(0, Math.min(100, quality)) / 100;

      // Convert image to canvas with enhanced error handling and performance tracking
      let canvas;
      try {
        if (typeof imageSource === 'string') {
          // Image URL - handle CORS and network issues
          canvas = await PerformanceOptimizer.trackOperation('canvas_conversion', async () => {
            return this._convertUrlToCanvasWithRetry(imageSource, 2);
          }, { sourceType: 'url', sourceLength: imageSource.length });
        } else if (imageSource instanceof HTMLImageElement) {
          // Image element
          canvas = await PerformanceOptimizer.trackOperation('canvas_conversion', async () => {
            return CanvasConverter.imageToCanvas(imageSource);
          }, { sourceType: 'element', width: imageSource.width, height: imageSource.height });
        } else {
          throw new Error('Invalid image source type. Expected string URL or HTMLImageElement.');
        }
      } catch (conversionError) {
        // Enhance conversion errors with context
        if (conversionError.message.includes('CORS')) {
          throw new Error('Cannot access image due to cross-origin restrictions. Try using an image from the same domain or download the image first.');
        } else if (conversionError.message.includes('too large')) {
          throw new Error('Image is too large to process. Try using a smaller image (recommended: under 4096x4096 pixels).');
        } else if (conversionError.message.includes('timeout')) {
          throw new Error('Image loading timed out. Check your internet connection and try again.');
        } else {
          throw new Error('Failed to process image: ' + conversionError.message);
        }
      }

      // Convert canvas to data URL with error handling
      let dataUrl;
      try {
        dataUrl = CanvasConverter.canvasToDataURL(canvas, format, normalizedQuality);
      } catch (dataUrlError) {
        if (dataUrlError.message.includes('CORS')) {
          throw new Error('Cannot export image with cross-origin content. Try using an image from the same domain.');
        } else if (dataUrlError.message.includes('too large')) {
          throw new Error('Generated image is too large. Try reducing the quality or using a smaller image.');
        } else {
          throw new Error('Failed to generate image data: ' + dataUrlError.message);
        }
      }

      // Generate filename if not provided
      const finalFilename = filename || this.generateFilename(format);

      // Convert data URL to blob with error handling and performance tracking
      let blob;
      try {
        blob = await PerformanceOptimizer.trackOperation('blob_creation', async () => {
          return this.dataUrlToBlob(dataUrl);
        }, { dataUrlLength: dataUrl.length, format, quality });
      } catch (blobError) {
        throw new Error('Failed to create download file: ' + blobError.message);
      }

      const fileSize = blob.size;

      // Check file size limits
      const maxFileSize = 100 * 1024 * 1024; // 100MB
      if (fileSize > maxFileSize) {
        throw new Error(`Generated file is too large (${Math.round(fileSize / 1024 / 1024)}MB). Try reducing quality or image size.`);
      }

      // Trigger download with enhanced error handling and retry logic
      let downloadSuccess = false;
      try {
        downloadSuccess = await this.downloadBlob(blob, finalFilename, {
          retryAttempts: 2,
          retryDelay: 1000,
          fallbackToDataUrl: true
        });
      } catch (downloadError) {
        // Provide specific download error messages
        if (downloadError.message.includes('popup') || downloadError.message.includes('blocked')) {
          throw new Error('Download was blocked by browser. Please allow popups for this site or try right-clicking the download button.');
        } else if (downloadError.message.includes('permission')) {
          throw new Error('Download permission denied. Please check your browser download settings.');
        } else {
          throw new Error('Download failed: ' + downloadError.message + '. Try using the basic download button as an alternative.');
        }
      }

      const processingTime = Date.now() - startTime;

      return {
        success: downloadSuccess,
        filename: finalFilename,
        fileSize: fileSize,
        format: format.toLowerCase(),
        quality: quality,
        downloadSuccess: downloadSuccess,
        processingTime: processingTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Enhanced error handling with recovery attempts
      const errorAnalysis = ErrorHandler.handleExportError(error, exportContext);
      
      // Log error for debugging with enhanced context
      console.error('Export failed:', {
        error: error.message,
        category: errorAnalysis.category,
        context: exportContext,
        analysis: errorAnalysis
      });

      // Attempt automatic recovery if enabled
      let recoveryAttempted = false;
      let recoveryResult = null;
      
      if (errorAnalysis.automaticRecovery && errorAnalysis.automaticRecovery.enabled) {
        try {
          recoveryResult = await ErrorHandler.attemptAutomaticRecovery(error, exportContext);
          recoveryAttempted = true;
          
          if (recoveryResult.success) {
            console.log(`Automatic recovery successful using strategy: ${recoveryResult.strategy}`);
            // Retry export with recovered context
            try {
              return await this.exportMeme(
                imageSource, 
                recoveryResult.newContext.format || format,
                recoveryResult.newContext.quality || quality,
                filename
              );
            } catch (retryError) {
              console.warn('Recovery retry failed:', retryError.message);
            }
          }
        } catch (recoveryError) {
          console.warn('Automatic recovery failed:', recoveryError.message);
        }
      }
      
      return {
        success: false,
        error: error.message,
        errorCategory: errorAnalysis.category,
        errorSeverity: errorAnalysis.severity,
        userMessage: errorAnalysis.message,
        suggestions: errorAnalysis.suggestions,
        recoveryOptions: errorAnalysis.recoveryOptions,
        fallbackActions: errorAnalysis.fallbackActions,
        filename: filename,
        format: format,
        quality: quality,
        downloadSuccess: false,
        processingTime: processingTime,
        timestamp: new Date().toISOString(),
        context: exportContext,
        recoveryAttempted: recoveryAttempted,
        recoveryResult: recoveryResult
      };
    }
  }

  /**
   * Convert URL to canvas with retry logic for network issues
   * @private
   */
  static async _convertUrlToCanvasWithRetry(imageUrl, maxRetries = 2) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await CanvasConverter.urlToCanvas(imageUrl);
      } catch (error) {
        lastError = error;
        
        // Don't retry CORS errors or validation errors
        if (error.message.includes('CORS') || 
            error.message.includes('Invalid') ||
            error.message.includes('too large')) {
          throw error;
        }
        
        // Wait before retry (except on last attempt)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          console.warn(`Image conversion attempt ${attempt + 1} failed, retrying...`);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Generate a descriptive filename with timestamp and unique identifier
   * @param {string} format - File format extension
   * @param {Date} timestamp - Optional timestamp (defaults to current time)
   * @param {Object} options - Additional options for filename generation
   * @param {string} options.prefix - Custom prefix (default: 'meme')
   * @param {boolean} options.includeQuality - Include quality in filename for lossy formats
   * @param {number} options.quality - Quality level for filename
   * @param {boolean} options.includeUniqueId - Include unique identifier to prevent conflicts
   * @returns {string} - Generated filename
   */
  static generateFilename(format = 'png', timestamp = null, options = {}) {
    try {
      const {
        prefix = 'meme',
        includeQuality = false,
        quality = null,
        includeUniqueId = true
      } = options;

      const now = timestamp || new Date();
      
      // Format timestamp as YYYY-MM-DD_HH-MM-SS
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      const dateString = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
      
      // Normalize format extension
      const normalizedFormat = format.toLowerCase().replace(/^\./, '');
      const extension = normalizedFormat === 'jpg' ? 'jpeg' : normalizedFormat;
      
      // Build filename components
      let filenameParts = [this.sanitizeFilenameComponent(prefix)];
      
      // Add timestamp
      filenameParts.push(dateString);
      
      // Add quality for lossy formats if requested
      if (includeQuality && quality !== null && (extension === 'jpeg' || extension === 'webp')) {
        filenameParts.push(`q${Math.round(quality)}`);
      }
      
      // Add unique identifier if requested (milliseconds + random)
      if (includeUniqueId) {
        const uniqueId = now.getMilliseconds().toString().padStart(3, '0') + 
                        Math.random().toString(36).substr(2, 3);
        filenameParts.push(uniqueId);
      }
      
      // Join parts and add extension
      const baseFilename = filenameParts.join('_');
      const filename = `${baseFilename}.${extension}`;
      
      // Ensure filename length is within limits (255 chars max)
      if (filename.length > 255) {
        const maxBaseLength = 255 - extension.length - 1; // -1 for the dot
        const truncatedBase = baseFilename.substring(0, maxBaseLength);
        return `${truncatedBase}.${extension}`;
      }
      
      return filename;
      
    } catch (error) {
      // Fallback to simple filename with timestamp
      const fallbackExtension = format.toLowerCase().replace(/^\./, '') || 'png';
      const fallbackTimestamp = Date.now();
      return `meme_${fallbackTimestamp}.${fallbackExtension}`;
    }
  }

  /**
   * Generate multiple distinct filenames for batch exports
   * @param {string} format - File format extension
   * @param {number} count - Number of filenames to generate
   * @param {Object} options - Options for filename generation
   * @param {string} options.batchPrefix - Custom prefix for batch exports
   * @param {boolean} options.includeSequence - Include sequence number in filename
   * @returns {string[]} - Array of unique filenames
   */
  static generateMultipleFilenames(format = 'png', count = 1, options = {}) {
    const filenames = [];
    const usedNames = new Set();
    const baseTimestamp = new Date();
    const { batchPrefix, includeSequence = true, ...otherOptions } = options;
    
    for (let i = 0; i < count; i++) {
      let filename;
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        // Offset timestamp by seconds plus attempts to ensure uniqueness
        const timestamp = new Date(baseTimestamp.getTime() + (i * 1000) + (attempts * 100));
        
        const filenameOptions = {
          ...otherOptions,
          includeUniqueId: true, // Always include unique ID for multiple files
          prefix: batchPrefix || otherOptions.prefix || 'meme'
        };
        
        // Add sequence number if requested
        if (includeSequence && count > 1) {
          const sequenceNumber = String(i + 1).padStart(String(count).length, '0');
          filenameOptions.prefix = `${filenameOptions.prefix}_${sequenceNumber}`;
        }
        
        filename = this.generateFilename(format, timestamp, filenameOptions);
        attempts++;
        
        // If we've tried too many times, force uniqueness with additional random
        if (attempts >= maxAttempts) {
          const randomSuffix = Math.random().toString(36).substr(2, 6);
          const parts = filename.split('.');
          const extension = parts.pop();
          const baseName = parts.join('.');
          filename = `${baseName}_${randomSuffix}.${extension}`;
        }
        
      } while (usedNames.has(filename) && attempts < maxAttempts + 5);
      
      usedNames.add(filename);
      filenames.push(filename);
    }
    
    return filenames;
  }

  /**
   * Sanitize a filename component (removes invalid characters)
   * @param {string} component - Component to sanitize
   * @returns {string} - Sanitized component
   */
  static sanitizeFilenameComponent(component) {
    if (!component || typeof component !== 'string') {
      return 'untitled';
    }

    return component
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
      .replace(/\s+/g, '_')         // Replace spaces with underscore
      .replace(/_{2,}/g, '_')       // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '')      // Remove leading/trailing underscores
      .substring(0, 50) || 'untitled'; // Limit component length
  }

  /**
   * Convert data URL to Blob object
   * @param {string} dataUrl - Data URL to convert
   * @returns {Blob} - Blob object for download
   */
  static dataUrlToBlob(dataUrl) {
    try {
      // Split data URL into parts
      const parts = dataUrl.split(',');
      if (parts.length !== 2) {
        throw new Error('Invalid data URL format');
      }

      const header = parts[0];
      const data = parts[1];

      // Extract MIME type
      const mimeMatch = header.match(/data:([^;]+)/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

      // Convert base64 to binary
      const binary = atob(data);
      const bytes = new Uint8Array(binary.length);
      
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      return new Blob([bytes], { type: mimeType });
    } catch (error) {
      throw new Error('Data URL to blob conversion failed: ' + error.message);
    }
  }

  /**
   * Download blob as file with robust browser support
   * @param {Blob} blob - Blob to download
   * @param {string} filename - Filename for download
   * @param {Object} options - Download options
   * @param {number} options.timeout - Timeout for cleanup (default: 1000ms)
   * @param {boolean} options.fallbackToDataUrl - Use data URL fallback if blob URL fails
   * @param {number} options.retryAttempts - Number of retry attempts (default: 2)
   * @param {number} options.retryDelay - Delay between retries in ms (default: 500)
   * @param {boolean} options.forceDownload - Force download even if popup blocked (default: true)
   * @returns {Promise<boolean>} - Success status
   */
  static async downloadBlob(blob, filename, options = {}) {
    const { 
      timeout = 1000, 
      fallbackToDataUrl = true, 
      retryAttempts = 2, 
      retryDelay = 500,
      forceDownload = true 
    } = options;
    
    const sanitizedFilename = this.sanitizeFilename(filename);

    // Validate inputs
    if (!blob || !(blob instanceof Blob)) {
      throw new Error('Invalid blob provided for download');
    }

    if (blob.size === 0) {
      throw new Error('Cannot download empty blob');
    }

    if (blob.size > 100 * 1024 * 1024) { // 100MB limit
      console.warn('Large file detected, download may be slow or fail');
    }

    let lastError = null;
    
    // Try download with retries
    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        // Method 1: Modern browsers with URL.createObjectURL
        if (window.URL && window.URL.createObjectURL) {
          const success = await this._downloadWithObjectURL(blob, sanitizedFilename, timeout, forceDownload);
          if (success) return true;
        }
        
        // Method 2: Fallback to data URL (for older browsers)
        if (fallbackToDataUrl) {
          const success = await this._downloadWithDataURL(blob, sanitizedFilename);
          if (success) return true;
        }
        
        throw new Error('No supported download method available');
        
      } catch (error) {
        lastError = error;
        console.warn(`Download attempt ${attempt + 1} failed:`, error.message);
        
        // Wait before retry (except on last attempt)
        if (attempt < retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    // All attempts failed, try final fallback methods
    try {
      return await this._tryFallbackDownloadMethods(blob, sanitizedFilename, timeout);
    } catch (fallbackError) {
      console.error('All download methods failed:', fallbackError);
      throw new Error(`Download failed after ${retryAttempts + 1} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
    }
  }

  /**
   * Download using object URL method (modern browsers)
   * @private
   */
  static async _downloadWithObjectURL(blob, filename, timeout, forceDownload = true) {
    return new Promise((resolve, reject) => {
      let url = null;
      let link = null;
      let cleanupTimer = null;
      let resolved = false;

      const cleanup = () => {
        if (resolved) return;
        resolved = true;
        
        try {
          if (cleanupTimer) {
            clearTimeout(cleanupTimer);
            cleanupTimer = null;
          }
          
          if (link && link.parentNode) {
            document.body.removeChild(link);
          }
          
          if (url) {
            URL.revokeObjectURL(url);
            url = null;
          }
        } catch (cleanupError) {
          console.warn('Cleanup error:', cleanupError);
        }
      };

      try {
        // Create object URL with error handling
        try {
          url = URL.createObjectURL(blob);
        } catch (urlError) {
          reject(new Error(`Failed to create object URL: ${urlError.message}`));
          return;
        }

        // Create download link
        link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.cssText = 'display: none; position: absolute; left: -9999px;';
        
        // Add additional attributes for better compatibility
        link.setAttribute('target', '_self');
        link.setAttribute('rel', 'noopener');

        // Set up event handlers
        const handleSuccess = () => {
          if (!resolved) {
            cleanup();
            resolve(true);
          }
        };

        const handleError = (error) => {
          if (!resolved) {
            cleanup();
            reject(new Error(`Download link error: ${error?.message || 'Unknown error'}`));
          }
        };

        // Add event listeners with proper cleanup
        link.addEventListener('click', handleSuccess, { once: true });
        link.addEventListener('error', handleError, { once: true });

        // Set cleanup timer
        cleanupTimer = setTimeout(() => {
          if (!resolved) {
            cleanup();
            resolve(true); // Assume success if no error after timeout
          }
        }, timeout);

        // Add to DOM and trigger download
        try {
          document.body.appendChild(link);
          
          // Trigger click with additional checks
          if (typeof link.click === 'function') {
            link.click();
          } else {
            // Fallback for older browsers
            const clickEvent = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true
            });
            link.dispatchEvent(clickEvent);
          }
        } catch (clickError) {
          cleanup();
          
          if (forceDownload) {
            // Try alternative method: programmatic navigation
            try {
              window.location.href = url;
              setTimeout(() => resolve(true), timeout);
            } catch (navError) {
              reject(new Error(`Click and navigation failed: ${clickError.message}, ${navError.message}`));
            }
          } else {
            reject(new Error(`Click failed: ${clickError.message}`));
          }
        }
        
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
  }

  /**
   * Download using data URL method (fallback for older browsers)
   * @private
   */
  static async _downloadWithDataURL(blob, filename) {
    return new Promise((resolve, reject) => {
      let reader = null;
      let link = null;
      let resolved = false;
      let timeoutId = null;

      const cleanup = () => {
        if (resolved) return;
        resolved = true;

        try {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          if (reader) {
            reader.onload = null;
            reader.onerror = null;
            reader.onabort = null;
            reader = null;
          }

          if (link && link.parentNode) {
            document.body.removeChild(link);
            link = null;
          }
        } catch (cleanupError) {
          console.warn('DataURL cleanup error:', cleanupError);
        }
      };

      try {
        // Check blob size limit for data URL (some browsers have limits)
        const maxDataUrlSize = 50 * 1024 * 1024; // 50MB conservative limit
        if (blob.size > maxDataUrlSize) {
          reject(new Error(`Blob too large for data URL method: ${blob.size} bytes`));
          return;
        }

        reader = new FileReader();
        
        // Set timeout for reading operation
        timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error('Data URL conversion timeout'));
        }, 30000); // 30 second timeout

        reader.onload = () => {
          if (resolved) return;

          try {
            clearTimeout(timeoutId);
            timeoutId = null;

            const dataUrl = reader.result;
            if (!dataUrl || typeof dataUrl !== 'string') {
              cleanup();
              reject(new Error('Invalid data URL generated'));
              return;
            }

            // Create and trigger download link
            link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename;
            link.style.cssText = 'display: none; position: absolute; left: -9999px;';
            link.setAttribute('target', '_self');
            
            document.body.appendChild(link);
            
            // Trigger download
            if (typeof link.click === 'function') {
              link.click();
            } else {
              // Fallback for older browsers
              const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
              });
              link.dispatchEvent(clickEvent);
            }
            
            // Clean up after short delay
            setTimeout(() => {
              cleanup();
              resolve(true);
            }, 100);
            
          } catch (error) {
            cleanup();
            reject(new Error(`Data URL download failed: ${error.message}`));
          }
        };
        
        reader.onerror = () => {
          cleanup();
          reject(new Error(`Failed to read blob as data URL: ${reader.error?.message || 'Unknown error'}`));
        };

        reader.onabort = () => {
          cleanup();
          reject(new Error('Data URL conversion was aborted'));
        };
        
        // Start reading the blob
        reader.readAsDataURL(blob);
        
      } catch (error) {
        cleanup();
        reject(new Error(`Data URL method setup failed: ${error.message}`));
      }
    });
  }

  /**
   * Try fallback download methods when primary methods fail
   * @private
   */
  static async _tryFallbackDownloadMethods(blob, filename, timeout) {
    const fallbackMethods = [
      () => this._downloadWithNewWindow(blob, filename, timeout),
      () => this._downloadWithIframe(blob, filename),
      () => this._downloadWithForm(blob, filename),
      () => this._downloadWithNavigate(blob, filename)
    ];

    let lastError = null;

    for (const method of fallbackMethods) {
      try {
        const success = await method();
        if (success) return true;
      } catch (error) {
        lastError = error;
        console.warn('Fallback method failed:', error.message);
      }
    }

    throw new Error(`All fallback methods failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Download by opening blob in new window
   * @private
   */
  static async _downloadWithNewWindow(blob, filename, timeout) {
    return new Promise((resolve, reject) => {
      try {
        const url = URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        
        if (!newWindow) {
          URL.revokeObjectURL(url);
          reject(new Error('Popup blocked or failed to open new window'));
          return;
        }

        // Set up cleanup
        const cleanup = () => {
          try {
            URL.revokeObjectURL(url);
            if (newWindow && !newWindow.closed) {
              newWindow.close();
            }
          } catch (cleanupError) {
            console.warn('New window cleanup error:', cleanupError);
          }
        };

        // Clean up after timeout
        setTimeout(() => {
          cleanup();
          resolve(true);
        }, timeout);

      } catch (error) {
        reject(new Error(`New window download failed: ${error.message}`));
      }
    });
  }

  /**
   * Download using hidden iframe
   * @private
   */
  static async _downloadWithIframe(blob, filename) {
    return new Promise((resolve, reject) => {
      try {
        const url = URL.createObjectURL(blob);
        const iframe = document.createElement('iframe');
        
        iframe.style.cssText = 'display: none; position: absolute; left: -9999px;';
        iframe.src = url;
        
        const cleanup = () => {
          try {
            if (iframe.parentNode) {
              document.body.removeChild(iframe);
            }
            URL.revokeObjectURL(url);
          } catch (cleanupError) {
            console.warn('Iframe cleanup error:', cleanupError);
          }
        };

        iframe.onload = () => {
          setTimeout(() => {
            cleanup();
            resolve(true);
          }, 1000);
        };

        iframe.onerror = () => {
          cleanup();
          reject(new Error('Iframe download failed'));
        };

        document.body.appendChild(iframe);

      } catch (error) {
        reject(new Error(`Iframe method failed: ${error.message}`));
      }
    });
  }

  /**
   * Download using form submission
   * @private
   */
  static async _downloadWithForm(blob, filename) {
    return new Promise((resolve, reject) => {
      try {
        const url = URL.createObjectURL(blob);
        const form = document.createElement('form');
        const input = document.createElement('input');
        
        form.method = 'GET';
        form.action = url;
        form.target = '_blank';
        form.style.cssText = 'display: none; position: absolute; left: -9999px;';
        
        input.type = 'hidden';
        input.name = 'download';
        input.value = filename;
        
        form.appendChild(input);
        document.body.appendChild(form);
        
        const cleanup = () => {
          try {
            if (form.parentNode) {
              document.body.removeChild(form);
            }
            URL.revokeObjectURL(url);
          } catch (cleanupError) {
            console.warn('Form cleanup error:', cleanupError);
          }
        };

        form.submit();
        
        setTimeout(() => {
          cleanup();
          resolve(true);
        }, 1000);

      } catch (error) {
        reject(new Error(`Form method failed: ${error.message}`));
      }
    });
  }

  /**
   * Download by navigating to blob URL
   * @private
   */
  static async _downloadWithNavigate(blob, filename) {
    return new Promise((resolve, reject) => {
      try {
        const url = URL.createObjectURL(blob);
        
        // Store current location to restore later
        const currentLocation = window.location.href;
        
        // Navigate to blob URL
        window.location.href = url;
        
        // Clean up after delay
        setTimeout(() => {
          try {
            URL.revokeObjectURL(url);
            // Optionally restore location (commented out to avoid navigation issues)
            // window.location.href = currentLocation;
            resolve(true);
          } catch (cleanupError) {
            console.warn('Navigate cleanup error:', cleanupError);
            resolve(true); // Still consider it successful
          }
        }, 2000);

      } catch (error) {
        reject(new Error(`Navigate method failed: ${error.message}`));
      }
    });
  }

  /**
   * Download multiple files sequentially
   * @param {Array} downloads - Array of {blob, filename} objects
   * @param {Object} options - Download options
   * @param {number} options.delay - Delay between downloads (default: 500ms)
   * @returns {Promise<Array>} - Array of download results
   */
  static async downloadMultipleBlobs(downloads, options = {}) {
    const { 
      delay = 500, 
      maxConcurrent = 1, 
      continueOnError = true,
      downloadOptions = {} 
    } = options;
    
    const results = [];
    
    if (!Array.isArray(downloads) || downloads.length === 0) {
      return results;
    }

    // Validate all downloads first
    const validDownloads = downloads.filter((download, index) => {
      if (!download || typeof download !== 'object') {
        results[index] = { success: false, filename: 'unknown', error: 'Invalid download object' };
        return false;
      }
      
      if (!download.blob || !(download.blob instanceof Blob)) {
        results[index] = { success: false, filename: download.filename || 'unknown', error: 'Invalid blob' };
        return false;
      }
      
      if (!download.filename || typeof download.filename !== 'string') {
        results[index] = { success: false, filename: 'unknown', error: 'Invalid filename' };
        return false;
      }
      
      return true;
    });

    // Process downloads
    if (maxConcurrent === 1) {
      // Sequential processing
      for (let i = 0; i < validDownloads.length; i++) {
        const { blob, filename } = validDownloads[i];
        
        try {
          const success = await this.downloadBlob(blob, filename, downloadOptions);
          results.push({ success, filename, error: null, index: i });
          
          // Add delay between downloads to prevent browser blocking
          if (i < validDownloads.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
        } catch (error) {
          const result = { success: false, filename, error: error.message, index: i };
          results.push(result);
          
          if (!continueOnError) {
            console.error(`Download failed for ${filename}, stopping batch:`, error);
            break;
          }
        }
      }
    } else {
      // Concurrent processing (limited)
      const chunks = [];
      for (let i = 0; i < validDownloads.length; i += maxConcurrent) {
        chunks.push(validDownloads.slice(i, i + maxConcurrent));
      }

      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        const chunkPromises = chunk.map(async ({ blob, filename }, index) => {
          try {
            const success = await this.downloadBlob(blob, filename, downloadOptions);
            return { success, filename, error: null, index: chunkIndex * maxConcurrent + index };
          } catch (error) {
            return { success: false, filename, error: error.message, index: chunkIndex * maxConcurrent + index };
          }
        });

        const chunkResults = await Promise.allSettled(chunkPromises);
        
        chunkResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            const filename = chunk[index]?.filename || 'unknown';
            results.push({ 
              success: false, 
              filename, 
              error: result.reason?.message || 'Unknown error',
              index: chunkIndex * maxConcurrent + index
            });
          }
        });

        // Add delay between chunks
        if (chunkIndex < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // Sort results by original index to maintain order
    results.sort((a, b) => (a.index || 0) - (b.index || 0));
    
    return results;
  }

  /**
   * Sanitize filename for cross-platform compatibility
   * @param {string} filename - Original filename
   * @returns {string} - Sanitized filename
   */
  static sanitizeFilename(filename) {
    if (!filename || typeof filename !== 'string') {
      return 'meme.png';
    }

    // Remove or replace invalid characters
    let sanitized = filename
      .replace(/[<>:"/\\|?*]/g, '_')  // Replace invalid chars with underscore
      .replace(/\s+/g, '_')           // Replace spaces with underscore
      .replace(/_{2,}/g, '_')         // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '');       // Remove leading/trailing underscores

    // Ensure filename is not empty
    if (!sanitized) {
      sanitized = 'meme';
    }

    // Ensure it has an extension
    if (!sanitized.includes('.')) {
      sanitized += '.png';
    }

    // Limit length
    if (sanitized.length > 255) {
      const parts = sanitized.split('.');
      const extension = parts.pop();
      const name = parts.join('.');
      const maxNameLength = 255 - extension.length - 1;
      sanitized = name.substring(0, maxNameLength) + '.' + extension;
    }

    return sanitized;
  }

  /**
   * Estimate file size for given parameters
   * @param {string|HTMLImageElement} imageSource - Image source
   * @param {string} format - Export format
   * @param {number} quality - Quality level (0-100)
   * @returns {Promise<number>} - Estimated file size in bytes
   */
  static async estimateFileSize(imageSource, format = 'png', quality = 80) {
    try {
      // For quick estimation without full conversion
      let canvas;
      if (typeof imageSource === 'string') {
        canvas = await CanvasConverter.urlToCanvas(imageSource);
      } else if (imageSource instanceof HTMLImageElement) {
        canvas = await CanvasConverter.imageToCanvas(imageSource);
      } else {
        throw new Error('Invalid image source type');
      }

      const normalizedQuality = Math.max(0, Math.min(100, quality)) / 100;
      const dataUrl = CanvasConverter.canvasToDataURL(canvas, format, normalizedQuality);
      
      return CanvasConverter.estimateFileSize(dataUrl);
    } catch (error) {
      // Return rough estimate based on format if conversion fails
      const baseSize = 100000; // 100KB base estimate
      
      switch (format.toLowerCase()) {
        case 'png':
          return baseSize * 2; // PNG is typically larger
        case 'jpeg':
        case 'jpg':
          return Math.round(baseSize * (quality / 100));
        case 'webp':
          return Math.round(baseSize * 0.7 * (quality / 100)); // WebP is more efficient
        default:
          return baseSize;
      }
    }
  }

  /**
   * Generate intelligent filename based on meme content
   * @param {string} format - File format extension
   * @param {Object} memeData - Meme content data
   * @param {string} memeData.topText - Top text of meme
   * @param {string} memeData.bottomText - Bottom text of meme
   * @param {string} memeData.templateName - Template name if available
   * @param {string} memeData.category - Meme category if available
   * @param {Object} options - Additional options
   * @param {boolean} options.includeContent - Include meme text in filename (default: true)
   * @param {number} options.maxWords - Maximum words from text to include (default: 3)
   * @returns {string} - Generated intelligent filename
   */
  static generateIntelligentFilename(format = 'png', memeData = {}, options = {}) {
    try {
      const { 
        topText = '', 
        bottomText = '', 
        templateName = '', 
        category = '' 
      } = memeData;
      
      const {
        includeContent = true,
        maxWords = 3,
        ...otherOptions
      } = options;
      
      // Create descriptive prefix from meme content
      let prefix = 'meme';
      
      // Priority 1: Use template name if available
      if (templateName && templateName.trim()) {
        prefix = this.sanitizeFilenameComponent(templateName);
      }
      // Priority 2: Use category if available and no template name
      else if (category && category.trim() && !templateName) {
        prefix = this.sanitizeFilenameComponent(category);
      }
      // Priority 3: Use meme text content if enabled
      else if (includeContent && (topText || bottomText)) {
        const text = (topText + ' ' + bottomText).trim();
        if (text) {
          // Extract meaningful words (filter out common words)
          const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'cant', 'wont', 'dont', 'doesnt', 'didnt', 'isnt', 'arent', 'wasnt', 'werent', 'havent', 'hasnt', 'hadnt']);
          
          const words = text
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2 && !commonWords.has(word))
            .slice(0, maxWords);
            
          if (words.length > 0) {
            prefix = this.sanitizeFilenameComponent(words.join('_'));
          }
        }
      }
      
      return this.generateFilename(format, null, {
        ...otherOptions,
        prefix: prefix
      });
      
    } catch (error) {
      console.warn('Intelligent filename generation failed:', error);
      // Fallback to regular filename generation
      return this.generateFilename(format, null, options);
    }
  }

  /**
   * Validate filename for cross-platform compatibility
   * @param {string} filename - Filename to validate
   * @returns {Object} - Validation result with issues and suggestions
   */
  static validateFilename(filename) {
    const issues = [];
    const suggestions = [];
    const warnings = [];
    
    if (!filename || typeof filename !== 'string') {
      issues.push('Filename is empty or invalid');
      suggestions.push('Use a descriptive filename');
      return { valid: false, issues, suggestions, warnings };
    }
    
    // Check length (filesystem limits)
    if (filename.length > 255) {
      issues.push('Filename too long (max 255 characters)');
      suggestions.push('Shorten the filename');
    } else if (filename.length > 200) {
      warnings.push('Filename is quite long, consider shortening for better compatibility');
    }
    
    // Check for invalid characters (cross-platform)
    const invalidChars = filename.match(/[<>:"/\\|?*\x00-\x1f]/g);
    if (invalidChars) {
      const uniqueChars = [...new Set(invalidChars)].map(char => {
        if (char.charCodeAt(0) < 32) return `\\x${char.charCodeAt(0).toString(16).padStart(2, '0')}`;
        return char;
      });
      issues.push(`Contains invalid characters: ${uniqueChars.join(', ')}`);
      suggestions.push('Remove or replace invalid characters with underscores');
    }
    
    // Check for problematic characters that might cause issues
    const problematicChars = filename.match(/[#%&{}\\$!'":@+`|=]/g);
    if (problematicChars) {
      warnings.push(`Contains characters that might cause issues: ${[...new Set(problematicChars)].join(', ')}`);
    }
    
    // Check for reserved names (Windows)
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    const nameWithoutExt = filename.split('.')[0].toUpperCase();
    if (reservedNames.includes(nameWithoutExt)) {
      issues.push(`"${nameWithoutExt}" is a reserved filename on Windows`);
      suggestions.push('Add a prefix or suffix to the filename');
    }
    
    // Check for extension
    if (!filename.includes('.')) {
      issues.push('Missing file extension');
      suggestions.push('Add appropriate file extension (.png, .jpeg, .webp)');
    } else {
      // Validate extension
      const extension = filename.split('.').pop().toLowerCase();
      const supportedExtensions = ['png', 'jpg', 'jpeg', 'webp'];
      if (!supportedExtensions.includes(extension)) {
        warnings.push(`Extension "${extension}" might not be supported for meme export`);
        suggestions.push('Use .png, .jpeg, or .webp extension');
      }
    }
    
    // Check for leading/trailing spaces or dots
    if (filename.startsWith(' ') || filename.endsWith(' ')) {
      issues.push('Filename has leading or trailing spaces');
      suggestions.push('Remove leading and trailing spaces');
    }
    
    if (filename.startsWith('.') && filename !== filename.split('.').pop()) {
      warnings.push('Filename starts with a dot (hidden file on Unix systems)');
    }
    
    if (filename.endsWith('.')) {
      issues.push('Filename ends with a dot');
      suggestions.push('Remove trailing dot');
    }
    
    // Check for consecutive dots
    if (filename.includes('..')) {
      warnings.push('Filename contains consecutive dots');
      suggestions.push('Replace consecutive dots with single dots');
    }
    
    // Check for very short names
    if (filename.length < 5) {
      warnings.push('Filename is very short, consider making it more descriptive');
    }
    
    // Check for Unicode characters that might cause issues
    const hasUnicode = /[^\x00-\x7F]/.test(filename);
    if (hasUnicode) {
      warnings.push('Filename contains non-ASCII characters, might cause issues on some systems');
    }
    
    return {
      valid: issues.length === 0,
      issues,
      suggestions,
      warnings,
      sanitized: this.sanitizeFilename(filename),
      length: filename.length,
      hasExtension: filename.includes('.'),
      extension: filename.includes('.') ? filename.split('.').pop().toLowerCase() : null
    };
  }

  /**
   * Generate alternative filenames to avoid conflicts
   * @param {string} originalFilename - Original filename that might conflict
   * @param {string[]} existingFilenames - Array of existing filenames to avoid
   * @param {number} maxAlternatives - Maximum number of alternatives to generate
   * @returns {string[]} - Array of alternative filenames
   */
  static generateAlternativeFilenames(originalFilename, existingFilenames = [], maxAlternatives = 5) {
    const alternatives = [];
    const existingSet = new Set(existingFilenames.map(f => f.toLowerCase()));
    
    if (!originalFilename || typeof originalFilename !== 'string') {
      return alternatives;
    }
    
    // If original doesn't conflict, return it
    if (!existingSet.has(originalFilename.toLowerCase())) {
      return [originalFilename];
    }
    
    const parts = originalFilename.split('.');
    const extension = parts.length > 1 ? parts.pop() : '';
    const baseName = parts.join('.');
    
    // Strategy 1: Add numbers
    for (let i = 1; i <= maxAlternatives; i++) {
      const candidate = extension ? `${baseName}_${i}.${extension}` : `${baseName}_${i}`;
      if (!existingSet.has(candidate.toLowerCase())) {
        alternatives.push(candidate);
      }
    }
    
    // Strategy 2: Add timestamp suffix
    if (alternatives.length < maxAlternatives) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const candidate = extension ? `${baseName}_${timestamp}.${extension}` : `${baseName}_${timestamp}`;
      if (!existingSet.has(candidate.toLowerCase())) {
        alternatives.push(candidate);
      }
    }
    
    // Strategy 3: Add random suffix
    while (alternatives.length < maxAlternatives) {
      const randomSuffix = Math.random().toString(36).substr(2, 6);
      const candidate = extension ? `${baseName}_${randomSuffix}.${extension}` : `${baseName}_${randomSuffix}`;
      if (!existingSet.has(candidate.toLowerCase())) {
        alternatives.push(candidate);
      }
    }
    
    return alternatives.slice(0, maxAlternatives);
  }

  /**
   * Blob URL management system for proper cleanup
   * @private
   */

  /**
   * Create and register a blob URL for automatic cleanup with memory management
   * @param {Blob} blob - Blob to create URL for
   * @param {number} ttl - Time to live in milliseconds (default: 60000)
   * @returns {string} - Object URL
   */
  static createManagedBlobUrl(blob, ttl = 60000) {
    try {
      if (!blob || !(blob instanceof Blob)) {
        throw new Error('Invalid blob provided');
      }

      // Check memory limits before creating new blob URL
      if (this._currentMemoryUsage + blob.size > this._memoryUsageLimit) {
        console.warn('Memory limit approaching, cleaning up old blob URLs');
        this._cleanupOldestBlobUrls();
      }

      // Check blob URL count limit
      if (this._blobUrlRegistry.size >= this._maxBlobUrls) {
        console.warn('Blob URL limit reached, cleaning up oldest entries');
        this._cleanupOldestBlobUrls(Math.floor(this._maxBlobUrls * 0.3));
      }

      const url = URL.createObjectURL(blob);
      const timestamp = Date.now();
      
      // Register the URL for cleanup
      this._blobUrlRegistry.set(url, {
        blob,
        created: timestamp,
        ttl,
        accessed: timestamp,
        size: blob.size
      });

      // Update memory usage tracking
      this._currentMemoryUsage += blob.size;

      // Set cleanup timer
      const timerId = setTimeout(() => {
        this.revokeManagedBlobUrl(url);
      }, ttl);

      this._cleanupTimers.set(url, timerId);

      console.debug(`Created managed blob URL, memory usage: ${Math.round(this._currentMemoryUsage / 1024 / 1024)}MB`);
      return url;
    } catch (error) {
      throw new Error(`Failed to create managed blob URL: ${error.message}`);
    }
  }

  /**
   * Revoke a managed blob URL with memory tracking
   * @param {string} url - URL to revoke
   * @returns {boolean} - Success status
   */
  static revokeManagedBlobUrl(url) {
    try {
      if (!url || typeof url !== 'string') {
        return false;
      }

      // Get blob info before removing
      const blobInfo = this._blobUrlRegistry.get(url);
      
      // Clear cleanup timer
      const timerId = this._cleanupTimers.get(url);
      if (timerId) {
        clearTimeout(timerId);
        this._cleanupTimers.delete(url);
      }

      // Update memory usage tracking
      if (blobInfo && blobInfo.size) {
        this._currentMemoryUsage = Math.max(0, this._currentMemoryUsage - blobInfo.size);
      }

      // Remove from registry
      this._blobUrlRegistry.delete(url);

      // Revoke the URL
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.warn('Failed to revoke managed blob URL:', error);
      return false;
    }
  }

  /**
   * Clean up expired blob URLs
   * @param {boolean} force - Force cleanup of all URLs regardless of TTL
   * @returns {number} - Number of URLs cleaned up
   */
  static cleanupExpiredBlobUrls(force = false) {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [url, info] of this._blobUrlRegistry.entries()) {
      const isExpired = force || (now - info.created) > info.ttl;
      
      if (isExpired) {
        this.revokeManagedBlobUrl(url);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Clean up oldest blob URLs to free memory
   * @private
   */
  static _cleanupOldestBlobUrls(count = null) {
    const entriesToRemove = count || Math.max(1, Math.floor(this._maxBlobUrls * 0.3));
    
    // Sort entries by creation time (oldest first)
    const sortedEntries = Array.from(this._blobUrlRegistry.entries())
      .sort(([, a], [, b]) => a.created - b.created)
      .slice(0, entriesToRemove);

    for (const [url] of sortedEntries) {
      this.revokeManagedBlobUrl(url);
    }

    console.debug(`Cleaned up ${sortedEntries.length} oldest blob URLs`);
  }

  /**
   * Get information about managed blob URLs with enhanced memory tracking
   * @returns {Object} - Registry information
   */
  static getBlobUrlInfo() {
    const now = Date.now();
    const urls = [];

    for (const [url, info] of this._blobUrlRegistry.entries()) {
      urls.push({
        url,
        size: info.size || info.blob.size,
        type: info.blob.type,
        created: info.created,
        age: now - info.created,
        ttl: info.ttl,
        expired: (now - info.created) > info.ttl
      });
    }

    return {
      count: urls.length,
      totalSize: this._currentMemoryUsage,
      memoryUsageLimit: this._memoryUsageLimit,
      memoryUtilization: (this._currentMemoryUsage / this._memoryUsageLimit) * 100,
      maxBlobUrls: this._maxBlobUrls,
      urls
    };
  }

  /**
   * Initialize automatic cleanup of blob URLs
   * @param {number} interval - Cleanup interval in milliseconds (default: 30000)
   */
  static initializeBlobUrlCleanup(interval = 30000) {
    // Clear any existing cleanup interval
    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval);
    }

    // Set up periodic cleanup
    this._cleanupInterval = setInterval(() => {
      const cleaned = this.cleanupExpiredBlobUrls();
      if (cleaned > 0) {
        console.debug(`Cleaned up ${cleaned} expired blob URLs`);
      }
    }, interval);

    // Clean up on page unload
    if (typeof window !== 'undefined') {
      const cleanup = () => {
        this.cleanupExpiredBlobUrls(true);
        if (this._cleanupInterval) {
          clearInterval(this._cleanupInterval);
        }
      };

      window.addEventListener('beforeunload', cleanup);
      window.addEventListener('unload', cleanup);
      
      // Also clean up on visibility change (when tab becomes hidden)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.cleanupExpiredBlobUrls();
        }
      });
    }
  }

  /**
   * Enhanced download with automatic blob URL management
   * @param {Blob} blob - Blob to download
   * @param {string} filename - Filename for download
   * @param {Object} options - Download options
   * @returns {Promise<boolean>} - Success status
   */
  static async downloadBlobManaged(blob, filename, options = {}) {
    const { urlTtl = 10000, ...downloadOptions } = options;
    
    try {
      // Use managed blob URL for better cleanup
      const url = this.createManagedBlobUrl(blob, urlTtl);
      
      try {
        // Use the existing robust download mechanism but with managed URL
        const success = await this.downloadBlob(blob, filename, downloadOptions);
        
        // Clean up immediately after successful download
        this.revokeManagedBlobUrl(url);
        
        return success;
      } catch (error) {
        // Clean up on error
        this.revokeManagedBlobUrl(url);
        throw error;
      }
    } catch (error) {
      throw new Error(`Managed download failed: ${error.message}`);
    }
  }

  /**
   * Check browser compatibility for export features
   * @returns {Object} - Compatibility information
   */
  static checkBrowserCompatibility() {
    const compatibility = {
      canvas: false,
      download: false,
      formats: {
        png: false,
        jpeg: false,
        webp: false
      },
      features: {
        objectURL: false,
        blob: false
      }
    };

    try {
      // Check Canvas API support
      const canvas = document.createElement('canvas');
      compatibility.canvas = !!(canvas.getContext && canvas.getContext('2d'));

      // Check download support (HTML5 download attribute)
      const link = document.createElement('a');
      compatibility.download = 'download' in link;

      // Check format support
      if (compatibility.canvas) {
        compatibility.formats.png = CanvasConverter.isFormatSupported('png');
        compatibility.formats.jpeg = CanvasConverter.isFormatSupported('jpeg');
        compatibility.formats.webp = CanvasConverter.isFormatSupported('webp');
      }

      // Check modern browser features
      compatibility.features.objectURL = !!(window.URL && window.URL.createObjectURL);
      compatibility.features.blob = !!(window.Blob);

    } catch (error) {
      console.warn('Browser compatibility check failed:', error);
    }

    return compatibility;
  }

  /**
   * Diagnose download issues and provide recommendations
   * @param {Error} error - Error that occurred during download
   * @param {Object} context - Context information about the download attempt
   * @returns {Object} - Diagnostic information and recommendations
   */
  static diagnoseDowloadIssue(error, context = {}) {
    const diagnosis = {
      error: error.message,
      category: 'unknown',
      severity: 'medium',
      recommendations: [],
      technicalDetails: {},
      userActions: []
    };

    const errorMessage = error.message.toLowerCase();

    // Categorize the error
    if (errorMessage.includes('popup') || errorMessage.includes('blocked')) {
      diagnosis.category = 'popup_blocked';
      diagnosis.severity = 'high';
      diagnosis.recommendations.push('Enable popups for this site');
      diagnosis.recommendations.push('Try right-clicking the download button and selecting "Save link as"');
      diagnosis.userActions.push('Check browser popup settings');
      diagnosis.userActions.push('Temporarily disable popup blockers');
    } else if (errorMessage.includes('cors') || errorMessage.includes('cross-origin')) {
      diagnosis.category = 'cors_error';
      diagnosis.severity = 'high';
      diagnosis.recommendations.push('Image source has CORS restrictions');
      diagnosis.recommendations.push('Try downloading from the same domain');
      diagnosis.userActions.push('Contact site administrator about CORS policy');
    } else if (errorMessage.includes('memory') || errorMessage.includes('out of memory')) {
      diagnosis.category = 'memory_error';
      diagnosis.severity = 'high';
      diagnosis.recommendations.push('Image too large for browser memory');
      diagnosis.recommendations.push('Try reducing image quality or size');
      diagnosis.userActions.push('Close other browser tabs');
      diagnosis.userActions.push('Try a different browser');
    } else if (errorMessage.includes('timeout')) {
      diagnosis.category = 'timeout_error';
      diagnosis.severity = 'medium';
      diagnosis.recommendations.push('Download took too long');
      diagnosis.recommendations.push('Try again with a stable internet connection');
      diagnosis.userActions.push('Check internet connection');
      diagnosis.userActions.push('Try downloading a smaller file first');
    } else if (errorMessage.includes('blob') || errorMessage.includes('url')) {
      diagnosis.category = 'blob_error';
      diagnosis.severity = 'medium';
      diagnosis.recommendations.push('Browser blob handling issue');
      diagnosis.recommendations.push('Try refreshing the page');
      diagnosis.userActions.push('Clear browser cache');
      diagnosis.userActions.push('Update browser to latest version');
    } else if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
      diagnosis.category = 'permission_error';
      diagnosis.severity = 'high';
      diagnosis.recommendations.push('Browser denied download permission');
      diagnosis.recommendations.push('Check browser download settings');
      diagnosis.userActions.push('Allow downloads for this site');
      diagnosis.userActions.push('Check if downloads folder is writable');
    }

    // Add technical details
    diagnosis.technicalDetails = {
      browserInfo: this.getBrowserInfo(),
      compatibility: this.checkBrowserCompatibility(),
      blobInfo: this.getBlobUrlInfo(),
      context: context
    };

    return diagnosis;
  }

  /**
   * Get browser information for diagnostics
   * @returns {Object} - Browser information
   */
  static getBrowserInfo() {
    const nav = navigator;
    const info = {
      userAgent: nav.userAgent,
      platform: nav.platform,
      language: nav.language,
      cookieEnabled: nav.cookieEnabled,
      onLine: nav.onLine,
      hardwareConcurrency: nav.hardwareConcurrency,
      maxTouchPoints: nav.maxTouchPoints
    };

    // Detect browser type
    const ua = nav.userAgent.toLowerCase();
    if (ua.includes('chrome') && !ua.includes('edge')) {
      info.browser = 'chrome';
    } else if (ua.includes('firefox')) {
      info.browser = 'firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      info.browser = 'safari';
    } else if (ua.includes('edge')) {
      info.browser = 'edge';
    } else if (ua.includes('opera')) {
      info.browser = 'opera';
    } else {
      info.browser = 'unknown';
    }

    // Detect mobile
    info.isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);

    return info;
  }

  /**
   * Test download functionality with a small test file
   * @returns {Promise<Object>} - Test results
   */
  static async testDownloadFunctionality() {
    const testResults = {
      overall: false,
      methods: {},
      errors: [],
      recommendations: []
    };

    // Create a small test blob
    const testData = 'Test download file content';
    const testBlob = new Blob([testData], { type: 'text/plain' });
    const testFilename = 'download_test.txt';

    // Test each download method
    const methods = [
      { name: 'objectURL', test: () => this._downloadWithObjectURL(testBlob, testFilename, 1000, false) },
      { name: 'dataURL', test: () => this._downloadWithDataURL(testBlob, testFilename) },
      { name: 'newWindow', test: () => this._downloadWithNewWindow(testBlob, testFilename, 1000) }
    ];

    for (const method of methods) {
      try {
        const success = await Promise.race([
          method.test(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Test timeout')), 5000))
        ]);
        
        testResults.methods[method.name] = { success, error: null };
        if (success) testResults.overall = true;
      } catch (error) {
        testResults.methods[method.name] = { success: false, error: error.message };
        testResults.errors.push(`${method.name}: ${error.message}`);
      }
    }

    // Generate recommendations based on test results
    if (!testResults.overall) {
      testResults.recommendations.push('No download methods are working');
      testResults.recommendations.push('Check browser settings and permissions');
      testResults.recommendations.push('Try a different browser');
    } else {
      const workingMethods = Object.entries(testResults.methods)
        .filter(([_, result]) => result.success)
        .map(([name, _]) => name);
      
      testResults.recommendations.push(`Working methods: ${workingMethods.join(', ')}`);
    }

    return testResults;
  }

  /**
   * Recovery mechanism for failed downloads
   * @param {Blob} blob - Original blob that failed to download
   * @param {string} filename - Original filename
   * @param {Error} originalError - The error that caused the failure
   * @param {Object} options - Recovery options
   * @returns {Promise<Object>} - Recovery result
   */
  static async recoverFailedDownload(blob, filename, originalError, options = {}) {
    const { 
      maxRecoveryAttempts = 3, 
      recoveryDelay = 1000,
      fallbackToBase64 = true,
      splitLargeFiles = true,
      maxChunkSize = 10 * 1024 * 1024 // 10MB
    } = options;

    const recoveryResult = {
      success: false,
      method: null,
      attempts: 0,
      errors: [],
      recommendations: []
    };

    // Diagnose the original error
    const diagnosis = this.diagnoseDowloadIssue(originalError, { blob, filename });
    recoveryResult.diagnosis = diagnosis;

    // Recovery strategies based on error type
    const recoveryStrategies = [];

    if (diagnosis.category === 'memory_error' && splitLargeFiles && blob.size > maxChunkSize) {
      recoveryStrategies.push({
        name: 'split_file',
        action: () => this._recoverBySplittingFile(blob, filename, maxChunkSize)
      });
    }

    if (diagnosis.category === 'blob_error' && fallbackToBase64) {
      recoveryStrategies.push({
        name: 'base64_fallback',
        action: () => this._recoverWithBase64(blob, filename)
      });
    }

    if (diagnosis.category === 'popup_blocked') {
      recoveryStrategies.push({
        name: 'user_initiated',
        action: () => this._recoverWithUserInitiated(blob, filename)
      });
    }

    // Generic recovery strategies
    recoveryStrategies.push(
      {
        name: 'retry_with_delay',
        action: () => this.downloadBlob(blob, filename, { retryAttempts: 1, retryDelay: recoveryDelay * 2 })
      },
      {
        name: 'alternative_filename',
        action: () => this.downloadBlob(blob, this.sanitizeFilename(`recovered_${filename}`))
      }
    );

    // Try recovery strategies
    for (const strategy of recoveryStrategies) {
      if (recoveryResult.attempts >= maxRecoveryAttempts) break;

      try {
        recoveryResult.attempts++;
        console.log(`Attempting recovery with strategy: ${strategy.name}`);
        
        const success = await strategy.action();
        if (success) {
          recoveryResult.success = true;
          recoveryResult.method = strategy.name;
          break;
        }
      } catch (error) {
        recoveryResult.errors.push(`${strategy.name}: ${error.message}`);
        
        // Wait before next attempt
        if (recoveryResult.attempts < maxRecoveryAttempts) {
          await new Promise(resolve => setTimeout(resolve, recoveryDelay));
        }
      }
    }

    // Generate final recommendations
    if (!recoveryResult.success) {
      recoveryResult.recommendations = [
        ...diagnosis.userActions,
        'Try downloading from a different device',
        'Contact technical support if the issue persists'
      ];
    }

    return recoveryResult;
  }

  /**
   * Recovery by splitting large files into chunks
   * @private
   */
  static async _recoverBySplittingFile(blob, filename, chunkSize) {
    const chunks = [];
    const totalChunks = Math.ceil(blob.size / chunkSize);
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, blob.size);
      const chunk = blob.slice(start, end);
      
      const chunkFilename = `${filename}.part${i + 1}of${totalChunks}`;
      chunks.push({ blob: chunk, filename: chunkFilename });
    }

    const results = await this.downloadMultipleBlobs(chunks, { delay: 1000 });
    return results.every(result => result.success);
  }

  /**
   * Recovery using base64 data URL
   * @private
   */
  static async _recoverWithBase64(blob, filename) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const base64Data = reader.result;
          const link = document.createElement('a');
          link.href = base64Data;
          link.download = filename;
          link.click();
          resolve(true);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Base64 conversion failed'));
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Recovery requiring user interaction
   * @private
   */
  static async _recoverWithUserInitiated(blob, filename) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      
      // Create a visible button for user to click
      const button = document.createElement('button');
      button.textContent = `Click to download ${filename}`;
      button.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        padding: 10px 20px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
      `;
      
      button.onclick = () => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        document.body.removeChild(button);
        URL.revokeObjectURL(url);
        resolve(true);
      };
      
      document.body.appendChild(button);
      
      // Auto-remove after 30 seconds
      setTimeout(() => {
        if (button.parentNode) {
          document.body.removeChild(button);
          URL.revokeObjectURL(url);
          resolve(false);
        }
      }, 30000);
    });
  }
}

export default ExportProcessor;