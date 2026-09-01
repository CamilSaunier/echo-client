import type { User } from "./user.types";

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  conversationId: string;
  user?: User;
}
