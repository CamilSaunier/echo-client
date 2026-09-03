// src/components/LoginForm/LoginForm.tsx
import { useState } from "react";
import type { SyntheticEvent } from "react";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/auth.stores";
import "./LoginForm.css";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { login, isLoading } = useAuthStore();

  const clearErrors = () => {
    if (globalError) setGlobalError("");
    if (Object.keys(fieldErrors).length > 0) setFieldErrors({});
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    clearErrors();

    try {
      await login({ email, password });
      toast.success("Connexion réussie ! Bienvenue sur Echo.");
    } catch (err: any) {
      const responseData = err.response?.data;
      const status = err.response?.status;

      if (status === 401) {
        setGlobalError("Email ou mot de passe incorrect.");
        return;
      }

      if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
        const errorsMap: Record<string, string> = {};
        responseData.errors.forEach((item: { field: string; message: string }) => {
          const fieldName = item.field ? item.field.replace("body.", "") : "global";
          errorsMap[fieldName] = item.message;
        });
        setFieldErrors(errorsMap);
      } else {
        setGlobalError(responseData?.message || "Impossible de se connecter au serveur.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {/* Encart d'erreur rouge global */}
      {globalError && <div className="form-error">{globalError}</div>}

      <div className="form-field">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearErrors();
          }}
          placeholder="toi@exemple.com"
          className={fieldErrors.email || globalError ? "input-error" : ""}
          required
        />
        {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="login-password">Mot de passe</label>
        <div className="password-input-wrapper">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearErrors();
            }}
            placeholder="••••••••"
            className={fieldErrors.password || globalError ? "input-error" : ""}
            required
          />
          <button
            type="button"
            className="toggle-password-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? "Masquer" : "Afficher"}
          </button>
        </div>
        {fieldErrors.password && <span className="field-error-text">{fieldErrors.password}</span>}
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
