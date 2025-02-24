import React from "react";
import { Link } from "react-router-dom";
import "../style.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/assessment" className="nav-link">
            Take Assessment
          </Link>
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
          <button className="login-button">
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;