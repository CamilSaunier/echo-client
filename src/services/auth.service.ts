// src/services/auth.service.ts
import type { LoginCredentials, RegisterCredentials, AuthResponse } from "../types/auth.types";
import type { User } from "../types/user.types";

// Récupération de l'URL de base de l'API depuis les variables d'environnement Vite,
// avec un fallback de sécurité sur le port 8000 si la variable n'est pas définie.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Service centralisant tous les appels HTTP vers l'API d'authentification du backend.
 */
export const authService = {
  /**
   * Registers a new user account on the backend.
   *
   * @param {RegisterCredentials} data - The user registration credentials (email, password, etc.)
   * @returns {Promise<User>} The newly created user object
   * @throws {Error} Throws an error if the registration request fails
   */
  async register(data: RegisterCredentials): Promise<User> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    // Si le serveur renvoie un code d'erreur HTTP (ex: 400, 500), on lève une exception
    if (!response.ok) {
      throw new Error(json.message || "Erreur lors de l'inscription");
    }

    // L'API encapsule sa réponse, on extrait et retourne uniquement la propriété `data` (l'utilisateur)
    return json.data;
  },

  /**
   * Authenticates an existing user with their credentials.
   *
   * @param {LoginCredentials} credentials - The user's email and password
   * @returns {Promise<AuthResponse>} An object containing the Access Token and user information
   * @throws {Error} Throws an error if credentials are invalid or request fails
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // `credentials: "include"` est crucial : il permet au navigateur d'accepter
      // et de stocker automatiquement le cookie HttpOnly contenant le Refresh Token envoyé par le back.
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.message || "Identifiants invalides");
    }

    // L'API renvoie { success, message, data: { accessToken, user } }, on retourne le bloc `data`
    return json.data;
  },

  /**
   * Retrieves the profile of the currently authenticated user using their Access Token.
   *
   * @param {string} accessToken - The JWT access token stored in memory (Zustand store)
   * @returns {Promise<User>} The user's profile information
   * @throws {Error} Throws an error if token is invalid or profile cannot be fetched
   */
  async getMe(accessToken: string): Promise<User> {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        // Transmission sécurisée de l'Access Token dans l'en-tête de la requête
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error("Impossible de récupérer le profil");
    }

    // Gère le cas où l'API renvoie directement l'objet ou l'encapsule dans `data`
    return json.data || json;
  },

  /**
   * Logs out the user by instructing the backend to revoke the Refresh Token
   * and clear the associated HttpOnly cookie.
   *
   * @returns {Promise<void>}
   */
  async logout(): Promise<void> {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      // Nécessaire pour que le navigateur transmette et permette au back de supprimer le cookie HttpOnly
      credentials: "include",
    });
  },
};
