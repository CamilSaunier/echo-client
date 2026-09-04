import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuthStore } from "../../stores/auth.stores";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import "./Header.css";

/**
 * Main application header component featuring navigation, theme switcher toggle, and logout.
 */
export const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

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
          <ThemeToggle />

          {isAuthenticated && (
            <button onClick={handleLogout} className="header-logout-btn" aria-label="Se déconnecter">
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
