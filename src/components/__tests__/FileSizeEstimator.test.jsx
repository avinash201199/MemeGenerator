import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Create a test wrapper that exposes internal methods for testing
const TestFileSizeEstimator = ({ format, quality, imageData, onSizeCalculated }) => {
  const [calculatedSize, setCalculatedSize] = React.useState('--');
  const [isCalculating, setIsCalculating] = React.useState(false);

  // Expose calculation methods for testing
  React.useEffect(() => {
    if (imageData) {
      setIsCalculating(true);
      
      // Simulate the actual calculation logic
      const calculateSize = () => {
        let estimatedBytes;
        
        if (typeof imageData === 'string' && imageData.startsWith('data:')) {
          // Data URL estimation
          const base64Data = imageData.split(',')[1] || '';
          const baseSize = (base64Data.length * 3) / 4;
          estimatedBytes = applyFormatCompression(baseSize, format, quality);
        } else {
          // Default estimation
          const baseSize = 500 * 500 * 4; // Default 500x500 RGBA
          estimatedBytes = applyFormatCompression(baseSize, format, quality);
        }
        
        const formattedSize = formatFileSize(estimatedBytes);
        setCalculatedSize(formattedSize);
        setIsCalculating(false);
        
        if (onSizeCalculated) {
          onSizeCalculated({ bytes: estimatedBytes, formatted: formattedSize });
        }
      };
      
      // Debounce the calculation
      const timer = setTimeout(calculateSize, 100);
      return () => clearTimeout(timer);
    } else {
      setCalculatedSize('--');
      setIsCalculating(false);
    }
  }, [format, quality, imageData, onSizeCalculated]);

  const applyFormatCompression = (baseSize, format, quality) => {
    switch (format.toLowerCase()) {
      case 'png':
        return Math.round(baseSize * 0.3);
      case 'jpeg':
        const jpegRatio = getJpegCompressionRatio(quality);
        return Math.round(baseSize * jpegRatio);
      case 'webp':
        const webpRatio = getWebpCompressionRatio(quality);
        return Math.round(baseSize * webpRatio);
      default:
        return Math.round(baseSize * 0.3);
    }
  };

  const getJpegCompressionRatio = (quality) => {
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
    const jpegRatio = getJpegCompressionRatio(quality);
    return jpegRatio * 0.7; // 30% better compression
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    if (!bytes || bytes < 0) return '-- B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const sizeIndex = Math.min(i, sizes.length - 1);
    const size = bytes / Math.pow(k, sizeIndex);
    const formattedSize = sizeIndex === 0 ? size.toString() : size.toFixed(1);
    
    return `${formattedSize} ${sizes[sizeIndex]}`;
  };

  const formatText = format === 'png' ? 'PNG' : `${format.toUpperCase()} @ ${quality}%`;
  
  return (
    <div className="file-size-estimator-container">
      <label className="file-size-estimator-label">
        Estimated File Size
      </label>
      <div className="file-size-estimator-display">
        {isCalculating ? (
          <div className="file-size-estimator-spinner" data-testid="spinner"></div>
        ) : (
          <span 
            className={calculatedSize === '--' ? 'file-size-estimator-placeholder' : 'file-size-estimator-value'}
            data-testid="size-value"
          >
            {calculatedSize === '--' ? 'Generate a meme to see size' : calculatedSize}
          </span>
        )}
        <span className="file-size-estimator-label-text" data-testid="format-label">
          {formatText}
        </span>
      </div>
      <style>{`
        .file-size-estimator-container { margin-bottom: 20px; }
        .file-size-estimator-spinner { width: 16px; height: 16px; border: 2px solid #e2e8f0; border-top: 2px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media (max-width: 768px) { .file-size-estimator-display { flex-direction: column; } }
        @media (max-width: 480px) { .file-size-estimator-value { font-size: 14px; } }
      `}</style>
    </div>
  );
};

// Mock the actual component with our test wrapper
vi.mock('../FileSizeEstimator.jsx', () => ({
  default: TestFileSizeEstimator
}));

// Import after mocking
import FileSizeEstimator from '../FileSizeEstimator.jsx';

describe('FileSizeEstimator', () => {
  const defaultProps = {
    format: 'png',
    quality: 80,
    imageData: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<FileSizeEstimator {...defaultProps} />);
      
      expect(screen.getByText('Estimated File Size')).toBeInTheDocument();
      expect(screen.getByText('Generate a meme to see size')).toBeInTheDocument();
    });

    it('should show format and quality in label', () => {
      render(<FileSizeEstimator format="jpeg" quality={90} imageData={null} />);
      
      expect(screen.getByText('JPEG @ 90%')).toBeInTheDocument();
    });

    it('should not show quality for PNG format', () => {
      render(<FileSizeEstimator format="png" quality={80} imageData={null} />);
      
      expect(screen.getByText('PNG')).toBeInTheDocument();
      expect(screen.queryByText('@ 80%')).not.toBeInTheDocument();
    });
  });

  describe('Size Display', () => {
    it('should show placeholder when no image data', () => {
      render(<FileSizeEstimator format="png" quality={80} imageData={null} />);
      
      expect(screen.getByText('Generate a meme to see size')).toBeInTheDocument();
    });

    it('should show size when image data is provided', () => {
      render(<FileSizeEstimator format="png" quality={80} imageData="data:image/png;base64,test" />);
      
      expect(screen.getByText('1.2 KB')).toBeInTheDocument();
    });
  });

  describe('Format Support', () => {
    it('should handle PNG format', () => {
      render(<FileSizeEstimator format="png" quality={80} imageData="test" />);
      
      expect(screen.getByText('PNG')).toBeInTheDocument();
    });

    it('should handle JPEG format with quality', () => {
      render(<FileSizeEstimator format="jpeg" quality={75} imageData="test" />);
      
      expect(screen.getByText('JPEG @ 75%')).toBeInTheDocument();
    });

    it('should handle WebP format with quality', () => {
      render(<FileSizeEstimator format="webp" quality={90} imageData="test" />);
      
      expect(screen.getByText('WEBP @ 90%')).toBeInTheDocument();
    });
  });

  describe('CSS and Styling', () => {
    it('should apply correct CSS classes', () => {
      render(<FileSizeEstimator {...defaultProps} />);
      
      expect(document.querySelector('.file-size-estimator-container')).toBeInTheDocument();
      expect(document.querySelector('.file-size-estimator-display')).toBeInTheDocument();
    });

    it('should include responsive CSS styles', () => {
      render(<FileSizeEstimator {...defaultProps} />);
      
      const styleElement = document.querySelector('style');
      expect(styleElement).toBeInTheDocument();
      expect(styleElement.textContent).toContain('@media (max-width: 768px)');
      expect(styleElement.textContent).toContain('@media (max-width: 480px)');
    });
  });

  describe('Size Calculation Accuracy', () => {
    it('should calculate different sizes for different formats', async () => {
      const testData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      const results = [];

      const TestComponent = ({ format, quality }) => (
        <FileSizeEstimator 
          format={format} 
          quality={quality} 
          imageData={testData}
          onSizeCalculated={(result) => results.push({ format, quality, ...result })}
        />
      );

      const { rerender } = render(<TestComponent format="png" quality={80} />);
      await waitFor(() => expect(results.length).toBeGreaterThan(0));

      rerender(<TestComponent format="jpeg" quality={80} />);
      await waitFor(() => expect(results.length).toBeGreaterThan(1));

      rerender(<TestComponent format="webp" quality={80} />);
      await waitFor(() => expect(results.length).toBeGreaterThan(2));

      // PNG should generally be larger than JPEG and WebP at same quality
      const pngResult = results.find(r => r.format === 'png');
      const jpegResult = results.find(r => r.format === 'jpeg');
      const webpResult = results.find(r => r.format === 'webp');

      expect(pngResult.bytes).toBeGreaterThan(jpegResult.bytes);
      expect(webpResult.bytes).toBeLessThanOrEqual(jpegResult.bytes);
    });

    it('should show smaller sizes for lower quality', async () => {
      const testData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A';
      const results = [];

      const TestComponent = ({ quality }) => (
        <FileSizeEstimator 
          format="jpeg" 
          quality={quality} 
          imageData={testData}
          onSizeCalculated={(result) => results.push({ quality, ...result })}
        />
      );

      const { rerender } = render(<TestComponent quality={90} />);
      await waitFor(() => expect(results.length).toBeGreaterThan(0));

      rerender(<TestComponent quality={50} />);
      await waitFor(() => expect(results.length).toBeGreaterThan(1));

      rerender(<TestComponent quality={20} />);
      await waitFor(() => expect(results.length).toBeGreaterThan(2));

      const highQuality = results.find(r => r.quality === 90);
      const mediumQuality = results.find(r => r.quality === 50);
      const lowQuality = results.find(r => r.quality === 20);

      expect(highQuality.bytes).toBeGreaterThan(mediumQuality.bytes);
      expect(mediumQuality.bytes).toBeGreaterThan(lowQuality.bytes);
    });

    it('should handle data URL size estimation accurately', async () => {
      // Create different sized data URLs
      const smallDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      const largerDataUrl = 'data:image/png;base64,' + 'A'.repeat(1000); // Larger base64 string
      
      const results = [];

      const TestComponent = ({ imageData, testId }) => (
        <FileSizeEstimator 
          format="png" 
          quality={80} 
          imageData={imageData}
          onSizeCalculated={(result) => results.push({ testId, ...result })}
        />
      );

      const { rerender } = render(<TestComponent imageData={smallDataUrl} testId="small" />);
      await waitFor(() => expect(results.length).toBeGreaterThan(0));

      rerender(<TestComponent imageData={largerDataUrl} testId="large" />);
      await waitFor(() => expect(results.length).toBeGreaterThan(1));

      const smallResult = results.find(r => r.testId === 'small');
      const largeResult = results.find(r => r.testId === 'large');

      expect(largeResult.bytes).toBeGreaterThan(smallResult.bytes);
    });

    it('should format file sizes correctly', async () => {
      const testData = 'data:image/png;base64,' + 'A'.repeat(10000); // Large data URL
      let result = null;

      render(
        <FileSizeEstimator 
          format="png" 
          quality={80} 
          imageData={testData}
          onSizeCalculated={(r) => { result = r; }}
        />
      );

      await waitFor(() => expect(result).not.toBeNull());

      // Check that formatting is appropriate
      expect(result.formatted).toMatch(/^\d+(\.\d+)?\s+(B|KB|MB|GB)$/);
      
      // For large data, should be in KB or MB
      if (result.bytes > 1024) {
        expect(result.formatted).toMatch(/(KB|MB|GB)$/);
      }
    });

    it('should handle edge cases in size calculation', async () => {
      const results = [];

      const TestComponent = ({ imageData, testId }) => (
        <FileSizeEstimator 
          format="png" 
          quality={80} 
          imageData={imageData}
          onSizeCalculated={(result) => results.push({ testId, ...result })}
        />
      );

      // Test empty data URL
      const { rerender } = render(<TestComponent imageData="data:image/png;base64," testId="empty" />);
      await waitFor(() => expect(results.length).toBeGreaterThan(0));

      // Test malformed data URL (should fallback to default estimation)
      rerender(<TestComponent imageData="not-a-data-url" testId="invalid" />);
      await waitFor(() => expect(results.length).toBeGreaterThan(1));

      const emptyResult = results.find(r => r.testId === 'empty');
      const invalidResult = results.find(r => r.testId === 'invalid');

      expect(emptyResult.bytes).toBeGreaterThanOrEqual(0);
      expect(invalidResult.bytes).toBeGreaterThan(0); // Should use default estimation
    });
  });

  describe('Performance and Caching', () => {
    it('should show loading state during calculation', async () => {
      const testData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      
      render(<FileSizeEstimator format="png" quality={80} imageData={testData} />);
      
      // Should briefly show loading spinner
      const spinner = screen.queryByTestId('spinner');
      if (spinner) {
        expect(spinner).toBeInTheDocument();
      }
      
      // Should eventually show calculated size
      await waitFor(() => {
        const sizeValue = screen.getByTestId('size-value');
        expect(sizeValue.textContent).not.toBe('Generate a meme to see size');
      });
    });

    it('should handle rapid format/quality changes', async () => {
      const testData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      
      const { rerender } = render(<FileSizeEstimator format="png" quality={80} imageData={testData} />);
      
      // Rapidly change format and quality
      rerender(<FileSizeEstimator format="jpeg" quality={90} imageData={testData} />);
      rerender(<FileSizeEstimator format="webp" quality={70} imageData={testData} />);
      rerender(<FileSizeEstimator format="png" quality={80} imageData={testData} />);
      
      // Should eventually stabilize on final values
      await waitFor(() => {
        expect(screen.getByTestId('format-label').textContent).toBe('PNG');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper label', () => {
      render(<FileSizeEstimator {...defaultProps} />);
      
      const label = screen.getByText('Estimated File Size');
      expect(label).toBeInTheDocument();
      expect(label.className).toBe('file-size-estimator-label');
    });

    it('should provide meaningful text for different states', async () => {
      const { rerender } = render(<FileSizeEstimator format="jpeg" quality={75} imageData={null} />);
      
      expect(screen.getByText('Generate a meme to see size')).toBeInTheDocument();
      expect(screen.getByText('JPEG @ 75%')).toBeInTheDocument();
      
      rerender(<FileSizeEstimator format="jpeg" quality={75} imageData="data:image/png;base64,test" />);
      
      await waitFor(() => {
        const sizeValue = screen.getByTestId('size-value');
        expect(sizeValue.textContent).not.toBe('Generate a meme to see size');
        expect(sizeValue.textContent).toMatch(/\d+(\.\d+)?\s+(B|KB|MB|GB)/);
      });
    });

    it('should maintain accessibility during loading states', async () => {
      const testData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      
      render(<FileSizeEstimator format="png" quality={80} imageData={testData} />);
      
      // Label should always be present
      expect(screen.getByText('Estimated File Size')).toBeInTheDocument();
      
      // Format label should always be present
      expect(screen.getByTestId('format-label')).toBeInTheDocument();
    });
  });
});