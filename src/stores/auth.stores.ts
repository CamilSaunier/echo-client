// Importation de la fonction 'create' de Zustand pour fabriquer le store
import { create } from "zustand";
// Importation du type TypeScript 'User' pour typer proprement notre utilisateur
import type { User } from "../types";

// Définition du contrat (interface) : à quoi ressemble l'état global de l'authentification ?
interface AuthState {
  // L'utilisateur connecté (soit un objet User, soit null s'il n'est pas connecté)
  user: User | null;

  // Le jeton JWT de sécurité (soit une string, soit null)
  token: string | null;

  // Action pour enregistrer l'utilisateur et son token lors de la connexion
  setAuth: (user: User, token: string) => void;

  // Action pour nettoyer l'état et déconnecter l'utilisateur
  logout: () => void;
}

// Création et exportation du store Zustand (qui est un hook React qu'on pourra appeler partout)
export const useAuthStore = create<AuthState>((set) => ({
  // --- 1. L'état initial (au démarrage de l'application) ---
  user: null,
  token: null,

  // --- 2. Les actions pour modifier cet état ---

  // Met à jour le state avec le nouvel utilisateur et le nouveau token
  setAuth: (user, token) => set({ user, token }),

  // Réinitialise l'utilisateur et le token à null (déconnexion)
  logout: () => set({ user: null, token: null }),
}));
