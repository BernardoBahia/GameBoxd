export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export type ApiFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  token?: string;
};

function notifyInvalidAuth() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("gameboxd:auth:logout"));
}

function normalizeToken(token: string) {
  const stripQuotes = (value: string) =>
    value
      .trim()
      .replace(/^"(.*)"$/, "$1")
      .replace(/^'(.*)'$/, "$1")
      .trim();

  const trimmed = stripQuotes(token);
  if (!trimmed) return "";

  const withoutBearer = trimmed.replace(/^Bearer\s+/i, "");
  return stripQuotes(withoutBearer);
}

function getBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  return trimmed ? trimmed : "http://localhost:3001";
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}) {
  const url = path.startsWith("http") ? path : `${getBaseUrl()}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  if (options.token) {
    const token = normalizeToken(options.token);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();

  let data: unknown = undefined;
  if (text) {
    const trimmedText = text.trim();
    const looksLikeJson =
      contentType.includes("application/json") ||
      trimmedText.startsWith("{") ||
      trimmedText.startsWith("[");

    if (looksLikeJson) {
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        data = text;
      }
    } else {
      data = text;
    }
  }

  if (!response.ok) {
    const message = (() => {
      if (typeof data === "string") return data;
      if (data && typeof data === "object") {
        const maybe = data as Record<string, unknown>;
        const error = maybe.error;
        if (typeof error === "string" && error.trim()) return error;
        const msg = maybe.message;
        if (typeof msg === "string" && msg.trim()) return msg;
      }
      return response.statusText;
    })();

    if (
      response.status === 401 &&
      options.token &&
      /token\s+inv[aá]lido|token\s+n[aã]o\s+fornecido|usu[aá]rio\s+n[aã]o\s+encontrado/i.test(
        String(message),
      )
    ) {
      notifyInvalidAuth();
    }
    throw new ApiError(String(message), response.status, data);
  }

  return data as T;
}
