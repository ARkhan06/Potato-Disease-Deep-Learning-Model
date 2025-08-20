import React, { useState, useRef } from 'react';

const PotatoDiseaseClassifier = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const classifyImage = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setPrediction(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      setError('Failed to classify image. Make sure the backend is running on http://localhost:8000');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getResultColor = (className) => {
    switch (className) {
      case 'Healthy': return '#48bb78';
      case 'Early Blight': return '#ed8936';
      case 'Late Blight': return '#e53e3e';
      default: return '#667eea';
    }
  };

  const getResultEmoji = (className) => {
    switch (className) {
      case 'Healthy': return '🌿';
      case 'Early Blight': return '🦠';
      case 'Late Blight': return '🍄';
      default: return '🔍';
    }
  };

  return (
    <div className="container">
      <div className="app">
        {/* Header */}
        <div className="header">
          <h1>🥔 Potato Disease Classifier</h1>
          <p>Upload a potato leaf image to detect diseases using AI</p>
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          <div 
            className={`upload-area ${isDragOver ? 'dragover' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current.click()}
          >
            <div className="upload-icon">📸</div>
            <div className="upload-text">
              {selectedFile ? selectedFile.name : 'Drop your image here or click to browse'}
            </div>
            <div className="upload-subtext">
              Supports JPG, PNG, WebP (Max 10MB)
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="file-input"
            />
          </div>
        </div>

        {/* Image Preview */}
        {previewUrl && (
          <div className="preview-section">
            <div className="image-preview">
              <img src={previewUrl} alt="Preview" className="preview-img" />
            </div>
            <div className="preview-actions">
              <button 
                onClick={classifyImage} 
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing...
                  </>
                ) : (
                  '🔍 Classify Disease'
                )}
              </button>
              <button 
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setPrediction(null);
                  setError(null);
                }}
                className="btn btn-secondary"
              >
                🗑️ Clear
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <div className="error-text">{error}</div>
          </div>
        )}

        {/* Results */}
        {prediction && (
          <div className="results-section">
            <div className="result-header">
              <h3>🎯 Classification Results</h3>
            </div>
            
            <div className="main-result">
              <div 
                className="result-card main"
                style={{ borderColor: getResultColor(prediction.chosen_class) }}
              >
                <div className="result-emoji">
                  {getResultEmoji(prediction.chosen_class)}
                </div>
                <div className="result-info">
                  <div className="result-label">Prediction</div>
                  <div className="result-value">{prediction.chosen_class}</div>
                  <div className="result-confidence">
                    Confidence: {(prediction.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="all-predictions">
              <h4>📊 All Predictions</h4>
              <div className="predictions-grid">
                {Object.entries(prediction.predictions).map(([className, confidence]) => (
                  <div key={className} className="prediction-item">
                    <div className="prediction-header">
                      <span className="prediction-emoji">{getResultEmoji(className)}</span>
                      <span className="prediction-name">{className}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${confidence * 100}%`,
                          backgroundColor: getResultColor(className)
                        }}
                      ></div>
                    </div>
                    <div className="prediction-percentage">
                      {(confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .app {
          max-width: 800px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(20px);
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
        }

        .header h1 {
          color: #2d3748;
          font-size: 2.5rem;
          margin-bottom: 12px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header p {
          color: #718096;
          font-size: 1.1rem;
          font-weight: 400;
        }

        .upload-section {
          margin-bottom: 30px;
        }

        .upload-area {
          border: 3px dashed #cbd5e0;
          border-radius: 20px;
          padding: 60px 20px;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          background: #f8fafc;
          position: relative;
          overflow: hidden;
        }

        .upload-area::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
          transition: left 0.5s;
        }

        .upload-area:hover::before {
          left: 100%;
        }

        .upload-area:hover {
          border-color: #667eea;
          background: #edf2f7;
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
        }

        .upload-area.dragover {
          border-color: #667eea;
          background: linear-gradient(135deg, #e6fffa, #f0fff4);
          transform: scale(1.02);
        }

        .upload-icon {
          font-size: 3.5rem;
          margin-bottom: 20px;
          filter: grayscale(0.3);
        }

        .upload-text {
          color: #4a5568;
          font-size: 1.2rem;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .upload-subtext {
          color: #a0aec0;
          font-size: 0.9rem;
        }

        .file-input {
          display: none;
        }

        .preview-section {
          margin-bottom: 30px;
          animation: fadeIn 0.5s ease-in;
        }

        .image-preview {
          text-align: center;
          margin-bottom: 25px;
        }

        .preview-img {
          max-width: 350px;
          max-height: 350px;
          border-radius: 16px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          object-fit: cover;
          border: 4px solid #e2e8f0;
        }

        .preview-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          border: none;
          padding: 14px 28px;
          border-radius: 25px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #4a5568;
        }

        .btn-secondary:hover {
          background: #cbd5e0;
          transform: translateY(-2px);
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .error-message {
          background: linear-gradient(135deg, #fed7d7, #feb2b2);
          border: 1px solid #fc8181;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 12px;
          animation: shake 0.5s ease-in-out;
        }

        .error-icon {
          font-size: 1.5rem;
        }

        .error-text {
          color: #9b2c2c;
          font-weight: 500;
        }

        .results-section {
          animation: slideUp 0.6s ease-out;
        }

        .result-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .result-header h3 {
          color: #2d3748;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .main-result {
          margin-bottom: 30px;
        }

        .result-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 3px solid;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.3s ease;
        }

        .result-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }

        .result-emoji {
          font-size: 3rem;
          background: #f7fafc;
          padding: 20px;
          border-radius: 50%;
          min-width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .result-info {
          flex: 1;
        }

        .result-label {
          color: #718096;
          font-size: 0.9rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }

        .result-value {
          color: #2d3748;
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .result-confidence {
          color: #4a5568;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .all-predictions h4 {
          color: #2d3748;
          margin-bottom: 20px;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .predictions-grid {
          display: grid;
          gap: 15px;
        }

        .prediction-item {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .prediction-item:hover {
          transform: translateX(5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }

        .prediction-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .prediction-emoji {
          font-size: 1.2rem;
        }

        .prediction-name {
          font-weight: 600;
          color: #2d3748;
        }

        .progress-bar {
          background: #e2e8f0;
          border-radius: 10px;
          height: 8px;
          margin-bottom: 8px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 0.8s ease-out;
        }

        .prediction-percentage {
          text-align: right;
          font-weight: 600;
          color: #4a5568;
          font-size: 0.9rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @media (max-width: 640px) {
          .app {
            padding: 20px;
            margin: 10px;
          }

          .header h1 {
            font-size: 2rem;
          }

          .upload-area {
            padding: 40px 15px;
          }

          .preview-img {
            max-width: 280px;
            max-height: 280px;
          }

          .preview-actions {
            flex-direction: column;
            align-items: center;
          }

          .result-card {
            flex-direction: column;
            text-align: center;
          }

          .result-emoji {
            min-width: 60px;
            height: 60px;
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PotatoDiseaseClassifier;