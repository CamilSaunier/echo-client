// src/stores/chat.store.ts
import { create } from "zustand";
import { conversationService } from "../services/conversation.service";
import { messageService } from "../services/message.service";
import { socketService } from "../services/socket.service";
import type { Conversation } from "../types/conversation.types";
import type { Message } from "../types/message.types";

/**
 * Interface defining the state and actions for the chat store.
 */
interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;

  fetchConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: Message) => void;
  initSocketListeners: () => void;
  cleanupSocketListeners: () => void;
}

/**
 * Zustand store managing state for active conversations, message threads, and WebSocket integration.
 */
export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoading: false,
  error: null,

  /**
   * Fetches all conversations of the logged-in user from the REST API.
   */
  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const conversations = await conversationService.getConversations();
      set({ conversations, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Erreur lors du chargement des conversations.",
        isLoading: false,
      });
    }
  },

  /**
   * Selects an active conversation thread and loads its chronological message history.
   *
   * @param conversationId - The unique identifier of the target conversation
   */
  selectConversation: async (conversationId: string) => {
    set({ activeConversationId: conversationId, isLoading: true, error: null });
    try {
      const messages = await conversationService.getConversationMessages(conversationId);
      set({ messages, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Erreur lors du chargement des messages.",
        isLoading: false,
      });
    }
  },

  /**
   * Sends a message to the active conversation via WebSocket or falls back to REST API.
   *
   * @param content - The plain text message content
   */
  sendMessage: async (content: string) => {
    const { activeConversationId } = get();
    if (!activeConversationId || !content.trim()) return;

    try {
      const socket = socketService.socket;

      // Si la socket est connectée, on privilégie l'émission en temps réel
      if (socket?.connected) {
        socket.emit("message:send", { content, conversationId: activeConversationId });
      } else {
        // Fallback HTTP REST si la connexion WebSocket est coupée
        const newMessage = await messageService.sendMessage(content, activeConversationId);
        get().addMessage(newMessage);
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Erreur lors de l'envoi du message." });
    }
  },

  /**
   * Appends an incoming message to the current thread and updates the conversation preview.
   *
   * @param newMessage - The new message payload from HTTP or WebSocket
   */
  addMessage: (newMessage: Message) => {
    const { activeConversationId, messages, conversations } = get();

    if (newMessage.conversationId === activeConversationId) {
      // Évite d'ajouter deux fois un message avec le même ID
      const exists = messages.some((m) => m.id === newMessage.id);
      if (!exists) {
        set({ messages: [...messages, newMessage] });
      }
    }

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === newMessage.conversationId) {
        return {
          ...conv,
          messages: [newMessage],
        };
      }
      return conv;
    });

    set({ conversations: updatedConversations });
  },

  /**
   * Registers real-time WebSocket event listeners for incoming message broadcasting.
   */
  initSocketListeners: () => {
    const socket = socketService.socket;
    if (!socket) return;

    // Suppression de l'écouteur précédent pour éviter l'accumulation de doublons
    socket.off("message:received");

    // Réception du message diffusé par le serveur
    socket.on("message:received", (message: Message) => {
      get().addMessage(message);
    });
  },

  /**
   * Unregisters WebSocket event listeners on component unmount or store reset.
   */
  cleanupSocketListeners: () => {
    const socket = socketService.socket;
    if (socket) {
      socket.off("message:received");
    }
  },
}));
