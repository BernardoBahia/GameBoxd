import { apiFetch } from "@/services/api";
import type { MeResponse, UserStatsResponse } from "@/types/profile";

export const profileService = {
  getMe(token: string) {
    return apiFetch<MeResponse>("/me", { token });
  },
  updateBio(bio: string | null, token: string) {
    return apiFetch<MeResponse>("/me", {
      method: "PATCH",
      body: JSON.stringify({ bio }),
      token,
    });
  },
  getUserStats(userId: string, token?: string) {
    return apiFetch<UserStatsResponse>(`/users/${userId}/stats`, { token });
  },
};
