// src/services/api.service.ts
import axios from "axios";
import { useAuthStore } from "../stores/auth.stores";

// 1. On récupère l'URL de base (ex: http://localhost:8000/api)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Global Axios instance configured for the Echo application.
 * Handles base URL configuration, credentials inclusion, and default headers.
 */
// 2. On crée une "instance" personnalisée d'Axios.
// Au lieu d'utiliser axios directement partout, on lui donne des réglages par défaut.
export const api = axios.create({
  baseURL: API_URL, // Toutes nos requêtes commenceront par l'URL de base définie
  withCredentials: true, // Force le navigateur à envoyer/recevoir les cookies HttpOnly (essentiel pour le Refresh Token)
  headers: {
    "Content-Type": "application/json", // On prévient le back qu'on envoie du JSON
  },
});

/**
 * Request interceptor: Automatically runs before every outgoing HTTP request.
 * It fetches the Access Token from the Zustand store in RAM and injects it into the Authorization header.
 *
 * @function interceptors.request
 * @param {InternalAxiosRequestConfig} config - The outgoing HTTP request configuration
 * @returns {InternalAxiosRequestConfig} The modified configuration with the Authorization header if available
 */
// 3. C'est LA grosse force d'Axios : l'intercepteur de requête.
// Cette fonction s'exécutera automatiquement juste AVANT que n'importe quelle requête ne parte de ton appli.
api.interceptors.request.use(
  (config) => {
    // A - On va chercher l'Access Token directement dans Zustand (en mémoire RAM)
    const accessToken = useAuthStore.getState().accessToken;

    // B - Si le token existe, on l'ajoute discrètement dans les headers de la requête
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // C - On laisse la requête continuer sa route
    return config;
  },
  (error) => {
    // Si y a un souci avant l'envoi, on rejette l'erreur
    return Promise.reject(error);
  },
);
