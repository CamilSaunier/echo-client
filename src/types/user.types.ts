export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface Friendship {
  id: string;
  status: "PENDING" | "ACCEPTED" | "BLOCKED";
  createdAt: string;
  userId: string;
  friendId: string;
  friend?: User;
  user?: User;
}
