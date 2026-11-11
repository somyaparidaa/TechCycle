import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";
import "../styles/InnerDash.css";
import {
  Monitor,
  Battery,
  Cpu,
  Calendar,
  User,
  Award,
  Newspaper,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function RecyclingDashboard() {
  const { currentUser } = useAuth();
  const displayName = currentUser?.displayName || "Anonymous";

  const [activeFilter, setActiveFilter] = useState("all");

  const recyclingData = [
    { month: "Jan", electronics: 4, metals: 3 },
    { month: "Feb", electronics: 3, metals: 4 },
    { month: "Mar", electronics: 5, metals: 2 },
  ];

  const timelineData = [
    {
      date: "2024-03-15",
      item: "Old Laptop",
      category: "Electronics",
      points: 50,
    },
    {
      date: "2024-03-10",
      item: "Copper Wires",
      category: "Metals",
      points: 30,
    },
  ];

  // Base news link
  const newsLink = "https://economictimes.indiatimes.com/topic/ewaste";

  // Expanded list of 20 e-waste news articles
  const allEwasteNews = [
    {
      headline: "New E-Waste Recycling Center Opens",
      date: "April 2, 2025",
      summary:
        "A state-of-the-art e-waste recycling facility has opened in the downtown area, making it easier for residents to dispose of electronics responsibly.",
      link: newsLink,
    },
    {
      headline: "Study Shows Rising E-Waste Concerns",
      date: "March 28, 2025",
      summary:
        "Recent research indicates that e-waste is growing at 3x the rate of regular municipal waste. Learn how you can help reduce the impact.",
      link: newsLink,
    },
    {
      headline: "Mobile Recycling Program This Weekend",
      date: "March 25, 2025",
      summary:
        "The mobile recycling unit will be at Central Park this Saturday from 9am-2pm. Bring your old devices and earn extra recycling points!",
      link: newsLink,
    },
    {
      headline: "Tech Companies Announce Recycling Initiative",
      date: "March 22, 2025",
      summary:
        "Major technology manufacturers have announced a joint initiative to increase the recyclability of their products by 30% over the next two years.",
      link: newsLink,
    },
    {
      headline: "E-Waste Regulations Tightened",
      date: "March 19, 2025",
      summary:
        "New regulations require manufacturers to take back end-of-life products and ensure proper recycling procedures are followed.",
      link: newsLink,
    },
    {
      headline: "Urban Mining: Gold from Old Devices",
      date: "March 15, 2025",
      summary:
        "A new process allows recyclers to extract precious metals from discarded electronics with 40% higher efficiency than previous methods.",
      link: newsLink,
    },
    {
      headline: "Schools Begin E-Waste Education Programs",
      date: "March 10, 2025",
      summary:
        "Local schools have integrated e-waste awareness into their curriculum to educate the next generation about responsible electronics disposal.",
      link: newsLink,
    },
    {
      headline: "Smartphone Recycling Rates Hit Record High",
      date: "March 7, 2025",
      summary:
        "Data shows smartphone recycling increased by 15% in the first quarter, attributed to improved collection programs and consumer awareness.",
      link: newsLink,
    },
    {
      headline: "E-Waste Art Exhibition Opens",
      date: "March 3, 2025",
      summary:
        "Artists have transformed electronic waste into stunning sculptures and installations, highlighting the growing problem while creating beauty from discards.",
      link: newsLink,
    },
    {
      headline: "Battery Recycling Breakthrough Announced",
      date: "February 27, 2025",
      summary:
        "Scientists have developed a new method for lithium-ion battery recycling that recovers 98% of critical materials while reducing processing costs.",
      link: newsLink,
    },
    {
      headline: "Community E-Waste Collection Drive Sets Records",
      date: "February 23, 2025",
      summary:
        "Last weekend's community collection event gathered over 5 tons of electronic waste, setting a new record for local recycling initiatives.",
      link: newsLink,
    },
    {
      headline: "Repair Cafés Gain Popularity",
      date: "February 18, 2025",
      summary:
        "The growing network of repair cafés helps extend device lifespans by teaching consumers how to fix their electronics rather than replace them.",
      link: newsLink,
    },
    {
      headline: "E-Waste in Landfills Reaches Concerning Levels",
      date: "February 15, 2025",
      summary:
        "Environmental monitoring shows increasing concentrations of heavy metals in soil near landfills due to improperly disposed electronics.",
      link: newsLink,
    },
    {
      headline: "City Launches E-Waste Pickup Service",
      date: "February 10, 2025",
      summary:
        "Residents can now schedule curbside pickup for electronic waste items through a new municipal service launching next month.",
      link: newsLink,
    },
    {
      headline: "Corporate E-Waste Programs Show Promise",
      date: "February 5, 2025",
      summary:
        "Major corporations implementing in-house recycling programs have reduced their e-waste footprint by an average of 27% in the past year.",
      link: newsLink,
    },
    {
      headline: "International E-Waste Conference Announced",
      date: "February 1, 2025",
      summary:
        "Experts from around the world will gather next month to discuss global solutions to the growing electronic waste crisis.",
      link: newsLink,
    },
    {
      headline: "Recycling App Helps Users Find Drop-off Locations",
      date: "January 27, 2025",
      summary:
        "A new smartphone app helps users locate the nearest e-waste recycling points and provides information on accepted items.",
      link: newsLink,
    },
    {
      headline: "E-Waste Processing Plant Upgrades Technology",
      date: "January 22, 2025",
      summary:
        "The regional recycling facility has implemented AI-driven sorting systems to improve processing efficiency by 35%.",
      link: newsLink,
    },
    {
      headline: "Health Risks of Improper E-Waste Handling Highlighted",
      date: "January 18, 2025",
      summary:
        "New research emphasizes the health hazards associated with informal e-waste processing, particularly exposure to toxic chemicals.",
      link: newsLink,
    },
    {
      headline: "Circular Economy Model Proposed for Electronics",
      date: "January 14, 2025",
      summary:
        "Industry leaders propose a comprehensive framework for transitioning to a circular economy model for consumer electronics.",
      link: newsLink,
    },
  ];

  // State to hold currently displayed news articles
  const [displayedNews, setDisplayedNews] = useState([]);
  // Number of news items to display at once
  const displayCount = 2;

  // Function to shuffle array using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Function to select random news articles
  const refreshNews = () => {
    setDisplayedNews(shuffleArray(allEwasteNews).slice(0, displayCount));
  };

  // Initialize news on component mount
  useEffect(() => {
    refreshNews();
  }, []);

  // Example data for carbon footprint pie chart
  const carbonData = [
    { name: "Electronics Usage", value: 300 },
    { name: "Travel", value: 250 },
    { name: "Home Energy", value: 150 },
    { name: "Other", value: 100 },
  ];
  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

  const filteredTimeline =
    activeFilter === "all"
      ? timelineData
      : timelineData.filter(
          (item) => item.category.toLowerCase() === activeFilter
        );

  const statsCards = [
    {
      icon: <Monitor className="stat-icon electronics-icon" />,
      title: "Electronics",
      value: "12 items",
      subtitle: "+2 this month",
    },
    {
      icon: <Battery className="stat-icon batteries-icon" />,
      title: "Batteries",
      value: "8 items",
      subtitle: "+1 this month",
    },
    {
      icon: <Cpu className="stat-icon components-icon" />,
      title: "Components",
      value: "15 items",
      subtitle: "+3 this month",
    },
    {
      icon: <Calendar className="stat-icon points-icon" />,
      title: "Total Points",
      value: "250",
      subtitle: "+45 this month",
    },
  ];

  // Extended achievements array with additional items.
  const achievements = [
    { name: "First Recycling", status: "completed" },
    { name: "10 Items Recycled", status: "completed" },
    { name: "Electronics Expert", status: "in-progress" },
    { name: "Master Recycler", status: "locked" },
    { name: "Green Champion", status: "completed" },
    { name: "Innovator in Recycling", status: "in-progress" },
  ];

  return (
    <div className="recycling-dashboard">
      <div className="main-content">
        <h1 className="dashboard-welcome">Welcome Back, {displayName}</h1>

        <div className="stats-grid">
          {statsCards.map((card, index) => (
            <div key={index} className="stat-card">
              {card.icon}
              <div className="stat-card-content">
                <div className="stat-card-title">{card.title}</div>
                <div className="stat-card-value">{card.value}</div>
                <div className="stat-card-subtitle">{card.subtitle}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="recycling-chart-container">
          <h2 className="section-titles">Recycling Statistics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={recyclingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="electronics" fill="#10B981" name="Electronics" />
              <Bar dataKey="metals" fill="#3B82F6" name="Metals" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="recent-activity-container">
          <div className="activity-header">
            <h2 className="section-titles">Recent Activity</h2>
            <div className="activity-filters">
              {["All", "Electronics", "Metals"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter.toLowerCase())}
                  className={`filter-button ${
                    activeFilter === filter.toLowerCase() ? "active" : ""
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="activity-timeline">
            {filteredTimeline.map((item, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-content">
                  <div className="timeline-date">{item.date}</div>
                  <div className="timeline-item-details">
                    <div className="timeline-item-name">{item.item}</div>
                    <div className="timeline-item-category">
                      {item.category}
                    </div>
                  </div>
                  <div className="timeline-points">+{item.points} pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="profile-sidebar">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <h2 className="profile-name">{displayName}</h2>
          <p className="profile-subtitle">Eco Warrior since 2023</p>
          <div className="profile-level-badge">Level 5 Recycler</div>
        </div>

        <div className="profile-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <div className="progress-text">Next Level: 25% to go</div>
        </div>

        <div className="profile-achievements">
          <div className="section-header">
            <Award />
            <h3>Achievements</h3>
          </div>
          <div className="achievements-list">
            {achievements.map((achievement, index) => (
              <div key={index} className="achievement-item">
                <span>{achievement.name}</span>
                <span className={`achievement-status ${achievement.status}`}>
                  {achievement.status === "completed"
                    ? "✓"
                    : achievement.status === "in-progress"
                    ? "In Progress"
                    : "Locked"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ewaste-news-container">
        <div className="news-title">
          <Newspaper size={20} />
          <span>E-Waste News & Updates</span>
          <button
            onClick={refreshNews}
            className="refresh-news-btn"
            aria-label="Refresh news"
            title="Show different news"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {displayedNews.map((news, index) => (
          <div key={index} className="news-item">
            <div className="news-headline">{news.headline}</div>
            <div className="news-date">{news.date}</div>
            <div className="news-summary">{news.summary}</div>
            <a
              href={news.link}
              className="news-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read more{" "}
              <ExternalLink size={14} style={{ verticalAlign: "middle" }} />
            </a>
          </div>
        ))}
      </div>

      {/* Unified Extra Content Block spanning full width */}
      <div className="extra-content-block">
        {/* Eco-Friendly Tips & Tricks */}
        <div className="tips-tricks-section">
          <h2>Eco-Friendly Tips & Tricks</h2>
          <ul>
            <li>
              Donate functioning electronics to local charities or schools.
            </li>
            <li>
              Opt for energy-efficient devices and unplug unused chargers.
            </li>
            <li>Buy refurbished gadgets to reduce manufacturing impact.</li>
            <li>Use cloud storage or external drives to extend device life.</li>
            <li>Research proper disposal methods for hazardous components.</li>
          </ul>
        </div>

        {/* Upcoming Challenges */}
        <div className="challenges-section">
          <h2>Upcoming Challenges</h2>
          <div className="challenge-item">
            <h3>Recycle 5 Batteries</h3>
            <p>Complete this challenge to earn +25 bonus points.</p>
          </div>
          <div className="challenge-item">
            <h3>Host a Neighborhood E-Waste Drive</h3>
            <p>
              Gather your neighbors to recycle old devices together. Earn a
              community badge!
            </p>
          </div>
          <div className="challenge-item">
            <h3>Repair Instead of Replace</h3>
            <p>Fix a broken gadget this month and earn an extra +50 points.</p>
          </div>
        </div>

        {/* Carbon Footprint */}
        <div className="carbon-footprint-section">
          <h2>Your Carbon Footprint</h2>
          <p>
            Estimate how electronics contribute to your overall carbon impact.
            Proper recycling and mindful usage can reduce this footprint!
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={carbonData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {carbonData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default RecyclingDashboard;
