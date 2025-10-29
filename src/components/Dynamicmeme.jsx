import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ExportOptionsPanel from './ExportOptionsPanel';
import ErrorBoundary from './ErrorBoundary';
import './Dynamicmeme.css';
const Dynamicmeme = () => {
  const [categories, setCategories] = useState({});
  const [topicInput, setTopicInput] = useState('');
  const [contextInput, setContextInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  const [currentMemeFilename, setCurrentMemeFilename] = useState(null);
  const [memeData, setMemeData] = useState(null);
  const [memeImageSrc, setMemeImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // API base URL (configure via Vite env)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      } else {
        showError('Failed to load categories');
      }
    } catch (error) {
      showError('Error loading categories: ' + error.message);
    }
  };

  const selectCategory = (categoryKey) => {
    setSelectedCategory(categoryKey);
    setShowExamples(true);
  };

  const useExample = (topic, context) => {
    setTopicInput(topic);
    setContextInput(context);
    setShowExamples(false);
  };

  const generateMeme = async () => {
    if (!topicInput.trim()) {
      showError('Please enter a topic for your meme');
      return;
    }

    setIsLoading(true);
    hideMessages();

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: topicInput,
          context: contextInput
        })
      });

      const data = await response.json();

      if (data.success) {
        displayMeme(data);
        showSuccess('Meme generated successfully!');
      } else {
        showError(data.error || 'Failed to generate meme');
      }
    } catch (error) {
      showError('Error generating meme: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomMeme = async () => {
    setIsLoading(true);
    hideMessages();

    try {
      const response = await fetch(`${API_BASE_URL}/api/random`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        displayMeme(data);
        setTopicInput(data.topic);
        setContextInput(data.context || '');
        showSuccess(`Random meme generated from ${data.category}!`);
      } else {
        showError(data.error || 'Failed to generate random meme');
      }
    } catch (error) {
      showError('Error generating random meme: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const displayMeme = (data) => {
    setCurrentMemeFilename(data.filename);
    setMemeData(data);
    // Update meme image source for export system
    setMemeImageSrc(`${API_BASE_URL}/api/view/${data.filename}`);
  };

  // Legacy download function - maintained for backward compatibility as fallback option
  const downloadMeme = () => {
    if (currentMemeFilename) {
      window.open(`${API_BASE_URL}/api/download/${currentMemeFilename}`, '_blank');
    }
  };

  const generateAnother = () => {
    setMemeData(null);
    setMemeImageSrc(null);
    setTopicInput('');
    setContextInput('');
    setShowExamples(false);
    setSelectedCategory('');
    hideMessages();
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage('');
    }, 5000);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const hideMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      generateMeme();
    }
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    body: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      minHeight: '100vh',
      color: '#333',
      margin: 0,
      padding: '80px 0 2rem 0',
      position: 'relative'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px',
      color: 'white'
    },
    headerH1: {
      fontSize: '3rem',
      marginBottom: '10px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
    },
    headerP: {
      fontSize: '1.2rem',
      opacity: 0.9
    },
    mainContent: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '30px',
      alignItems: 'start',
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr',
        gap: '20px'
      }
    },
    inputSection: {
      background: 'white',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      minHeight: '500px',
      display: 'flex',
      flexDirection: 'column'
    },
    outputSection: {
      background: 'white',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      minHeight: '500px',
      display: 'flex',
      flexDirection: 'column'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      marginBottom: '20px',
      color: '#4a5568',
      borderBottom: '2px solid #e2e8f0',
      paddingBottom: '10px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#4a5568'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'border-color 0.3s ease',
      boxSizing: 'border-box',
      color: '#000000'
    },
    categoryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '10px',
      marginTop: '10px'
    },
    categoryBtn: {
      padding: '12px 16px',
      border: '2px solid #e2e8f0',
      background: 'white',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'center',
      fontSize: '14px'
    },
    categoryBtnSelected: {
      borderColor: '#667eea',
      background: '#667eea',
      color: 'white'
    },
    btn: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      padding: '15px 30px',
      borderRadius: '50px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px'
    },
    btnSecondary: {
      background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'
    },
    btnDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    btnGroup: {
      display: 'flex',
      gap: '15px',
      marginTop: '20px'
    },
    legacyDownloadSection: {
      marginTop: '15px',
      paddingTop: '15px',
      borderTop: '1px solid #e2e8f0'
    },
    memeDisplay: {
      textAlign: 'center'
    },
    memePlaceholder: {
      border: '3px dashed #e2e8f0',
      borderRadius: '12px',
      padding: '60px 20px',
      color: '#a0aec0',
      fontSize: '1.1rem'
    },
    memeImage: {
      maxWidth: '100%',
      maxHeight: '300px',
      width: 'auto',
      height: 'auto',
      borderRadius: '12px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
    },
    memeInfo: {
      marginTop: '15px',
      padding: '15px',
      background: '#f7fafc',
      borderRadius: '8px',
      textAlign: 'left'
    },
    memeText: {
      background: 'white',
      padding: '10px',
      borderRadius: '6px',
      margin: '5px 0',
      borderLeft: '4px solid #667eea'
    },
    loading: {
      textAlign: 'center',
      padding: '40px'
    },
    spinner: {
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #667eea',
      borderRadius: '50%',
      width: '50px',
      height: '50px',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 20px'
    },
    errorMessage: {
      background: '#fed7d7',
      color: '#c53030',
      padding: '15px',
      borderRadius: '8px',
      margin: '15px 0'
    },
    successMessage: {
      background: '#c6f6d5',
      color: '#22543d',
      padding: '15px',
      borderRadius: '8px',
      margin: '15px 0'
    },
    examplesList: {
      background: '#f7fafc',
      padding: '15px',
      borderRadius: '8px',
      marginTop: '10px'
    },
    exampleItem: {
      padding: '8px 12px',
      margin: '5px 0',
      background: 'white',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      border: '1px solid #e2e8f0'
    },
    footer: {
      textAlign: 'center',
      marginTop: '40px',
      color: 'white',
      opacity: 0.8
    }
  };

  return (<>
  <Navbar />
    <div style={styles.body}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.headerH1}>
            <i className="fas fa-laugh-squint"></i> Dynamic Meme Generator
          </h1>
          <p style={styles.headerP}>
            Create hilarious memes on ANY topic with AI-powered text generation!
          </p>
        </div>

        <div style={styles.mainContent} className="dynamic-meme-main-content grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Input Section */}
          <div style={styles.inputSection} className="order-2 lg:order-1">
            <h2 style={styles.sectionTitle}>
              <i className="fas fa-edit"></i> Create Your Meme
            </h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <i className="fas fa-lightbulb"></i> Meme Topic
              </label>
              <input
                type="text"
                style={styles.input}
                className="dynamic-meme-input"
                placeholder="Enter your meme topic (e.g., 'AI vs Human Intelligence')"
                maxLength="200"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <i className="fas fa-tags"></i> Context (Optional)
              </label>
              <input
                type="text"
                style={styles.input}
                className="dynamic-meme-input"
                placeholder="Add context for better results (e.g., 'technology and society')"
                maxLength="100"
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <i className="fas fa-th-large"></i> Or Choose from Categories
              </label>
              <div style={styles.categoryGrid} className="dynamic-meme-category-grid">
                {Object.keys(categories).map(key => {
                  const category = categories[key];
                  return (
                    <div
                      key={key}
                      style={{
                        ...styles.categoryBtn,
                        ...(selectedCategory === key ? styles.categoryBtnSelected : {})
                      }}
                      className="dynamic-meme-category-btn"
                      onClick={() => selectCategory(key)}
                    >
                      {category.name}
                    </div>
                  );
                })}
              </div>

              {showExamples && selectedCategory && (
                <div style={styles.examplesList}>
                  <h4>
                    <i className="fas fa-list"></i> Example topics for {categories[selectedCategory]?.name}:
                  </h4>
                  {categories[selectedCategory]?.examples.map((example, index) => (
                    <div
                      key={index}
                      style={styles.exampleItem}
                      className="dynamic-meme-example-item"
                      onClick={() => useExample(example, categories[selectedCategory].name.toLowerCase())}
                    >
                      {example}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.btnGroup} className="dynamic-meme-btn-group">
              <button
                style={{
                  ...styles.btn,
                  ...(isLoading ? styles.btnDisabled : {})
                }}
                className="dynamic-meme-btn"
                onClick={generateMeme}
                disabled={isLoading}
              >
                <i className="fas fa-magic"></i> Generate Meme
              </button>
              <button
                style={{
                  ...styles.btn,
                  ...styles.btnSecondary,
                  ...(isLoading ? styles.btnDisabled : {})
                }}
                className="dynamic-meme-btn"
                onClick={generateRandomMeme}
                disabled={isLoading}
              >
                <i className="fas fa-random"></i> Surprise Me!
              </button>
            </div>

            {errorMessage && (
              <div style={styles.errorMessage}>
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div style={styles.successMessage}>
                {successMessage}
              </div>
            )}
          </div>

          {/* Output Section */}
          <div style={styles.outputSection} className="order-1 lg:order-2">
            <h2 style={styles.sectionTitle}>
              <i className="fas fa-image"></i> Your Meme
            </h2>

            <div style={styles.memeDisplay}>
              {!memeData && !isLoading && (
                <div style={styles.memePlaceholder}>
                  <i className="fas fa-image fa-3x"></i>
                  <p>Your generated meme will appear here</p>
                </div>
              )}

              {isLoading && (
                <div style={styles.loading}>
                  <div style={styles.spinner}></div>
                  <p>Generating your awesome meme...</p>
                </div>
              )}

              {memeData && !isLoading && (
                <div>
                  <div>
                    <img
                      style={styles.memeImage}
                      src={memeImageSrc}
                      alt="Generated Meme"
                      id="generated-meme-image"
                    />
                  </div>

                  {/* Advanced Export Options Panel with Error Boundary */}
                  <ErrorBoundary>
                    <ExportOptionsPanel
                      memeImageSrc={memeImageSrc}
                      isVisible={!!memeImageSrc}
                      onExport={(format, quality) => {
                        // Export functionality will be handled by the ExportOptionsPanel internally
                        console.log(`Exporting meme in ${format} format with quality ${quality}`);
                      }}
                    />
                  </ErrorBoundary>

                  {/* Legacy download and action buttons - maintained for backward compatibility */}
                  <div style={styles.legacyDownloadSection}>
                    <div style={styles.btnGroup} className="dynamic-meme-btn-group">
                      <button 
                        style={styles.btn} 
                        className="dynamic-meme-btn" 
                        onClick={downloadMeme}
                        title="Quick download using original format (fallback option)"
                      >
                        <i className="fas fa-download"></i> Quick Download
                      </button>
                      <button
                        style={{ ...styles.btn, ...styles.btnSecondary }}
                        className="dynamic-meme-btn"
                        onClick={generateAnother}
                      >
                        <i className="fas fa-redo"></i> Generate Another
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
    <Footer />
  </>
  );
};

export default Dynamicmeme;