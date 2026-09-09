// src/services/conversation.service.ts
import { api } from "./api.service";
import type { Conversation } from "../types/conversation.types";
import type { Message } from "../types/message.types";

/**
 * Service handling HTTP requests for conversations and thread histories.
 */
export const conversationService = {
  /**
   * Retrieves all conversations for the authenticated user.
   *
   * @async
   * @function getConversations
   * @returns {Promise<Conversation[]>} List of user conversations
   */
  async getConversations(): Promise<Conversation[]> {
    // Appel HTTP REST pour récupérer les conversations et leurs derniers messages
    const response = await api.get<Conversation[]>("/conversations");
    return response.data;
  },

  /**
   * Retrieves full message history for a specific conversation thread.
   *
   * @async
   * @function getConversationMessages
   * @param {string} conversationId - The target conversation identifier
   * @returns {Promise<Message[]>} Array of chronological messages
   */
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    // Récupération de l'historique complet des messages pour la salle sélectionnée
    const response = await api.get<Message[]>(`/conversations/${conversationId}/messages`);
    return response.data;
  },

  /**
   * Creates or fetches a direct 1-to-1 conversation with a target user.
   * @async
   * @function getOrCreateDirectConversation
   * @param {string} targetUserId - The target conversation identifier
   * @returns {Promise<Conversation>} Array of chronological messages
   */
  async getOrCreateDirectConversation(targetUserId: string): Promise<Conversation> {
    const response = await api.post<Conversation>("/conversations/direct", { targetUserId });
    return response.data;
  },

  /**
   * Leaves a specific conversation for the authenticated user.
   *
   * @async
   * @function leaveConversation
   * @param {string} conversationId - The identifier of the conversation to leave
   * @returns {Promise<void>}
   */
  async leaveConversation(conversationId: string): Promise<void> {
    await api.delete(`/conversations/${conversationId}/leave`);
  },
};
