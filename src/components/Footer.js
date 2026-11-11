import React, { useState, useRef, useEffect } from "react";
import "../styles/Footer.css";
import { gsap } from "gsap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { Diamond, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Ref to the parent container of FAQ items (optional, for clarity)
  const faqListRef = useRef(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I recycle my old electronics?",
      answer:
        "You can either drop off your old electronics at our nearest collection center or schedule a free pickup through our website.",
    },
    {
      question: "What electronics do you accept?",
      answer:
        "We accept all types of electronics including computers, laptops, smartphones, tablets, TVs, printers, and small household appliances.",
    },
    {
      question: "Is there a fee for recycling?",
      answer:
        "Most standard electronics can be recycled for free. However, certain items like CRT monitors or TVs may incur a small fee due to special handling requirements.",
    },
    {
      question: "How is my data protected when recycling devices?",
      answer:
        "We follow a strict data destruction protocol for all devices. Hard drives are either securely wiped using industry-standard methods or physically destroyed based on your preference.",
    },
    {
      question: "Do you offer business recycling services?",
      answer:
        "Yes, we offer specialized services for businesses including bulk pickups, asset management, and certificates of recycling/destruction for compliance purposes.",
    },
  ];

  // === GSAP Pendulum Animation ===
  // useEffect(() => {
  //   if (!faqListRef.current) return;

  //   // Select all the FAQ items
  //   const items = faqListRef.current.querySelectorAll(".faq-item");

  //   items.forEach((item, index) => {
  //     // Determine direction: even indices start from the left, odd from the right
  //     const startX = index % 2 === 0 ? -50 : 50;

  //     gsap.fromTo(
  //       item,
  //       { x: startX }, // Starting position
  //       {
  //         x: 0, // Move to center (x=0)
  //         duration: 1.5, // Adjust duration to control speed
  //         ease: "power1.inOut",
  //         repeat: -1, // Infinite loop
  //         yoyo: true, // Pendulum effect (back and forth)
  //         stagger: 0.2, // Optional: small delay between items
  //       }
  //     );
  //   });
  // }, []);

  return (
    <section id="footer">
      <div className="full-width-container">
        {/* FAQ Section */}
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list" ref={faqListRef}>
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <div
                  className={`faq-question ${
                    expandedFaq === index ? "expanded" : ""
                  }`}
                  onClick={() => toggleFaq(index)}
                >
                  {faq.question}
                  <span className="toggle-icon">
                    {expandedFaq === index ? "−" : "+"}
                  </span>
                </div>
                {expandedFaq === index && (
                  <div className="faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <footer className="footer">
      <div className="footer-container">
        <div className="grid-container">
          <div className="footer-section">
            <div className="brand">
              {/* <Diamond className="brand-icon" /> */}
              <div className="brand-name">
                TechCycle
              </div>
            </div>
            <p className="footer-text">
              Recycle,reborn,Relive!
            </p>
          </div>
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-list">
              <li><a href="#home" className="footer-link">Home</a></li>
              <li><a href="#about" className="footer-link">About ss</a></li>
              <li><a href="#features" className="footer-link">Contact us</a></li>
              <li><a href="#testimonials" className="footer-link">FAQs</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3 className="footer-title">CONTACT US</h3>
            <ul className="footer-list">
              <li className="footer-item">
                <Mail className="footer-icon" />
                <span className="footer-text">techcycle@ac.in</span>
              </li>
              <li className="footer-item">
                <Phone className="footer-icon" />
                <span className="footer-text">+91 637006XXXX</span>
              </li>
              <li className="footer-item">
                <MapPin className="footer-icon" />
                <span className="footer-text">National Institute of Technology, Rourkela</span>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3 className="footer-title">Legal</h3>
            <ul className="footer-list">
              <li><a href="#" className="footer-link">Privacy Policy</a></li>
              <li><a href="#" className="footer-link">Terms of Service</a></li>
              <li><a href="#" className="footer-link">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-text">© 2025 TechCycle. All rights reserved.</p>
      </div>
    </footer>
      </div>
    </section>
  );
};

export default Footer;