// src/components/Sidebar/Sidebar.tsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Zap, Menu, X, ChevronLeft, ChevronRight, LayoutDashboard, MessageSquare, Settings, LogOut, Hash } from "lucide-react";
import { useAuthStore } from "../../stores/auth.stores";
import { useChatStore } from "../../stores/chat.store";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import "./Sidebar.css";

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isCollapsed: externalIsCollapsed, onToggleCollapse }: SidebarProps) {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isCollapsed = externalIsCollapsed ?? internalIsCollapsed;

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const { conversations, activeConversationId, selectConversation } = useChatStore();

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalIsCollapsed(!internalIsCollapsed);
    }
  };

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <>
      <button className="mobile-menu-btn" onClick={toggleMobile} aria-label="Ouvrir le menu">
        <Menu size={20} />
      </button>

      <button
        type="button"
        className={`sidebar-overlay ${isMobileOpen ? "active" : ""}`}
        onClick={closeMobile}
        aria-label="Fermer le menu mobile"
        tabIndex={isMobileOpen ? 0 : -1}
      />

      <aside className={`app-sidebar ${isCollapsed ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`}>
        {/* En-tête */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-icon">
              <Zap size={22} />
            </span>
            {!isCollapsed && <span className="brand-title">Echo</span>}
          </div>

          <button className="mobile-close-btn" onClick={toggleMobile} aria-label="Fermer le menu">
            <X size={20} />
          </button>
          <button className="desktop-collapse-btn" onClick={toggleCollapse} aria-label={isCollapsed ? "Agrandir le menu" : "Réduire le menu"}>
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation principale */}
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={closeMobile}>
            <span className="link-icon">
              <LayoutDashboard size={20} />
            </span>
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink to="/dashboard/chat" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={closeMobile}>
            <span className="link-icon">
              <MessageSquare size={20} />
            </span>
            {!isCollapsed && <span>Discussions</span>}
          </NavLink>

          {/* Section sous-liste des conversations */}
          {!isCollapsed && conversations.length > 0 && (
            <div className="sidebar-conversations-section">
              <span className="sidebar-section-title">Mes canaux</span>
              <div className="sidebar-conversations-list">
                {conversations.map((conv) => {
                  const otherParticipant = conv.participants.find((p) => p.userId !== user?.id);
                  const displayName = conv.name || otherParticipant?.user.username || "Discussion";

                  return (
                    <button
                      key={conv.id}
                      type="button"
                      className={`sidebar-sublink ${activeConversationId === conv.id ? "active" : ""}`}
                      onClick={() => {
                        selectConversation(conv.id);
                        closeMobile();
                      }}
                    >
                      <span className="sublink-icon">
                        <Hash size={16} />
                      </span>
                      <span className="sublink-text">{displayName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <NavLink to="/dashboard/settings" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={closeMobile}>
            <span className="link-icon">
              <Settings size={20} />
            </span>
            {!isCollapsed && <span>Paramètres</span>}
          </NavLink>
        </nav>

        {/* Pied de page */}
        <div className="sidebar-footer">
          <div className={`sidebar-theme-wrapper ${isCollapsed ? "collapsed" : ""}`}>
            <ThemeToggle isCollapsed={isCollapsed} />
          </div>

          <button
            type="button"
            className="sidebar-link logout-btn"
            onClick={() => {
              closeMobile();
              logout();
            }}
          >
            <span className="link-icon">
              <LogOut size={20} />
            </span>
            {!isCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
