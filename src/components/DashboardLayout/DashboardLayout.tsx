// src/layouts/DashboardLayout.tsx
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../Sidebar/Sidebar";
import { useChatStore } from "../../stores/chat.store";
import { socketService } from "../../services/socket.service";
import "./DashboardLayout.css";

export function DashboardLayout() {
  useEffect(() => {
    // 1. Connexion au serveur WebSocket
    socketService.connect();

    // 2. Initialisation des écouteurs (messages, statuts en ligne, etc.)
    useChatStore.getState().initSocketListeners();

    // 3. Nettoyage à la déconnexion / démontage du layout
    return () => {
      useChatStore.getState().cleanupSocketListeners();
      socketService.disconnect();
    };
  }, []);

  return (
    <div className="dashboard-app-layout">
      {/* 1. La Sidebar globale de navigation */}
      <Sidebar />

      {/* 2. La zone de contenu où s'affichera ton DashboardPage (Chat) */}
      <div className="dashboard-app-content">
        <Outlet />
      </div>
    </div>
  );
}
