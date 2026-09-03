// src/stores/auth.stores.ts
import { create } from "zustand";
import { authService } from "../services/auth.service";
import { socketService } from "../services/socket.service";
import type { LoginCredentials, RegisterCredentials } from "../types/auth.types";
import type { User } from "../types/user.types";

/**
 * Interface définissant la structure de l'état global d'authentification (State & Actions).
 */
interface AuthState {
  // --- Les Données (State) ---
  user: User | null; // Informations sur l'utilisateur connecté (ou null si déconnecté)
  accessToken: string | null; // Jeton d'accès JWT stocké en mémoire vive (RAM)
  isAuthenticated: boolean; // Booléen rapide pour savoir si l'utilisateur est connecté
  isLoading: boolean; // Permet de gérer les états de chargement (loaders sur les boutons)

  // --- Les Actions (Methods) ---
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
}

/**
 * Création du store Zustand pour l'authentification.
 * Accessible globalement dans toute l'application React.
 */
export const useAuthStore = create<AuthState>((set) => ({
  // --- État initial ---
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,

  // --- Actions de mise à jour simple de l'état ---
  setAccessToken: (token) =>
    set({
      accessToken: token,
      isAuthenticated: !!token, // Met à jour true si le token existe, false sinon
    }),

  setUser: (user) => set({ user }),

  // --- Action de Connexion (Login) ---
  login: async (credentials) => {
    set({ isLoading: true }); // Active le loader
    try {
      // 1. Appel au service d'authentification distant
      const response = await authService.login(credentials);

      // 2. Si succès, on met à jour le store avec les données reçues
      set({
        accessToken: response.accessToken,
        user: response.user,
        isAuthenticated: true,
      });

      // 3. Connexion au serveur WebSocket avec le nouveau token disponible
      socketService.connect();
    } catch (error) {
      // L'erreur est relancée pour pouvoir l'afficher dans le composant UI
      throw error;
    } finally {
      set({ isLoading: false }); // Désactive le loader dans tous les cas
    }
  },

  // --- Action d'Inscription (Register) ---
  register: async (data) => {
    set({ isLoading: true });
    try {
      // Appel au service d'inscription
      await authService.register(data);
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // --- Action de Déconnexion (Logout) ---
  logout: async () => {
    try {
      // Appelle le service pour nettoyer le cookie HttpOnly côté back
      await authService.logout();
    } finally {
      // Qu'il y ait une erreur réseau ou non, on coupe la socket et on nettoie l'état local
      socketService.disconnect();
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
      });
    }
  },
}));
