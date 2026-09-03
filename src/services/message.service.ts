// src/services/message.service.ts
import { api } from "./api.service";
import type { Message } from "../types/message.types";

export const messageService = {
  /**
   * Retrieves all messages from the server.
   *
   * @async
   * @function getMessages
   * @returns {Promise<Message[]>} A promise that resolves to an array of messages
   * @throws {AxiosError} If the network request fails
   */
  async getMessages(): Promise<Message[]> {
    // Appel HTTP GET vers l'API pour récupérer la liste des messages
    const response = await api.get<Message[]>("/messages");
    return response.data;
  },

  /**
   * Sends a new message to a specific conversation via HTTP.
   *
   * @async
   * @function sendMessage
   * @param {string} content - The text content of the message
   * @param {string} conversationId - The unique identifier of the target conversation
   * @returns {Promise<Message>} A promise that resolves to the newly created message object
   * @throws {AxiosError} If validation fails or the user is unauthorized
   */
  async sendMessage(content: string, conversationId: string): Promise<Message> {
    // Appel HTTP POST pour envoyer et persister un nouveau message en base de données
    const response = await api.post<Message>("/messages", {
      content,
      conversationId,
    });
    return response.data;
  },
};
