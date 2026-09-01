// src/components/LoginForm/LoginForm.tsx
import { useState } from "react";
import type { SyntheticEvent } from "react";
import { toast } from "sonner"; // Import de la fonction toast
import { useAuthStore } from "../../stores/auth.stores";
import "./LoginForm.css";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Récupération de l'action login et du loader depuis le store
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    try {
      // Appel de l'action login du store
      await login({ email, password });
      toast.success("Connexion réussie ! Bienvenue sur Echo.");
      console.log("Connexion réussie avec rememberMe :", rememberMe);
    } catch (error: any) {
      // Toast d'erreur global et élégant en cas d'échec
      toast.error(error.message || "Identifiants invalides ou erreur serveur.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-field">
        <label htmlFor="login-email">Email</label>
        <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.com" required />
      </div>

      <div className="form-field">
        <label htmlFor="login-password">Mot de passe</label>
        <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
      </div>

      <div className="form-row">
        <label className="checkbox-inline">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
          Rester connecté
        </label>
        <a href="#forgot" onClick={(e) => e.preventDefault()}>
          Mot de passe oublié ?
        </a>
      </div>

      <button type="submit" className="btn-submit" disabled={isLoading}>
        {isLoading ? "Connexion en cours..." : "Se connecter"}
      </button>
    </form>
  );
}
