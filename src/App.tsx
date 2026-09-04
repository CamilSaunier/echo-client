// src/App.tsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./stores/auth.stores";
import { AuthPage } from "./pages/AuthPage/AuthPage";
import { DashboardPage } from "./pages/DashboardPage/DashboardPage";
import { DashboardLayout } from "./components/DashboardLayout/DashboardLayout";
import { Header } from "./components/Header/Header";
import { Footer } from "./components/Footer/Footer";
import { AppLoader } from "./components/AppLoader/AppLoader";
import { Toaster } from "sonner";

/**
 * Layout pour les pages publiques (Auth, etc.) avec Header et Footer.
 */
function PublicLayout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/**
 * Composant Racine.
 * Gère la vérification initiale de session et le routage global.
 */
export function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Vérification de la session au démarrage
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Loader pendant la vérification du token / cookie HttpOnly
  if (isInitializing) {
    return <AppLoader message="Vérification de la session..." />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />

      <Routes>
        {/* --- ROUTES PUBLIQUES (avec Header & Footer) --- */}
        <Route element={<PublicLayout />}>
          <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" replace />} />
        </Route>

        {/* --- ROUTES PROTÉGÉES (avec Sidebar via DashboardLayout) --- */}
        <Route path="/dashboard" element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/auth" replace />}>
          {/* /dashboard -> Affiche le chat/dashboard principal */}
          <Route index element={<DashboardPage />} />
          <Route path="chat" element={<DashboardPage />} />

          {/* Futurs sous-modules du Dashboard */}
          <Route path="settings" element={<div style={{ padding: "2rem" }}>Paramètres</div>} />
        </Route>

        {/* --- REDIRECTIONS DE SECOURS --- */}
        {/* / redirige directement vers /dashboard ou /auth */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />} />
        {/* Toute autre URL inconnue redirige vers / */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
