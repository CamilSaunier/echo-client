import type { User } from "./user.types";

export interface ConversationParticipant {
  id: string;
  userId: string;
  conversationId: string;
  joinedAt: string;
  user: User;
}

export interface Conversation {
  id: string;
  name: string | null;
  isGroup: boolean;
  createdAt: string;
  participants: ConversationParticipant[];
}
