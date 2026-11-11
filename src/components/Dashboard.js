import React, { useState } from 'react';
import "../styles/Dashboard.css"
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  Recycle, 
  ServerCog, 
  TreePine, 
  Zap, 
  Table, 
  LayoutGrid, 
  BarChart3, 
  Award,
  PieChart as PieChartIcon,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data
  const stats = {
    totalCollected: 4827,
    deviceTypes: [
      { name: 'Smartphones', value: 1236, percentage: 26, color: '#2CA577' },
      { name: 'Peripherals', value: 1369, percentage: 28, color: '#3498db' },
      { name: 'Laptops', value: 896, percentage: 19, color: '#9b59b6' },
      { name: 'Computers', value: 742, percentage: 15, color: '#e67e22' },
      { name: 'Tablets', value: 584, percentage: 12, color: '#f1c40f' }
    ],
    materialsSaved: {
      plastic: 6342,
      metals: 4521,
      rareEarth: 328,
      glass: 1897
    },
    monthlyCollection: [
      { month: 'Jan', amount: 342 },
      { month: 'Feb', amount: 386 },
      { month: 'Mar', amount: 412 },
      { month: 'Apr', amount: 387 },
      { month: 'May', amount: 452 },
      { month: 'Jun', amount: 518 },
      { month: 'Jul', amount: 489 },
      { month: 'Aug', amount: 534 },
      { month: 'Sep', amount: 461 },
      { month: 'Oct', amount: 427 },
      { month: 'Nov', amount: 419 },
      { month: 'Dec', amount: 0 }
    ],
    environmentalImpact: {
      co2Reduced: 78.4,
      waterSaved: 1243,
      energySaved: 36712
    },
    // Additional data for detailed view
    detailedData: {
      collectionByLocation: [
        { location: 'North Region', amount: 1267 },
        { location: 'East Region', amount: 1046 },
        { location: 'South Region', amount: 1389 },
        { location: 'West Region', amount: 1125 }
      ],
      materialTrends: [
        { month: 'Jan', plastic: 520, metals: 380, glass: 150, rareEarth: 32 },
        { month: 'Feb', plastic: 540, metals: 390, glass: 155, rareEarth: 28 },
        { month: 'Mar', plastic: 570, metals: 410, glass: 162, rareEarth: 31 },
        { month: 'Apr', plastic: 550, metals: 400, glass: 158, rareEarth: 29 },
        { month: 'May', plastic: 590, metals: 420, glass: 170, rareEarth: 33 },
        { month: 'Jun', plastic: 620, metals: 440, glass: 180, rareEarth: 35 }
      ],
      quarterlyBreakdown: [
        { quarter: 'Q1', smartphones: 310, peripherals: 342, laptops: 224, computers: 186, tablets: 146 },
        { quarter: 'Q2', smartphones: 412, peripherals: 456, laptops: 299, computers: 247, tablets: 195 },
        { quarter: 'Q3', smartphones: 514, peripherals: 571, laptops: 373, computers: 309, tablets: 243 }
      ]
    }
  };

  // Overview tab content
  const OverviewContent = () => (
    <>
      {/* Key Metrics Container */}
      <section className="metrics-section">
        <div className="metrics-container">
          {/* Devices Metric */}
          <div className="container-box metric-box">
            <div className="metric-content">
              <ServerCog className="metric-icon icon-green" />
              <div className="metric-details">
                <p className="metric-label">Total Devices</p>
                <p className="metric-value">{stats.totalCollected}</p>
              </div>
            </div>
          </div>

          {/* CO2 Metric */}
          <div className="container-box metric-box">
            <div className="metric-content">
              <TreePine className="metric-icon icon-blue" />
              <div className="metric-details">
                <p className="metric-label">CO₂ Prevented</p>
                <p className="metric-value">{stats.environmentalImpact.co2Reduced} tons</p>
              </div>
            </div>
          </div>

          {/* Materials Metric */}
          <div className="container-box metric-box">
            <div className="metric-content">
              <Table className="metric-icon icon-purple" />
              <div className="metric-details">
                <p className="metric-label">Materials Recovered</p>
                <p className="metric-value">
                  {Object.values(stats.materialsSaved).reduce((a, b) => a + b, 0)} kg
                </p>
              </div>
            </div>
          </div>

          {/* Energy Metric */}
          <div className="container-box metric-box">
            <div className="metric-content">
              <Zap className="metric-icon icon-yellow" />
              <div className="metric-details">
                <p className="metric-label">Energy Saved</p>
                <p className="metric-value">{stats.environmentalImpact.energySaved} kWh</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="charts-section">
        <div className="charts-container">
          {/* Device Types Distribution Chart */}
          <div className="container-box chart-box">
            <div className="chart-header">
              <h2 className="chart-title">
                <LayoutGrid className="chart-icon icon-green" />
                Device Types Distribution
              </h2>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.deviceTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.deviceTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Collection Trend Chart */}
          <div className="container-box chart-box">
            <div className="chart-header">
              <h2 className="chart-title">
                <BarChart3 className="chart-icon icon-blue" />
                Monthly Collection Trend
              </h2>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyCollection}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#2CA577" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  // Detailed tab content
  const DetailedContent = () => (
    <>
      {/* Detailed Metrics Section */}
      <section className="metrics-section">
        <div className="metrics-container">
          {/* Regional Collection Breakdown */}
          <div className="container-box metric-box detailed-metric">
            <div className="metric-header">
              <MapPin className="metric-icon icon-green" />
              <h3 className="detailed-title">Collection by Region</h3>
            </div>
            <div className="metric-body">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.detailedData.collectionByLocation}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    label={({ location, percent }) => `${location}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {stats.detailedData.collectionByLocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#2CA577', '#3498db', '#9b59b6', '#e67e22'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quarterly Breakdown */}
          <div className="container-box metric-box detailed-metric">
            <div className="metric-header">
              <Calendar className="metric-icon icon-blue" />
              <h3 className="detailed-title">Quarterly Performance</h3>
            </div>
            <div className="metric-body">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.detailedData.quarterlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="smartphones" stackId="a" fill="#2CA577" />
                  <Bar dataKey="peripherals" stackId="a" fill="#3498db" />
                  <Bar dataKey="laptops" stackId="a" fill="#9b59b6" />
                  <Bar dataKey="computers" stackId="a" fill="#e67e22" />
                  <Bar dataKey="tablets" stackId="a" fill="#f1c40f" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Charts Section */}
      <section className="charts-section">
        <div className="charts-container">
          {/* Material Trends Chart */}
          <div className="container-box chart-box">
            <div className="chart-header">
              <h2 className="chart-title">
                <TrendingUp className="chart-icon icon-purple" />
                Material Recovery Trends
              </h2>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.detailedData.materialTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="plastic" stackId="1" stroke="#16a34a" fill="#16a34a" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="metals" stackId="1" stroke="#3498db" fill="#3498db" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="glass" stackId="1" stroke="#9b59b6" fill="#9b59b6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="rareEarth" stackId="1" stroke="#e67e22" fill="#e67e22" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Collection Growth Chart */}
          <div className="container-box chart-box">
            <div className="chart-header">
              <h2 className="chart-title">
                <PieChartIcon className="chart-icon icon-yellow" />
                Collection Growth Analysis
              </h2>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.monthlyCollection}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#16a34a" activeDot={{ r: 8 }} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  return (
    <div className="dashboard-container">
      {/* Main wrapper with consistent padding and background */}
      <div className="dashboard-wrapper">
        {/* Header Container */}
        <header className="container-box header-container">
          <div className="header-content">
            <div className="header-logo">
              <Recycle className="header-icon" />
              <h1 className="header-title">TechCycle Dashboard</h1>
            </div>
            <nav className="header-nav">
              <button 
                className={`nav-button ${activeTab === 'overview' ? 'nav-button-active' : 'nav-button-inactive'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`nav-button ${activeTab === 'detailed' ? 'nav-button-active' : 'nav-button-inactive'}`}
                onClick={() => setActiveTab('detailed')}
              >
                Detailed View
              </button>
            </nav>
          </div>
        </header>

        {/* Render the active tab content */}
        {activeTab === 'overview' ? <OverviewContent /> : <DetailedContent />}

        {/* Footer Call to Action Container - Always visible on both tabs */}
        <section className="footer-section">
          <div className="container-box cta-container">
            {/* <Award className="cta-icon" /> */}
            {/* <h2 className="cta-title">Your Impact Matters</h2>
            <p className="cta-text">
              By responsibly recycling your electronic devices, you're helping reduce environmental waste, 
              conserve valuable resources, and create a more sustainable future for our planet.
            </p> */}
            {/* <Link to="/login" className="cta-button">Continue Recycling</Link> */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;