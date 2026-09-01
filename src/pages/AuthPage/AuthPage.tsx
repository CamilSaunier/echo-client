import { useState, useEffect } from "react";
import { LoginForm } from "../../components/LoginForm/LoginForm";
import { RegisterForm } from "../../components/RegisterForm/RegisterForm";
import "./AuthPage.css";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isDark, setIsDark] = useState(true);

  // Gestion du mode sombre / clair sur la racine
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <main className="auth-container">
      {/* Toggle Clair / Sombre */}
      <div className="theme-switcher">
        <span>Clair</span>
        <button type="button" className={`toggle-switch ${isDark ? "active" : ""}`} onClick={() => setIsDark(!isDark)} aria-label="Basculer le thème">
          <span className="toggle-thumb" />
        </button>
        <span>Sombre</span>
      </div>

      <div className="auth-card">
        {/* Navigation par onglets */}
        <div className="auth-tabs">
          <button type="button" className={`tab-btn ${isLogin ? "active" : ""}`} onClick={() => setIsLogin(true)}>
            Connexion
          </button>
          <button type="button" className={`tab-btn ${!isLogin ? "active" : ""}`} onClick={() => setIsLogin(false)}>
            Créer un compte
          </button>
        </div>

        {/* En-tête dynamique */}
        <div className="auth-header">
          <h2 className="auth-title">{isLogin ? "Bon retour" : "Créer un compte"}</h2>
          <p className="auth-subtitle">{isLogin ? "Connecte-toi pour accéder à ton espace." : "Rejoins-nous pour commencer."}</p>
        </div>

        {/* Formulaire actif */}
        {isLogin ? <LoginForm /> : <RegisterForm />}

        {/* Bascule de pied de page */}
        <div className="auth-footer-switch">
          {isLogin ? (
            <p>
              Pas encore de compte ?{" "}
              <button type="button" onClick={() => setIsLogin(false)}>
                Inscris-toi
              </button>
            </p>
          ) : (
            <p>
              Déjà un compte ?{" "}
              <button type="button" onClick={() => setIsLogin(true)}>
                Connecte-toi
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default AuthPage;
