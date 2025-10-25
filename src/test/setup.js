// Test setup file for Vitest
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock DOM APIs that might not be available in test environment
global.URL = global.URL || {
  createObjectURL: vi.fn(() => 'mock-object-url'),
  revokeObjectURL: vi.fn()
};

global.Blob = global.Blob || class MockBlob {
  constructor(parts, options) {
    this.parts = parts || [];
    this.type = options?.type || '';
    this.size = parts ? parts.reduce((size, part) => size + (part.length || 0), 0) : 0;
  }
};

// Mock FileReader
global.FileReader = global.FileReader || class MockFileReader {
  constructor() {
    this.result = null;
    this.onload = null;
    this.onerror = null;
  }
  
  readAsDataURL(blob) {
    setTimeout(() => {
      this.result = 'data:image/png;base64,mock-base64-data';
      if (this.onload) this.onload();
    }, 0);
  }
};

// Mock Canvas API
global.HTMLCanvasElement = global.HTMLCanvasElement || class MockCanvas {
  constructor() {
    this.width = 0;
    this.height = 0;
  }
  
  getContext() {
    return {
      drawImage: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8Array(4) })),
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    };
  }
  
  toDataURL(type, quality) {
    return `data:${type || 'image/png'};base64,mock-canvas-data`;
  }
};

// Mock Image constructor
global.Image = global.Image || class MockImage {
  constructor() {
    this.src = '';
    this.width = 100;
    this.height = 100;
    this.naturalWidth = 100;
    this.naturalHeight = 100;
    this.complete = false;
    this.onload = null;
    this.onerror = null;
  }
  
  set src(value) {
    this._src = value;
    setTimeout(() => {
      this.complete = true;
      if (this.onload) this.onload();
    }, 0);
  }
  
  get src() {
    return this._src;
  }
};

// Mock performance API
global.performance = global.performance || {
  memory: {
    usedJSHeapSize: 1000000,
    jsHeapSizeLimit: 10000000
  },
  now: () => Date.now()
};

// Mock navigator
global.navigator = global.navigator || {
  userAgent: 'test-user-agent',
  deviceMemory: 4,
  onLine: true
};

// Mock document methods
if (typeof document !== 'undefined') {
  document.createElement = document.createElement || vi.fn((tagName) => {
    const element = {
      tagName: tagName.toUpperCase(),
      style: {},
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      click: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      parentNode: null
    };
    
    if (tagName === 'canvas') {
      Object.assign(element, new global.HTMLCanvasElement());
    }
    
    if (tagName === 'a') {
      element.href = '';
      element.download = '';
    }
    
    return element;
  });
  
  document.body = document.body || {
    appendChild: vi.fn(),
    removeChild: vi.fn()
  };
}