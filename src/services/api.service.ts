// src/services/api.service.ts
import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../stores/auth.stores";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Axios instance configured for the Echo application.
 * Features base URL setup, credentials inclusion for HttpOnly cookies, and default JSON headers.
 */
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Requis pour transmettre automatiquement le cookie HttpOnly (refresh token)
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor.
 * Automatically injects the Access Token from the Zustand store in RAM into the Authorization header.
 */
api.interceptors.request.use(
  (config) => {
    // Récupération de l'Access Token stocké en mémoire RAM via Zustand
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- GESTION DE LA FILE D'ATTENTE ET DU VERROU (MUTEX) ---

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/**
 * Resolves or rejects all pending requests queued during an ongoing token refresh operation.
 *
 * @param {unknown} error - Error object if the refresh attempt failed.
 * @param {string | null} token - The newly retrieved Access Token if the refresh succeeded.
 */
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Response interceptor.
 * Intercepts 401 Unauthorized errors and handles silent token rotation with mutex queuing.
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si ce n'est pas une erreur 401 ou si la requête a déjà été réessayée une fois, on abandonne
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Ne pas tenter de refresh si l'erreur provient directement des routes de login ou de refresh
    if (originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // CAS 1 : Un rafraîchissement est déjà en cours par une autre requête (verrou actif)
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        // On pousse la promesse dans la file d'attente
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          // Une fois débloquée, on rejoue la requête avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // CAS 2 : Première requête à capturer le 401 -> Elle devient le "leader" pour lancer le refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Appel du contrat de rafraîchissement (le cookie HttpOnly est géré automatiquement par withCredentials)
      const { data } = await api.post<{ accessToken: string }>("/auth/refresh");
      const newAccessToken = data.accessToken;

      // Mise à jour du token en mémoire RAM dans le store Zustand
      useAuthStore.getState().setAccessToken(newAccessToken);

      // Traitement et déblocage de toutes les requêtes en attente dans la file
      processQueue(null, newAccessToken);

      // Rejoue la requête initiale qui avait déclenché le refresh
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Si le refresh échoue (cookie expiré ou révoqué), on rejette la file et on déconnecte
      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    } finally {
      // Libération du verrou dans tous les cas
      isRefreshing = false;
    }
  },
);
