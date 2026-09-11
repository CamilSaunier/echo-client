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
  typingUsers: Record<string, boolean>; // Stocke l'état de frappe par userId (ex: { [userId]: true })

  fetchConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  startDirectConversation: (targetUserId: string) => Promise<void>;
  leaveConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: Message) => void;

  // Actions pour l'indicateur de frappe
  setTyping: (userId: string, isTyping: boolean) => void;
  sendTypingStatus: (conversationId: string, isTyping: boolean) => void;

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
  typingUsers: {},

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
    set({ activeConversationId: conversationId, isLoading: true, error: null, typingUsers: {} });
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
   * Starts or opens an existing direct conversation with a friend.
   *
   * @param targetUserId - The unique identifier of the target user/friend
   */
  startDirectConversation: async (targetUserId: string) => {
    set({ isLoading: true, error: null });
    try {
      const conversation = await conversationService.getOrCreateDirectConversation(targetUserId);

      const { conversations } = get();
      const exists = conversations.some((c) => c.id === conversation.id);

      if (!exists) {
        set({ conversations: [conversation, ...conversations] });
      }

      // Rejoint la room Socket.io pour la réception temps réel
      const socket = socketService.socket;
      if (socket?.connected) {
        socket.emit("conversation:join", { conversationId: conversation.id });
      }

      // Active la conversation et récupère son historique
      await get().selectConversation(conversation.id);
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Erreur lors de l'ouverture de la conversation.",
        isLoading: false,
      });
    }
  },

  /**
   * Leaves a specified conversation thread and resets local state if active.
   *
   * @param conversationId - The unique identifier of the target conversation
   */
  leaveConversation: async (conversationId: string) => {
    set({ isLoading: true, error: null });
    try {
      await conversationService.leaveConversation(conversationId);

      const socket = socketService.socket;
      if (socket?.connected) {
        socket.emit("conversation:leave", { conversationId });
      }

      const { conversations, activeConversationId, messages } = get();
      const isCurrentActive = activeConversationId === conversationId;

      set({
        conversations: conversations.filter((c) => c.id !== conversationId),
        activeConversationId: isCurrentActive ? null : activeConversationId,
        messages: isCurrentActive ? [] : messages,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Erreur lors de la sortie de la conversation.",
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

      // Arrêt immédiat de l'indicateur de frappe lors de l'envoi
      get().sendTypingStatus(activeConversationId, false);

      if (socket?.connected) {
        socket.emit("message:send", { content, conversationId: activeConversationId });
      } else {
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
      const exists = messages.some((m) => m.id === newMessage.id);
      if (!exists) {
        set({ messages: [...messages, newMessage] });
      }
    }

    const conversationExists = conversations.some((c) => c.id === newMessage.conversationId);

    if (!conversationExists) {
      get().fetchConversations();
      return;
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
   * Met à jour l'état de frappe d'un utilisateur spécifique.
   */
  setTyping: (userId: string, isTyping: boolean) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [userId]: isTyping,
      },
    }));
  },

  /**
   * Émet l'événement de frappe au serveur WebSocket.
   */
  sendTypingStatus: (conversationId: string, isTyping: boolean) => {
    const socket = socketService.socket;
    if (socket?.connected) {
      socket.emit("typing", { conversationId, isTyping });
    }
  },

  /**
   * Registers real-time WebSocket event listeners for incoming message broadcasting and typing status.
   */
  initSocketListeners: () => {
    const socket = socketService.socket;
    if (!socket) return;

    socket.off("message:received");
    socket.off("user:typing");

    socket.on("message:received", (message: Message) => {
      get().addMessage(message);
    });

    socket.on("user:typing", ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      get().setTyping(userId, isTyping);
    });
  },

  /**
   * Unregisters WebSocket event listeners on component unmount or store reset.
   */
  cleanupSocketListeners: () => {
    const socket = socketService.socket;
    if (socket) {
      socket.off("message:received");
      socket.off("user:typing");
    }
  },
}));
