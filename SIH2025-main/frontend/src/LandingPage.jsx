import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Navbar - Styled to match the Nexus design */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo-box">
            <span className="logo-icon">N</span>
            <span className="logo-text">Nexus</span>
          </div>
        </div>
        <div className="navbar-right">
          <button 
            className="register-btn"
            onClick={() => navigate("/studentRegister")}
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section - Matching the reference image */}
      <section className="hero-section">
        <h1 className="hero-title">
          Learn <span className="highlight">Smarter</span> with{" "}
          <span className="app-name">TestApp</span>
        </h1>
        <p className="hero-subtitle">
          A little practice each day keeps the confusion away.
        </p>

        <div className="hero-buttons">
          <button 
            className="primary-btn" 
            onClick={() => navigate("/studentLogin")}
          >
            Students
          </button>
          <button 
            className="secondary-btn" 
            onClick={() => navigate("/teacherLogin")}
          >
            Teachers
          </button>
        </div>
      </section>

      {/* Features Section - Re-designed to match the reference */}
      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon feature-icon-study">🚀</div>
          <h3>Study</h3>
        </div>
        <div className="feature-card">
          <div className="feature-icon feature-icon-easy">🦉</div>
          <h3>Easy to Use</h3>
        </div>
        <div className="feature-card">
          <div className="feature-icon feature-icon-fun">🖍</div>
          <h3>Fun for Students</h3>
        </div>
      </section>
    </div>
  );
}
