// src/stores/auth.stores.ts
import { create } from "zustand";
import { authService } from "../services/auth.service";
import { socketService } from "../services/socket.service";
import type { LoginCredentials, RegisterCredentials } from "../types/auth.types";
import type { User } from "../types/user.types";

/**
 * Interface representing the global authentication state and available actions.
 */
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean; // Indique si la vérification initiale de session est en cours

  /** Authenticates a user and connects WebSockets. */
  login: (credentials: LoginCredentials) => Promise<void>;
  /** Registers a new user account. */
  register: (data: RegisterCredentials) => Promise<void>;
  /** Logs out the user, revokes session and disconnects WebSockets. */
  logout: () => Promise<void>;
  /** Restores user session silently using the HttpOnly refresh token cookie on app startup. */
  checkAuth: () => Promise<void>;
  /** Directly updates the Access Token in RAM state. */
  setAccessToken: (token: string | null) => void;
  /** Directly updates the current authenticated user object. */
  setUser: (user: User | null) => void;
}

/**
 * Zustand authentication store.
 * Keeps tokens strictly in RAM to protect against XSS vulnerabilities.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true, // Démarre à true pour bloquer le rendu des routes protégées au boot

  setAccessToken: (token) =>
    set({
      accessToken: token,
      isAuthenticated: !!token,
    }),

  setUser: (user) => set({ user }),

  checkAuth: async () => {
    try {
      // Tentative de récupération d'un nouvel Access Token via le cookie HttpOnly
      const response = await authService.refreshToken();

      set({
        accessToken: response.accessToken,
        user: response.user,
        isAuthenticated: true,
      });

      // Connexion au serveur WebSocket une fois la session restaurée
      socketService.connect();
    } catch {
      // Si le cookie est absent ou expiré, réinitialisation silencieuse du store
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
      });
    } finally {
      // Libération du verrou d'initialisation de l'application
      set({ isInitializing: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(credentials);
      set({
        accessToken: response.accessToken,
        user: response.user,
        isAuthenticated: true,
      });

      // Connexion au serveur WebSocket dès que l'utilisateur se connecte
      socketService.connect();
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      await authService.register(data);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      // Coupure propre de la connexion WebSocket et vidage de la mémoire RAM
      socketService.disconnect();
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
      });
    }
  },
}));
