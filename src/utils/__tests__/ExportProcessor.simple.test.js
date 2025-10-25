import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ExportProcessor from '../ExportProcessor.js';

describe('ExportProcessor - Core Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clean up blob URLs before each test
    ExportProcessor.cleanupExpiredBlobUrls(true);
  });

  afterEach(() => {
    // Clean up after each test
    ExportProcessor.cleanupExpiredBlobUrls(true);
  });

  describe('Filename Generation', () => {
    it('should generate filename with default format', () => {
      const filename = ExportProcessor.generateFilename();
      
      expect(typeof filename).toBe('string');
      expect(filename).toMatch(/\.png$/);
      expect(filename).toMatch(/^meme_/);
    });

    it('should generate filename with specified format', () => {
      const filename = ExportProcessor.generateFilename('jpeg');
      
      expect(filename).toMatch(/\.jpeg$/);
    });

    it('should generate filename with custom prefix', () => {
      const filename = ExportProcessor.generateFilename('png', null, { prefix: 'custom' });
      
      expect(filename).toMatch(/^custom_/);
    });

    it('should include quality in filename when requested', () => {
      const filename = ExportProcessor.generateFilename('jpeg', null, { 
        includeQuality: true, 
        quality: 80 
      });
      
      expect(filename).toMatch(/_q80_/);
    });

    it('should handle custom timestamp', () => {
      const customDate = new Date('2023-01-01T12:00:00Z');
      const filename = ExportProcessor.generateFilename('png', customDate);
      
      expect(filename).toMatch(/2023-01-01/);
    });

    it('should truncate long filenames', () => {
      const longPrefix = 'a'.repeat(300);
      const filename = ExportProcessor.generateFilename('png', null, { prefix: longPrefix });
      
      expect(filename.length).toBeLessThanOrEqual(255);
    });
  });

  describe('Multiple Filename Generation', () => {
    it('should generate multiple unique filenames', () => {
      const filenames = ExportProcessor.generateMultipleFilenames('png', 3);
      
      expect(filenames).toHaveLength(3);
      expect(new Set(filenames).size).toBe(3); // All unique
    });

    it('should include sequence numbers when requested', () => {
      const filenames = ExportProcessor.generateMultipleFilenames('png', 3, { 
        includeSequence: true 
      });
      
      expect(filenames[0]).toMatch(/_1_/);
      expect(filenames[1]).toMatch(/_2_/);
      expect(filenames[2]).toMatch(/_3_/);
    });

    it('should use batch prefix', () => {
      const filenames = ExportProcessor.generateMultipleFilenames('png', 2, { 
        batchPrefix: 'batch' 
      });
      
      filenames.forEach(filename => {
        expect(filename).toMatch(/^batch_/);
      });
    });
  });

  describe('Filename Sanitization', () => {
    it('should remove invalid characters', () => {
      const filename = ExportProcessor.sanitizeFilename('test<>:"/\\|?*file.png');
      
      expect(filename).toBe('test_file.png');
    });

    it('should replace spaces with underscores', () => {
      const filename = ExportProcessor.sanitizeFilename('test file name.png');
      
      expect(filename).toBe('test_file_name.png');
    });

    it('should handle empty filename', () => {
      const filename = ExportProcessor.sanitizeFilename('');
      
      expect(filename).toBe('meme.png');
    });

    it('should add extension if missing', () => {
      const filename = ExportProcessor.sanitizeFilename('testfile');
      
      expect(filename).toBe('testfile.png');
    });

    it('should truncate very long filenames', () => {
      const longName = 'a'.repeat(300) + '.png';
      const filename = ExportProcessor.sanitizeFilename(longName);
      
      expect(filename.length).toBeLessThanOrEqual(255);
      expect(filename).toMatch(/\.png$/);
    });
  });

  describe('Filename Component Sanitization', () => {
    it('should sanitize filename component', () => {
      const component = ExportProcessor.sanitizeFilenameComponent('test<>component');
      
      expect(component).toBe('testcomponent');
    });

    it('should handle empty component', () => {
      const component = ExportProcessor.sanitizeFilenameComponent('');
      
      expect(component).toBe('untitled');
    });

    it('should limit component length', () => {
      const longComponent = 'a'.repeat(100);
      const component = ExportProcessor.sanitizeFilenameComponent(longComponent);
      
      expect(component.length).toBeLessThanOrEqual(50);
    });

    it('should handle null and undefined inputs', () => {
      expect(ExportProcessor.sanitizeFilenameComponent(null)).toBe('untitled');
      expect(ExportProcessor.sanitizeFilenameComponent(undefined)).toBe('untitled');
    });
  });

  describe('Data URL to Blob Conversion', () => {
    it('should convert data URL to blob', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      const blob = ExportProcessor.dataUrlToBlob(dataUrl);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should reject invalid data URL', () => {
      expect(() => ExportProcessor.dataUrlToBlob('invalid-url')).toThrow('Invalid data URL format');
    });

    it('should handle data URL without MIME type', () => {
      const dataUrl = 'data:;base64,dGVzdA==';
      const blob = ExportProcessor.dataUrlToBlob(dataUrl);
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png'); // Default fallback
    });
  });

  describe('Intelligent Filename Generation', () => {
    it('should use template name when available', () => {
      const memeData = { templateName: 'Drake Pointing' };
      const filename = ExportProcessor.generateIntelligentFilename('png', memeData);
      
      expect(filename).toMatch(/^Drake_Pointing_/);
    });

    it('should use category when template name not available', () => {
      const memeData = { category: 'Reaction' };
      const filename = ExportProcessor.generateIntelligentFilename('png', memeData);
      
      expect(filename).toMatch(/^Reaction_/);
    });

    it('should use meme text when other data not available', () => {
      const memeData = { 
        topText: 'When you see a bug',
        bottomText: 'But it works in production'
      };
      const filename = ExportProcessor.generateIntelligentFilename('png', memeData, {
        includeContent: true
      });
      
      expect(filename).toMatch(/when_you_see/);
    });

    it('should filter out common words from text', () => {
      const memeData = { 
        topText: 'The quick brown fox',
        bottomText: 'jumps over the lazy dog'
      };
      const filename = ExportProcessor.generateIntelligentFilename('png', memeData, {
        includeContent: true,
        maxWords: 3
      });
      
      // Should not include common words like 'the', 'over'
      expect(filename).not.toMatch(/the|over/);
      expect(filename).toMatch(/quick|brown|fox|jumps|lazy|dog/);
    });

    it('should fallback to regular filename generation on error', () => {
      const filename = ExportProcessor.generateIntelligentFilename('png', null);
      
      expect(filename).toMatch(/^meme_/);
    });
  });

  describe('Filename Validation', () => {
    it('should validate correct filename', () => {
      const result = ExportProcessor.validateFilename('test-file.png');
      
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.hasExtension).toBe(true);
      expect(result.extension).toBe('png');
    });

    it('should detect invalid characters', () => {
      const result = ExportProcessor.validateFilename('test<>file.png');
      
      expect(result.valid).toBe(false);
      expect(result.issues.some(issue => issue.includes('invalid characters'))).toBe(true);
    });

    it('should detect missing extension', () => {
      const result = ExportProcessor.validateFilename('testfile');
      
      expect(result.valid).toBe(false);
      expect(result.issues.some(issue => issue.includes('Missing file extension'))).toBe(true);
      expect(result.hasExtension).toBe(false);
    });

    it('should detect reserved names', () => {
      const result = ExportProcessor.validateFilename('CON.png');
      
      expect(result.valid).toBe(false);
      expect(result.issues.some(issue => issue.includes('reserved filename'))).toBe(true);
    });

    it('should detect filename too long', () => {
      const longName = 'a'.repeat(300) + '.png';
      const result = ExportProcessor.validateFilename(longName);
      
      expect(result.valid).toBe(false);
      expect(result.issues.some(issue => issue.includes('too long'))).toBe(true);
    });

    it('should provide sanitized version', () => {
      const result = ExportProcessor.validateFilename('test<>file.png');
      
      expect(result.sanitized).toBe('test_file.png');
    });
  });

  describe('Alternative Filename Generation', () => {
    it('should return original filename if no conflict', () => {
      const alternatives = ExportProcessor.generateAlternativeFilenames('test.png', []);
      
      expect(alternatives).toEqual(['test.png']);
    });

    it('should generate numbered alternatives', () => {
      const existing = ['test.png'];
      const alternatives = ExportProcessor.generateAlternativeFilenames('test.png', existing, 3);
      
      expect(alternatives).toContain('test_1.png');
      expect(alternatives).toContain('test_2.png');
      expect(alternatives).toContain('test_3.png');
    });

    it('should generate timestamp alternative', () => {
      const existing = ['test.png', 'test_1.png', 'test_2.png', 'test_3.png', 'test_4.png', 'test_5.png'];
      const alternatives = ExportProcessor.generateAlternativeFilenames('test.png', existing, 5);
      
      expect(alternatives.some(alt => alt.includes('-'))).toBe(true); // Timestamp format
    });

    it('should handle empty original filename', () => {
      const alternatives = ExportProcessor.generateAlternativeFilenames('', []);
      
      expect(alternatives).toHaveLength(0);
    });
  });

  describe('Browser Compatibility', () => {
    it('should check browser compatibility', () => {
      const compatibility = ExportProcessor.checkBrowserCompatibility();
      
      expect(compatibility).toHaveProperty('canvas');
      expect(compatibility).toHaveProperty('download');
      expect(compatibility).toHaveProperty('formats');
      expect(compatibility).toHaveProperty('features');
      expect(typeof compatibility.canvas).toBe('boolean');
      expect(typeof compatibility.download).toBe('boolean');
    });
  });

  describe('File Size Estimation', () => {
    let mockBlob;

    beforeEach(() => {
      mockBlob = new Blob(['test data'], { type: 'image/png' });
    });

    it('should estimate file size for different formats', async () => {
      // Mock CanvasConverter methods
      const mockCanvas = { width: 100, height: 100 };
      vi.doMock('../CanvasConverter.js', () => ({
        default: {
          urlToCanvas: vi.fn().mockResolvedValue(mockCanvas),
          imageToCanvas: vi.fn().mockResolvedValue(mockCanvas),
          canvasToDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockdata'),
          estimateFileSize: vi.fn().mockReturnValue(1024)
        }
      }));

      const size = await ExportProcessor.estimateFileSize('test-url', 'png', 80);
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThan(0);
    });

    it('should provide fallback estimation on conversion failure', async () => {
      // Mock CanvasConverter to throw error
      vi.doMock('../CanvasConverter.js', () => ({
        default: {
          urlToCanvas: vi.fn().mockRejectedValue(new Error('Conversion failed')),
          imageToCanvas: vi.fn().mockRejectedValue(new Error('Conversion failed'))
        }
      }));

      const size = await ExportProcessor.estimateFileSize('test-url', 'jpeg', 75);
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThan(0);
    });

    it('should adjust estimation based on format', async () => {
      const pngSize = await ExportProcessor.estimateFileSize('test-url', 'png', 100);
      const jpegSize = await ExportProcessor.estimateFileSize('test-url', 'jpeg', 50);
      const webpSize = await ExportProcessor.estimateFileSize('test-url', 'webp', 50);

      expect(typeof pngSize).toBe('number');
      expect(typeof jpegSize).toBe('number');
      expect(typeof webpSize).toBe('number');
      
      // WebP should generally be smaller than JPEG at same quality
      expect(webpSize).toBeLessThanOrEqual(jpegSize);
    });
  });

  describe('Export Process', () => {
    let mockImageElement;

    beforeEach(() => {
      mockImageElement = {
        width: 200,
        height: 150,
        naturalWidth: 200,
        naturalHeight: 150,
        complete: true
      };

      // Mock CanvasConverter
      vi.doMock('../CanvasConverter.js', () => ({
        default: {
          imageToCanvas: vi.fn().mockResolvedValue({ width: 200, height: 150 }),
          urlToCanvas: vi.fn().mockResolvedValue({ width: 200, height: 150 }),
          canvasToDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockdata'),
          estimateFileSize: vi.fn().mockReturnValue(2048)
        }
      }));

      // Mock download functionality
      vi.spyOn(ExportProcessor, 'downloadBlob').mockResolvedValue(true);
    });

    it('should export meme with image element', async () => {
      const result = await ExportProcessor.exportMeme(mockImageElement, 'png', 80);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('fileSize');
      expect(result).toHaveProperty('format');
      expect(result.format).toBe('png');
    });

    it('should export meme with image URL', async () => {
      const result = await ExportProcessor.exportMeme('https://example.com/image.png', 'jpeg', 75);
      
      expect(result).toHaveProperty('success');
      expect(result.format).toBe('jpeg');
    });

    it('should handle export errors gracefully', async () => {
      // Mock CanvasConverter to throw error
      vi.doMock('../CanvasConverter.js', () => ({
        default: {
          imageToCanvas: vi.fn().mockRejectedValue(new Error('Conversion failed'))
        }
      }));

      const result = await ExportProcessor.exportMeme(mockImageElement, 'png', 80);
      
      expect(result.success).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('errorCategory');
    });

    it('should validate input parameters', async () => {
      const result1 = await ExportProcessor.exportMeme(null, 'png', 80);
      expect(result1.success).toBe(false);
      expect(result1.error).toContain('Image source is required');

      const result2 = await ExportProcessor.exportMeme(mockImageElement, 'invalid', 80);
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('Unsupported format');

      const result3 = await ExportProcessor.exportMeme(mockImageElement, 'png', 150);
      expect(result3.success).toBe(false);
      expect(result3.error).toContain('Quality must be a number between 0 and 100');
    });

    it('should include processing time in result', async () => {
      const result = await ExportProcessor.exportMeme(mockImageElement, 'png', 80);
      
      expect(result).toHaveProperty('processingTime');
      expect(typeof result.processingTime).toBe('number');
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Download Functionality', () => {
    let mockBlob;

    beforeEach(() => {
      mockBlob = new Blob(['test data'], { type: 'image/png' });
      
      // Mock DOM elements
      const mockLink = {
        href: '',
        download: '',
        style: { cssText: '' },
        setAttribute: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        click: vi.fn(),
        parentNode: null
      };

      global.document.createElement = vi.fn((tagName) => {
        if (tagName === 'a') return mockLink;
        return {};
      });

      global.document.body = {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      };
    });

    it('should download blob with object URL method', async () => {
      const success = await ExportProcessor.downloadBlob(mockBlob, 'test.png');
      expect(typeof success).toBe('boolean');
    });

    it('should handle download with retry logic', async () => {
      const success = await ExportProcessor.downloadBlob(mockBlob, 'test.png', {
        retryAttempts: 2,
        retryDelay: 100
      });
      expect(typeof success).toBe('boolean');
    });

    it('should validate blob input', async () => {
      await expect(ExportProcessor.downloadBlob(null, 'test.png')).rejects.toThrow('Invalid blob provided');
      await expect(ExportProcessor.downloadBlob({}, 'test.png')).rejects.toThrow('Invalid blob provided');
    });

    it('should handle empty blob', async () => {
      const emptyBlob = new Blob([], { type: 'image/png' });
      await expect(ExportProcessor.downloadBlob(emptyBlob, 'test.png')).rejects.toThrow('Cannot download empty blob');
    });

    it('should warn about large files', async () => {
      const largeData = 'x'.repeat(100 * 1024 * 1024); // 100MB
      const largeBlob = new Blob([largeData], { type: 'image/png' });
      
      // Should not throw but might warn
      const success = await ExportProcessor.downloadBlob(largeBlob, 'large.png');
      expect(typeof success).toBe('boolean');
    });
  });

  describe('Multiple File Downloads', () => {
    it('should download multiple files sequentially', async () => {
      const downloads = [
        { blob: new Blob(['data1'], { type: 'image/png' }), filename: 'file1.png' },
        { blob: new Blob(['data2'], { type: 'image/png' }), filename: 'file2.png' }
      ];

      const results = await ExportProcessor.downloadMultipleBlobs(downloads, { delay: 100 });
      
      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('filename');
      });
    });

    it('should handle invalid downloads in batch', async () => {
      const downloads = [
        { blob: new Blob(['data1'], { type: 'image/png' }), filename: 'file1.png' },
        { blob: null, filename: 'invalid.png' }, // Invalid blob
        { blob: new Blob(['data3'], { type: 'image/png' }), filename: 'file3.png' }
      ];

      const results = await ExportProcessor.downloadMultipleBlobs(downloads);
      
      expect(results).toHaveLength(3);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toContain('Invalid blob');
    });

    it('should support concurrent downloads', async () => {
      const downloads = [
        { blob: new Blob(['data1'], { type: 'image/png' }), filename: 'file1.png' },
        { blob: new Blob(['data2'], { type: 'image/png' }), filename: 'file2.png' }
      ];

      const results = await ExportProcessor.downloadMultipleBlobs(downloads, { 
        maxConcurrent: 2,
        delay: 50 
      });
      
      expect(results).toHaveLength(2);
    });
  });

  describe('Blob URL Management', () => {
    let mockBlob;

    beforeEach(() => {
      mockBlob = new Blob(['test data'], { type: 'image/png' });
    });

    it('should create managed blob URL', () => {
      const url = ExportProcessor.createManagedBlobUrl(mockBlob, 5000);
      
      expect(typeof url).toBe('string');
      expect(url).toBe('mock-object-url'); // From test setup
    });

    it('should revoke managed blob URL', () => {
      const url = ExportProcessor.createManagedBlobUrl(mockBlob, 5000);
      const success = ExportProcessor.revokeManagedBlobUrl(url);
      
      expect(success).toBe(true);
    });

    it('should track memory usage', () => {
      const info = ExportProcessor.getBlobUrlInfo();
      
      expect(info).toHaveProperty('count');
      expect(info).toHaveProperty('totalSize');
      expect(info).toHaveProperty('memoryUsageLimit');
      expect(info).toHaveProperty('memoryUtilization');
      expect(typeof info.count).toBe('number');
      expect(typeof info.totalSize).toBe('number');
    });

    it('should cleanup expired blob URLs', () => {
      const cleaned = ExportProcessor.cleanupExpiredBlobUrls();
      expect(typeof cleaned).toBe('number');
      expect(cleaned).toBeGreaterThanOrEqual(0);
    });

    it('should initialize blob URL cleanup', () => {
      expect(() => ExportProcessor.initializeBlobUrlCleanup(1000)).not.toThrow();
    });

    it('should handle invalid blob in managed URL creation', () => {
      expect(() => ExportProcessor.createManagedBlobUrl(null)).toThrow('Invalid blob provided');
      expect(() => ExportProcessor.createManagedBlobUrl({})).toThrow('Invalid blob provided');
    });
  });

  describe('Browser Diagnostics', () => {
    it('should get browser information', () => {
      const info = ExportProcessor.getBrowserInfo();
      
      expect(info).toHaveProperty('userAgent');
      expect(info).toHaveProperty('platform');
      expect(info).toHaveProperty('browser');
      expect(info).toHaveProperty('isMobile');
      expect(typeof info.browser).toBe('string');
      expect(typeof info.isMobile).toBe('boolean');
    });

    it('should diagnose download issues', () => {
      const error = new Error('Popup blocked');
      const diagnosis = ExportProcessor.diagnoseDowloadIssue(error, { filename: 'test.png' });
      
      expect(diagnosis).toHaveProperty('category');
      expect(diagnosis).toHaveProperty('severity');
      expect(diagnosis).toHaveProperty('recommendations');
      expect(diagnosis).toHaveProperty('userActions');
      expect(Array.isArray(diagnosis.recommendations)).toBe(true);
      expect(Array.isArray(diagnosis.userActions)).toBe(true);
    });

    it('should categorize different error types', () => {
      const corsError = new Error('CORS error occurred');
      const memoryError = new Error('Out of memory');
      const timeoutError = new Error('Request timeout');

      const corsDiagnosis = ExportProcessor.diagnoseDowloadIssue(corsError);
      const memoryDiagnosis = ExportProcessor.diagnoseDowloadIssue(memoryError);
      const timeoutDiagnosis = ExportProcessor.diagnoseDowloadIssue(timeoutError);

      expect(corsDiagnosis.category).toBe('cors_error');
      expect(memoryDiagnosis.category).toBe('memory_error');
      expect(timeoutDiagnosis.category).toBe('timeout_error');
    });

    it('should test download functionality', async () => {
      const testResult = await ExportProcessor.testDownloadFunctionality();
      
      expect(testResult).toHaveProperty('overall');
      expect(testResult).toHaveProperty('methods');
      expect(testResult).toHaveProperty('errors');
      expect(testResult).toHaveProperty('recommendations');
      expect(typeof testResult.overall).toBe('boolean');
      expect(Array.isArray(testResult.errors)).toBe(true);
      expect(Array.isArray(testResult.recommendations)).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    let mockBlob;

    beforeEach(() => {
      mockBlob = new Blob(['test data'], { type: 'image/png' });
    });

    it('should attempt recovery for failed downloads', async () => {
      const originalError = new Error('Download failed');
      const recoveryResult = await ExportProcessor.recoverFailedDownload(
        mockBlob, 
        'test.png', 
        originalError,
        { maxRecoveryAttempts: 2 }
      );
      
      expect(recoveryResult).toHaveProperty('success');
      expect(recoveryResult).toHaveProperty('method');
      expect(recoveryResult).toHaveProperty('attempts');
      expect(recoveryResult).toHaveProperty('diagnosis');
      expect(typeof recoveryResult.success).toBe('boolean');
      expect(typeof recoveryResult.attempts).toBe('number');
    });

    it('should provide recovery recommendations', async () => {
      const error = new Error('Permission denied');
      const recoveryResult = await ExportProcessor.recoverFailedDownload(mockBlob, 'test.png', error);
      
      expect(recoveryResult).toHaveProperty('recommendations');
      expect(Array.isArray(recoveryResult.recommendations)).toBe(true);
      if (recoveryResult.recommendations.length > 0) {
        expect(typeof recoveryResult.recommendations[0]).toBe('string');
      }
    });
  });
});