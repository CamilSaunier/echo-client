// src/components/Sidebar/Sidebar.tsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Zap, Menu, X, ChevronLeft, ChevronRight, Settings, LogOut, Hash, Users, User, ChevronDown, ChevronUp } from "lucide-react";
import { useAuthStore } from "../../stores/auth.stores";
import { useChatStore } from "../../stores/chat.store";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { LeaveConversationButton } from "../LeaveConversationButton/LeaveConversationButton";
import "./Sidebar.css";

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isCollapsed: externalIsCollapsed, onToggleCollapse }: SidebarProps) {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // État pour ouvrir/fermer le menu déroulant des amis
  const [isFriendsOpen, setIsFriendsOpen] = useState(true);

  const isCollapsed = externalIsCollapsed ?? internalIsCollapsed;

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const { conversations, activeConversationId, selectConversation, onlineUserIds, startDirectConversation } = useChatStore();

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalIsCollapsed(!internalIsCollapsed);
    }
  };

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

  // Extraction unique de tous les contacts/amis rencontrés dans les conversations
  const allFriendsMap = new Map();
  conversations.forEach((conv) => {
    const otherParticipant = conv.participants.find((p) => p.userId !== user?.id);
    if (otherParticipant && otherParticipant.user) {
      allFriendsMap.set(otherParticipant.userId, {
        userId: otherParticipant.userId,
        username: otherParticipant.user.username,
      });
    }
  });
  const friendsList = Array.from(allFriendsMap.values());

  const onlineFriends = friendsList.filter((f) => onlineUserIds.includes(f.userId));
  const offlineFriends = friendsList.filter((f) => !onlineUserIds.includes(f.userId));

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
          {/* Section Menu Déroulant des Amis */}
          {!isCollapsed && (
            <div className="sidebar-friends-dropdown-section">
              <button type="button" className="sidebar-dropdown-header" onClick={() => setIsFriendsOpen(!isFriendsOpen)}>
                <div className="dropdown-title-wrapper">
                  <Users size={18} />
                  <span>Amis ({friendsList.length})</span>
                </div>
                {isFriendsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isFriendsOpen && (
                <div className="sidebar-friends-list">
                  {friendsList.length === 0 ? (
                    <p className="sidebar-empty-text">Aucun ami pour le moment</p>
                  ) : (
                    <>
                      {/* En ligne */}
                      {onlineFriends.length > 0 && (
                        <div className="friend-category">
                          <span className="friend-category-title">En ligne — {onlineFriends.length}</span>
                          {onlineFriends.map((friend) => (
                            <button
                              key={friend.userId}
                              type="button"
                              className="friend-item-btn"
                              onClick={() => {
                                startDirectConversation(friend.userId);
                                closeMobile();
                              }}
                            >
                              <span className="friend-status-dot online" />
                              <span className="friend-name">{friend.username}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Hors ligne */}
                      {offlineFriends.length > 0 && (
                        <div className="friend-category">
                          <span className="friend-category-title">Hors ligne — {offlineFriends.length}</span>
                          {offlineFriends.map((friend) => (
                            <button
                              key={friend.userId}
                              type="button"
                              className="friend-item-btn offline"
                              onClick={() => {
                                startDirectConversation(friend.userId);
                                closeMobile();
                              }}
                            >
                              <span className="friend-status-dot offline" />
                              <span className="friend-name">{friend.username}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Section des canaux de discussion */}
          {!isCollapsed && conversations.length > 0 && (
            <div className="sidebar-conversations-section">
              <span className="sidebar-section-title">Canaux actifs</span>
              <div className="sidebar-conversations-list">
                {conversations.map((conv) => {
                  const otherParticipant = conv.participants.find((p) => p.userId !== user?.id);
                  const displayName = conv.name || otherParticipant?.user.username || "Discussion";
                  const isOnline = otherParticipant ? onlineUserIds.includes(otherParticipant.userId) : false;

                  return (
                    <div key={conv.id} className={`sidebar-sublink-wrapper ${activeConversationId === conv.id ? "active" : ""}`}>
                      <button
                        type="button"
                        className="sidebar-sublink"
                        onClick={() => {
                          selectConversation(conv.id);
                          closeMobile();
                        }}
                      >
                        <span className="sublink-icon-wrapper">
                          <Hash size={16} />
                          <span className={`sidebar-status-dot ${isOnline ? "online" : "offline"}`} />
                        </span>
                        <span className="sublink-text">{displayName}</span>
                      </button>

                      <LeaveConversationButton conversationId={conv.id} className="sidebar-leave-btn" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <NavLink to="/dashboard/settings" className={({ isActive }): string => `sidebar-link ${isActive ? "active" : ""}`} onClick={closeMobile}>
            <span className="link-icon">
              <Settings size={20} />
            </span>
            {!isCollapsed && <span>Paramètres</span>}
          </NavLink>
        </nav>

        {/* Pied de page */}
        <div className="sidebar-footer">
          {user && (
            <div className={`sidebar-user-info ${isCollapsed ? "collapsed" : ""}`} title={user.username}>
              <div className="user-avatar">
                <User size={18} />
              </div>
              {!isCollapsed && (
                <div className="user-details">
                  <span className="user-username">{user.username}</span>
                </div>
              )}
            </div>
          )}

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
