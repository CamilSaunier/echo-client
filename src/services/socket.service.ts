// src/services/socket.service.ts
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../stores/auth.stores";

// Récupération de l'URL du serveur.
// Si VITE_API_URL vaut "http://localhost:8000/api", on retire "/api" pour obtenir "http://localhost:8000"
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";

class SocketService {
  // Propriété publique qui stocke l'instance de la socket (ou null si non connecté)
  public socket: Socket | null = null;

  /**
   * Establish connexion with websocket Serv.
   * Use Acces Token in the store for authenticated the user
   */
  public connect(): Socket {
    // Si une connexion existe déjà et est active, on la retourne directement pour éviter les doublons
    if (this.socket?.connected) {
      return this.socket;
    }

    // On va chercher l'access token actuel directement dans le store Zustand (hors composant React)
    const accessToken = useAuthStore.getState().accessToken;

    // Initialisation de la connexion Socket.io avec le client
    this.socket = io(SOCKET_URL, {
      auth: {
        token: accessToken, // Transmis au serveur lors du handshake pour authentification
      },
      withCredentials: true, // Autorise l'envoi de cookies si nécessaire
      autoConnect: true, // Connexion immédiate à l'instanciation
    });

    // Événement : Connexion réussie
    this.socket.on("connect", () => {
      console.log("🟢 Connecté au serveur WebSocket avec l'ID :", this.socket?.id);
    });

    // Événement : Déconnexion du serveur
    this.socket.on("disconnect", (reason) => {
      console.log("🔴 Déconnecté du serveur WebSocket. Raison :", reason);
    });

    // Événement : Erreur lors de la tentative de connexion (ex: JWT invalide)
    this.socket.on("connect_error", (err) => {
      console.error("⚠️ Erreur de connexion WebSocket :", err.message);
    });

    return this.socket;
  }

  /**
   * Ferme proprement la connexion WebSocket (utile lors de la déconnexion de l'utilisateur).
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect(); // Coupe la liaison
      this.socket = null; // Nettoie la référence
      console.log("🔌 WebSocket déconnecté manuellement.");
    }
  }
}

// Export d'une instance unique (Singleton) utilisable partout dans l'application front
export const socketService = new SocketService();
