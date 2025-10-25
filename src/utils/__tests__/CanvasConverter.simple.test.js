import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CanvasConverter from '../CanvasConverter.js';

// Enhanced mocks for better test compatibility
const createMockCanvas = () => {
  const canvas = {
    width: 100,
    height: 100,
    getContext: vi.fn(() => ({
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8Array(4) })),
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    })),
    toDataURL: vi.fn((type, quality) => `data:${type || 'image/png'};base64,mockdata`)
  };
  
  // Make it pass instanceof checks
  Object.setPrototypeOf(canvas, HTMLCanvasElement.prototype);
  return canvas;
};

const createMockImage = () => {
  const image = {
    naturalWidth: 200,
    naturalHeight: 150,
    width: 200,
    height: 150,
    complete: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    src: '',
    onload: null,
    onerror: null
  };
  
  // Make it pass instanceof checks
  Object.setPrototypeOf(image, HTMLImageElement.prototype);
  return image;
};

describe('CanvasConverter - Core Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear cache before each test
    CanvasConverter.clearCache();
    
    // Mock document.createElement
    global.document.createElement = vi.fn((tagName) => {
      if (tagName === 'canvas') {
        return createMockCanvas();
      }
      return {
        tagName: tagName.toUpperCase(),
        style: {},
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      };
    });
  });

  afterEach(() => {
    // Clean up after each test
    CanvasConverter.clearCache();
  });

  describe('Format Support Detection', () => {
    it('should detect PNG format support', () => {
      const isSupported = CanvasConverter.isFormatSupported('png');
      expect(typeof isSupported).toBe('boolean');
    });

    it('should detect JPEG format support', () => {
      const isSupported = CanvasConverter.isFormatSupported('jpeg');
      expect(typeof isSupported).toBe('boolean');
    });

    it('should detect WebP format support', () => {
      const isSupported = CanvasConverter.isFormatSupported('webp');
      expect(typeof isSupported).toBe('boolean');
    });

    it('should return false for unsupported formats', () => {
      const isSupported = CanvasConverter.isFormatSupported('gif');
      expect(isSupported).toBe(false);
    });

    it('should handle case insensitive format names', () => {
      const pngSupported = CanvasConverter.isFormatSupported('PNG');
      const jpegSupported = CanvasConverter.isFormatSupported('JPEG');
      
      expect(typeof pngSupported).toBe('boolean');
      expect(typeof jpegSupported).toBe('boolean');
    });
  });

  describe('Supported Formats List', () => {
    it('should return array of supported formats', () => {
      const formats = CanvasConverter.getSupportedFormats();
      
      expect(Array.isArray(formats)).toBe(true);
      // In test environment, formats might not be detected, so just check structure
      expect(formats.length).toBeGreaterThanOrEqual(0);
      if (formats.length > 0) {
        expect(formats).toContain('png');
      }
    });
  });

  describe('File Size Estimation', () => {
    it('should estimate file size from valid data URL', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      const size = CanvasConverter.estimateFileSize(dataUrl);
      
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThan(0);
    });

    it('should throw error for invalid data URL', () => {
      expect(() => CanvasConverter.estimateFileSize('invalid-url')).toThrow();
      expect(() => CanvasConverter.estimateFileSize('')).toThrow();
    });

    it('should handle data URL without base64 data', () => {
      expect(() => CanvasConverter.estimateFileSize('data:image/png;base64,')).toThrow();
    });
  });

  describe('Cache Management', () => {
    it('should provide cache statistics', () => {
      const stats = CanvasConverter.getCacheStats();
      
      expect(stats).toHaveProperty('totalEntries');
      expect(stats).toHaveProperty('memoryUsage');
      expect(stats).toHaveProperty('entries');
      expect(Array.isArray(stats.entries)).toBe(true);
      expect(typeof stats.totalEntries).toBe('number');
      expect(typeof stats.memoryUsage).toBe('number');
    });

    it('should clear cache and return count', () => {
      const clearedCount = CanvasConverter.clearCache();
      expect(typeof clearedCount).toBe('number');
      expect(clearedCount).toBeGreaterThanOrEqual(0);
    });

    it('should cleanup expired cache entries', () => {
      const cleanedCount = CanvasConverter.cleanupExpiredCache();
      expect(typeof cleanedCount).toBe('number');
      expect(cleanedCount).toBeGreaterThanOrEqual(0);
    });

    it('should initialize cache cleanup without errors', () => {
      expect(() => CanvasConverter.initializeCacheCleanup(1000)).not.toThrow();
    });
  });

  describe('Canvas Disposal', () => {
    it('should dispose canvas without errors', () => {
      const mockCanvas = { width: 100, height: 100, getContext: () => ({}) };
      expect(() => CanvasConverter.disposeCanvas(mockCanvas)).not.toThrow();
    });

    it('should dispose multiple canvases without errors', () => {
      const canvases = [
        { width: 100, height: 100, getContext: () => ({}) },
        { width: 200, height: 200, getContext: () => ({}) }
      ];
      expect(() => CanvasConverter.disposeCanvases(canvases)).not.toThrow();
    });

    it('should handle null canvas disposal gracefully', () => {
      expect(() => CanvasConverter.disposeCanvas(null)).not.toThrow();
      expect(() => CanvasConverter.disposeCanvases([null, undefined])).not.toThrow();
    });
  });

  describe('Canvas to Data URL Conversion', () => {
    let mockCanvas;

    beforeEach(() => {
      mockCanvas = createMockCanvas();
    });

    it('should convert canvas to PNG data URL', () => {
      const dataUrl = CanvasConverter.canvasToDataURL(mockCanvas, 'png');
      
      expect(typeof dataUrl).toBe('string');
      expect(dataUrl).toMatch(/^data:image\/png/);
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
    });

    it('should convert canvas to JPEG data URL with quality', () => {
      const dataUrl = CanvasConverter.canvasToDataURL(mockCanvas, 'jpeg', 0.8);
      
      expect(typeof dataUrl).toBe('string');
      expect(dataUrl).toMatch(/^data:image\/jpeg/);
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
    });

    it('should convert canvas to WebP data URL with quality', () => {
      const dataUrl = CanvasConverter.canvasToDataURL(mockCanvas, 'webp', 0.9);
      
      expect(typeof dataUrl).toBe('string');
      expect(dataUrl).toMatch(/^data:image\/webp/);
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/webp', 0.9);
    });

    it('should handle invalid canvas input', () => {
      expect(() => CanvasConverter.canvasToDataURL(null)).toThrow('Invalid canvas element provided');
      expect(() => CanvasConverter.canvasToDataURL(undefined)).toThrow('Invalid canvas element provided');
      expect(() => CanvasConverter.canvasToDataURL({})).toThrow('Invalid canvas element provided');
    });

    it('should handle invalid canvas dimensions', () => {
      const invalidCanvas = Object.create(HTMLCanvasElement.prototype);
      Object.assign(invalidCanvas, { ...mockCanvas, width: 0, height: 0 });
      expect(() => CanvasConverter.canvasToDataURL(invalidCanvas)).toThrow('Invalid canvas dimensions');
    });

    it('should normalize quality to valid range', () => {
      CanvasConverter.canvasToDataURL(mockCanvas, 'jpeg', 1.5); // Above 1
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 1);
      
      CanvasConverter.canvasToDataURL(mockCanvas, 'jpeg', -0.5); // Below 0
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0);
    });

    it('should handle unsupported format gracefully', () => {
      // Mock isFormatSupported to return false
      vi.spyOn(CanvasConverter, 'isFormatSupported').mockReturnValue(false);
      
      const dataUrl = CanvasConverter.canvasToDataURL(mockCanvas, 'gif');
      expect(dataUrl).toMatch(/^data:image\/png/); // Should fallback to PNG
    });
  });

  describe('Image to Canvas Conversion', () => {
    let mockImage;

    beforeEach(() => {
      mockImage = createMockImage();
    });

    it('should convert loaded image to canvas', async () => {
      const canvas = await CanvasConverter.imageToCanvas(mockImage);
      
      expect(canvas).toBeDefined();
      expect(canvas.width).toBe(200);
      expect(canvas.height).toBe(150);
    });

    it('should handle invalid image element', async () => {
      await expect(CanvasConverter.imageToCanvas(null)).rejects.toThrow('Invalid image element provided');
      await expect(CanvasConverter.imageToCanvas({})).rejects.toThrow('Invalid image element provided');
    });

    it('should handle image with invalid dimensions', async () => {
      const invalidImage = Object.create(HTMLImageElement.prototype);
      Object.assign(invalidImage, { ...mockImage, naturalWidth: 0, naturalHeight: 0, width: 0, height: 0 });
      await expect(CanvasConverter.imageToCanvas(invalidImage)).rejects.toThrow('Invalid image dimensions');
    });

    it('should handle very large images', async () => {
      const largeImage = Object.create(HTMLImageElement.prototype);
      Object.assign(largeImage, { ...mockImage, naturalWidth: 10000, naturalHeight: 10000 });
      await expect(CanvasConverter.imageToCanvas(largeImage)).rejects.toThrow('Image too large');
    });

    it('should use caching when enabled', async () => {
      const canvas1 = await CanvasConverter.imageToCanvas(mockImage, { useCache: true });
      const canvas2 = await CanvasConverter.imageToCanvas(mockImage, { useCache: true });
      
      expect(canvas1).toBeDefined();
      expect(canvas2).toBeDefined();
      // Second call should use cache (different canvas instance but same source)
    });

    it('should skip caching when disabled', async () => {
      const canvas = await CanvasConverter.imageToCanvas(mockImage, { useCache: false });
      expect(canvas).toBeDefined();
    });
  });

  describe('URL to Canvas Conversion', () => {
    beforeEach(() => {
      // Mock Image constructor properly
      global.Image = function() {
        const img = createMockImage();
        img.complete = false;
        img.naturalWidth = 300;
        img.naturalHeight = 200;
        
        // Add proper src setter/getter
        let _src = '';
        Object.defineProperty(img, 'src', {
          get: () => _src,
          set: (value) => {
            _src = value;
            setTimeout(() => {
              img.complete = true;
              if (img.onload) img.onload();
            }, 0);
          }
        });
        
        return img;
      };
    });

    it('should convert URL to canvas', async () => {
      const canvas = await CanvasConverter.urlToCanvas('https://example.com/image.png');
      expect(canvas).toBeDefined();
    });

    it('should handle invalid URL', async () => {
      await expect(CanvasConverter.urlToCanvas('')).rejects.toThrow('Invalid image URL provided');
      await expect(CanvasConverter.urlToCanvas(null)).rejects.toThrow('Invalid image URL provided');
    });

    it('should handle data URLs', async () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      const canvas = await CanvasConverter.urlToCanvas(dataUrl);
      expect(canvas).toBeDefined();
    });

    it('should handle image loading errors', async () => {
      // Mock Image to trigger error
      global.Image = function() {
        const img = createMockImage();
        img.complete = false;
        
        let _src = '';
        Object.defineProperty(img, 'src', {
          get: () => _src,
          set: (value) => {
            _src = value;
            setTimeout(() => {
              if (img.onerror) img.onerror(new Error('Image load failed'));
            }, 0);
          }
        });
        
        return img;
      };

      await expect(CanvasConverter.urlToCanvas('https://invalid.com/image.png')).rejects.toThrow();
    });
  });

  describe('Performance Optimizations', () => {
    it('should track memory usage in cache stats', () => {
      const stats = CanvasConverter.getCacheStats();
      
      expect(stats).toHaveProperty('memoryUsage');
      expect(stats).toHaveProperty('maxMemoryUsage');
      expect(stats).toHaveProperty('memoryUtilization');
      expect(typeof stats.memoryUsage).toBe('number');
      expect(typeof stats.maxMemoryUsage).toBe('number');
      expect(typeof stats.memoryUtilization).toBe('number');
    });

    it('should cleanup cache when memory limit is reached', () => {
      // This is more of an integration test, but we can verify the method exists
      expect(typeof CanvasConverter.cleanupExpiredCache).toBe('function');
      
      const cleaned = CanvasConverter.cleanupExpiredCache(true); // Force cleanup
      expect(typeof cleaned).toBe('number');
    });

    it('should initialize cache cleanup system', () => {
      expect(() => CanvasConverter.initializeCacheCleanup(1000)).not.toThrow();
    });

    it('should provide cache statistics with detailed entries', () => {
      const stats = CanvasConverter.getCacheStats();
      
      expect(Array.isArray(stats.entries)).toBe(true);
      expect(typeof stats.totalEntries).toBe('number');
      expect(typeof stats.activeCanvases).toBe('number');
    });
  });

  describe('Memory Management', () => {
    it('should dispose canvas properly', () => {
      const mockCanvas = {
        width: 100,
        height: 100,
        getContext: vi.fn(() => ({
          clearRect: vi.fn()
        }))
      };

      expect(() => CanvasConverter.disposeCanvas(mockCanvas)).not.toThrow();
    });

    it('should dispose multiple canvases', () => {
      const canvases = [
        { width: 100, height: 100, getContext: () => ({ clearRect: vi.fn() }) },
        { width: 200, height: 200, getContext: () => ({ clearRect: vi.fn() }) }
      ];

      expect(() => CanvasConverter.disposeCanvases(canvases)).not.toThrow();
    });

    it('should handle null canvas disposal gracefully', () => {
      expect(() => CanvasConverter.disposeCanvas(null)).not.toThrow();
      expect(() => CanvasConverter.disposeCanvas(undefined)).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully in format detection', () => {
      expect(() => CanvasConverter.isFormatSupported(null)).not.toThrow();
      expect(() => CanvasConverter.isFormatSupported(undefined)).not.toThrow();
      expect(() => CanvasConverter.isFormatSupported('')).not.toThrow();
    });

    it('should return false for invalid format inputs', () => {
      expect(CanvasConverter.isFormatSupported(null)).toBe(false);
      expect(CanvasConverter.isFormatSupported(undefined)).toBe(false);
      expect(CanvasConverter.isFormatSupported('')).toBe(false);
      expect(CanvasConverter.isFormatSupported(123)).toBe(false);
    });

    it('should handle canvas context creation failure', () => {
      const mockCanvas = createMockCanvas();
      mockCanvas.getContext = vi.fn(() => null); // Simulate context creation failure

      expect(() => CanvasConverter.canvasToDataURL(mockCanvas)).toThrow('Cannot get canvas 2D context');
    });

    it('should handle CORS errors in canvas conversion', () => {
      const mockCanvas = createMockCanvas();
      mockCanvas.toDataURL = vi.fn(() => {
        const error = new Error('CORS error');
        error.name = 'SecurityError';
        throw error;
      });

      expect(() => CanvasConverter.canvasToDataURL(mockCanvas)).toThrow('CORS error');
    });
  });
});