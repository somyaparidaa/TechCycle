import React, { useState } from "react";
import {
  AlertTriangle,
  Info,
  TreeDeciduous,
  Upload,
  X,
  Camera,
  ImageIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import "../styles/Awareness.css";
import img5 from "../images/image.png";

const facts = [
  {
    title: "Growing E-Waste Crisis",
    description:
      "E-waste is rapidly increasing due to rising electronics consumption and short product lifecycles. Toxic materials like lead and mercury pollute soil and water, harming ecosystems and human health. Poor recycling practices worsen the crisis, especially in developing nations.",
    icon: AlertTriangle,
  },
  {
    title: "Environmental Impact",
    description:
      "E-waste recycling reduces landfill waste, conserves natural resources, and prevents toxic chemicals like lead and mercury from polluting air, soil, and water. However, improper recycling methods release hazardous substances, harming workers and ecosystems.",
    icon: TreeDeciduous,
  },
  {
    title: "Valuable Materials",
    description:
      "Electronic waste holds valuable materials like gold, silver, and rare metals. One metric ton of circuit boards contains 40–800 times more gold than mined ore, making e-waste recycling highly profitable.",
    icon: Info,
  },
];

const Awareness = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    setError(null);
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setPrediction(null);
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/identify-ewaste", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = await response.json();
      setPrediction(data.prediction);
      setShowModal(true); // Show modal
    } catch (error) {
      setError("Error analyzing image. Please try again.");
      console.error("Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPrediction(null);
    setError(null);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="awareness-container">
      {/* Awareness Facts */}
      <div className="awareness-card">
        <h2 className="sections-title">E-Waste Awareness</h2>
        <div className="facts-grid">
          {facts.map((fact, index) => (
            <div key={index} className="fact-card">
              <div className="fact-header">
                <fact.icon className="fact-icon" />
                <h3 className="fact-title">{fact.title}</h3>
              </div>
              <p className="fact-description">{fact.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* E-Waste Identifier */}
      <div className="awareness-card">
        <h2 className="identifier-title">E-Waste Identifier</h2>
        <p className="identifier-subtitle">
          Upload a photo of your electronic waste for identification and
          recycling guidance
        </p>

        <div className="upload-area">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />

          {!selectedImage ? (
            <label htmlFor="image-upload" className="upload-label">
              <Upload className="upload-icon" />
              <span className="upload-text">
                <strong>Click to upload</strong> or drag and drop
              </span>
              <p className="upload-hint">PNG, JPG, up to 10MB</p>
            </label>
          ) : (
            <div className="uploaded-image-wrapper">
              <button onClick={clearImage} className="remove-image-btn">
                <X className="remove-image-icon" />
              </button>
              <img
                src={selectedImage}
                alt="Selected"
                className="uploaded-image"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="identifier-error">
            <AlertCircle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        {isAnalyzing && (
          <div className="identifier-analyzing">
            <div className="loader-dot"></div>
            <div className="loader-dot delay-100"></div>
            <div className="loader-dot delay-200"></div>
            <span className="analyzing-text">Analyzing image...</span>
          </div>
        )}
      </div>

      {/* Modal for prediction result */}
      {showModal && prediction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-btn" onClick={closeModal}>
              <X size={20} />
            </button>
            <CheckCircle className="modal-icon" />
            <h3 className="modal-title">Analysis Result</h3>
            <p className="modal-prediction">{prediction}</p>
            <div className="recycling-instructions">
              <h4>Recycling Instructions:</h4>
              <ul>
                <li>Remove any batteries before recycling</li>
                <li>Ensure all personal data is wiped</li>
                <li>Take to your nearest e-waste center</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Impact Section */}
      <div className="awareness-card">
        <h2 className="section-title">Impact of E-Waste Recycling</h2>
        <div className="impact-grid">
          <div className="image-container">
            <img src={img5} alt="E-waste recycling" className="impact-image" />
          </div>
          <div className="impact-content">
            <h3>Why Recycle E-Waste?</h3>
            <ul>
              <li>Prevents toxic materials from entering landfills</li>
              <li>Recovers valuable materials for reuse</li>
              <li>Reduces energy consumption in manufacturing</li>
              <li>Creates green jobs in recycling industry</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Awareness;
