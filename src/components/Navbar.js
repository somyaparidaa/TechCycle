// Navbar.js
import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "../styles/Navbar.css";
import { Recycle } from "lucide-react";

const Header = () => {
  return (
    <header className="nav">
      <div className="logo" id="logo">
        
      <Recycle className="logo-icon" />
        TechCycle
      </div>
      <nav>
        <a href="#homepage" className="nav-linker">
          Home
        </a>
        <a href="#mission" className="nav-linker">
          About us
        </a>
        <a href="#last" className="nav-linker">
          Contact us
        </a>
        <a href="#footer" className="nav-linker">
          FAQs
        </a>
      </nav>
      <Link to="/login" className="login-btn" id="loginBtn">
        Login
      </Link>
    </header>
  );
};

export default Header;