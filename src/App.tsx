import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/auth.stores";
import { AuthPage } from "./pages/AuthPage/AuthPage";
import { DashboardPage } from "./pages/DashboardPage/DashboardPage";

export function App() {
  // On récupère le token depuis ton store Zustand
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = !!token;

  return (
    <BrowserRouter>
      <Routes>
        {/* Route publique d'authentification (/auth)
            Si l'utilisateur est DÉJÀ connecté et essaie d'aller sur /auth, on le renvoie vers la racine (/) */}
        <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" replace />} />

        {/* Route principale / protégée (Le Guard)
            Si l'utilisateur n'est PAS connecté, on le redirige vers /auth */}
        <Route path="/" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/auth" replace />} />

        {/* Évolution future : tu pourras rajouter tes autres pages protégées ici 
            <Route path="/settings" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/auth" replace />} />
        */}

        {/* Redirection par défaut : toute URL inconnue renvoie vers la racine */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
