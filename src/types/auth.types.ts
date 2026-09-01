// src/types/auth.types.ts
import type { User } from "./user.types";

export interface LoginCredentials {
  email: string;
  passwordHash: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  passwordHash: string;
}

export interface AuthResponse {
  user: User;
  token?: string; // à voir à l'usage sinon gérer par les cookies
}
