import { apiFetch } from "@/services/api";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";

export const authService = {
  login(body: LoginRequest) {
    return apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  register(body: RegisterRequest) {
    return apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};
