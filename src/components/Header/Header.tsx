// src/components/Header/Header.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.stores";
import "./Header.css";

/**
 * Main application header component featuring navigation, theme switcher toggle, and logout.
 */
export const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  // État local pour gérer le thème (light / dark)
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains("dark") || window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Logo / Titre de l'application */}
        <Link to="/" className="header-logo">
          Echo<span>.</span>
        </Link>

        {/* Actions de droite : Toggle de thème et Déconnexion conditionnelle */}
        <div className="header-actions">
          {/* Toggle Switch inspiré d'AuthPage */}
          <div className="header-theme-switcher">
            <span className="theme-label">Clair</span>
            <button
              type="button"
              className={`toggle-switch ${isDark ? "active" : ""}`}
              onClick={() => setIsDark(!isDark)}
              aria-label="Basculer le thème"
            >
              <span className="toggle-thumb" />
            </button>
            <span className="theme-label">Sombre</span>
          </div>

          {isAuthenticated && (
            <button onClick={handleLogout} className="header-logout-btn">
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
