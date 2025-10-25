/**
 * Export Utilities Index
 * Centralized exports for all export-related utilities
 */

import CanvasConverter from './CanvasConverter.js';
import ExportProcessor from './ExportProcessor.js';
import BrowserCompatibility from './BrowserCompatibility.js';

// Export individual classes
export { CanvasConverter, ExportProcessor, BrowserCompatibility };

// Export as default object for convenience
export default {
  CanvasConverter,
  ExportProcessor,
  BrowserCompatibility
};

// Convenience functions for common operations
export const convertImageToCanvas = CanvasConverter.imageToCanvas;
export const convertUrlToCanvas = CanvasConverter.urlToCanvas;
export const exportMeme = ExportProcessor.exportMeme;
export const checkWebPSupport = BrowserCompatibility.checkWebPSupport;
export const getCompatibilityReport = BrowserCompatibility.getCompatibilityReport;