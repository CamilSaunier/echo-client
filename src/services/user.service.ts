import { api } from "./api.service";
import type { User } from "../types/user.types";
import type { ApiResponse } from "../types/api.types";

/**
 * Service handling HTTP requests for user operations.
 * Service gérant les appels API liés aux utilisateurs.
 */
export const userService = {
  /**
   * Searches users by username query string.
   * Recherche des utilisateurs par pseudo.
   *
   * @param {string} query - The search query string.
   * @returns {Promise<User[]>} Array of matching safe user objects.
   */
  searchUsers: async (query: string): Promise<User[]> => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const response = await api.get<ApiResponse<User[]>>(`/users/search?q=${encodeURIComponent(query.trim())}`);
    return response.data.data;
  },
};
