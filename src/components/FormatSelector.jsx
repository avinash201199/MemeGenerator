import React from 'react';

const FormatSelector = ({ selectedFormat, onFormatChange, disabled = false }) => {
  const formats = [
    {
      value: 'png',
      label: 'PNG',
      description: 'Lossless, best quality',
      icon: '🖼️'
    },
    {
      value: 'jpeg',
      label: 'JPEG',
      description: 'Smaller size, adjustable quality',
      icon: '📷'
    },
    {
      value: 'webp',
      label: 'WebP',
      description: 'Modern format, best compression',
      icon: '🚀'
    }
  ];

  const handleFormatClick = (format) => {
    if (!disabled) {
      onFormatChange(format);
    }
  };

  // CSS for responsive design
  const responsiveCSS = `
    .format-selector-container {
      margin-bottom: 20px;
    }

    .format-selector-label {
      display: block;
      margin-bottom: 12px;
      font-weight: 600;
      color: #4a5568;
      font-size: 14px;
    }

    .format-selector-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
    }

    .format-selector-button {
      padding: 16px 12px;
      border: 2px solid #e2e8f0;
      background: white;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
      font-size: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-height: 100px;
      font-family: inherit;
    }

    .format-selector-button:hover:not(.format-selector-button-disabled):not(.format-selector-button-selected) {
      border-color: #cbd5e0;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      background-color: #f7fafc;
    }

    .format-selector-button-selected {
      border-color: #667eea;
      background: linear-gradient(135deg, #f7faff 0%, #edf2ff 100%);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      transform: translateY(-1px);
    }

    .format-selector-button-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .format-selector-icon {
      font-size: 24px;
      margin-bottom: 4px;
    }

    .format-selector-label-text {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 4px;
    }

    .format-selector-description {
      font-size: 12px;
      color: #718096;
      line-height: 1.3;
    }

    /* Responsive breakpoints */
    @media (max-width: 768px) {
      .format-selector-grid {
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 10px;
      }

      .format-selector-button {
        padding: 14px 10px;
        min-height: 90px;
        font-size: 13px;
      }

      .format-selector-icon {
        font-size: 20px;
      }

      .format-selector-description {
        font-size: 11px;
      }
    }

    @media (max-width: 480px) {
      .format-selector-grid {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .format-selector-button {
        flex-direction: row;
        text-align: left;
        min-height: 60px;
        padding: 12px 16px;
        gap: 12px;
      }

      .format-selector-icon {
        font-size: 24px;
        margin-bottom: 0;
        flex-shrink: 0;
      }

      .format-selector-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .format-selector-label-text {
        margin-bottom: 2px;
        font-size: 14px;
      }

      .format-selector-description {
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
      <div className="format-selector-container" style={styles.container}>
        <label className="format-selector-label" style={styles.label}>
          <i className="fas fa-file-image"></i> Export Format
        </label>
        <div className="format-selector-grid">
          {formats.map((format) => {
            const isSelected = selectedFormat === format.value;
            const buttonClasses = [
              'format-selector-button',
              isSelected ? 'format-selector-button-selected' : '',
              disabled ? 'format-selector-button-disabled' : ''
            ].filter(Boolean).join(' ');

            return (
              <div
                key={format.value}
                className={buttonClasses}
                onClick={() => handleFormatClick(format.value)}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                    e.preventDefault();
                    handleFormatClick(format.value);
                  }
                }}
                aria-pressed={isSelected}
                aria-disabled={disabled}
              >
                <div className="format-selector-icon">{format.icon}</div>
                <div className="format-selector-content">
                  <div className="format-selector-label-text">{format.label}</div>
                  <div className="format-selector-description">{format.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default FormatSelector;