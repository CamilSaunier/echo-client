// src/App.tsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/auth.stores";
import { AuthPage } from "./pages/AuthPage/AuthPage";
import { DashboardPage } from "./pages/DashboardPage/DashboardPage";
import { Header } from "./components/Header/Header";
import { Footer } from "./components/Footer/Footer";
import { AppLoader } from "./components/AppLoader/AppLoader";
import { Toaster } from "sonner";

/**
 * Root application component.
 * Manages initial session verification, global routing, and layout structure.
 */
export function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Exécution du rafraîchissement silencieux de session au démarrage de l'application
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Bloque le rendu des routes pendant la vérification du cookie HttpOnly
  if (isInitializing) {
    return <AppLoader message="Vérification de la session..." />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />

      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />

        <main style={{ flex: 1 }}>
          <Routes>
            {/* Page publique d'authentification : redirige vers / si l'utilisateur est déjà connecté */}
            <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" replace />} />

            {/* Route protégée (Dashboard) : redirige vers /auth si non connecté */}
            <Route path="/" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/auth" replace />} />

            {/* Redirection par défaut vers la racine */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
