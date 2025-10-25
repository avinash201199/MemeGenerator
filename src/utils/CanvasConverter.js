/**
 * Canvas Converter Utility
 * Handles image-to-canvas conversion and format export operations
 * Includes performance optimizations: caching, memory management, and debounced operations
 */

class CanvasConverter {
  // Static cache for canvas conversions to avoid repeated processing
  static _canvasCache = new Map();
  static _cacheTimestamps = new Map();
  static _maxCacheSize = 10; // Maximum number of cached canvases
  static _cacheTimeout = 5 * 60 * 1000; // 5 minutes cache timeout
  static _cleanupInterval = null;

  // Memory management tracking
  static _activeCanvases = new Set();
  static _memoryUsage = 0;
  static _maxMemoryUsage = 100 * 1024 * 1024; // 100MB limit for cached canvases
  /**
   * Convert an HTML image element to a canvas element with caching
   * @param {HTMLImageElement} imageElement - The image element to convert
   * @param {Object} options - Conversion options
   * @param {boolean} options.useCache - Whether to use caching (default: true)
   * @param {string} options.cacheKey - Custom cache key (auto-generated if not provided)
   * @returns {Promise<HTMLCanvasElement>} - Promise resolving to canvas element
   */
  static async imageToCanvas(imageElement, options = {}) {
    const { useCache = true, cacheKey = null } = options;

    // Generate cache key if caching is enabled
    let finalCacheKey = null;
    if (useCache) {
      finalCacheKey = cacheKey || this._generateCacheKey(imageElement);
      
      // Check cache first
      const cachedCanvas = this._getCachedCanvas(finalCacheKey);
      if (cachedCanvas) {
        console.debug('Canvas cache hit for key:', finalCacheKey);
        return this._cloneCanvas(cachedCanvas);
      }
    }
    return new Promise((resolve, reject) => {
      try {
        // Validate input
        if (!imageElement || !(imageElement instanceof HTMLImageElement)) {
          reject(new Error('Invalid image element provided'));
          return;
        }

        // Check browser canvas support
        if (!this._checkCanvasSupport()) {
          reject(new Error('Canvas API not supported in this browser'));
          return;
        }

        // Create canvas element with error handling
        let canvas, ctx;
        try {
          canvas = document.createElement('canvas');
          ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get 2D canvas context'));
            return;
          }
        } catch (canvasError) {
          reject(new Error('Canvas creation failed: ' + canvasError.message));
          return;
        }
        
        // Get image dimensions with fallbacks
        const width = imageElement.naturalWidth || imageElement.width || 0;
        const height = imageElement.naturalHeight || imageElement.height || 0;
        
        // Validate dimensions
        if (width <= 0 || height <= 0) {
          reject(new Error('Invalid image dimensions: ' + width + 'x' + height));
          return;
        }

        // Check for memory safety with dynamic limits based on available memory
        const deviceMemory = navigator.deviceMemory || 4; // Default to 4GB if not available
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Adjust limits based on device capabilities
        const maxDimension = isMobile ? 4096 : Math.min(8192, deviceMemory * 1024); // Scale with device memory
        const maxPixels = isMobile ? 8388608 : Math.min(16777216, deviceMemory * 2097152); // 8MP mobile, scale for desktop
        
        if (width > maxDimension || height > maxDimension) {
          reject(new Error(`Image too large: ${width}x${height}. Maximum dimension is ${maxDimension}px for this device.`));
          return;
        }
        
        const totalPixels = width * height;
        if (totalPixels > maxPixels) {
          reject(new Error(`Image too large: ${totalPixels} pixels. Maximum is ${maxPixels} pixels for this device.`));
          return;
        }

        // Estimate memory usage (4 bytes per pixel for RGBA) with safety margin
        const estimatedMemory = totalPixels * 4;
        const maxMemory = Math.min(256 * 1024 * 1024, deviceMemory * 64 * 1024 * 1024); // 256MB max or 64MB per GB of device memory
        const safetyMargin = 0.8; // Use only 80% of available memory
        
        if (estimatedMemory > maxMemory * safetyMargin) {
          reject(new Error(`Image requires too much memory: ~${Math.round(estimatedMemory / 1024 / 1024)}MB. Maximum safe limit is ${Math.round(maxMemory * safetyMargin / 1024 / 1024)}MB for this device.`));
          return;
        }

        // Additional check for available heap memory (if supported)
        if (performance.memory) {
          const availableMemory = performance.memory.jsHeapSizeLimit - performance.memory.usedJSHeapSize;
          if (estimatedMemory > availableMemory * 0.5) { // Use only 50% of available heap
            reject(new Error(`Insufficient available memory: ~${Math.round(availableMemory / 1024 / 1024)}MB available, ${Math.round(estimatedMemory / 1024 / 1024)}MB required. Try closing other tabs or using a smaller image.`));
            return;
          }
        }
        
        // Set canvas dimensions with error handling
        try {
          canvas.width = width;
          canvas.height = height;
        } catch (dimensionError) {
          reject(new Error('Failed to set canvas dimensions: ' + dimensionError.message));
          return;
        }
        
        // Handle image loading if not already loaded
        if (imageElement.complete && imageElement.naturalWidth > 0) {
          // Image is already loaded
          try {
            this._drawImageSafely(ctx, imageElement, width, height);
            
            // Cache the canvas if caching is enabled
            if (useCache && finalCacheKey) {
              this._cacheCanvas(finalCacheKey, canvas);
            }
            
            // Track active canvas for memory management
            this._trackCanvas(canvas);
            
            resolve(canvas);
          } catch (drawError) {
            reject(new Error('Failed to draw image to canvas: ' + drawError.message));
          }
        } else {
          // Wait for image to load with timeout
          const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Image loading timeout'));
          }, 15000); // 15 second timeout
          
          const cleanup = () => {
            clearTimeout(timeout);
            imageElement.removeEventListener('load', handleLoad);
            imageElement.removeEventListener('error', handleError);
          };
          
          const handleLoad = () => {
            cleanup();
            try {
              // Update dimensions in case they changed
              canvas.width = imageElement.naturalWidth;
              canvas.height = imageElement.naturalHeight;
              this._drawImageSafely(ctx, imageElement, imageElement.naturalWidth, imageElement.naturalHeight);
              
              // Cache the canvas if caching is enabled
              if (useCache && finalCacheKey) {
                this._cacheCanvas(finalCacheKey, canvas);
              }
              
              // Track active canvas for memory management
              this._trackCanvas(canvas);
              
              resolve(canvas);
            } catch (drawError) {
              reject(new Error('Failed to draw loaded image: ' + drawError.message));
            }
          };
          
          const handleError = (error) => {
            cleanup();
            reject(new Error('Image loading failed: ' + (error.message || 'Unknown error')));
          };
          
          imageElement.addEventListener('load', handleLoad);
          imageElement.addEventListener('error', handleError);
        }
      } catch (error) {
        reject(new Error('Canvas conversion failed: ' + error.message));
      }
    });
  }

  /**
   * Safely draw image to canvas with error handling
   * @private
   */
  static _drawImageSafely(ctx, imageElement, width, height) {
    try {
      // Clear canvas first
      ctx.clearRect(0, 0, width, height);
      
      // Set high quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw image with error handling
      ctx.drawImage(imageElement, 0, 0);
      
      // Verify the draw operation succeeded by checking pixel data
      const imageData = ctx.getImageData(0, 0, Math.min(1, width), Math.min(1, height));
      if (!imageData || !imageData.data) {
        throw new Error('Canvas draw operation failed - no pixel data');
      }
      
    } catch (error) {
      if (error.name === 'SecurityError') {
        throw new Error('CORS error: Cannot access cross-origin image data');
      } else if (error.name === 'InvalidStateError') {
        throw new Error('Canvas in invalid state for drawing');
      } else {
        throw new Error('Draw operation failed: ' + error.message);
      }
    }
  }

  /**
   * Check canvas support
   * @private
   */
  static _checkCanvasSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext && canvas.getContext('2d'));
    } catch (error) {
      return false;
    }
  }

  /**
   * Load image from URL and convert to canvas
   * @param {string} imageUrl - URL of the image to convert
   * @returns {Promise<HTMLCanvasElement>} - Promise resolving to canvas element
   */
  static async urlToCanvas(imageUrl) {
    return new Promise((resolve, reject) => {
      try {
        // Validate URL
        if (!imageUrl || typeof imageUrl !== 'string') {
          reject(new Error('Invalid image URL provided'));
          return;
        }

        // Check for data URLs (base64 images)
        if (imageUrl.startsWith('data:')) {
          return this._handleDataUrlToCanvas(imageUrl, resolve, reject);
        }

        const img = new Image();
        let corsAttempted = false;
        
        // Set up error handler first
        img.onerror = (error) => {
          // If CORS failed and we haven't tried without CORS yet, try again
          if (corsAttempted && img.crossOrigin) {
            console.warn('CORS request failed, attempting without CORS...');
            corsAttempted = false;
            img.crossOrigin = null;
            img.src = imageUrl; // Retry without CORS
            return;
          }
          
          // Determine error type for better error messages
          let errorMessage = 'Failed to load image from URL: ' + imageUrl;
          let errorCategory = 'network';
          
          if (img.crossOrigin && corsAttempted) {
            errorMessage = 'CORS error: Cross-origin image access denied. The image server does not allow cross-origin requests.';
            errorCategory = 'cors';
          } else if (imageUrl.startsWith('http://') && window.location.protocol === 'https:') {
            errorMessage = 'Mixed content error: Cannot load HTTP image from HTTPS page. Modern browsers block HTTP content on HTTPS pages.';
            errorCategory = 'mixed_content';
          } else if (!navigator.onLine) {
            errorMessage = 'Network error: No internet connection available.';
            errorCategory = 'network';
          } else if (imageUrl.length > 2048) {
            errorMessage = 'URL too long: Image URL exceeds browser limits.';
            errorCategory = 'url_length';
          } else {
            // Try to determine if it's a 404, 403, or other HTTP error
            const urlObj = new URL(imageUrl, window.location.href);
            if (urlObj.protocol === 'file:') {
              errorMessage = 'File protocol error: Cannot load local files due to browser security restrictions.';
              errorCategory = 'file_protocol';
            } else {
              errorMessage = `Image loading failed: The image at ${imageUrl} could not be loaded. This may be due to the image not existing, server issues, or network problems.`;
              errorCategory = 'image_load_failed';
            }
          }
          
          const enhancedError = new Error(errorMessage);
          enhancedError.category = errorCategory;
          enhancedError.imageUrl = imageUrl;
          enhancedError.corsAttempted = corsAttempted;
          reject(enhancedError);
        };
        
        img.onload = async () => {
          try {
            // Check image dimensions for memory safety
            const maxDimension = 8192; // 8K max dimension
            const maxPixels = 16777216; // 16 megapixels max (4096x4096)
            
            if (img.naturalWidth > maxDimension || img.naturalHeight > maxDimension) {
              reject(new Error(`Image too large: ${img.naturalWidth}x${img.naturalHeight}. Maximum dimension is ${maxDimension}px.`));
              return;
            }
            
            const totalPixels = img.naturalWidth * img.naturalHeight;
            if (totalPixels > maxPixels) {
              reject(new Error(`Image too large: ${totalPixels} pixels. Maximum is ${maxPixels} pixels.`));
              return;
            }
            
            const canvas = await this.imageToCanvas(img);
            resolve(canvas);
          } catch (error) {
            reject(error);
          }
        };
        
        // Try with CORS first for cross-origin images
        try {
          const url = new URL(imageUrl, window.location.href);
          if (url.origin !== window.location.origin) {
            img.crossOrigin = 'anonymous';
            corsAttempted = true;
          }
        } catch (urlError) {
          // Invalid URL, but let the browser handle it
          console.warn('Invalid URL format:', imageUrl);
        }
        
        // Set timeout for image loading
        const timeout = setTimeout(() => {
          reject(new Error('Image loading timeout: Request took too long to complete.'));
        }, 30000); // 30 second timeout
        
        // Clear timeout on success or error
        const originalOnload = img.onload;
        const originalOnerror = img.onerror;
        
        img.onload = (event) => {
          clearTimeout(timeout);
          originalOnload(event);
        };
        
        img.onerror = (event) => {
          clearTimeout(timeout);
          originalOnerror(event);
        };
        
        img.src = imageUrl;
      } catch (error) {
        reject(new Error('URL to canvas conversion failed: ' + error.message));
      }
    });
  }

  /**
   * Handle data URL to canvas conversion
   * @private
   */
  static _handleDataUrlToCanvas(dataUrl, resolve, reject) {
    try {
      // Validate data URL format
      if (!dataUrl.startsWith('data:image/')) {
        reject(new Error('Invalid data URL: Must be an image data URL'));
        return;
      }

      // Check data URL size (approximate)
      const sizeEstimate = dataUrl.length * 0.75; // Base64 is ~33% larger than binary
      const maxSize = 50 * 1024 * 1024; // 50MB limit
      
      if (sizeEstimate > maxSize) {
        reject(new Error(`Data URL too large: ~${Math.round(sizeEstimate / 1024 / 1024)}MB. Maximum is ${maxSize / 1024 / 1024}MB.`));
        return;
      }

      const img = new Image();
      
      img.onload = async () => {
        try {
          const canvas = await this.imageToCanvas(img);
          resolve(canvas);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load data URL image: Invalid or corrupted data'));
      };
      
      img.src = dataUrl;
    } catch (error) {
      reject(new Error('Data URL processing failed: ' + error.message));
    }
  }

  /**
   * Convert canvas to data URL in specified format
   * @param {HTMLCanvasElement} canvas - Canvas element to convert
   * @param {string} format - Output format ('png', 'jpeg', 'webp')
   * @param {number} quality - Quality level (0-1) for lossy formats
   * @returns {string} - Data URL of the converted image
   */
  static canvasToDataURL(canvas, format = 'png', quality = 0.8) {
    try {
      // Validate canvas
      if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        throw new Error('Invalid canvas element provided');
      }

      // Check canvas state
      if (canvas.width <= 0 || canvas.height <= 0) {
        throw new Error('Invalid canvas dimensions: ' + canvas.width + 'x' + canvas.height);
      }

      // Check for canvas context
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Cannot get canvas 2D context');
      }

      // Normalize format
      const normalizedFormat = format.toLowerCase();
      let mimeType;
      
      switch (normalizedFormat) {
        case 'png':
          mimeType = 'image/png';
          break;
        case 'jpeg':
        case 'jpg':
          mimeType = 'image/jpeg';
          break;
        case 'webp':
          mimeType = 'image/webp';
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Check format support before attempting conversion
      if (!this.isFormatSupported(normalizedFormat)) {
        // Fallback to PNG if format not supported
        console.warn(`Format ${normalizedFormat} not supported, falling back to PNG`);
        mimeType = 'image/png';
      }
      
      // Ensure quality is within valid range
      const normalizedQuality = Math.max(0, Math.min(1, quality));
      
      let dataUrl;
      try {
        if (mimeType === 'image/png') {
          // PNG is lossless, quality parameter is ignored
          dataUrl = canvas.toDataURL(mimeType);
        } else {
          dataUrl = canvas.toDataURL(mimeType, normalizedQuality);
        }
      } catch (conversionError) {
        if (conversionError.name === 'SecurityError') {
          throw new Error('CORS error: Cannot export canvas with cross-origin content');
        } else if (conversionError.name === 'InvalidStateError') {
          throw new Error('Canvas in invalid state for export');
        } else {
          throw new Error('Canvas export failed: ' + conversionError.message);
        }
      }

      // Validate the result
      if (!dataUrl || !dataUrl.startsWith('data:')) {
        throw new Error('Invalid data URL generated');
      }

      // Check if format fallback occurred
      if (mimeType !== 'image/png' && dataUrl.startsWith('data:image/png')) {
        console.warn(`Browser fell back to PNG format instead of ${mimeType}`);
      }

      // Check data URL size
      const sizeEstimate = dataUrl.length * 0.75; // Approximate binary size
      const maxSize = 100 * 1024 * 1024; // 100MB limit
      
      if (sizeEstimate > maxSize) {
        throw new Error(`Generated image too large: ~${Math.round(sizeEstimate / 1024 / 1024)}MB. Try reducing quality or image size.`);
      }
      
      return dataUrl;
    } catch (error) {
      throw new Error('Canvas to data URL conversion failed: ' + error.message);
    }
  }

  /**
   * Estimate file size from data URL
   * @param {string} dataUrl - Data URL to analyze
   * @returns {number} - Estimated file size in bytes
   */
  static estimateFileSize(dataUrl) {
    try {
      // Remove data URL prefix to get base64 data
      const base64Data = dataUrl.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid data URL format');
      }
      
      // Calculate size: base64 encoding adds ~33% overhead
      // Each base64 character represents 6 bits, so 4 chars = 3 bytes
      const base64Length = base64Data.length;
      const estimatedBytes = (base64Length * 3) / 4;
      
      // Account for padding characters
      const paddingChars = (base64Data.match(/=/g) || []).length;
      return Math.round(estimatedBytes - paddingChars);
    } catch (error) {
      throw new Error('File size estimation failed: ' + error.message);
    }
  }

  /**
   * Check if the browser supports a specific image format
   * @param {string} format - Format to check ('png', 'jpeg', 'webp')
   * @returns {boolean} - True if format is supported
   */
  static isFormatSupported(format) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      
      const normalizedFormat = format.toLowerCase();
      let mimeType;
      
      switch (normalizedFormat) {
        case 'png':
          mimeType = 'image/png';
          break;
        case 'jpeg':
        case 'jpg':
          mimeType = 'image/jpeg';
          break;
        case 'webp':
          mimeType = 'image/webp';
          break;
        default:
          return false;
      }
      
      // Try to create a data URL with the format
      const dataUrl = canvas.toDataURL(mimeType);
      
      // Check if the browser actually supports the format
      // If not supported, it will fallback to PNG
      return dataUrl.startsWith(`data:${mimeType}`);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get supported formats for the current browser
   * @returns {Array<string>} - Array of supported format names
   */
  static getSupportedFormats() {
    const formats = ['png', 'jpeg', 'webp'];
    return formats.filter(format => this.isFormatSupported(format));
  }

  /**
   * Performance optimization methods
   */

  /**
   * Generate cache key for image element
   * @private
   */
  static _generateCacheKey(imageElement) {
    if (!imageElement) return null;
    
    // Use image source and dimensions as cache key
    const src = imageElement.src || imageElement.currentSrc || '';
    const width = imageElement.naturalWidth || imageElement.width || 0;
    const height = imageElement.naturalHeight || imageElement.height || 0;
    
    // Create hash-like key from source and dimensions
    const keyData = `${src}_${width}x${height}`;
    return btoa(keyData).replace(/[+/=]/g, '').substring(0, 16);
  }

  /**
   * Get cached canvas if available and not expired
   * @private
   */
  static _getCachedCanvas(cacheKey) {
    if (!cacheKey || !this._canvasCache.has(cacheKey)) {
      return null;
    }

    const timestamp = this._cacheTimestamps.get(cacheKey);
    const now = Date.now();
    
    // Check if cache entry is expired
    if (timestamp && (now - timestamp) > this._cacheTimeout) {
      this._removeCacheEntry(cacheKey);
      return null;
    }

    // Update access timestamp
    this._cacheTimestamps.set(cacheKey, now);
    
    return this._canvasCache.get(cacheKey);
  }

  /**
   * Cache a canvas with memory management
   * @private
   */
  static _cacheCanvas(cacheKey, canvas) {
    if (!cacheKey || !canvas) return;

    // Check memory limits before caching
    const canvasSize = this._estimateCanvasMemoryUsage(canvas);
    if (this._memoryUsage + canvasSize > this._maxMemoryUsage) {
      this._cleanupOldestCacheEntries();
    }

    // Check cache size limit
    if (this._canvasCache.size >= this._maxCacheSize) {
      this._cleanupOldestCacheEntries(1);
    }

    // Clone canvas for caching to avoid reference issues
    const clonedCanvas = this._cloneCanvas(canvas);
    
    this._canvasCache.set(cacheKey, clonedCanvas);
    this._cacheTimestamps.set(cacheKey, Date.now());
    this._memoryUsage += canvasSize;

    console.debug(`Canvas cached with key: ${cacheKey}, memory usage: ${Math.round(this._memoryUsage / 1024 / 1024)}MB`);
  }

  /**
   * Clone a canvas element
   * @private
   */
  static _cloneCanvas(originalCanvas) {
    const clonedCanvas = document.createElement('canvas');
    const clonedCtx = clonedCanvas.getContext('2d');
    
    clonedCanvas.width = originalCanvas.width;
    clonedCanvas.height = originalCanvas.height;
    
    clonedCtx.drawImage(originalCanvas, 0, 0);
    
    return clonedCanvas;
  }

  /**
   * Estimate memory usage of a canvas
   * @private
   */
  static _estimateCanvasMemoryUsage(canvas) {
    if (!canvas) return 0;
    // 4 bytes per pixel (RGBA)
    return canvas.width * canvas.height * 4;
  }

  /**
   * Remove specific cache entry
   * @private
   */
  static _removeCacheEntry(cacheKey) {
    const canvas = this._canvasCache.get(cacheKey);
    if (canvas) {
      const memoryUsage = this._estimateCanvasMemoryUsage(canvas);
      this._memoryUsage = Math.max(0, this._memoryUsage - memoryUsage);
    }
    
    this._canvasCache.delete(cacheKey);
    this._cacheTimestamps.delete(cacheKey);
  }

  /**
   * Clean up oldest cache entries
   * @private
   */
  static _cleanupOldestCacheEntries(count = null) {
    const entriesToRemove = count || Math.max(1, Math.floor(this._maxCacheSize * 0.3));
    
    // Sort entries by timestamp (oldest first)
    const sortedEntries = Array.from(this._cacheTimestamps.entries())
      .sort(([, a], [, b]) => a - b)
      .slice(0, entriesToRemove);

    for (const [cacheKey] of sortedEntries) {
      this._removeCacheEntry(cacheKey);
    }

    console.debug(`Cleaned up ${sortedEntries.length} canvas cache entries`);
  }

  /**
   * Track active canvas for memory management
   * @private
   */
  static _trackCanvas(canvas) {
    if (canvas) {
      this._activeCanvases.add(canvas);
    }
  }

  /**
   * Clean up expired cache entries
   * @param {boolean} force - Force cleanup of all entries
   * @returns {number} - Number of entries cleaned up
   */
  static cleanupExpiredCache(force = false) {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [cacheKey, timestamp] of this._cacheTimestamps.entries()) {
      const isExpired = force || (now - timestamp) > this._cacheTimeout;
      
      if (isExpired) {
        this._removeCacheEntry(cacheKey);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache information
   */
  static getCacheStats() {
    const now = Date.now();
    const entries = [];

    for (const [cacheKey, timestamp] of this._cacheTimestamps.entries()) {
      const canvas = this._canvasCache.get(cacheKey);
      if (canvas) {
        entries.push({
          key: cacheKey,
          age: now - timestamp,
          size: this._estimateCanvasMemoryUsage(canvas),
          dimensions: `${canvas.width}x${canvas.height}`,
          expired: (now - timestamp) > this._cacheTimeout
        });
      }
    }

    return {
      totalEntries: this._canvasCache.size,
      memoryUsage: this._memoryUsage,
      maxMemoryUsage: this._maxMemoryUsage,
      memoryUtilization: (this._memoryUsage / this._maxMemoryUsage) * 100,
      activeCanvases: this._activeCanvases.size,
      entries
    };
  }

  /**
   * Clear all cached canvases
   * @returns {number} - Number of entries cleared
   */
  static clearCache() {
    const count = this._canvasCache.size;
    
    this._canvasCache.clear();
    this._cacheTimestamps.clear();
    this._memoryUsage = 0;
    
    console.debug(`Cleared ${count} canvas cache entries`);
    return count;
  }

  /**
   * Initialize automatic cache cleanup
   * @param {number} interval - Cleanup interval in milliseconds (default: 60000)
   */
  static initializeCacheCleanup(interval = 60000) {
    // Clear any existing cleanup interval
    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval);
    }

    // Set up periodic cleanup
    this._cleanupInterval = setInterval(() => {
      const cleaned = this.cleanupExpiredCache();
      if (cleaned > 0) {
        console.debug(`Canvas cache cleanup: removed ${cleaned} expired entries`);
      }
    }, interval);

    // Clean up on page unload
    if (typeof window !== 'undefined') {
      const cleanup = () => {
        this.clearCache();
        if (this._cleanupInterval) {
          clearInterval(this._cleanupInterval);
        }
      };

      window.addEventListener('beforeunload', cleanup);
      window.addEventListener('unload', cleanup);
      
      // Also clean up on visibility change (when tab becomes hidden)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.cleanupExpiredCache();
        }
      });
    }
  }

  /**
   * Dispose of a canvas and remove from tracking
   * @param {HTMLCanvasElement} canvas - Canvas to dispose
   */
  static disposeCanvas(canvas) {
    if (canvas && this._activeCanvases.has(canvas)) {
      this._activeCanvases.delete(canvas);
      
      // Clear canvas content to free memory
      try {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        canvas.width = 0;
        canvas.height = 0;
      } catch (error) {
        console.warn('Error disposing canvas:', error);
      }
    }
  }

  /**
   * Batch dispose multiple canvases
   * @param {HTMLCanvasElement[]} canvases - Array of canvases to dispose
   */
  static disposeCanvases(canvases) {
    if (Array.isArray(canvases)) {
      canvases.forEach(canvas => this.disposeCanvas(canvas));
    }
  }
}

export default CanvasConverter;