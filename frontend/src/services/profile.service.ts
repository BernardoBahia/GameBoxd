import { apiFetch } from "@/services/api";
import type { MeResponse, UserStatsResponse } from "@/types/profile";

function getBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  return typeof raw === "string" && raw.trim() ? raw.trim() : "http://localhost:3001";
}

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
  async uploadAvatar(file: File, token: string): Promise<MeResponse> {
    const form = new FormData();
    form.append("avatar", file);
    const res = await fetch(`${getBaseUrl()}/me/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? "Erro ao enviar avatar");
    return data as MeResponse;
  },
  getAvatarUrl(avatarPath: string | null | undefined): string | null {
    if (!avatarPath) return null;
    if (avatarPath.startsWith("http")) return avatarPath;
    return `${getBaseUrl()}${avatarPath}`;
  },
};
