import React, { useEffect } from "react";
import "../styles/techCycle.css"; // Ensure this path is correct

const TechCycleLogin = () => {
  useEffect(() => {
    drawCircuitBoard();
    createEwasteElements();
    animateCounters();
  }, []);

  // Circuit board background animation
  const drawCircuitBoard = () => {
    const circuitBoard = document.getElementById("circuitBoard");
    let paths = "";
    const numLines = 50;

    for (let i = 0; i < numLines; i++) {
      const x1 = Math.random() * 100;
      const y1 = Math.random() * 100;
      const x2 = x1 + (Math.random() * 20 - 10);
      const y2 = y1 + (Math.random() * 20 - 10);

      paths += `<path d="M${x1}% ${y1}% L${x2}% ${y2}%" stroke="#4ecca3" stroke-width="0.5" />`;

      // Add some circuit nodes
      if (Math.random() > 0.7) {
        paths += `<circle cx="${x1}%" cy="${y1}%" r="1" fill="#4ecca3" />`;
      }
    }

    if (circuitBoard) {
      circuitBoard.innerHTML = paths;
    }
  };

  // Create e-waste floating elements
  const createEwasteElements = () => {
    const ewasteElements = document.getElementById("ewasteElements");
    if (!ewasteElements) return;

    const elements = [
      // Computer icon
      '<svg width="60" height="60" viewBox="0 0 24 24" fill="#4ecca3" opacity="0.6" xmlns="http://www.w3.org/2000/svg"><path d="M20 18C21.1 18 22 17.1 22 16V6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V16C2 17.1 2.9 18 4 18H0V20H24V18H20ZM4 6H20V16H4V6Z"/></svg>',
      // Phone icon
      '<svg width="50" height="50" viewBox="0 0 24 24" fill="#4ecca3" opacity="0.6" xmlns="http://www.w3.org/2000/svg"><path d="M17 1.01L7 1C5.9 1 5 1.9 5 3V21C5 22.1 5.9 23 7 23H17C18.1 23 19 22.1 19 21V3C19 1.9 18.1 1.01 17 1.01ZM17 19H7V5H17V19ZM12 18C12.83 18 13.5 17.33 13.5 16.5C13.5 15.67 12.83 15 12 15C11.17 15 10.5 15.67 10.5 16.5C10.5 17.33 11.17 18 12 18Z"/></svg>',
      // Circuit board icon
      '<svg width="70" height="70" viewBox="0 0 24 24" fill="#4ecca3" opacity="0.6" xmlns="http://www.w3.org/2000/svg"><path d="M7 5H9V9H7V5ZM15 5H17V9H15V5ZM7 11H9V15H7V11ZM15 11H17V15H15V11ZM5 5V15H3V5H5ZM21 5V15H19V5H21ZM5 19H19V21H5V19ZM19 3H5C3.9 3 3 3.9 3 5V15C3 16.1 3.9 17 5 17H19C20.1 17 21 16.1 21 15V5C21 3.9 20.1 3 19 3Z"/></svg>',
    ];

    for (let i = 0; i < 15; i++) {
      const element = document.createElement("div");
      element.className = "ewaste-item";
      element.innerHTML = elements[Math.floor(Math.random() * elements.length)];
      element.style.left = `${Math.random() * 100}%`;
      element.style.top = `${Math.random() * 100}%`;
      element.style.animationDelay = `${Math.random() * 5}s`;
      element.style.animationDuration = `${15 + Math.random() * 15}s`;
      element.style.transform = `scale(${0.5 + Math.random() * 0.5}) rotate(${
        Math.random() * 360
      }deg)`;

      ewasteElements.appendChild(element);
    }
  };

  // Animate counters
  const animateCounters = () => {
    let devicesCount = 0;
    let wasteCount = 0;
    const targetDevices = 53824;
    const targetWaste = 278;
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const devicesIncrement = targetDevices / steps;
    const wasteIncrement = targetWaste / steps;

    const counter = setInterval(() => {
      devicesCount += devicesIncrement;
      wasteCount += wasteIncrement;

      if (devicesCount >= targetDevices) {
        devicesCount = targetDevices;
        wasteCount = targetWaste;
        clearInterval(counter);
      }

      const devicesEl = document.getElementById("devicesCounter");
      const wasteEl = document.getElementById("wasteCounter");
      if (devicesEl) {
        devicesEl.textContent = Math.floor(devicesCount).toLocaleString();
      }
      if (wasteEl) {
        wasteEl.textContent = Math.floor(wasteCount).toLocaleString();
      }
    }, interval);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const overlay = document.getElementById("overlay");
    const loader = document.getElementById("loader");
    if (overlay) overlay.style.display = "block";
    if (loader) loader.style.display = "block";

    setTimeout(() => {
      if (overlay) overlay.style.display = "none";
      if (loader) loader.style.display = "none";
      alert("Login successful!");
    }, 2000);
  };

  return (
    <div className="techcycle-container">
      {/* Circuit board background */}
      <svg
        className="circuit-board"
        id="circuitBoard"
        width="100%"
        height="100%"
      ></svg>

      {/* E-waste floating elements */}
      <div className="ewaste-elements" id="ewasteElements"></div>

      {/* Loading animation */}
      <div className="overlay" id="overlay"></div>
      <div className="loader" id="loader">
        <div className="loader-circle"></div>
      </div>

      <div className="container">
        <div className="info-wrapper">
          <div className="logo">
            <div className="logo-icon">
              <span>♻</span>
            </div>
            <span>TechCycle</span>
          </div>

          <h1>
            Turn E-Waste Into
            <br />A Sustainable Future
          </h1>
          <p>
            Join thousands of environmentally conscious users who are helping to
            reduce electronic waste through proper recycling and upcycling
            initiatives.
          </p>

          <div className="stat-box">
            <div className="icon">📱</div>
            <div>
              <div className="stat-number" id="devicesCounter">
                0
              </div>
              <div className="stat-text">Devices Recycled</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="icon">🔋</div>
            <div>
              <div className="stat-number" id="wasteCounter">
                0
              </div>
              <div className="stat-text">Tons of E-Waste Diverted</div>
            </div>
          </div>
        </div>

        <div className="login-wrapper">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your TechCycle account</p>
          </div>

          <form id="loginForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="remember-forgot">
              <div className="checkbox-wrapper">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="#">Forgot Password?</a>
            </div>

            <button type="submit" className="login-btn">
              Sign In
            </button>

            <div className="register-link">
              Don&apos;t have an account? <a href="#">Register</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TechCycleLogin;
