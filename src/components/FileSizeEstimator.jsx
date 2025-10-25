import React, { useState, useEffect, useCallback, useRef } from 'react';

const FileSizeEstimator = ({ 
  format, 
  quality, 
  imageData = null 
}) => {
  const [estimatedSize, setEstimatedSize] = useState('--');
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Enhanced performance optimization: cache previous calculations with memory management
  const calculationCache = useRef(new Map());
  const lastCalculationTime = useRef(0);
  const abortController = useRef(null);
  const maxCacheSize = useRef(50); // Limit cache size to prevent memory leaks
  const cacheTimeout = useRef(5 * 60 * 1000); // 5 minute cache timeout
  const memoryUsageEstimate = useRef(0); // Track approximate memory usage
  const maxMemoryUsage = useRef(10 * 1024 * 1024); // 10MB limit for cache

  // Adaptive debounce timing based on system performance
  const getAdaptiveDebounceTime = useCallback(() => {
    // Use performance API if available to adjust debounce time
    if (performance && performance.memory) {
      const memoryPressure = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
      if (memoryPressure > 0.8) return 500; // Slower on high memory pressure
      if (memoryPressure > 0.6) return 400;
      return 250; // Faster on low memory pressure
    }
    
    // Fallback based on cache size
    const cacheSize = calculationCache.current.size;
    if (cacheSize > 30) return 400;
    if (cacheSize > 15) return 350;
    return 300;
  }, []);

  // Enhanced debounced calculation with adaptive timing and memory management
  const debouncedCalculateSize = useCallback(
    debounce((format, quality, imageData) => {
      calculateFileSize(format, quality, imageData);
    }, getAdaptiveDebounceTime()), // Adaptive debounce time based on system performance
    [getAdaptiveDebounceTime]
  );

  useEffect(() => {
    if (imageData) {
      setIsCalculating(true);
      debouncedCalculateSize(format, quality, imageData);
    } else {
      setEstimatedSize('--');
      setIsCalculating(false);
    }
  }, [format, quality, imageData, debouncedCalculateSize]);

  // Enhanced cleanup effect with memory management and performance monitoring
  useEffect(() => {
    // Initialize cache cleanup interval
    const cleanupInterval = setInterval(() => {
      cleanupExpiredCacheEntries();
    }, 60000); // Clean up every minute

    // Monitor memory usage and clean up if needed
    const memoryMonitorInterval = setInterval(() => {
      if (memoryUsageEstimate.current > maxMemoryUsage.current) {
        console.debug('FileSizeEstimator: Memory limit reached, cleaning cache');
        cleanupOldestCacheEntries();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      // Cleanup on unmount
      if (abortController.current) {
        abortController.current.abort();
      }
      clearInterval(cleanupInterval);
      clearInterval(memoryMonitorInterval);
      calculationCache.current.clear();
      memoryUsageEstimate.current = 0;
    };
  }, []);

  const calculateFileSize = async (format, quality, imageData) => {
    const startTime = Date.now();
    
    try {
      if (!imageData) {
        setEstimatedSize('--');
        setIsCalculating(false);
        return;
      }

      // Generate enhanced cache key with better collision resistance
      const cacheKey = generateCacheKey(format, quality, imageData);
      
      // Check cache first with expiration
      const cachedResult = getCachedResult(cacheKey, startTime);
      if (cachedResult) {
        setEstimatedSize(cachedResult.size);
        setIsCalculating(false);
        return;
      }

      // Abort any previous calculation
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      let estimatedBytes;

      if (typeof imageData === 'string' && imageData.startsWith('data:')) {
        // If imageData is a data URL, estimate from its length
        estimatedBytes = estimateFromDataUrl(imageData, format, quality);
      } else if (typeof imageData === 'string') {
        // If imageData is a URL, estimate based on typical meme dimensions
        estimatedBytes = estimateFromUrl(imageData, format, quality);
      } else {
        // Default estimation for unknown data types
        estimatedBytes = estimateDefault(format, quality);
      }

      // Check if calculation was aborted
      if (abortController.current?.signal.aborted) {
        return;
      }

      const formattedSize = formatFileSize(estimatedBytes);
      
      // Cache the result with memory management
      cacheResult(cacheKey, formattedSize, estimatedBytes, startTime);

      setEstimatedSize(formattedSize);
      lastCalculationTime.current = Date.now();
      
    } catch (error) {
      if (!abortController.current?.signal.aborted) {
        console.warn('Error calculating file size:', error);
        setEstimatedSize('~');
      }
    } finally {
      if (!abortController.current?.signal.aborted) {
        setIsCalculating(false);
      }
    }
  };

  // Enhanced cache key generation with better collision resistance
  const generateCacheKey = useCallback((format, quality, imageData) => {
    let dataHash = '';
    if (typeof imageData === 'string') {
      // Create a simple hash from the string
      dataHash = imageData.length > 100 
        ? imageData.substring(0, 50) + imageData.substring(imageData.length - 50)
        : imageData;
    } else {
      dataHash = 'object_' + Date.now();
    }
    
    return `${format}_${quality}_${btoa(dataHash).replace(/[+/=]/g, '').substring(0, 16)}`;
  }, []);

  // Get cached result with expiration check
  const getCachedResult = useCallback((cacheKey, currentTime) => {
    const cachedResult = calculationCache.current.get(cacheKey);
    if (cachedResult && (currentTime - cachedResult.timestamp) < cacheTimeout.current) {
      // Update access time for LRU behavior
      cachedResult.lastAccessed = currentTime;
      return cachedResult;
    }
    
    // Remove expired entry
    if (cachedResult) {
      calculationCache.current.delete(cacheKey);
      memoryUsageEstimate.current = Math.max(0, memoryUsageEstimate.current - (cachedResult.memorySize || 1000));
    }
    
    return null;
  }, []);

  // Cache result with memory management
  const cacheResult = useCallback((cacheKey, formattedSize, estimatedBytes, timestamp) => {
    const memorySize = (formattedSize.length + cacheKey.length) * 2; // Rough estimate
    
    // Check if we need to clean up before adding
    if (calculationCache.current.size >= maxCacheSize.current || 
        memoryUsageEstimate.current + memorySize > maxMemoryUsage.current) {
      cleanupOldestCacheEntries();
    }

    calculationCache.current.set(cacheKey, {
      size: formattedSize,
      timestamp,
      lastAccessed: timestamp,
      memorySize,
      bytes: estimatedBytes
    });

    memoryUsageEstimate.current += memorySize;
  }, []);

  // Clean up expired cache entries
  const cleanupExpiredCacheEntries = useCallback(() => {
    const now = Date.now();
    let cleanedCount = 0;
    let freedMemory = 0;

    for (const [key, value] of calculationCache.current.entries()) {
      if (now - value.timestamp > cacheTimeout.current) {
        calculationCache.current.delete(key);
        freedMemory += value.memorySize || 1000;
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      memoryUsageEstimate.current = Math.max(0, memoryUsageEstimate.current - freedMemory);
      console.debug(`FileSizeEstimator: Cleaned ${cleanedCount} expired cache entries, freed ~${Math.round(freedMemory / 1024)}KB`);
    }
  }, []);

  // Clean up oldest cache entries (LRU)
  const cleanupOldestCacheEntries = useCallback(() => {
    const entries = Array.from(calculationCache.current.entries());
    
    // Sort by last accessed time (oldest first)
    entries.sort(([, a], [, b]) => (a.lastAccessed || a.timestamp) - (b.lastAccessed || b.timestamp));
    
    // Remove oldest 30% of entries
    const toRemove = Math.max(1, Math.floor(entries.length * 0.3));
    let freedMemory = 0;
    
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      const [key, value] = entries[i];
      calculationCache.current.delete(key);
      freedMemory += value.memorySize || 1000;
    }

    memoryUsageEstimate.current = Math.max(0, memoryUsageEstimate.current - freedMemory);
    console.debug(`FileSizeEstimator: Cleaned ${toRemove} oldest cache entries, freed ~${Math.round(freedMemory / 1024)}KB`);
  }, []);

  const estimateFromDataUrl = (dataUrl, format, quality) => {
    // Remove data URL prefix to get base64 data
    const base64Data = dataUrl.split(',')[1] || '';
    const baseSize = (base64Data.length * 3) / 4; // Convert base64 to bytes

    return applyFormatCompression(baseSize, format, quality);
  };

  const estimateFromUrl = (url, format, quality) => {
    // Estimate based on typical meme dimensions (500x500 average)
    // This is a fallback when we can't get actual image dimensions
    const estimatedPixels = 500 * 500;
    const bytesPerPixel = 4; // RGBA
    const baseSize = estimatedPixels * bytesPerPixel;

    return applyFormatCompression(baseSize, format, quality);
  };

  const estimateDefault = (format, quality) => {
    // Default estimation for 500x500 image
    const baseSize = 500 * 500 * 4; // RGBA bytes
    return applyFormatCompression(baseSize, format, quality);
  };

  const applyFormatCompression = (baseSize, format, quality) => {
    switch (format.toLowerCase()) {
      case 'png':
        // PNG is lossless but has good compression
        return Math.round(baseSize * 0.3); // ~30% of raw size
      
      case 'jpeg':
        // JPEG compression based on quality
        const jpegCompressionRatio = getJpegCompressionRatio(quality);
        return Math.round(baseSize * jpegCompressionRatio);
      
      case 'webp':
        // WebP is more efficient than JPEG
        const webpCompressionRatio = getWebpCompressionRatio(quality);
        return Math.round(baseSize * webpCompressionRatio);
      
      default:
        return Math.round(baseSize * 0.3);
    }
  };

  const getJpegCompressionRatio = (quality) => {
    // JPEG compression ratio based on quality (empirical values)
    if (quality >= 95) return 0.4;
    if (quality >= 90) return 0.25;
    if (quality >= 80) return 0.15;
    if (quality >= 70) return 0.1;
    if (quality >= 60) return 0.08;
    if (quality >= 50) return 0.06;
    if (quality >= 40) return 0.05;
    if (quality >= 30) return 0.04;
    if (quality >= 20) return 0.03;
    return 0.02;
  };

  const getWebpCompressionRatio = (quality) => {
    // WebP is typically 25-30% smaller than JPEG at same quality
    const jpegRatio = getJpegCompressionRatio(quality);
    return jpegRatio * 0.7; // 30% better compression
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    if (!bytes || bytes < 0) return '-- B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    // Ensure we don't go beyond our sizes array
    const sizeIndex = Math.min(i, sizes.length - 1);
    const size = bytes / Math.pow(k, sizeIndex);
    const formattedSize = sizeIndex === 0 ? size.toString() : size.toFixed(1);
    
    return `${formattedSize} ${sizes[sizeIndex]}`;
  };

  const getSizeColor = (sizeStr) => {
    if (!sizeStr || sizeStr === '--' || sizeStr === '~') return '#718096';
    
    const sizeValue = parseFloat(sizeStr);
    const unit = sizeStr.split(' ')[1];
    
    let sizeInKB = sizeValue;
    if (unit === 'MB') sizeInKB = sizeValue * 1024;
    else if (unit === 'GB') sizeInKB = sizeValue * 1024 * 1024;
    
    if (sizeInKB > 2048) return '#f56565'; // Red for > 2MB
    if (sizeInKB > 1024) return '#ed8936'; // Orange for > 1MB
    if (sizeInKB > 512) return '#ecc94b';  // Yellow for > 512KB
    return '#48bb78'; // Green for smaller sizes
  };

  // CSS for responsive design
  const responsiveCSS = `
    .file-size-estimator-container {
      margin-bottom: 20px;
    }

    .file-size-estimator-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #4a5568;
      font-size: 14px;
    }

    .file-size-estimator-display {
      padding: 12px 16px;
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.3s ease;
    }

    .file-size-estimator-value {
      font-size: 16px;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .file-size-estimator-label-text {
      font-size: 12px;
      color: #718096;
    }

    .file-size-estimator-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #e2e8f0;
      border-top: 2px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .file-size-estimator-placeholder {
      color: #a0aec0;
      font-style: italic;
      font-size: 14px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Responsive breakpoints */
    @media (max-width: 768px) {
      .file-size-estimator-display {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 14px 16px;
      }

      .file-size-estimator-value {
        font-size: 15px;
      }

      .file-size-estimator-label-text {
        font-size: 11px;
      }
    }

    @media (max-width: 480px) {
      .file-size-estimator-display {
        padding: 12px 14px;
        gap: 6px;
      }

      .file-size-estimator-value {
        font-size: 14px;
      }

      .file-size-estimator-placeholder {
        font-size: 13px;
      }

      .file-size-estimator-spinner {
        width: 14px;
        height: 14px;
      }
    }
  `;

  const styles = {
    container: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#4a5568',
      fontSize: '14px'
    }
  };

  return (
    <>
      <style>{responsiveCSS}</style>
      <div className="file-size-estimator-container" style={styles.container}>
        <label className="file-size-estimator-label" style={styles.label}>
          <i className="fas fa-weight"></i> Estimated File Size
        </label>
        <div className="file-size-estimator-display">
          <div>
            {isCalculating ? (
              <div className="file-size-estimator-spinner"></div>
            ) : (
              <span 
                className={estimatedSize === '--' ? 'file-size-estimator-placeholder' : 'file-size-estimator-value'}
                style={estimatedSize !== '--' ? {color: getSizeColor(estimatedSize)} : {}}
              >
                {estimatedSize === '--' ? 'Generate a meme to see size' : estimatedSize}
              </span>
            )}
          </div>
          <span className="file-size-estimator-label-text">
            {format.toUpperCase()} {format !== 'png' ? `@ ${quality}%` : ''}
          </span>
        </div>
      </div>
    </>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default FileSizeEstimator;