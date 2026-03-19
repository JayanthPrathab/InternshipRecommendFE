import React from "react";
import "./styles/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <header className="hero-section">
        <h1>Find Your Perfect Internship 🚀</h1>
        <p>
          The smart way to bridge the gap between education and your first professional steps. 
          Upload your skills, get AI-powered recommendations, and apply in seconds.
        </p>
        <div className="feature-badges">
          <span>✔ AI Recommendations</span>
          <span>✔ Direct Applications</span>
          <span>✔ Admin Dashboard</span>
        </div>
      </header>
    </div>
  );
};

export default Home;