import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login"; // Import your Login component
import "./styles/Navbar.css";

const Navbar = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("user_id"));
  const navigate = useNavigate();

const handleLogout = () => {
  localStorage.clear();
  setIsLoggedIn(false); // Update state!
  setShowLoginModal(false); // Close modal if open
  navigate("/"); // This forces the browser to go back to Home.jsx
};

  return (
    <>
      <nav className="navbar">
        <div className="nav-logo">InternMatch 🚀</div>
        <div className="nav-links">
          {!isLoggedIn ? (
            <button className="login-nav-btn" onClick={() => setShowLoginModal(true)}>
              Login / Sign Up
            </button>
          ) : (
            <button onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Show the Login component as a modal if the button is clicked */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowLoginModal(false)}>×</button>
            <Login closeModal={() => {setShowLoginModal(false);setIsLoggedIn(true);}} />
          </div>
        </div>
      )}
    </>
  );

};
export default Navbar;