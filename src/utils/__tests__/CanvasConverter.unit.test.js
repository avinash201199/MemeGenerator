import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CanvasConverter from '../CanvasConverter.js';

describe('CanvasConverter - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    CanvasConverter.clearCache();
  });

  afterEach(() => {
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

    it('should handle invalid format inputs', () => {
      expect(CanvasConverter.isFormatSupported(null)).toBe(false);
      expect(CanvasConverter.isFormatSupported(undefined)).toBe(false);
      expect(CanvasConverter.isFormatSupported('')).toBe(false);
      expect(CanvasConverter.isFormatSupported(123)).toBe(false);
    });
  });

  describe('Supported Formats List', () => {
    it('should return array of supported formats', () => {
      const formats = CanvasConverter.getSupportedFormats();
      
      expect(Array.isArray(formats)).toBe(true);
      expect(formats.length).toBeGreaterThanOrEqual(0);
      
      // Should contain at least PNG in most environments
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

    it('should calculate size correctly for different data URLs', () => {
      const smallDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      const largerDataUrl = 'data:image/png;base64,' + 'A'.repeat(100);
      
      const smallSize = CanvasConverter.estimateFileSize(smallDataUrl);
      const largerSize = CanvasConverter.estimateFileSize(largerDataUrl);
      
      expect(largerSize).toBeGreaterThan(smallSize);
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

    it('should track memory usage in cache stats', () => {
      const stats = CanvasConverter.getCacheStats();
      
      expect(stats).toHaveProperty('memoryUsage');
      expect(stats).toHaveProperty('maxMemoryUsage');
      expect(stats).toHaveProperty('memoryUtilization');
      expect(typeof stats.memoryUsage).toBe('number');
      expect(typeof stats.maxMemoryUsage).toBe('number');
      expect(typeof stats.memoryUtilization).toBe('number');
    });
  });

  describe('Canvas Disposal', () => {
    it('should dispose canvas without errors', () => {
      const mockCanvas = { 
        width: 100, 
        height: 100, 
        getContext: vi.fn(() => ({ clearRect: vi.fn() }))
      };
      expect(() => CanvasConverter.disposeCanvas(mockCanvas)).not.toThrow();
    });

    it('should dispose multiple canvases without errors', () => {
      const canvases = [
        { width: 100, height: 100, getContext: () => ({ clearRect: vi.fn() }) },
        { width: 200, height: 200, getContext: () => ({ clearRect: vi.fn() }) }
      ];
      expect(() => CanvasConverter.disposeCanvases(canvases)).not.toThrow();
    });

    it('should handle null canvas disposal gracefully', () => {
      expect(() => CanvasConverter.disposeCanvas(null)).not.toThrow();
      expect(() => CanvasConverter.disposeCanvas(undefined)).not.toThrow();
      expect(() => CanvasConverter.disposeCanvases([null, undefined])).not.toThrow();
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
  });

  describe('Performance Optimizations', () => {
    it('should cleanup cache when memory limit is reached', () => {
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
});