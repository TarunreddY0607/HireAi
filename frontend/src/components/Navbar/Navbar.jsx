import "./Navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { FiArrowRight } from "react-icons/fi";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const close = () => setMenuOpen(false);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    close();

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          const yOffset = -70;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -70;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        
        {/* ── Brand Logo ────────────────────────── */}
        <a href="#home" onClick={(e) => scrollToSection(e, "home")} className="navbar-brand">
          <div className="brand-badge-icon">
            <HiSparkles className="brand-sparkle-icon" />
          </div>
          <span className="brand-logo-text">
            Hire<span className="brand-logo-gradient">AI</span>
          </span>
          <span className="brand-version-pill">PLATFORM</span>
        </a>

        {/* ── Nav Links ─────────────────────────── */}
        <ul className={`nav-links${menuOpen ? " active" : ""}`}>
          <li>
            <a href="#home" onClick={(e) => scrollToSection(e, "home")}>
              Home
            </a>
          </li>
          <li>
            <a href="#features" onClick={(e) => scrollToSection(e, "features")}>
              Features
            </a>
          </li>
          <li>
            <a href="#about" onClick={(e) => scrollToSection(e, "about")}>
              About
            </a>
          </li>
          <li>
            <a href="#contact" onClick={(e) => scrollToSection(e, "contact")}>
              Contact
            </a>
          </li>
        </ul>

        {/* ── Buttons ───────────────────────────── */}
        <div className="nav-buttons">
          <Link to="/login" className="nav-btn-link" onClick={close}>
            <button className="nav-login-btn">Sign In</button>
          </Link>
          <Link to="/register" className="nav-btn-link" onClick={close}>
            <button className="nav-register-btn">
              <span>Get Started</span>
              <FiArrowRight className="btn-arrow" />
            </button>
          </Link>
        </div>

        {/* ── Mobile toggle ─────────────────────── */}
        <button
          className="menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

      </div>
    </header>
  );
}

export default Navbar;