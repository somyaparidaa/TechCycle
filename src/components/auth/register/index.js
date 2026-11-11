import React, { useState, useEffect, useRef } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";
import { doCreateUserWithEmailAndPassword } from "../../../firebase/auth";
import { updateProfile } from "firebase/auth";
import "./register.css";

const Register = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  const registerCardRef = useRef(null);
  const circuitBoardRef = useRef(null);
  const ewasteElementsRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCardActive, setIsCardActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCardActive(true);
    }, 100);

    drawCircuitBoard();
    createEwasteElements();

    return () => clearTimeout(timer);
  }, []);

  const drawCircuitBoard = () => {
    if (!circuitBoardRef.current) return;
    let paths = "";
    const numLines = 50;

    for (let i = 0; i < numLines; i++) {
      const x1 = Math.random() * 100;
      const y1 = Math.random() * 100;
      const x2 = x1 + (Math.random() * 20 - 10);
      const y2 = y1 + (Math.random() * 20 - 10);

      paths += `<path d="M${x1}% ${y1}% L${x2}% ${y2}%" stroke="#4ecca3" stroke-width="0.5" />`;

      if (Math.random() > 0.7) {
        paths += `<circle cx="${x1}%" cy="${y1}%" r="1" fill="#4ecca3" />`;
      }
    }

    circuitBoardRef.current.innerHTML = paths;
  };

  const createEwasteElements = () => {
    if (!ewasteElementsRef.current) return;
    const elements = [
      '<svg width="60" height="60" viewBox="0 0 24 24" fill="#4ecca3" opacity="0.6" xmlns="http://www.w3.org/2000/svg"><path d="M20 18C21.1 18 22 17.1 22 16V6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V16C2 17.1 2.9 18 4 18H0V20H24V18H20ZM4 6H20V16H4V6Z"/></svg>',
      '<svg width="50" height="50" viewBox="0 0 24 24" fill="#4ecca3" opacity="0.6" xmlns="http://www.w3.org/2000/svg"><path d="M17 1.01L7 1C5.9 1 5 1.9 5 3V21C5 22.1 5.9 23 7 23H17C18.1 23 19 22.1 19 21V3C19 1.9 18.1 1.01 17 1.01ZM17 19H7V5H17V19ZM12 18C12.83 18 13.5 17.33 13.5 16.5C13.5 15.67 12.83 15 12 15C11.17 15 10.5 15.67 10.5 16.5C10.5 17.33 11.17 18 12 18Z"/></svg>',
      '<svg width="70" height="70" viewBox="0 0 24 24" fill="#4ecca3" opacity="0.6" xmlns="http://www.w3.org/2000/svg"><path d="M7 5H9V9H7V5ZM15 5H17V9H15V5ZM7 11H9V15H7V11ZM15 11H17V15H15V11ZM5 5V15H3V5H5ZM21 5V15H19V5H21ZM5 19H19V21H5V19ZM19 3H5C3.9 3 3 3.9 3 5V15C3 16.1 3.9 17 5 17H19C20.1 17 21 16.1 21 15V5C21 3.9 20.1 3 19 3Z"/></svg>',
      '<svg width="40" height="40" viewBox="0 0 24 24" fill="#4ecca3" opacity="0.6" xmlns="http://www.w3.org/2000/svg"><path d="M15.67 4H14V2H10V4H8.33C7.6 4 7 4.6 7 5.33V20.66C7 21.4 7.6 22 8.33 22H15.66C16.4 22 17 21.4 17 20.67V5.33C17 4.6 16.4 4 15.67 4ZM13 18H11V16H13V18ZM13 14H11V8H13V14Z"/></svg>',
      '<svg width="55" height="55" viewBox="0 0 24 24" fill="#4ecca3" opacity="0.6" xmlns="http://www.w3.org/2000/svg"><path d="M12 7V12L15 15" fill="none" stroke="#0a1a17" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="9" stroke="#0a1a17" stroke-width="2" fill="none"/></svg>',
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

      ewasteElementsRef.current.appendChild(element);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isRegistering) {
      if (password !== confirmPassword) {
        setErrorMessage("Passwords don't match");
        registerCardRef.current.classList.add("shake");
        setTimeout(() => {
          registerCardRef.current.classList.remove("shake");
        }, 500);
        return;
      }

      setIsRegistering(true);
      try {
        const userCredential = await doCreateUserWithEmailAndPassword(
          email,
          password
        );
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        navigate("/profile");
      } catch (error) {
        setErrorMessage("Registration failed. Please try again.");
        setIsRegistering(false);
        registerCardRef.current.classList.add("shake");
        setTimeout(() => {
          registerCardRef.current.classList.remove("shake");
        }, 500);
      }
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const emailInput = e.target;
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (value && isValidEmail) {
      emailInput.classList.add("valid");
      emailInput.classList.remove("invalid");
    } else if (value) {
      emailInput.classList.add("invalid");
      emailInput.classList.remove("valid");
    } else {
      emailInput.classList.remove("valid", "invalid");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    const passwordInput = e.target;
    const isStrongPassword = value.length >= 8;

    if (value && isStrongPassword) {
      passwordInput.classList.add("valid");
      passwordInput.classList.remove("invalid");
    } else if (value) {
      passwordInput.classList.add("invalid");
      passwordInput.classList.remove("valid");
    } else {
      passwordInput.classList.remove("valid", "invalid");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    const confirmInput = e.target;
    const isMatching = value === password;

    if (value && isMatching) {
      confirmInput.classList.add("valid");
      confirmInput.classList.remove("invalid");
    } else if (value) {
      confirmInput.classList.add("invalid");
      confirmInput.classList.remove("valid");
    } else {
      confirmInput.classList.remove("valid", "invalid");
    }
  };

  if (userLoggedIn) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="register-container">
      <svg
        ref={circuitBoardRef}
        className="circuit-board"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      ></svg>

      <div ref={ewasteElementsRef} className="ewaste-elements"></div>

      <main
        ref={registerCardRef}
        className={`register-card ${isCardActive ? "active" : ""}`}
      >
        <div className="register-header">
          <h3>Create a New Account</h3>
        </div>
        <form onSubmit={onSubmit} className="register-form">
          <div className="forms-group">
            <label>Full Name</label>
            <input
              type="text"
              autoComplete="name"
              required
              placeholder="Enter your full name"
              value={name}
              onChange={handleNameChange}
            />
          </div>

          <div className="forms-group">
            <label>Email</label>
            <input
              type="email"
              autoComplete="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
            />
          </div>

          <div className="forms-group">
            <label>Password</label>
            <input
              type="password"
              autoComplete="new-password"
              required
              placeholder="Create a password"
              value={password}
              onChange={handlePasswordChange}
              disabled={isRegistering}
            />
          </div>

          <div className="forms-group">
            <label>Confirm Password</label>
            <input
              type="password"
              autoComplete="off"
              required
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              disabled={isRegistering}
            />
          </div>

          {errorMessage && (
            <span className="error-message">{errorMessage}</span>
          )}

          <button
            type="submit"
            disabled={isRegistering}
            className="register-button"
          >
            {isRegistering ? "Signing Up..." : "Sign Up"}
          </button>

          <div className="register-footer">
            Already have an account?{" "}
            <Link to="/login" className="footer-links">
              Sign In
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Register;