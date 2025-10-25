import React, { useState, useEffect, useCallback } from 'react';

const QualitySlider = ({ 
  quality = 80, 
  onQualityChange, 
  visible = true, 
  disabled = false 
}) => {
  const [localQuality, setLocalQuality] = useState(quality);

  // Debounced callback to prevent excessive updates
  const debouncedOnQualityChange = useCallback(
    debounce((value) => {
      onQualityChange(value);
    }, 300),
    [onQualityChange]
  );

  // Update local state when prop changes
  useEffect(() => {
    setLocalQuality(quality);
  }, [quality]);

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setLocalQuality(value);
    debouncedOnQualityChange(value);
  };

  const getQualityLabel = (value) => {
    if (value >= 90) return 'Excellent';
    if (value >= 80) return 'High';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Medium';
    if (value >= 20) return 'Low';
    if (value > 0) return 'Very Low';
    return 'Minimum';
  };

  const getQualityColor = (value) => {
    if (value >= 80) return '#48bb78';
    if (value >= 60) return '#ed8936';
    if (value >= 40) return '#ecc94b';
    return '#f56565';
  };

  // CSS for responsive design
  const responsiveCSS = `
    .quality-slider-container {
      margin-bottom: 20px;
      transition: opacity 0.3s ease, visibility 0.3s ease, max-height 0.3s ease;
      overflow: hidden;
    }

    .quality-slider-container.hidden {
      opacity: 0;
      visibility: hidden;
      max-height: 0;
      margin-bottom: 0;
    }

    .quality-slider-container.visible {
      opacity: 1;
      visibility: visible;
      max-height: 200px;
    }

    .quality-slider-label {
      display: block;
      margin-bottom: 12px;
      font-weight: 600;
      color: #4a5568;
      font-size: 14px;
    }

    .quality-slider-input-container {
      position: relative;
      margin-bottom: 8px;
    }

    .quality-slider-input {
      width: 100%;
      height: 8px;
      border-radius: 4px;
      background: linear-gradient(to right, 
        #f56565 0%, 
        #ecc94b 25%, 
        #ed8936 50%, 
        #48bb78 75%, 
        #48bb78 100%);
      outline: none;
      cursor: pointer;
      transition: opacity 0.3s ease;
      -webkit-appearance: none;
      appearance: none;
    }

    .quality-slider-input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quality-slider-input::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: #667eea;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s ease;
    }

    .quality-slider-input::-webkit-slider-thumb:hover {
      transform: scale(1.1);
    }

    .quality-slider-input::-webkit-slider-thumb:active {
      transform: scale(0.95);
    }

    .quality-slider-input::-moz-range-thumb {
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: #667eea;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s ease;
    }

    .quality-slider-input::-moz-range-thumb:hover {
      transform: scale(1.1);
    }

    .quality-slider-input::-moz-range-thumb:active {
      transform: scale(0.95);
    }

    .quality-slider-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #718096;
      margin-bottom: 4px;
    }

    .quality-slider-value {
      font-weight: 600;
      font-size: 14px;
    }

    .quality-slider-labels {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #a0aec0;
    }

    /* Responsive breakpoints */
    @media (max-width: 768px) {
      .quality-slider-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .quality-slider-value {
        font-size: 13px;
      }

      .quality-slider-labels {
        font-size: 9px;
      }
    }

    @media (max-width: 480px) {
      .quality-slider-input::-webkit-slider-thumb {
        height: 24px;
        width: 24px;
      }

      .quality-slider-input::-moz-range-thumb {
        height: 24px;
        width: 24px;
      }

      .quality-slider-info {
        font-size: 11px;
      }

      .quality-slider-value {
        font-size: 12px;
      }
    }
  `;

  const styles = {
    container: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '12px',
      fontWeight: '600',
      color: '#4a5568',
      fontSize: '14px'
    }
  };

  return (
    <>
      <style>{responsiveCSS}</style>
      <div className={`quality-slider-container ${visible ? 'visible' : 'hidden'}`}>
        <label className="quality-slider-label" style={styles.label}>
          <i className="fas fa-sliders-h"></i> Quality
        </label>
        <div className="quality-slider-input-container">
          <input
            type="range"
            min="0"
            max="100"
            value={localQuality}
            onChange={handleSliderChange}
            disabled={disabled}
            className="quality-slider-input"
            aria-label={`Quality: ${localQuality}% (${getQualityLabel(localQuality)})`}
          />
        </div>
        <div className="quality-slider-info">
          <span>Quality: <span className="quality-slider-value" style={{color: getQualityColor(localQuality)}}>{localQuality}% ({getQualityLabel(localQuality)})</span></span>
          <span>Size vs Quality</span>
        </div>
        <div className="quality-slider-labels">
          <span>Smaller</span>
          <span>Larger</span>
        </div>
      </div>
    </>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default QualitySlider;