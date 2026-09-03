// src/services/auth.service.ts
import { api } from "./api.service";
import type { LoginCredentials, RegisterCredentials, AuthResponse } from "../types/auth.types";
import type { User } from "../types/user.types";

/**
 * Service centralisant tous les appels HTTP vers l'API d'authentification du backend via Axios.
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
    // Axios effectue la requête POST et parse automatiquement le JSON dans response.data
    const response = await api.post<{ success: boolean; message: string; data: User }>("/auth/register", data);

    // L'API encapsule sa réponse, on extrait et retourne uniquement la propriété `data` (l'utilisateur)
    return response.data.data;
  },

  /**
   * Authenticates an existing user with their credentials.
   *
   * @param {LoginCredentials} credentials - The user's email and password
   * @returns {Promise<AuthResponse>} An object containing the Access Token and user information
   * @throws {Error} Throws an error if credentials are invalid or request fails
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<{ success: boolean; message: string; data: AuthResponse }>("/auth/login", credentials);

    // L'API renvoie { success, message, data: { accessToken, user } }, on retourne le bloc `data`
    return response.data.data;
  },

  /**
   * Refreshes the JWT access token using the HttpOnly refresh token cookie.
   *
   * @returns {Promise<AuthResponse>} An object containing the new Access Token and user information
   * @throws {Error} Throws an error if the refresh token is missing or expired
   */
  async refreshToken(): Promise<AuthResponse> {
    // Le cookie HttpOnly est transmis automatiquement par le navigateur grâce à `withCredentials: true`.
    // On extrait le bloc `data` qui contient le nouvel accessToken et les données de l'utilisateur.
    const response = await api.post<{ success: boolean; message: string; data: AuthResponse }>("/auth/refresh");

    return response.data.data;
  },

  /**
   * Retrieves the profile of the currently authenticated user using their Access Token.
   *
   * @param {string} accessToken - The JWT access token stored in memory (Zustand store)
   * @returns {Promise<User>} The user's profile information
   * @throws {Error} Throws an error if token is invalid or profile cannot be fetched
   */
  async getMe(_accessToken: string): Promise<User> {
    // Grâce à l'intercepteur Axios configuré dans api.ts, l'Access Token est injecté
    // automatiquement dans le header Authorization. Pas besoin de le passer manuellement.
    const response = await api.get<{ success: boolean; message: string; data: User }>("/auth/me");

    // Gère le cas où l'API renvoie directement l'objet ou l'encapsule dans `data`
    return response.data.data || response.data;
  },

  /**
   * Logs out the user by instructing the backend to revoke the Refresh Token
   * and clear the associated HttpOnly cookie.
   *
   * @returns {Promise<void>}
   */
  async logout(): Promise<void> {
    // Grâce à `withCredentials: true`, le navigateur transmet automatiquement le cookie HttpOnly
    // pour qu'il soit supprimé côté serveur.
    await api.post("/auth/logout");
  },
};
