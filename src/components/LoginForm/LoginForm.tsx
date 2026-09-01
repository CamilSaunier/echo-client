import { useState } from "react";
import type { SyntheticEvent } from "react";
import "./LoginForm.css";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    console.log("Connexion :", { email, password, rememberMe });
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

      <button type="submit" className="btn-submit">
        Se connecter
      </button>
    </form>
  );
}
