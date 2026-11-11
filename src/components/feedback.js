import React, { useState, useEffect } from "react";
import "../styles/feedback.css";
import {
  Star,
  Zap,
  MessageCircle,
  Send,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Award,
  ChevronLeft,
} from "lucide-react";

export default function FeedbackInterface({ onBack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState({
    rating: 0,
    category: "",
    priority: "",
    description: "",
    suggestions: "",
    email: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [animateStep, setAnimateStep] = useState(false);
  const [motivationalText, setMotivationalText] = useState("");

  // Google Form configuration
  const GOOGLE_FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLScuf4P1X4k03ZAQ52b4CrWjvD61uJEP5smHJb5LKa1va_f0rA/viewform?usp=header";
  const FORM_FIELD_IDS = {
    rating: "entry.123456789",
    category: "entry.987654321",
    priority: "entry.192837465",
    description: "entry.564738291",
    suggestions: "entry.918273645",
    email: "entry.657483920",
  };

  const motivationalMessages = [
    "Your voice matters! 🎯",
    "Help shape the future! 🚀",
    "Be part of the change! ✨",
    "Your ideas inspire us! 💡",
    "Together we grow! 🌱",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(
        Math.random() * motivationalMessages.length
      );
      setMotivationalText(motivationalMessages[randomIndex]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      title: "Rate Your Experience",
      subtitle: "How do you feel about our website?",
      icon: <Star className="step-icon" />,
    },
    {
      title: "What's Your Focus?",
      subtitle: "Which area needs the most attention?",
      icon: <Zap className="step-icon" />,
    },
    {
      title: "Priority Level",
      subtitle: "How urgent is this improvement?",
      icon: <TrendingUp className="step-icon" />,
    },
    {
      title: "Tell Us More",
      subtitle: "Share your detailed thoughts",
      icon: <MessageCircle className="step-icon" />,
    },
    {
      title: "Your Suggestions",
      subtitle: "What specific improvements would you like?",
      icon: <Sparkles className="step-icon" />,
    },
    {
      title: "Stay Connected",
      subtitle: "Get updates on improvements (optional)",
      icon: <Users className="step-icon" />,
    },
  ];

  const categories = [
    { name: "User Interface", icon: "🎨", color: "category-purple" },
    { name: "Performance", icon: "⚡", color: "category-yellow" },
    { name: "Navigation", icon: "🧭", color: "category-blue" },
    { name: "Content", icon: "📝", color: "category-green" },
    { name: "Mobile Experience", icon: "📱", color: "category-pink" },
    { name: "Accessibility", icon: "♿", color: "category-indigo" },
  ];

  const priorities = [
    { level: "Low", description: "Nice to have", color: "priority-low" },
    {
      level: "Medium",
      description: "Should improve",
      color: "priority-medium",
    },
    { level: "High", description: "Needs attention", color: "priority-high" },
    {
      level: "Critical",
      description: "Must fix now!",
      color: "priority-critical",
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setAnimateStep(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setAnimateStep(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setAnimateStep(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setAnimateStep(false);
      }, 300);
    }
  };

  const handleSubmit = () => {
    const params = new URLSearchParams();
    if (feedback.rating)
      params.append(FORM_FIELD_IDS.rating, feedback.rating.toString());
    if (feedback.category)
      params.append(FORM_FIELD_IDS.category, feedback.category);
    if (feedback.priority)
      params.append(FORM_FIELD_IDS.priority, feedback.priority);
    if (feedback.description)
      params.append(FORM_FIELD_IDS.description, feedback.description);
    if (feedback.suggestions)
      params.append(FORM_FIELD_IDS.suggestions, feedback.suggestions);
    if (feedback.email) params.append(FORM_FIELD_IDS.email, feedback.email);

    window.open(`${GOOGLE_FORM_URL}?${params.toString()}`, "_blank");
    setIsSubmitted(true);
  };

  const handleBackToApp = () => {
    if (onBack) {
      onBack();
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setCurrentStep(0);
    setFeedback({
      rating: 0,
      category: "",
      priority: "",
      description: "",
      suggestions: "",
      email: "",
    });
  };

  const renderStarRating = () => (
    <div className="star-rating-container">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setFeedback({ ...feedback, rating: star })}
          className="star-button"
        >
          <Star
            className={`star-icon ${
              star <= (hoveredRating || feedback.rating)
                ? "star-filled"
                : "star-empty"
            }`}
          />
        </button>
      ))}
    </div>
  );

  const renderCategories = () => (
    <div className="categories-grid">
      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => setFeedback({ ...feedback, category: cat.name })}
          className={`category-button ${cat.color} ${
            feedback.category === cat.name ? "category-selected" : ""
          }`}
        >
          <div className="category-icon">{cat.icon}</div>
          <div className="category-name">{cat.name}</div>
        </button>
      ))}
    </div>
  );

  const renderPriorities = () => (
    <div className="priorities-container">
      {priorities.map((priority) => (
        <button
          key={priority.level}
          onClick={() => setFeedback({ ...feedback, priority: priority.level })}
          className={`priority-button ${priority.color} ${
            feedback.priority === priority.level ? "priority-selected" : ""
          }`}
        >
          <div className="priority-level">{priority.level}</div>
          <div className="priority-description">{priority.description}</div>
        </button>
      ))}
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="feedback-container submitted-view">
        <div className="success-card">
          <button onClick={handleBackToApp} className="back-to-app-button">
            <ChevronLeft className="back-icon" />
            Back to App
          </button>

          <div className="success-content">
            <CheckCircle className="success-icon" />
            <h2 className="success-title">Thank You! 🎉</h2>
            <p className="success-message">
              Your feedback has been submitted successfully!
            </p>
            <div className="forms-notice">
              <p className="forms-notice-text">
                For more detailed feedback, you can complete our{" "}
                <a
                  href={GOOGLE_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="forms-link"
                >
                  Google Form
                </a>
              </p>
            </div>
          </div>
          <div className="points-container">
            <Award className="points-icon" />
            <p className="points-text">We appreciate your time!</p>
          </div>
          <div className="success-actions">
            <button onClick={resetForm} className="action-button">
              Submit Another Feedback
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="feedback-content">
          <div className="feedback-header">
            <div className="icon-container">
              <div className="header-icon">{steps[currentStep].icon}</div>
            </div>
            <h1 className="feedback-title">{steps[currentStep].title}</h1>
            <p className="feedback-subtitle">{steps[currentStep].subtitle}</p>
            <div className="motivational-text">{motivationalText}</div>
          </div>

          <div className={`step-content ${animateStep ? "animating" : ""}`}>
            {currentStep === 0 && (
              <div>
                {renderStarRating()}
                {feedback.rating > 0 && (
                  <div className="rating-feedback">
                    <p className="rating-text">
                      {feedback.rating <= 2
                        ? "We hear you! Let's make it better 💪"
                        : feedback.rating <= 4
                        ? "Great! Help us make it even better ⭐"
                        : "Awesome! Share how we can stay amazing 🚀"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 1 && renderCategories()}

            {currentStep === 2 && renderPriorities()}

            {currentStep === 3 && (
              <div className="description-container">
                <textarea
                  value={feedback.description}
                  onChange={(e) =>
                    setFeedback({ ...feedback, description: e.target.value })
                  }
                  placeholder="Tell us what's on your mind... What's working? What's not? We're all ears! 👂"
                  className="feedback-textarea"
                />
                <div className="char-count">
                  {feedback.description.length}/500 characters
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="suggestions-container">
                <textarea
                  value={feedback.suggestions}
                  onChange={(e) =>
                    setFeedback({ ...feedback, suggestions: e.target.value })
                  }
                  placeholder="Share your brilliant ideas! What features would make you excited? What changes would make your experience amazing? 💡✨"
                  className="feedback-textarea"
                />
              </div>
            )}

            {currentStep === 5 && (
              <div className="final-step">
                <div className="email-container">
                  <input
                    type="email"
                    value={feedback.email}
                    onChange={(e) =>
                      setFeedback({ ...feedback, email: e.target.value })
                    }
                    placeholder="your.email@example.com (optional)"
                    className="feedback-input"
                  />
                  <p className="input-helper">
                    We'll send you updates when we implement your suggestions!
                    📬
                  </p>
                </div>

                <div className="forms-integration">
                  <h3 className="forms-title">
                    <span className="forms-icon">📝</span>
                    Need More Space?
                  </h3>
                  <p className="forms-helper">
                    You'll have the option to provide additional feedback
                    through Google Forms after submission.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="navigation-buttons">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`nav-button back-button ${
                currentStep === 0 ? "disabled" : ""
              }`}
            >
              Back
            </button>

            <div className="step-counter">
              Step {currentStep + 1} of {steps.length}
            </div>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="nav-button submit-button"
              >
                <Send className="button-icon" />
                <span>Submit Feedback</span>
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={
                  (currentStep === 0 && feedback.rating === 0) ||
                  (currentStep === 1 && !feedback.category) ||
                  (currentStep === 2 && !feedback.priority) ||
                  (currentStep === 3 && feedback.description.trim().length < 10)
                }
                className={`nav-button next-button ${
                  (currentStep === 0 && feedback.rating === 0) ||
                  (currentStep === 1 && !feedback.category) ||
                  (currentStep === 2 && !feedback.priority) ||
                  (currentStep === 3 && feedback.description.trim().length < 10)
                    ? "disabled"
                    : ""
                }`}
              >
                <span>Next</span>
                <ArrowRight className="button-icon" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
