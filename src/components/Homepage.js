import React, { useEffect, useRef } from "react";
import Typed from "typed.js";
import "../styles/Homepage.css";
import { Link } from "react-router";
const Hero = () => {
  const typedTextRef = useRef(null);

  useEffect(() => {
    if (typedTextRef.current) {
      const typed = new Typed(typedTextRef.current, {
        strings: ["Give your old Tech a <br> New Life today!"],
        typeSpeed: 50,
        showCursor: true,
        cursorChar: "|",
        startDelay: 300,
        loop: false,
        html: true,
      });

      // Destroy Typed instance on unmount
      return () => {
        typed.destroy();
      };
    }
  }, []);

  return (
    <section id="homepage">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            <span ref={typedTextRef}></span>
          </h1>
          <Link to="/login" className="hero-button" >
        Get Started
      </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
