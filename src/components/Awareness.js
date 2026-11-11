import React, { useState } from "react";
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import "../styles/Awareness.css";

const Awareness = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    setError(null);
    setResult(null);
    setSelectedFile(file);
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
  };

  const handleClassify = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/identify-ewaste", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error(data.error || "Model service unavailable. Weights pending loading.");
        }
        throw new Error(data.error || "Failed to analyze image. Please try again.");
      }

      if (data.status === "error") {
        throw new Error(data.error || "Inference failed on the uploaded image.");
      }

      setResult(data);
    } catch (err) {
      console.error("Inference request error:", err);
      setError(
        err.message ||
          "Could not connect to the AI Scanner backend. Ensure the server is running at http://127.0.0.1:8000."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedFile(null);
    setSelectedImage(null);
    setResult(null);
    setError(null);
  };

  const isLowConfidence = result && typeof result.confidence === "number" && result.confidence < 40.0;

  return (
    <div className="awareness-container">
      {/* Scanner Header Banner */}
      <div className="scanner-hero-card">
        <div className="scanner-hero-badge">
          <Sparkles className="badge-icon" size={16} />
          <span>MobileNetV2 Neural Classifier • 36 E-Waste Classes</span>
        </div>
        <h1 className="scanner-hero-title">Give your e-waste a second life.</h1>
        <p className="scanner-hero-subtitle">
          Upload a clear photo of any electronic component or discarded device.
          Our deep learning model identifies the part in real-time and prescribes certified
          environmental handling directives.
        </p>
      </div>

      {/* Main Interactive Workspace */}
      <div className="scanner-workspace-card">
        <div className="workspace-header">
          <div className="header-meta">
            <Cpu className="header-icon" size={24} />
            <div>
              <h2 className="workspace-title">E-Waste AI Scanner</h2>
              <p className="workspace-desc">
                Supports common PCBs, semiconductors, capacitors, transformers, microchips, and discrete parts.
              </p>
            </div>
          </div>
          {selectedImage && !isAnalyzing && (
            <button
              type="button"
              onClick={clearImage}
              className="scanner-reset-btn"
              title="Clear selection"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Upload / Preview Stage */}
        <div className="scanner-upload-stage">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="scanner-file-input"
            id="scanner-image-input"
            disabled={isAnalyzing}
          />

          {!selectedImage ? (
            <label htmlFor="scanner-image-input" className="scanner-dropzone">
              <div className="dropzone-icon-wrap">
                <Upload className="dropzone-icon" size={36} />
              </div>
              <span className="dropzone-title">Click to upload or drag & drop</span>
              <span className="dropzone-hint">
                PNG, JPG, JPEG, or WEBP up to 10MB (centered with good lighting recommended)
              </span>
            </label>
          ) : (
            <div className="scanner-preview-container">
              <div className="preview-image-box">
                <img
                  src={selectedImage}
                  alt="Component to classify"
                  className="preview-image"
                />
                {!isAnalyzing && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="preview-close-btn"
                    aria-label="Remove image"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="scanner-actions-bar">
                <label
                  htmlFor="scanner-image-input"
                  className={`scanner-secondary-btn ${isAnalyzing ? "disabled" : ""}`}
                >
                  <Upload size={16} />
                  <span>Choose Different Photo</span>
                </label>

                <button
                  type="button"
                  onClick={handleClassify}
                  disabled={isAnalyzing}
                  className="scanner-primary-btn"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="spinner-dot" />
                      <span>Classifying Component...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Identify Component</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Notice */}
        {error && (
          <div className="scanner-alert scanner-alert-error" role="alert">
            <AlertCircle className="alert-icon" size={20} />
            <div className="alert-text">
              <strong>Identification Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Live Classification Results */}
        {result && (
          <div className={`scanner-result-card ${isLowConfidence ? "low-confidence" : "high-confidence"}`}>
            <div className="result-header">
              <div className="result-status-indicator">
                {isLowConfidence ? (
                  <AlertTriangle className="status-icon warning" size={26} />
                ) : (
                  <CheckCircle2 className="status-icon success" size={26} />
                )}
                <div>
                  <span className="result-tagline">
                    {isLowConfidence ? "Low-Confidence Classification" : "Component Identified"}
                  </span>
                  <h3 className="result-component-name">{result.prediction}</h3>
                </div>
              </div>

              {typeof result.confidence === "number" && (
                <div className="confidence-badge-wrapper">
                  <div className="confidence-badge">
                    <span className="confidence-label">Confidence</span>
                    <span className="confidence-val">{result.confidence}%</span>
                  </div>
                  <div className="confidence-meter-bg">
                    <div
                      className={`confidence-meter-fill ${isLowConfidence ? "fill-warning" : "fill-success"}`}
                      style={{ width: `${Math.min(100, Math.max(0, result.confidence))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Low Confidence Warning Note */}
            {isLowConfidence && (
              <div className="low-confidence-banner">
                <AlertTriangle size={18} />
                <span>
                  The model prediction confidence is below the verified 40% threshold.
                  Please verify this component manually or re-upload a closer, well-lit photo before proceeding with disposal.
                </span>
              </div>
            )}

            {/* Recycling Directive Section */}
            {result.recycling_guide && (
              <div className="recycling-directive-box">
                <div className="directive-header">
                  <ShieldCheck size={18} className="directive-icon" />
                  <h4>Prescribed Environmental Directive</h4>
                </div>
                <p className="directive-text">{result.recycling_guide}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Awareness;
