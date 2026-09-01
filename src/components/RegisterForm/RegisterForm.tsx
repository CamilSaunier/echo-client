import { useState } from "react";
import type { SyntheticEvent } from "react";
import "./RegisterForm.css";

export function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    // Vérification de concordance
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setError("");
    console.log("Inscription validée avec :", { username, email, password });
    // TODO: Appel API register
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      {error && <div className="form-error">{error}</div>}

      <div className="form-field">
        <label htmlFor="reg-username">Nom d'utilisateur</label>
        <input id="reg-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ton pseudo" required />
      </div>

      <div className="form-field">
        <label htmlFor="reg-email">Email</label>
        <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.com" required />
      </div>

      <div className="form-field">
        <label htmlFor="reg-password">Mot de passe</label>
        <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
      </div>

      <div className="form-field">
        <label htmlFor="reg-confirm-password">Confirmer le mot de passe</label>
        <input
          id="reg-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      <button type="submit" className="btn-submit" style={{ marginTop: "0.5rem" }}>
        S'inscrire
      </button>
    </form>
  );
}
