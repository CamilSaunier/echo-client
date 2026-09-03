// src/components/Footer/Footer.tsx
import React from "react";
import "./Footer.css";

/**
 * Main application footer component.
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <p className="footer-text">Echo Project &copy; {currentYear} — Secure Full-Stack Architecture.</p>
        <div className="footer-links">
          <span className="footer-status">
            <span className="status-dot"></span> Système opérationnel
          </span>
        </div>
      </div>
    </footer>
  );
};
