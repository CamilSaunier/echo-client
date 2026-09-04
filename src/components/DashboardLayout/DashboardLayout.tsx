// src/layouts/DashboardLayout.tsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "../Sidebar/Sidebar";
import "./DashboardLayout.css";

export function DashboardLayout() {
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
