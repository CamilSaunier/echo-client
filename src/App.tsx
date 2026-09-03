// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/auth.stores";
import { AuthPage } from "./pages/AuthPage/AuthPage";
import { DashboardPage } from "./pages/DashboardPage/DashboardPage";
import { Header } from "./components/Header/Header";
import { Footer } from "./components/Footer/Footer";
import { Toaster } from "sonner";

/**
 * Root component of the Echo client application.
 */
export function App() {
  // On récupère "isAuthenticated" directement depuis ton store Zustand
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      {/* Le Toaster global est placé ici pour être accessible partout */}
      <Toaster position="top-right" richColors />

      {/* Conteneur global avec une disposition en colonne pour épingler le footer en bas */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Le Header s'affiche sur toutes les pages */}
        <Header />

        {/* Zone de contenu principale flexible */}
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Route publique d'authentification (/auth)
                Si l'utilisateur est DÉJÀ connecté, on le redirige vers le Dashboard (/) */}
            <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" replace />} />

            {/* Route principale / protégée (Le Guard)
                Si l'utilisateur n'est PAS connecté, on le redirige vers /auth */}
            <Route path="/" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/auth" replace />} />

            {/* Redirection par défaut : toute URL inconnue renvoie vers la racine */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Le Footer s'affiche sur toutes les pages */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
