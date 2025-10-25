/**
 * Performance Monitor Utility
 * Tracks and optimizes performance for the export system
 */

class PerformanceMonitor {
  static _metrics = new Map();
  static _performanceObserver = null;
  static _memoryCheckInterval = null;
  static _isMonitoring = false;

  /**
   * Start performance monitoring
   * @param {Object} options - Monitoring options
   * @param {boolean} options.trackMemory - Track memory usage (default: true)
   * @param {boolean} options.trackTiming - Track operation timing (default: true)
   * @param {number} options.memoryCheckInterval - Memory check interval in ms (default: 5000)
   */
  static startMonitoring(options = {}) {
    const {
      trackMemory = true,
      trackTiming = true,
      memoryCheckInterval = 5000
    } = options;

    if (this._isMonitoring) {
      console.warn('Performance monitoring is already active');
      return;
    }

    this._isMonitoring = true;
    console.log('Starting performance monitoring for export system');

    // Initialize metrics storage
    this._initializeMetrics();

    // Start memory monitoring
    if (trackMemory) {
      this._startMemoryMonitoring(memoryCheckInterval);
    }

    // Start timing monitoring
    if (trackTiming && 'PerformanceObserver' in window) {
      this._startTimingMonitoring();
    }

    // Monitor export system components
    this._monitorExportComponents();
  }

  /**
   * Stop performance monitoring
   */
  static stopMonitoring() {
    if (!this._isMonitoring) {
      return;
    }

    this._isMonitoring = false;
    console.log('Stopping performance monitoring');

    // Stop memory monitoring
    if (this._memoryCheckInterval) {
      clearInterval(this._memoryCheckInterval);
      this._memoryCheckInterval = null;
    }

    // Stop performance observer
    if (this._performanceObserver) {
      this._performanceObserver.disconnect();
      this._performanceObserver = null;
    }
  }

  /**
   * Initialize metrics storage
   * @private
   */
  static _initializeMetrics() {
    this._metrics.set('memory', {
      current: 0,
      peak: 0,
      history: [],
      canvasCache: 0,
      blobUrls: 0
    });

    this._metrics.set('timing', {
      canvasConversion: [],
      fileExport: [],
      sizeEstimation: []
    });

    this._metrics.set('cache', {
      hits: 0,
      misses: 0,
      evictions: 0
    });

    this._metrics.set('errors', {
      canvasErrors: 0,
      exportErrors: 0,
      memoryErrors: 0
    });
  }

  /**
   * Start memory monitoring
   * @private
   */
  static _startMemoryMonitoring(interval) {
    this._memoryCheckInterval = setInterval(() => {
      this._checkMemoryUsage();
    }, interval);

    // Initial memory check
    this._checkMemoryUsage();
  }

  /**
   * Check current memory usage
   * @private
   */
  static _checkMemoryUsage() {
    const memoryMetrics = this._metrics.get('memory');
    
    // Get browser memory info if available
    if (performance.memory) {
      const current = performance.memory.usedJSHeapSize;
      memoryMetrics.current = current;
      memoryMetrics.peak = Math.max(memoryMetrics.peak, current);
      
      // Keep history of last 20 measurements
      memoryMetrics.history.push({
        timestamp: Date.now(),
        usage: current,
        limit: performance.memory.jsHeapSizeLimit
      });

      if (memoryMetrics.history.length > 20) {
        memoryMetrics.history.shift();
      }
    }

    // Get canvas cache memory usage
    try {
      const CanvasConverter = require('./CanvasConverter.js').default;
      const cacheStats = CanvasConverter.getCacheStats();
      memoryMetrics.canvasCache = cacheStats.memoryUsage;
    } catch (error) {
      // CanvasConverter might not be available
    }

    // Get blob URL memory usage
    try {
      const ExportProcessor = require('./ExportProcessor.js').default;
      const blobInfo = ExportProcessor.getBlobUrlInfo();
      memoryMetrics.blobUrls = blobInfo.totalSize;
    } catch (error) {
      // ExportProcessor might not be available
    }

    // Check for memory pressure
    this._checkMemoryPressure();
  }

  /**
   * Check for memory pressure and trigger cleanup if needed
   * @private
   */
  static _checkMemoryPressure() {
    const memoryMetrics = this._metrics.get('memory');
    
    if (performance.memory) {
      const usageRatio = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
      
      if (usageRatio > 0.8) { // 80% memory usage
        console.warn('High memory usage detected, triggering cleanup');
        this._triggerMemoryCleanup();
      }
    }
  }

  /**
   * Trigger memory cleanup across export system components
   * @private
   */
  static _triggerMemoryCleanup() {
    try {
      // Clean up canvas cache
      const CanvasConverter = require('./CanvasConverter.js').default;
      const cleanedCanvases = CanvasConverter.cleanupExpiredCache();
      console.debug(`Cleaned up ${cleanedCanvases} canvas cache entries`);

      // Clean up blob URLs
      const ExportProcessor = require('./ExportProcessor.js').default;
      const cleanedBlobs = ExportProcessor.cleanupExpiredBlobUrls();
      console.debug(`Cleaned up ${cleanedBlobs} blob URLs`);

      // Force garbage collection if available (Chrome DevTools)
      if (window.gc) {
        window.gc();
      }

    } catch (error) {
      console.warn('Error during memory cleanup:', error);
    }
  }

  /**
   * Start timing monitoring
   * @private
   */
  static _startTimingMonitoring() {
    try {
      this._performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this._processTimingEntries(entries);
      });

      this._performanceObserver.observe({ 
        entryTypes: ['measure', 'navigation', 'resource'] 
      });
    } catch (error) {
      console.warn('Failed to start timing monitoring:', error);
    }
  }

  /**
   * Process timing entries
   * @private
   */
  static _processTimingEntries(entries) {
    const timingMetrics = this._metrics.get('timing');

    entries.forEach(entry => {
      if (entry.name.includes('canvas-conversion')) {
        timingMetrics.canvasConversion.push({
          duration: entry.duration,
          timestamp: entry.startTime
        });
      } else if (entry.name.includes('file-export')) {
        timingMetrics.fileExport.push({
          duration: entry.duration,
          timestamp: entry.startTime
        });
      } else if (entry.name.includes('size-estimation')) {
        timingMetrics.sizeEstimation.push({
          duration: entry.duration,
          timestamp: entry.startTime
        });
      }
    });

    // Keep only last 50 entries for each timing type
    Object.keys(timingMetrics).forEach(key => {
      if (timingMetrics[key].length > 50) {
        timingMetrics[key] = timingMetrics[key].slice(-50);
      }
    });
  }

  /**
   * Monitor export system components
   * @private
   */
  static _monitorExportComponents() {
    // Monitor for canvas cache events
    this._monitorCanvasCache();
    
    // Monitor for export errors
    this._monitorExportErrors();
  }

  /**
   * Monitor canvas cache performance
   * @private
   */
  static _monitorCanvasCache() {
    // This would be integrated with CanvasConverter to track cache hits/misses
    // For now, we'll check periodically
    setInterval(() => {
      try {
        const CanvasConverter = require('./CanvasConverter.js').default;
        const cacheStats = CanvasConverter.getCacheStats();
        
        const cacheMetrics = this._metrics.get('cache');
        // Update cache metrics based on stats
        // This is a simplified version - in practice, we'd track deltas
        
      } catch (error) {
        // CanvasConverter might not be available
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Monitor export errors
   * @private
   */
  static _monitorExportErrors() {
    // Listen for unhandled errors that might be related to exports
    window.addEventListener('error', (event) => {
      if (event.error && event.error.message) {
        const message = event.error.message.toLowerCase();
        const errorMetrics = this._metrics.get('errors');
        
        if (message.includes('canvas') || message.includes('conversion')) {
          errorMetrics.canvasErrors++;
        } else if (message.includes('export') || message.includes('download')) {
          errorMetrics.exportErrors++;
        } else if (message.includes('memory') || message.includes('out of memory')) {
          errorMetrics.memoryErrors++;
        }
      }
    });
  }

  /**
   * Record a performance measurement
   * @param {string} name - Measurement name
   * @param {number} duration - Duration in milliseconds
   * @param {Object} metadata - Additional metadata
   */
  static recordMeasurement(name, duration, metadata = {}) {
    if (!this._isMonitoring) return;

    // Use Performance API if available
    if ('performance' in window && performance.mark && performance.measure) {
      const startMark = `${name}-start`;
      const endMark = `${name}-end`;
      
      performance.mark(startMark);
      setTimeout(() => {
        performance.mark(endMark);
        performance.measure(name, startMark, endMark);
      }, duration);
    }

    // Also store in our metrics
    const category = this._categorizeMeasurement(name);
    if (category) {
      const timingMetrics = this._metrics.get('timing');
      if (timingMetrics[category]) {
        timingMetrics[category].push({
          duration,
          timestamp: Date.now(),
          metadata
        });
      }
    }
  }

  /**
   * Categorize measurement by name
   * @private
   */
  static _categorizeMeasurement(name) {
    if (name.includes('canvas') || name.includes('conversion')) {
      return 'canvasConversion';
    } else if (name.includes('export') || name.includes('download')) {
      return 'fileExport';
    } else if (name.includes('size') || name.includes('estimation')) {
      return 'sizeEstimation';
    }
    return null;
  }

  /**
   * Get performance report
   * @returns {Object} - Performance metrics report
   */
  static getPerformanceReport() {
    if (!this._isMonitoring) {
      return { error: 'Performance monitoring is not active' };
    }

    const report = {
      timestamp: Date.now(),
      monitoring: this._isMonitoring,
      memory: this._getMemoryReport(),
      timing: this._getTimingReport(),
      cache: this._getCacheReport(),
      errors: this._getErrorReport(),
      recommendations: this._generateRecommendations()
    };

    return report;
  }

  /**
   * Get memory usage report
   * @private
   */
  static _getMemoryReport() {
    const memoryMetrics = this._metrics.get('memory');
    
    return {
      current: memoryMetrics.current,
      peak: memoryMetrics.peak,
      canvasCache: memoryMetrics.canvasCache,
      blobUrls: memoryMetrics.blobUrls,
      total: memoryMetrics.canvasCache + memoryMetrics.blobUrls,
      history: memoryMetrics.history.slice(-10), // Last 10 measurements
      browserLimit: performance.memory ? performance.memory.jsHeapSizeLimit : null
    };
  }

  /**
   * Get timing performance report
   * @private
   */
  static _getTimingReport() {
    const timingMetrics = this._metrics.get('timing');
    const report = {};

    Object.keys(timingMetrics).forEach(category => {
      const measurements = timingMetrics[category];
      if (measurements.length > 0) {
        const durations = measurements.map(m => m.duration);
        report[category] = {
          count: measurements.length,
          average: durations.reduce((a, b) => a + b, 0) / durations.length,
          min: Math.min(...durations),
          max: Math.max(...durations),
          recent: measurements.slice(-5) // Last 5 measurements
        };
      }
    });

    return report;
  }

  /**
   * Get cache performance report
   * @private
   */
  static _getCacheReport() {
    const cacheMetrics = this._metrics.get('cache');
    const total = cacheMetrics.hits + cacheMetrics.misses;
    
    return {
      hits: cacheMetrics.hits,
      misses: cacheMetrics.misses,
      evictions: cacheMetrics.evictions,
      hitRate: total > 0 ? (cacheMetrics.hits / total) * 100 : 0
    };
  }

  /**
   * Get error report
   * @private
   */
  static _getErrorReport() {
    return { ...this._metrics.get('errors') };
  }

  /**
   * Generate performance recommendations
   * @private
   */
  static _generateRecommendations() {
    const recommendations = [];
    const memoryReport = this._getMemoryReport();
    const timingReport = this._getTimingReport();
    const cacheReport = this._getCacheReport();

    // Memory recommendations
    if (memoryReport.total > 50 * 1024 * 1024) { // 50MB
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: 'High memory usage detected. Consider reducing cache sizes or cleaning up more frequently.'
      });
    }

    // Timing recommendations
    if (timingReport.canvasConversion && timingReport.canvasConversion.average > 1000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Canvas conversion is slow. Consider optimizing image sizes or using more aggressive caching.'
      });
    }

    // Cache recommendations
    if (cacheReport.hitRate < 50) {
      recommendations.push({
        type: 'cache',
        priority: 'medium',
        message: 'Low cache hit rate. Consider increasing cache size or improving cache key generation.'
      });
    }

    return recommendations;
  }

  /**
   * Export performance data for analysis
   * @param {string} format - Export format ('json' or 'csv')
   * @returns {string} - Exported data
   */
  static exportPerformanceData(format = 'json') {
    const report = this.getPerformanceReport();
    
    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    } else if (format === 'csv') {
      // Simple CSV export for timing data
      let csv = 'Category,Duration,Timestamp\n';
      
      Object.keys(report.timing).forEach(category => {
        const measurements = this._metrics.get('timing')[category];
        measurements.forEach(measurement => {
          csv += `${category},${measurement.duration},${measurement.timestamp}\n`;
        });
      });
      
      return csv;
    }
    
    return JSON.stringify(report);
  }

  /**
   * Clear all performance metrics
   */
  static clearMetrics() {
    this._metrics.clear();
    this._initializeMetrics();
    console.log('Performance metrics cleared');
  }
}

export default PerformanceMonitor;