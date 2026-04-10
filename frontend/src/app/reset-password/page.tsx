"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { PasswordChecklist } from "@/components/auth/PasswordChecklist";
import { validatePassword } from "@/utils/password-rules";

function getBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  return typeof raw === "string" && raw.trim() ? raw.trim() : "http://localhost:3001";
}

type TokenStatus = "validating" | "valid" | "invalid";
type FormStatus = "idle" | "loading" | "success" | "error";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("validating");
  const [tokenError, setTokenError] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formError, setFormError] = useState("");

  // Valida o token assim que a página carrega
  useEffect(() => {
    if (!token) {
      setTokenStatus("invalid");
      setTokenError("Link inválido. Solicite um novo.");
      return;
    }

    fetch(`${getBaseUrl()}/auth/reset-password/validate?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setTokenStatus("valid");
        } else {
          setTokenStatus("invalid");
          setTokenError(data.error ?? "Token inválido ou expirado.");
        }
      })
      .catch(() => {
        setTokenStatus("invalid");
        setTokenError("Não foi possível verificar o link.");
      });
  }, [token]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");

    const { valid, errors } = validatePassword(password);
    if (!valid) {
      setFormError(errors.join("; "));
      return;
    }

    if (password !== confirm) {
      setFormError("As senhas não coincidem.");
      return;
    }

    setFormStatus("loading");

    try {
      const res = await fetch(`${getBaseUrl()}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken: token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data?.error ?? "Erro ao redefinir senha.");
        setFormStatus("error");
        return;
      }

      setFormStatus("success");
    } catch {
      setFormError("Não foi possível conectar ao servidor.");
      setFormStatus("error");
    }
  }

  if (tokenStatus === "validating") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-4 py-12">
        <AuthCard title="Verificando link..." description="">
          <div className="flex justify-center py-4">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-200" />
          </div>
        </AuthCard>
      </main>
    );
  }

  if (tokenStatus === "invalid") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-4 py-12">
        <AuthCard title="Link inválido" description="">
          <div className="space-y-4">
            <p className="text-sm text-red-400">{tokenError}</p>
            <AuthButton asChild variant="secondary">
              <Link href="/forgot-password">Solicitar novo link</Link>
            </AuthButton>
          </div>
        </AuthCard>
      </main>
    );
  }

  if (formStatus === "success") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-4 py-12">
        <AuthCard title="Senha redefinida!" description="Sua senha foi alterada com sucesso.">
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Agora você pode entrar com sua nova senha.
            </p>
            <AuthButton asChild variant="secondary">
              <Link href="/login">Ir para o login</Link>
            </AuthButton>
          </div>
        </AuthCard>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-4 py-12">
      <AuthCard
        title="Nova senha"
        description="Escolha uma senha segura para sua conta."
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <AuthInput
              label="Nova senha"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordChecklist password={password} />
          </div>
          <AuthInput
            label="Confirmar senha"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <div className="pt-2">
            <AuthButton type="submit" disabled={formStatus === "loading" || !validatePassword(password).valid || password !== confirm}>
              {formStatus === "loading" ? "Salvando..." : "Redefinir senha"}
            </AuthButton>
          </div>

          {(formStatus === "error" || formError) && (
            <p className="text-sm text-red-400" role="alert">
              {formError}
            </p>
          )}
        </form>
      </AuthCard>
    </main>
  );
}
