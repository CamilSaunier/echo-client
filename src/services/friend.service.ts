import { api } from "./api.service";
import type { Friendship } from "../types/friend.types";
import type { ApiResponse } from "../types/api.types";

/**
 * Service handling HTTP requests for friendship management.
 * Service gérant les appels API du module d'amis.
 */
export const friendService = {
  /**
   * Fetches the list of confirmed friends for the current user.
   * Récupère la liste des amis confirmés (status ACCEPTED).
   *
   * @returns {Promise<Friendship[]>} Array of accepted friendships.
   */
  getFriends: async (): Promise<Friendship[]> => {
    const response = await api.get<ApiResponse<Friendship[]>>("/friends");
    return response.data.data;
  },

  /**
   * Fetches pending incoming friend requests.
   * Récupère les demandes d'amis en attente (status PENDING).
   *
   * @returns {Promise<Friendship[]>} Array of pending friendships.
   */
  getPendingRequests: async (): Promise<Friendship[]> => {
    const response = await api.get<ApiResponse<Friendship[]>>("/friends/requests/pending");
    return response.data.data;
  },

  /**
   * Sends a friend request to a target user.
   * Envoie une demande d'ami à un utilisateur via son ID.
   *
   * @param {string} friendId - Target user ID.
   * @returns {Promise<Friendship>} Created friendship entity.
   */
  sendFriendRequest: async (friendId: string): Promise<Friendship> => {
    const response = await api.post<ApiResponse<Friendship>>("/friends/request", {
      friendId,
    });
    return response.data.data;
  },

  /**
   * Responds to an incoming friend request by accepting or rejecting it.
   * Accepte ou refuse une demande d'ami en attente.
   *
   * @param {string} friendshipId - Friendship relationship ID.
   * @param {boolean} accept - True to accept, false to reject.
   * @returns {Promise<Friendship>} Updated friendship entity.
   */
  respondToRequest: async (friendshipId: string, accept: boolean): Promise<Friendship> => {
    const response = await api.patch<ApiResponse<Friendship>>(`/friends/request/${friendshipId}`, { accept });
    return response.data.data;
  },

  /**
   * Deletes a friend from the user's friend list.
   * Supprime un ami via son ID d'utilisateur.
   *
   * @param {string} friendId - ID of the target friend.
   * @returns {Promise<void>}
   */
  removeFriend: async (friendId: string): Promise<void> => {
    await api.delete(`/friends/${friendId}`);
  },
};
