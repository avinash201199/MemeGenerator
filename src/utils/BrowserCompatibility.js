/**
 * Browser Compatibility Detection Utility
 * Detects browser support for various export features and formats
 */

class BrowserCompatibility {
  /**
   * Check WebP format support specifically
   * @returns {Promise<boolean>} - Promise resolving to WebP support status
   */
  static checkWebPSupport() {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        
        // Try to create a WebP data URL
        const dataUrl = canvas.toDataURL('image/webp');
        
        // Check if the result is actually WebP (not fallback to PNG)
        const isWebPSupported = dataUrl.startsWith('data:image/webp');
        
        resolve(isWebPSupported);
      } catch (error) {
        resolve(false);
      }
    });
  }

  /**
   * Check Canvas API support
   * @returns {boolean} - True if Canvas API is supported
   */
  static checkCanvasSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext && canvas.getContext('2d'));
    } catch (error) {
      return false;
    }
  }

  /**
   * Check HTML5 download attribute support
   * @returns {boolean} - True if download attribute is supported
   */
  static checkDownloadSupport() {
    try {
      const link = document.createElement('a');
      return 'download' in link;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check Blob API support
   * @returns {boolean} - True if Blob API is supported
   */
  static checkBlobSupport() {
    try {
      return !!(window.Blob && new Blob());
    } catch (error) {
      return false;
    }
  }

  /**
   * Check URL.createObjectURL support
   * @returns {boolean} - True if createObjectURL is supported
   */
  static checkObjectURLSupport() {
    try {
      return !!(window.URL && window.URL.createObjectURL);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check File API support
   * @returns {boolean} - True if File API is supported
   */
  static checkFileAPISupport() {
    try {
      return !!(window.File && window.FileReader && window.FileList);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check CORS support for cross-origin images
   * @returns {boolean} - True if CORS is supported
   */
  static checkCORSSupport() {
    try {
      const img = new Image();
      return 'crossOrigin' in img;
    } catch (error) {
      return false;
    }
  }

  /**
   * Detect browser name and version
   * @returns {Object} - Browser information
   */
  static detectBrowser() {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';

    try {
      // Chrome
      if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browserName = 'Chrome';
        const match = userAgent.match(/Chrome\/(\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
      }
      // Firefox
      else if (userAgent.includes('Firefox')) {
        browserName = 'Firefox';
        const match = userAgent.match(/Firefox\/(\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
      }
      // Safari
      else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browserName = 'Safari';
        const match = userAgent.match(/Version\/(\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
      }
      // Edge
      else if (userAgent.includes('Edg')) {
        browserName = 'Edge';
        const match = userAgent.match(/Edg\/(\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
      }
      // Internet Explorer
      else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
        browserName = 'Internet Explorer';
        const match = userAgent.match(/(?:MSIE |rv:)(\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
      }
    } catch (error) {
      console.warn('Browser detection failed:', error);
    }

    return {
      name: browserName,
      version: browserVersion,
      userAgent: userAgent
    };
  }

  /**
   * Get comprehensive compatibility report
   * @returns {Promise<Object>} - Complete compatibility information
   */
  static async getCompatibilityReport() {
    const report = {
      browser: this.detectBrowser(),
      features: {
        canvas: this.checkCanvasSupport(),
        download: this.checkDownloadSupport(),
        blob: this.checkBlobSupport(),
        objectURL: this.checkObjectURLSupport(),
        fileAPI: this.checkFileAPISupport(),
        cors: this.checkCORSSupport()
      },
      formats: {
        png: false,
        jpeg: false,
        webp: false
      },
      recommendations: [],
      warnings: []
    };

    // Check format support if canvas is available
    if (report.features.canvas) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;

        // PNG support (should always be available)
        report.formats.png = canvas.toDataURL('image/png').startsWith('data:image/png');

        // JPEG support
        report.formats.jpeg = canvas.toDataURL('image/jpeg').startsWith('data:image/jpeg');

        // WebP support (async check)
        report.formats.webp = await this.checkWebPSupport();
      } catch (error) {
        console.warn('Format support check failed:', error);
      }
    }

    // Generate recommendations and warnings
    this.generateRecommendations(report);

    return report;
  }

  /**
   * Generate recommendations based on compatibility
   * @param {Object} report - Compatibility report to analyze
   */
  static generateRecommendations(report) {
    // Clear existing recommendations
    report.recommendations = [];
    report.warnings = [];
    report.criticalIssues = [];

    // Check for critical missing features
    if (!report.features.canvas) {
      report.criticalIssues.push('Canvas API not supported - export functionality will not work');
      report.recommendations.push('Please update to a modern browser that supports HTML5 Canvas');
    }

    if (!report.features.blob) {
      report.criticalIssues.push('Blob API not supported - file downloads may not work');
      report.recommendations.push('Please update your browser for full download functionality');
    }

    if (!report.features.download) {
      report.warnings.push('HTML5 download attribute not supported');
      report.recommendations.push('Downloads may open in new tab instead of saving directly');
    }

    // Format-specific recommendations
    if (!report.formats.webp) {
      report.recommendations.push('WebP format not supported - consider using PNG or JPEG for better compatibility');
    }

    if (!report.formats.jpeg) {
      report.warnings.push('JPEG format not supported - this is unusual and may indicate browser issues');
    }

    // Browser-specific recommendations with version checks
    const browserName = report.browser.name.toLowerCase();
    const browserVersion = parseInt(report.browser.version);

    if (browserName === 'internet explorer') {
      report.criticalIssues.push('Internet Explorer has limited support for modern export features');
      report.recommendations.push('Consider upgrading to Microsoft Edge or another modern browser');
    }

    if (browserName === 'safari') {
      if (browserVersion < 14) {
        report.warnings.push('Safari versions below 14 have limited WebP support');
        report.recommendations.push('Update Safari for better format support');
      }
      if (browserVersion < 12) {
        report.criticalIssues.push('Safari versions below 12 may have canvas export issues');
      }
    }

    if (browserName === 'firefox') {
      if (browserVersion < 65) {
        report.warnings.push('Firefox versions below 65 have limited WebP support');
      }
      if (browserVersion < 60) {
        report.warnings.push('Firefox versions below 60 may have download issues');
      }
    }

    if (browserName === 'chrome') {
      if (browserVersion < 80) {
        report.warnings.push('Chrome versions below 80 may have performance issues with large images');
      }
    }

    if (browserName === 'edge') {
      if (browserVersion < 79) {
        report.warnings.push('Legacy Edge has limited export capabilities');
        report.recommendations.push('Update to Chromium-based Edge for better performance');
      }
    }

    // CORS warnings
    if (!report.features.cors) {
      report.criticalIssues.push('CORS not supported - cross-origin images may not export properly');
    }

    // Memory and performance warnings
    const deviceMemory = navigator.deviceMemory;
    if (deviceMemory && deviceMemory < 4) {
      report.warnings.push(`Low device memory detected (${deviceMemory}GB) - large images may cause issues`);
      report.recommendations.push('Use smaller images or lower quality settings for better performance');
    }

    // Mobile-specific warnings
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      report.warnings.push('Mobile device detected - some features may be limited');
      report.recommendations.push('Use smaller images and lower quality settings on mobile devices');
    }

    // Connection-specific warnings
    if (navigator.connection) {
      const connection = navigator.connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        report.warnings.push('Slow network connection detected - downloads may be slow');
        report.recommendations.push('Use lower quality settings to reduce file size');
      }
      if (connection.saveData) {
        report.warnings.push('Data saver mode detected');
        report.recommendations.push('Consider using lower quality settings to save bandwidth');
      }
    }

    // Privacy mode detection
    try {
      if (window.navigator.webdriver) {
        report.warnings.push('Automated browser detected - some features may be limited');
      }
    } catch (e) {
      // Ignore privacy detection errors
    }
  }

  /**
   * Get fallback options for unsupported features
   * @param {Object} compatibilityReport - Report from getCompatibilityReport()
   * @returns {Object} - Fallback options
   */
  static getFallbackOptions(compatibilityReport) {
    const fallbacks = {
      formats: [],
      downloadMethod: 'link',
      corsWorkaround: false
    };

    // Determine available formats in order of preference
    if (compatibilityReport.formats.webp) {
      fallbacks.formats.push('webp');
    }
    if (compatibilityReport.formats.jpeg) {
      fallbacks.formats.push('jpeg');
    }
    if (compatibilityReport.formats.png) {
      fallbacks.formats.push('png');
    }

    // Determine best download method
    if (compatibilityReport.features.download && compatibilityReport.features.blob) {
      fallbacks.downloadMethod = 'blob';
    } else if (compatibilityReport.features.objectURL) {
      fallbacks.downloadMethod = 'objectURL';
    } else {
      fallbacks.downloadMethod = 'newWindow';
    }

    // CORS workaround needed?
    fallbacks.corsWorkaround = !compatibilityReport.features.cors;

    return fallbacks;
  }

  /**
   * Test export functionality with a small test image
   * @returns {Promise<Object>} - Test results
   */
  static async testExportFunctionality() {
    const results = {
      canvasCreation: false,
      pngExport: false,
      jpegExport: false,
      webpExport: false,
      blobCreation: false,
      downloadTrigger: false,
      errors: []
    };

    try {
      // Test canvas creation
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, 10, 10);
      results.canvasCreation = true;

      // Test PNG export
      try {
        const pngDataUrl = canvas.toDataURL('image/png');
        results.pngExport = pngDataUrl.startsWith('data:image/png');
      } catch (error) {
        results.errors.push('PNG export failed: ' + error.message);
      }

      // Test JPEG export
      try {
        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        results.jpegExport = jpegDataUrl.startsWith('data:image/jpeg');
      } catch (error) {
        results.errors.push('JPEG export failed: ' + error.message);
      }

      // Test WebP export
      try {
        const webpDataUrl = canvas.toDataURL('image/webp', 0.8);
        results.webpExport = webpDataUrl.startsWith('data:image/webp');
      } catch (error) {
        results.errors.push('WebP export failed: ' + error.message);
      }

      // Test blob creation
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        results.blobCreation = blob.size > 0;
      } catch (error) {
        results.errors.push('Blob creation failed: ' + error.message);
      }

      // Test download trigger (without actually downloading)
      try {
        const link = document.createElement('a');
        link.download = 'test.png';
        link.href = canvas.toDataURL('image/png');
        results.downloadTrigger = true;
      } catch (error) {
        results.errors.push('Download trigger failed: ' + error.message);
      }

    } catch (error) {
      results.errors.push('Canvas creation failed: ' + error.message);
    }

    return results;
  }
}

export default BrowserCompatibility;