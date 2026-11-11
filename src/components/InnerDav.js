import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Recycle,
  User,
  Map,
  Lightbulb,
  LogOut,
  Moon,
  Sun,
  Menu,
} from "lucide-react";
import { useAuth } from "../contexts/authContext";
import { doSignOut } from "../firebase/auth";
import "../styles/InnerDav.css";

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true"; // Keep dark mode state on reload
  });
  const [menuOpen, setMenuOpen] = useState(false);

  console.log(user);

  const handleLogout = async () => {
    try {
      await doSignOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  // Apply dark mode styles
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", darkMode); // Save preference
  }, [darkMode]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            <Recycle className="logo-icon" />
            <span className="logo-text">TechCycle</span>
          </Link>
        </div>

        {/* Right side icons - Grouped closer */}
        <div className="right-icons">
          {/* Dark Mode Toggle */}
          <button className="icon-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun /> : <Moon />}
          </button>

          {/* Logout Button */}
          <button className="icon-btn" onClick={handleLogout}>
            <LogOut />
          </button>

          {/* Dropdown Menu */}
          <div className="menu-container">
            <button onClick={() => setMenuOpen(!menuOpen)} className="icon-btn">
              <Menu />
            </button>

            {menuOpen && (
              <div className="dropdown-menu">
                <Link to="dashboard">Profile</Link>
                <Link to="info">Sell/Buy</Link>
                <Link to="map">Recycling Centers</Link>
                <Link to="awareness">Awareness</Link>
                <Link to="institution">Institutions</Link>
                <Link to="feedback">Feedback</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
