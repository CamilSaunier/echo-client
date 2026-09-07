import { create } from "zustand";
import { friendService } from "../services/friend.service";
import type { Friendship } from "../types/friend.types";

/**
 * State structure and actions interface for the friend store.
 * Interface de l'état et des actions du store d'amis.
 */
export interface FriendState {
  friends: Friendship[];
  pendingRequests: Friendship[];
  isLoading: boolean;
  error: string | null;

  /** Fetches all accepted friends. */
  fetchFriends: () => Promise<void>;
  /** Fetches incoming pending requests. */
  fetchPendingRequests: () => Promise<void>;
  /** Fetches both friends and pending requests concurrently. */
  fetchAll: () => Promise<void>;
  /** Sends a new friend request. */
  sendRequest: (friendId: string) => Promise<void>;
  /** Accepts or rejects a pending friend request. */
  respondToRequest: (friendshipId: string, accept: boolean) => Promise<void>;
  /** Removes an existing friend. */
  removeFriend: (friendId: string) => Promise<void>;
  /** Clears the current error state. */
  clearError: () => void;
}

/**
 * Zustand store for managing global friendship state and actions.
 * Store Zustand pour la gestion globale de l'état et des actions d'amitié.
 */
export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  pendingRequests: [],
  isLoading: false,
  error: null,

  /**
   * Fetches the accepted friends list.
   * Récupère la liste des amis confirmés.
   */
  fetchFriends: async () => {
    try {
      const friends = await friendService.getFriends();
      set({ friends });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to fetch friends" });
    }
  },

  /**
   * Fetches incoming pending friend requests.
   * Récupère les demandes d'amis en attente.
   */
  fetchPendingRequests: async () => {
    try {
      const pendingRequests = await friendService.getPendingRequests();
      set({ pendingRequests });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to fetch pending requests" });
    }
  },

  /**
   * Fetches both friends and pending requests concurrently.
   * Charge simultanément les amis et les demandes en attente.
   */
  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [friends, pendingRequests] = await Promise.all([friendService.getFriends(), friendService.getPendingRequests()]);
      set({ friends, pendingRequests, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to load friend data",
        isLoading: false,
      });
    }
  },

  /**
   * Sends a friend request and refreshes pending requests.
   * Envoie une demande d'ami puis rafraîchit la liste des demandes.
   */
  sendRequest: async (friendId: string) => {
    set({ error: null });
    try {
      await friendService.sendFriendRequest(friendId);
      await get().fetchPendingRequests();
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to send request" });
      throw err;
    }
  },

  /**
   * Responds to a friend request and updates the state.
   * Répond à une demande (accepter/refuser) et met à jour l'état complet.
   */
  respondToRequest: async (friendshipId: string, accept: boolean) => {
    set({ error: null });
    try {
      await friendService.respondToRequest(friendshipId, accept);
      await get().fetchAll();
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to respond to request" });
      throw err;
    }
  },

  /**
   * Removes a friend and refreshes the friends list.
   * Supprime un ami puis rafraîchit la liste des amis.
   */
  removeFriend: async (friendId: string) => {
    set({ error: null });
    try {
      await friendService.removeFriend(friendId);
      await get().fetchFriends();
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to remove friend" });
      throw err;
    }
  },

  /**
   * Clears error state.
   * Réinitialise l'état d'erreur.
   */
  clearError: () => set({ error: null }),
}));
