import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExportOptionsPanel from '../ExportOptionsPanel';

// Mock the utility modules
vi.mock('../../utils/CanvasConverter', () => ({
  default: {
    convertImageToCanvas: vi.fn(),
    exportCanvas: vi.fn(),
    getSupportedFormats: vi.fn(),
    clearCache: vi.fn(),
    initializeCacheCleanup: vi.fn()
  }
}));

vi.mock('../../utils/ExportProcessor', () => ({
  default: {
    exportMeme: vi.fn(),
    generateFilename: vi.fn(),
    initializeBlobUrlCleanup: vi.fn()
  }
}));

vi.mock('../../utils/ErrorHandler', () => ({
  default: {
    checkCompatibilityIssues: vi.fn(),
    handleExportError: vi.fn(),
    SEVERITY_LEVELS: {
      CRITICAL: 'critical',
      HIGH: 'high'
    }
  }
}));

vi.mock('../../utils/PerformanceMonitor', () => ({
  default: {
    startMonitoring: vi.fn(),
    stopMonitoring: vi.fn()
  }
}));

vi.mock('../../utils/PerformanceOptimizer', () => ({
  default: {
    initializeMonitoring: vi.fn(),
    stopMonitoring: vi.fn()
  }
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
global.URL.revokeObjectURL = vi.fn();

// Mock canvas and image elements
const mockCanvas = {
  toDataURL: vi.fn(() => 'data:image/png;base64,mockdata'),
  getContext: vi.fn(() => ({
    drawImage: vi.fn(),
    canvas: { width: 500, height: 500 }
  }))
};

global.HTMLCanvasElement.prototype.toDataURL = mockCanvas.toDataURL;
global.HTMLCanvasElement.prototype.getContext = mockCanvas.getContext;

describe('Export Flow Integration Tests', () => {
  const mockMemeImageSrc = 'data:image/png;base64,mockImageData';

  test('should render export options panel with meme image', () => {
    render(
      <ExportOptionsPanel
        memeImageSrc={mockMemeImageSrc}
        isVisible={true}
      />
    );

    // Verify core components are rendered
    expect(screen.getByText('Export Options')).toBeInTheDocument();
    expect(screen.getByText('Export Format')).toBeInTheDocument();
    expect(screen.getByText('Estimated File Size')).toBeInTheDocument();
  });

  test('should show placeholder when no meme image provided', () => {
    render(
      <ExportOptionsPanel
        memeImageSrc={null}
        isVisible={true}
      />
    );

    // Should show placeholder message
    expect(screen.getByText('Generate a meme to access export options')).toBeInTheDocument();
  });

  test('should not render when not visible', () => {
    render(
      <ExportOptionsPanel
        memeImageSrc={mockMemeImageSrc}
        isVisible={false}
      />
    );

    // Should not render when not visible
    expect(screen.queryByText('Export Options')).not.toBeInTheDocument();
  });
});