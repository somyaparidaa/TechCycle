import React, { useState } from "react";
import {
  Building,
  Users,
  Award,
  Calendar,
  MapPin,
  Recycle,
  CheckCircle,
  Star,
  TrendingUp,
  Download,
  Upload,
} from "lucide-react";
import "../styles/institution.css";

const InstitutionalPortal = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [applicationStep, setApplicationStep] = useState(1);
  const [institutionData, setInstitutionData] = useState({
    name: "",
    type: "university",
    size: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    currentWasteVolume: "",
    goals: [],
  });

  const programs = [
    {
      id: "campus-recycling",
      title: "Campus Recycling Program",
      description: "Complete e-waste management solution for your campus",
      features: [
        "Collection Points Setup",
        "Student Awareness Campaigns",
        "Monthly Pickup Services",
        "Impact Tracking Dashboard",
      ],
      benefits: "Reduce campus waste by up to 80%",
      duration: "12 months",
      participants: "500+ institutions",
    },
    {
      id: "volunteer-network",
      title: "Student Volunteer Network",
      description: "Engage students in environmental conservation",
      features: [
        "Volunteer Training Programs",
        "Event Organization Tools",
        "Recognition System",
        "Community Outreach",
      ],
      benefits: "Build environmental leaders",
      duration: "Ongoing",
      participants: "200+ campuses",
    },
    {
      id: "research-partnership",
      title: "Research Partnership",
      description: "Collaborate on e-waste research and innovation",
      features: [
        "Data Access",
        "Research Grants",
        "Publication Support",
        "Technology Testing",
      ],
      benefits: "Advance sustainability research",
      duration: "2-4 years",
      participants: "50+ universities",
    },
  ];

  const successStories = [
    {
      institution: "Tech University",
      type: "University",
      impact: "15,000 kg e-waste recycled",
      students: "2,500 students engaged",
      achievement: "Zero E-Waste Campus Certification",
    },
    {
      institution: "Green College",
      type: "College",
      impact: "8,500 kg e-waste recycled",
      students: "1,200 volunteers trained",
      achievement: "Regional Sustainability Award",
    },
    {
      institution: "Innovation High School",
      type: "School",
      impact: "3,200 kg e-waste recycled",
      students: "800 students participated",
      achievement: "Best Environmental Initiative",
    },
  ];

  const handleInputChange = (field, value) => {
    setInstitutionData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGoalToggle = (goal) => {
    setInstitutionData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const renderOverview = () => (
    <div className="ewaste-overview-section">
      <div className="ewaste-hero-content">
        <div className="ewaste-hero-text">
          <h1>Transform Your Institution into an E-Waste Champion</h1>
          <p>
            Join hundreds of educational institutions making a real
            environmental impact through our comprehensive e-waste management
            programs.
          </p>
          <div className="ewaste-impact-stats">
            <div className="ewaste-stat-item">
              <span className="ewaste-stat-number">500+</span>
              <span className="ewaste-stat-label">Partner Institutions</span>
            </div>
            <div className="ewaste-stat-item">
              <span className="ewaste-stat-number">2.5M kg</span>
              <span className="ewaste-stat-label">E-Waste Recycled</span>
            </div>
            <div className="ewaste-stat-item">
              <span className="ewaste-stat-number">50,000+</span>
              <span className="ewaste-stat-label">Students Engaged</span>
            </div>
          </div>
        </div>
        <div className="ewaste-hero-visual">
          <div className="ewaste-floating-card">
            <Recycle className="ewaste-icon-large" />
            <h3>Smart Recycling</h3>
            <p>AI-powered waste classification</p>
          </div>
        </div>
      </div>

      <div className="ewaste-programs-grid">
        <h2>Choose Your Impact Program</h2>
        <div className="ewaste-programs-container">
          {programs.map((program) => (
            <div key={program.id} className="ewaste-program-card">
              <div className="ewaste-program-header">
                <h3>{program.title}</h3>
                <span className="ewaste-participants-badge">
                  {program.participants}
                </span>
              </div>
              <p className="ewaste-program-description">
                {program.description}
              </p>
              <div className="ewaste-program-features">
                {program.features.map((feature, index) => (
                  <div key={index} className="ewaste-feature-item">
                    <CheckCircle className="ewaste-check-icon" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <div className="ewaste-program-footer">
                <div className="ewaste-program-meta">
                  <span className="ewaste-benefit">{program.benefits}</span>
                  <span className="ewaste-duration">
                    Duration: {program.duration}
                  </span>
                </div>
                <button
                  className="ewaste-select-program-btn"
                  onClick={() => {
                    setSelectedProgram(program);
                    setActiveTab("application");
                  }}
                >
                  Select Program
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSuccessStories = () => (
    <div className="ewaste-success-stories-section">
      <h2>Success Stories from Partner Institutions</h2>
      <div className="ewaste-stories-grid">
        {successStories.map((story, index) => (
          <div key={index} className="ewaste-story-card">
            <div className="ewaste-story-header">
              <Building className="ewaste-institution-icon" />
              <div>
                <h3>{story.institution}</h3>
                <span className="ewaste-institution-type">{story.type}</span>
              </div>
              <Star className="ewaste-achievement-star" />
            </div>
            <div className="ewaste-story-metrics">
              <div className="ewaste-metric">
                <TrendingUp className="ewaste-metric-icon" />
                <span>{story.impact}</span>
              </div>
              <div className="ewaste-metric">
                <Users className="ewaste-metric-icon" />
                <span>{story.students}</span>
              </div>
            </div>
            <div className="ewaste-achievement">
              <Award className="ewaste-award-icon" />
              <span>{story.achievement}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="ewaste-impact-visualization">
        <h3>Collective Impact Dashboard</h3>
        <div className="ewaste-impact-metrics">
          <div className="ewaste-impact-card">
            <div className="ewaste-impact-number">2,500,000</div>
            <div className="ewaste-impact-label">kg E-Waste Recycled</div>
            <div className="ewaste-impact-comparison">
              Equivalent to 500 cars removed from roads
            </div>
          </div>
          <div className="ewaste-impact-card">
            <div className="ewaste-impact-number">50,000</div>
            <div className="ewaste-impact-label">Students Educated</div>
            <div className="ewaste-impact-comparison">
              Creating tomorrow's environmental leaders
            </div>
          </div>
          <div className="ewaste-impact-card">
            <div className="ewaste-impact-number">500</div>
            <div className="ewaste-impact-label">Partner Institutions</div>
            <div className="ewaste-impact-comparison">
              Growing network of change-makers
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApplication = () => (
    <div className="ewaste-application-section">
      <div className="ewaste-application-header">
        <h2>Join Our Partnership Program</h2>
        {selectedProgram && (
          <div className="ewaste-selected-program-info">
            <h3>Selected: {selectedProgram.title}</h3>
            <p>{selectedProgram.description}</p>
          </div>
        )}
      </div>

      <div className="ewaste-application-steps">
        <div className="ewaste-steps-indicator">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`ewaste-step ${
                applicationStep >= step ? "ewaste-active" : ""
              }`}
            >
              <span className="ewaste-step-number">{step}</span>
              <span className="ewaste-step-label">
                {step === 1
                  ? "Institution Info"
                  : step === 2
                  ? "Goals & Objectives"
                  : "Resources & Timeline"}
              </span>
            </div>
          ))}
        </div>

        <div className="ewaste-application-form">
          {applicationStep === 1 && (
            <div className="ewaste-form-step">
              <h3>Institution Information</h3>
              <div className="ewaste-form-grid">
                <div className="ewaste-form-group">
                  <label>Institution Name</label>
                  <input
                    type="text"
                    value={institutionData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter institution name"
                  />
                </div>
                <div className="ewaste-form-group">
                  <label>Institution Type</label>
                  <select
                    value={institutionData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                  >
                    <option value="university">University</option>
                    <option value="college">College</option>
                    <option value="school">School</option>
                    <option value="research">Research Institute</option>
                  </select>
                </div>
                <div className="ewaste-form-group">
                  <label>Institution Size</label>
                  <select
                    value={institutionData.size}
                    onChange={(e) => handleInputChange("size", e.target.value)}
                  >
                    <option value="">Select size</option>
                    <option value="small">Small (0-1000 students)</option>
                    <option value="medium">Medium (1000-5000 students)</option>
                    <option value="large">Large (5000-15000 students)</option>
                    <option value="xlarge">
                      Extra Large (15000+ students)
                    </option>
                  </select>
                </div>
                <div className="ewaste-form-group">
                  <label>Contact Person</label>
                  <input
                    type="text"
                    value={institutionData.contactPerson}
                    onChange={(e) =>
                      handleInputChange("contactPerson", e.target.value)
                    }
                    placeholder="Full name"
                  />
                </div>
                <div className="ewaste-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={institutionData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="official@institution.edu"
                  />
                </div>
                <div className="ewaste-form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={institutionData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div className="ewaste-form-group ewaste-full-width">
                <label>Complete Address</label>
                <textarea
                  value={institutionData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter complete institutional address"
                  rows="3"
                />
              </div>
            </div>
          )}

          {applicationStep === 2 && (
            <div className="ewaste-form-step">
              <h3>Goals & Objectives</h3>
              <div className="ewaste-goals-selection">
                <p>
                  Select your primary objectives (multiple selection allowed):
                </p>
                <div className="ewaste-goals-grid">
                  {[
                    "Reduce campus e-waste by 80%+",
                    "Educate 1000+ students annually",
                    "Achieve zero e-waste campus status",
                    "Build student volunteer network",
                    "Conduct sustainability research",
                    "Create community outreach programs",
                    "Implement smart recycling solutions",
                    "Develop environmental curriculum",
                  ].map((goal) => (
                    <div
                      key={goal}
                      className={`ewaste-goal-option ${
                        institutionData.goals.includes(goal)
                          ? "ewaste-selected"
                          : ""
                      }`}
                      onClick={() => handleGoalToggle(goal)}
                    >
                      <CheckCircle className="ewaste-goal-check" />
                      <span>{goal}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ewaste-form-group">
                <label>Current E-Waste Volume (monthly estimate)</label>
                <select
                  value={institutionData.currentWasteVolume}
                  onChange={(e) =>
                    handleInputChange("currentWasteVolume", e.target.value)
                  }
                >
                  <option value="">Select volume</option>
                  <option value="0-50kg">0-50 kg</option>
                  <option value="50-200kg">50-200 kg</option>
                  <option value="200-500kg">200-500 kg</option>
                  <option value="500kg+">500 kg+</option>
                </select>
              </div>
            </div>
          )}

          {applicationStep === 3 && (
            <div className="ewaste-form-step">
              <h3>Resources & Timeline</h3>
              <div className="ewaste-resources-section">
                <h4>Available Resources</h4>
                <div className="ewaste-resource-checkboxes">
                  <label className="ewaste-checkbox-label">
                    <input type="checkbox" />
                    <span>Dedicated sustainability team</span>
                  </label>
                  <label className="ewaste-checkbox-label">
                    <input type="checkbox" />
                    <span>Budget allocation for green initiatives</span>
                  </label>
                  <label className="ewaste-checkbox-label">
                    <input type="checkbox" />
                    <span>Student volunteer programs</span>
                  </label>
                  <label className="ewaste-checkbox-label">
                    <input type="checkbox" />
                    <span>Physical space for collection points</span>
                  </label>
                </div>
              </div>

              <div className="ewaste-timeline-section">
                <h4>Preferred Implementation Timeline</h4>
                <div className="ewaste-timeline-options">
                  <label>
                    <input type="radio" name="timeline" value="immediate" />
                    <span>Immediate (within 1 month)</span>
                  </label>
                  <label>
                    <input type="radio" name="timeline" value="semester" />
                    <span>Next semester (2-3 months)</span>
                  </label>
                  <label>
                    <input type="radio" name="timeline" value="academic-year" />
                    <span>Next academic year (6-12 months)</span>
                  </label>
                </div>
              </div>

              <div className="ewaste-document-upload">
                <h4>Supporting Documents (Optional)</h4>
                <div className="ewaste-upload-area">
                  <Upload className="ewaste-upload-icon" />
                  <p>
                    Upload institutional profile, sustainability reports, or
                    other relevant documents
                  </p>
                  <button className="ewaste-upload-btn">Choose Files</button>
                </div>
              </div>
            </div>
          )}

          <div className="ewaste-form-navigation">
            {applicationStep > 1 && (
              <button
                className="ewaste-nav-btn ewaste-prev-btn"
                onClick={() => setApplicationStep(applicationStep - 1)}
              >
                Previous
              </button>
            )}
            {applicationStep < 3 ? (
              <button
                className="ewaste-nav-btn ewaste-next-btn"
                onClick={() => setApplicationStep(applicationStep + 1)}
              >
                Next Step
              </button>
            ) : (
              <button className="ewaste-submit-btn">Submit Application</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="ewaste-resources-section">
      <h2>Resources & Support</h2>
      <div className="ewaste-resources-grid">
        <div className="ewaste-resource-category">
          <h3>Implementation Guides</h3>
          <div className="ewaste-resource-list">
            <div className="ewaste-resource-item">
              <Download className="ewaste-resource-icon" />
              <div>
                <h4>Campus Setup Guide</h4>
                <p>Step-by-step guide for setting up collection points</p>
              </div>
            </div>
            <div className="ewaste-resource-item">
              <Download className="ewaste-resource-icon" />
              <div>
                <h4>Student Engagement Toolkit</h4>
                <p>Materials for awareness campaigns and events</p>
              </div>
            </div>
            <div className="ewaste-resource-item">
              <Download className="ewaste-resource-icon" />
              <div>
                <h4>Impact Measurement Framework</h4>
                <p>Tools to track and report your environmental impact</p>
              </div>
            </div>
          </div>
        </div>

        <div className="ewaste-resource-category">
          <h3>Training Materials</h3>
          <div className="ewaste-resource-list">
            <div className="ewaste-resource-item">
              <Download className="ewaste-resource-icon" />
              <div>
                <h4>Volunteer Training Manual</h4>
                <p>Comprehensive guide for training student volunteers</p>
              </div>
            </div>
            <div className="ewaste-resource-item">
              <Download className="ewaste-resource-icon" />
              <div>
                <h4>E-Waste Classification Guide</h4>
                <p>Visual guide for proper e-waste categorization</p>
              </div>
            </div>
            <div className="ewaste-resource-item">
              <Download className="ewaste-resource-icon" />
              <div>
                <h4>Safety Protocols</h4>
                <p>Essential safety guidelines for handling e-waste</p>
              </div>
            </div>
          </div>
        </div>

        <div className="ewaste-resource-category">
          <h3>Support Tools</h3>
          <div className="ewaste-resource-list">
            <div className="ewaste-resource-item">
              <MapPin className="ewaste-resource-icon" />
              <div>
                <h4>Recycling Center Locator</h4>
                <p>Find certified recycling centers near your institution</p>
              </div>
            </div>
            <div className="ewaste-resource-item">
              <Calendar className="ewaste-resource-icon" />
              <div>
                <h4>Event Planning Templates</h4>
                <p>Templates for organizing e-waste collection drives</p>
              </div>
            </div>
            <div className="ewaste-resource-item">
              <Award className="ewaste-resource-icon" />
              <div>
                <h4>Recognition Program</h4>
                <p>Certification and awards for outstanding performance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ewaste-support-contact">
        <h3>Need Personal Support?</h3>
        <p>
          Our institutional support team is here to help you every step of the
          way.
        </p>
        <div className="ewaste-contact-options">
          <button className="ewaste-contact-btn">Schedule Consultation</button>
          <button className="ewaste-contact-btn ewaste-secondary">
            Join Webinar
          </button>
          <button className="ewaste-contact-btn ewaste-secondary">
            FAQ Center
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ewaste-institutional-portal">
      <div className="ewaste-portal-navigation">
        <div className="ewaste-nav-tabs">
          <button
            className={`ewaste-nav-tab ${
              activeTab === "overview" ? "ewaste-active" : ""
            }`}
            onClick={() => setActiveTab("overview")}
          >
            <Building className="ewaste-tab-icon" />
            Overview
          </button>
          <button
            className={`ewaste-nav-tab ${
              activeTab === "success" ? "ewaste-active" : ""
            }`}
            onClick={() => setActiveTab("success")}
          >
            <Star className="ewaste-tab-icon" />
            Success Stories
          </button>
          <button
            className={`ewaste-nav-tab ${
              activeTab === "application" ? "ewaste-active" : ""
            }`}
            onClick={() => setActiveTab("application")}
          >
            <Users className="ewaste-tab-icon" />
            Apply Now
          </button>
          <button
            className={`ewaste-nav-tab ${
              activeTab === "resources" ? "ewaste-active" : ""
            }`}
            onClick={() => setActiveTab("resources")}
          >
            <Download className="ewaste-tab-icon" />
            Resources
          </button>
        </div>
      </div>

      <div className="ewaste-portal-content">
        {activeTab === "overview" && renderOverview()}
        {activeTab === "success" && renderSuccessStories()}
        {activeTab === "application" && renderApplication()}
        {activeTab === "resources" && renderResources()}
      </div>
    </div>
  );
};

export default InstitutionalPortal;
