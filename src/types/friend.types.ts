import type { User } from "./user.types";

export type FriendshipStatus = "PENDING" | "ACCEPTED" | "BLOCKED";

export interface Friendship {
  id: string;
  status: FriendshipStatus;
  createdAt: string;
  userId: string;
  user?: User;
  friendId: string;
  friend?: User;
}
