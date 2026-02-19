"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { authService } from "@/services/auth.service";
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "@/types/auth";
import { getErrorMessage } from "@/utils/errors";

const STORAGE_KEY = "gameboxd.auth";

function looksLikeJwt(token: string) {
  const trimmed = token.trim();
  if (!trimmed) return false;
  const parts = trimmed.split(".");
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

function readStoredAuth(): AuthResponse | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthResponse;
    const token = (parsed as any)?.token;
    if (typeof token !== "string" || !looksLikeJwt(token)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function storeAuth(value: AuthResponse | null) {
  if (typeof window === "undefined") return;
  if (!value) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function useAuth() {
  const [data, setData] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(readStoredAuth());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      setData(null);
      storeAuth(null);
    };
    window.addEventListener("gameboxd:auth:logout", handler);
    return () => {
      window.removeEventListener("gameboxd:auth:logout", handler);
    };
  }, []);

  const user: AuthUser | null = data?.user ?? null;
  const token = data?.token ?? null;

  const login = useCallback(async (body: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.login(body);
      setData(result);
      storeAuth(result);
      return result;
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.register(body);
      setData(result);
      storeAuth(result);
      return result;
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setData(null);
    storeAuth(null);
  }, []);

  return useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      error,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, error, login, register, logout],
  );
}
