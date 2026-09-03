// src/components/RegisterForm/RegisterForm.tsx
import { useState } from "react";
import type { SyntheticEvent } from "react";
import { toast } from "sonner";
import { useAuthStore } from "../../stores/auth.stores";
import "./RegisterForm.css";

/**
 * Register form component handling user creation, password confirmation, and API error handling.
 */
export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { register, isLoading } = useAuthStore();

  const clearErrors = () => {
    if (globalError) setGlobalError("");
    if (Object.keys(fieldErrors).length > 0) setFieldErrors({});
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    clearErrors();

    // Vérification de la concordance des mots de passe
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Les mots de passe ne correspondent pas." });
      return;
    }

    try {
      await register({ email, username, password });
      toast.success("Compte créé avec succès ! Vous pouvez vous connecter.");
    } catch (err: any) {
      const responseData = err.response?.data;
      const status = err.response?.status;

      if (status === 409) {
        setGlobalError("Cet email ou nom d'utilisateur est déjà utilisé.");
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
        setGlobalError(responseData?.message || "Impossible de créer le compte pour le moment.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      {/* Encart d'erreur rouge global */}
      {globalError && <div className="form-error">{globalError}</div>}

      <div className="form-field">
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
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
        <label htmlFor="register-username">Nom d'utilisateur</label>
        <input
          id="register-username"
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            clearErrors();
          }}
          placeholder="Pseudo"
          className={fieldErrors.username || globalError ? "input-error" : ""}
          required
        />
        {fieldErrors.username && <span className="field-error-text">{fieldErrors.username}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="register-password">Mot de passe</label>
        <div className="password-input-wrapper">
          <input
            id="register-password"
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

      <div className="form-field">
        <label htmlFor="register-confirm-password">Confirmer le mot de passe</label>
        <div className="password-input-wrapper">
          <input
            id="register-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearErrors();
            }}
            placeholder="••••••••"
            className={fieldErrors.confirmPassword || globalError ? "input-error" : ""}
            required
          />
          <button
            type="button"
            className="toggle-password-btn"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
          >
            {showConfirmPassword ? "Masquer" : "Afficher"}
          </button>
        </div>
        {fieldErrors.confirmPassword && <span className="field-error-text">{fieldErrors.confirmPassword}</span>}
      </div>

      <button type="submit" className="btn-submit" disabled={isLoading}>
        {isLoading ? "Création du compte..." : "S'inscrire"}
      </button>
    </form>
  );
}
