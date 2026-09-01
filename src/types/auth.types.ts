// src/types/auth.types.ts
import type { User } from "./user.types";

export interface LoginCredentials {
  email: string;
  password: string; // Le mot de passe en clair envoyé au back
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string; // Le mot de passe en clair envoyé au back
}

export interface AuthResponse {
  accessToken: string; // Correspond exactement à ce que renvoie ton AuthClient.login
  user: User;
}
