/**
 * Performance Optimizer Utility
 * Provides performance monitoring and optimization for the export system
 */

class PerformanceOptimizer {
  // Static properties for performance tracking
  static _performanceMetrics = new Map();
  static _memorySnapshots = [];
  static _maxSnapshots = 100;
  static _optimizationStrategies = new Map();
  static _isMonitoring = false;
  static _monitoringInterval = null;

  /**
   * Initialize performance monitoring
   * @param {Object} options - Monitoring options
   * @param {number} options.interval - Monitoring interval in milliseconds (default: 5000)
   * @param {boolean} options.trackMemory - Whether to track memory usage (default: true)
   * @param {boolean} options.trackTiming - Whether to track operation timing (default: true)
   */
  static initializeMonitoring(options = {}) {
    const {
      interval = 5000,
      trackMemory = true,
      trackTiming = true
    } = options;

    if (this._isMonitoring) {
      console.warn('Performance monitoring already initialized');
      return;
    }

    this._isMonitoring = true;

    // Start periodic monitoring
    this._monitoringInterval = setInterval(() => {
      if (trackMemory) {
        this._captureMemorySnapshot();
      }
      
      this._analyzePerformance();
      this._applyOptimizations();
    }, interval);

    // Monitor page visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this._onPageHidden();
        } else {
          this._onPageVisible();
        }
      });
    }

    console.debug('Performance monitoring initialized');
  }

  /**
   * Stop performance monitoring
   */
  static stopMonitoring() {
    if (this._monitoringInterval) {
      clearInterval(this._monitoringInterval);
      this._monitoringInterval = null;
    }
    
    this._isMonitoring = false;
    console.debug('Performance monitoring stopped');
  }

  /**
   * Track operation performance
   * @param {string} operationName - Name of the operation
   * @param {Function} operation - Function to execute and measure
   * @param {Object} context - Additional context information
   * @returns {Promise<any>} - Result of the operation
   */
  static async trackOperation(operationName, operation, context = {}) {
    const startTime = performance.now();
    const startMemory = this._getMemoryUsage();
    
    try {
      const result = await operation();
      
      const endTime = performance.now();
      const endMemory = this._getMemoryUsage();
      const duration = endTime - startTime;
      const memoryDelta = endMemory.used - startMemory.used;

      // Record performance metrics
      this._recordMetric(operationName, {
        duration,
        memoryDelta,
        startMemory: startMemory.used,
        endMemory: endMemory.used,
        success: true,
        timestamp: Date.now(),
        context
      });

      // Check for performance issues
      this._checkPerformanceThresholds(operationName, duration, memoryDelta);

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this._recordMetric(operationName, {
        duration,
        memoryDelta: 0,
        success: false,
        error: error.message,
        timestamp: Date.now(),
        context
      });

      throw error;
    }
  }

  /**
   * Get current memory usage information
   * @private
   */
  static _getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    
    // Fallback for browsers without memory API
    return { used: 0, total: 0, limit: 0 };
  }

  /**
   * Capture memory snapshot
   * @private
   */
  static _captureMemorySnapshot() {
    const memoryInfo = this._getMemoryUsage();
    const timestamp = Date.now();

    this._memorySnapshots.push({
      timestamp,
      ...memoryInfo,
      utilization: memoryInfo.limit > 0 ? (memoryInfo.used / memoryInfo.limit) * 100 : 0
    });

    // Limit snapshot history
    if (this._memorySnapshots.length > this._maxSnapshots) {
      this._memorySnapshots.shift();
    }
  }

  /**
   * Record performance metric
   * @private
   */
  static _recordMetric(operationName, metric) {
    if (!this._performanceMetrics.has(operationName)) {
      this._performanceMetrics.set(operationName, []);
    }

    const metrics = this._performanceMetrics.get(operationName);
    metrics.push(metric);

    // Limit metric history per operation
    if (metrics.length > 50) {
      metrics.shift();
    }
  }

  /**
   * Check performance thresholds and trigger optimizations
   * @private
   */
  static _checkPerformanceThresholds(operationName, duration, memoryDelta) {
    const thresholds = {
      'canvas_conversion': { duration: 2000, memory: 50 * 1024 * 1024 }, // 2s, 50MB
      'file_size_estimation': { duration: 500, memory: 10 * 1024 * 1024 }, // 500ms, 10MB
      'export_processing': { duration: 5000, memory: 100 * 1024 * 1024 }, // 5s, 100MB
      'blob_creation': { duration: 1000, memory: 25 * 1024 * 1024 } // 1s, 25MB
    };

    const threshold = thresholds[operationName];
    if (!threshold) return;

    const issues = [];
    
    if (duration > threshold.duration) {
      issues.push(`slow_execution`);
    }
    
    if (memoryDelta > threshold.memory) {
      issues.push(`high_memory_usage`);
    }

    if (issues.length > 0) {
      console.warn(`Performance issue detected in ${operationName}:`, {
        duration: `${Math.round(duration)}ms`,
        memoryDelta: `${Math.round(memoryDelta / 1024 / 1024)}MB`,
        issues
      });

      this._triggerOptimization(operationName, issues);
    }
  }

  /**
   * Trigger optimization strategies
   * @private
   */
  static _triggerOptimization(operationName, issues) {
    const strategies = this._getOptimizationStrategies(operationName, issues);
    
    for (const strategy of strategies) {
      try {
        strategy.execute();
        console.debug(`Applied optimization: ${strategy.name} for ${operationName}`);
      } catch (error) {
        console.warn(`Optimization failed: ${strategy.name}`, error);
      }
    }
  }

  /**
   * Get optimization strategies for specific issues
   * @private
   */
  static _getOptimizationStrategies(operationName, issues) {
    const strategies = [];

    if (issues.includes('slow_execution')) {
      strategies.push({
        name: 'reduce_quality_temporarily',
        execute: () => {
          // This would be implemented by the calling component
          console.debug('Suggesting quality reduction for faster processing');
        }
      });
    }

    if (issues.includes('high_memory_usage')) {
      strategies.push({
        name: 'clear_caches',
        execute: () => {
          // Clear various caches
          if (typeof window !== 'undefined' && window.CanvasConverter) {
            window.CanvasConverter.clearCache();
          }
          
          // Force garbage collection if available (development only)
          if (window.gc && typeof window.gc === 'function') {
            window.gc();
          }
        }
      });
    }

    return strategies;
  }

  /**
   * Analyze overall performance trends
   * @private
   */
  static _analyzePerformance() {
    const analysis = {
      memoryTrend: this._analyzeMemoryTrend(),
      operationPerformance: this._analyzeOperationPerformance(),
      recommendations: []
    };

    // Generate recommendations based on analysis
    if (analysis.memoryTrend.increasing && analysis.memoryTrend.rate > 1024 * 1024) { // 1MB/minute
      analysis.recommendations.push('Memory usage is increasing rapidly. Consider clearing caches more frequently.');
    }

    if (analysis.operationPerformance.slowOperations.length > 0) {
      analysis.recommendations.push(`Slow operations detected: ${analysis.operationPerformance.slowOperations.join(', ')}`);
    }

    return analysis;
  }

  /**
   * Analyze memory usage trends
   * @private
   */
  static _analyzeMemoryTrend() {
    if (this._memorySnapshots.length < 2) {
      return { increasing: false, rate: 0 };
    }

    const recent = this._memorySnapshots.slice(-10); // Last 10 snapshots
    const first = recent[0];
    const last = recent[recent.length - 1];
    
    const timeDiff = (last.timestamp - first.timestamp) / 1000 / 60; // minutes
    const memoryDiff = last.used - first.used;
    const rate = timeDiff > 0 ? memoryDiff / timeDiff : 0; // bytes per minute

    return {
      increasing: memoryDiff > 0,
      rate,
      currentUtilization: last.utilization,
      trend: rate > 0 ? 'increasing' : rate < 0 ? 'decreasing' : 'stable'
    };
  }

  /**
   * Analyze operation performance
   * @private
   */
  static _analyzeOperationPerformance() {
    const slowOperations = [];
    const averageDurations = new Map();

    for (const [operationName, metrics] of this._performanceMetrics.entries()) {
      const recentMetrics = metrics.slice(-10); // Last 10 operations
      const successfulMetrics = recentMetrics.filter(m => m.success);
      
      if (successfulMetrics.length > 0) {
        const avgDuration = successfulMetrics.reduce((sum, m) => sum + m.duration, 0) / successfulMetrics.length;
        averageDurations.set(operationName, avgDuration);

        // Define slow thresholds
        const slowThresholds = {
          'canvas_conversion': 1500,
          'file_size_estimation': 300,
          'export_processing': 3000,
          'blob_creation': 800
        };

        const threshold = slowThresholds[operationName] || 1000;
        if (avgDuration > threshold) {
          slowOperations.push(operationName);
        }
      }
    }

    return {
      slowOperations,
      averageDurations: Object.fromEntries(averageDurations)
    };
  }

  /**
   * Apply automatic optimizations
   * @private
   */
  static _applyOptimizations() {
    const memoryInfo = this._getMemoryUsage();
    
    // High memory usage optimization
    if (memoryInfo.limit > 0 && (memoryInfo.used / memoryInfo.limit) > 0.8) {
      console.debug('High memory usage detected, applying optimizations');
      
      // Clear caches
      this._clearAllCaches();
      
      // Suggest garbage collection
      if (window.gc && typeof window.gc === 'function') {
        window.gc();
      }
    }
  }

  /**
   * Clear all managed caches
   * @private
   */
  static _clearAllCaches() {
    try {
      // Clear CanvasConverter cache
      if (typeof window !== 'undefined' && window.CanvasConverter) {
        window.CanvasConverter.clearCache();
      }

      // Clear ExportProcessor blob URLs
      if (typeof window !== 'undefined' && window.ExportProcessor) {
        window.ExportProcessor.cleanupExpiredBlobUrls(true);
      }

      console.debug('All caches cleared for memory optimization');
    } catch (error) {
      console.warn('Error clearing caches:', error);
    }
  }

  /**
   * Handle page hidden event
   * @private
   */
  static _onPageHidden() {
    console.debug('Page hidden, applying background optimizations');
    
    // Clear caches when page is hidden
    this._clearAllCaches();
    
    // Reduce monitoring frequency
    if (this._monitoringInterval) {
      clearInterval(this._monitoringInterval);
      this._monitoringInterval = setInterval(() => {
        this._captureMemorySnapshot();
      }, 30000); // Reduce to every 30 seconds
    }
  }

  /**
   * Handle page visible event
   * @private
   */
  static _onPageVisible() {
    console.debug('Page visible, resuming normal monitoring');
    
    // Resume normal monitoring frequency
    if (this._monitoringInterval) {
      clearInterval(this._monitoringInterval);
      this._monitoringInterval = setInterval(() => {
        this._captureMemorySnapshot();
        this._analyzePerformance();
        this._applyOptimizations();
      }, 5000);
    }
  }

  /**
   * Get performance statistics
   * @returns {Object} - Performance statistics
   */
  static getPerformanceStats() {
    const stats = {
      monitoring: this._isMonitoring,
      memorySnapshots: this._memorySnapshots.length,
      operationMetrics: {},
      currentMemory: this._getMemoryUsage(),
      recommendations: []
    };

    // Aggregate operation metrics
    for (const [operationName, metrics] of this._performanceMetrics.entries()) {
      const successfulMetrics = metrics.filter(m => m.success);
      const failedMetrics = metrics.filter(m => !m.success);
      
      if (successfulMetrics.length > 0) {
        const durations = successfulMetrics.map(m => m.duration);
        const memoryDeltas = successfulMetrics.map(m => m.memoryDelta);
        
        stats.operationMetrics[operationName] = {
          totalOperations: metrics.length,
          successfulOperations: successfulMetrics.length,
          failedOperations: failedMetrics.length,
          averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
          minDuration: Math.min(...durations),
          maxDuration: Math.max(...durations),
          averageMemoryDelta: memoryDeltas.reduce((a, b) => a + b, 0) / memoryDeltas.length,
          successRate: (successfulMetrics.length / metrics.length) * 100
        };
      }
    }

    // Add current analysis
    const analysis = this._analyzePerformance();
    stats.memoryTrend = analysis.memoryTrend;
    stats.recommendations = analysis.recommendations;

    return stats;
  }

  /**
   * Export performance data for analysis
   * @returns {Object} - Exportable performance data
   */
  static exportPerformanceData() {
    return {
      timestamp: Date.now(),
      memorySnapshots: this._memorySnapshots,
      performanceMetrics: Object.fromEntries(this._performanceMetrics),
      stats: this.getPerformanceStats(),
      browserInfo: {
        userAgent: navigator.userAgent,
        memory: performance.memory ? {
          supported: true,
          current: this._getMemoryUsage()
        } : { supported: false },
        timing: performance.timing ? {
          supported: true,
          navigationStart: performance.timing.navigationStart,
          loadEventEnd: performance.timing.loadEventEnd
        } : { supported: false }
      }
    };
  }

  /**
   * Reset all performance data
   */
  static resetPerformanceData() {
    this._performanceMetrics.clear();
    this._memorySnapshots.length = 0;
    console.debug('Performance data reset');
  }

  /**
   * Create a performance-optimized wrapper for functions
   * @param {string} operationName - Name for tracking
   * @param {Function} fn - Function to wrap
   * @returns {Function} - Wrapped function
   */
  static createOptimizedWrapper(operationName, fn) {
    return async (...args) => {
      return this.trackOperation(operationName, () => fn(...args), { args: args.length });
    };
  }

  /**
   * Debounce function with performance tracking
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {string} operationName - Name for performance tracking
   * @returns {Function} - Debounced function
   */
  static createPerformanceDebounce(func, wait, operationName) {
    let timeout;
    let lastCallTime = 0;
    
    return function executedFunction(...args) {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;
      
      const later = () => {
        clearTimeout(timeout);
        lastCallTime = Date.now();
        
        // Track the debounced execution
        PerformanceOptimizer.trackOperation(operationName, () => func(...args), {
          debounceDelay: wait,
          actualDelay: timeSinceLastCall
        });
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

export default PerformanceOptimizer;