// src/components/ThemeToggle/ThemeToggle.tsx
import React from "react";
import { useTheme } from "../../hooks/useTheme";
import "./ThemeToggle.css";

export interface ThemeToggleProps {
  isCollapsed?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isCollapsed = false }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`theme-switcher ${isCollapsed ? "collapsed" : ""}`}>
      {!isCollapsed && <span className="theme-label">Clair</span>}
      <button type="button" className={`toggle-switch ${isDark ? "active" : ""}`} onClick={toggleTheme} aria-label="Basculer le thème">
        <span className="toggle-thumb" />
      </button>
      {!isCollapsed && <span className="theme-label">Sombre</span>}
    </div>
  );
};
