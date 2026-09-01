// Importation de la fonction 'create' de Zustand pour fabriquer le store global
import { create } from "zustand";

// Définition du contrat (interface) : à quoi ressemble l'état et les actions de l'authentification ?
interface AuthState {
  // Le jeton JWT de sécurité (soit une string, soit null s'il n'est pas connecté)
  token: string | null;

  // Un booléen pratique pour savoir directement si l'utilisateur est authentifié (vrai si le token existe)
  isAuthenticated: boolean;

  // Action pour enregistrer le token lors de la connexion
  login: (token: string) => void;

  // Action pour supprimer le token et déconnecter l'utilisateur
  logout: () => void;
}

// Création et exportation du store Zustand
export const useAuthStore = create<AuthState>((set) => ({
  // --- 1. L'état initial (au démarrage ou au rechargement de l'application) ---

  // On va chercher directement dans le stockage du navigateur si un token existe déjà
  token: localStorage.getItem("token") || null,

  // 'isAuthenticated' passe à true si un token est présent dans le localStorage (grâce à la double négation !!)
  isAuthenticated: !!localStorage.getItem("token"),

  // --- 2. Les actions pour modifier cet état ---

  // Action de connexion
  login: (token: string) => {
    // 1. On sauvegarde le token dans le navigateur pour qu'il persiste au refresh
    localStorage.setItem("token", token);
    // 2. On met à jour le store : on stocke le token et on passe isAuthenticated à true
    set({ token, isAuthenticated: true });
  },

  // Action de déconnexion
  logout: () => {
    // 1. On supprime le token du stockage du navigateur
    localStorage.removeItem("token");
    // 2. On remet tout à zéro dans le store
    set({ token: null, isAuthenticated: false });
  },
}));
