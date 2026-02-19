"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthButton } from "@/components/auth/AuthButton";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/games");
  }, [isAuthenticated, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);

    try {
      await login({ email, password });
      setSuccess(true);
      router.replace("/games");
    } catch {
      // handled by hook error
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-4 py-12">
      <AuthCard
        title="Entrar"
        description="Acesse sua conta para avaliar jogos e publicar reviews."
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <AuthInput
            label="Email"
            type="email"
            placeholder="voce@exemplo.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <AuthInput
            label="Senha"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="pt-2">
            <AuthButton type="submit" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </AuthButton>
          </div>

          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="text-sm text-emerald-400">Sucesso! Redirecionando…</p>
          ) : null}

          <div className="grid gap-2">
            <AuthButton asChild variant="secondary">
              <Link href="/register">Criar conta</Link>
            </AuthButton>
            <p className="text-center text-xs text-zinc-500">
              Ao continuar, você concorda com uma experiência simples, limpa e
              sem distrações.
            </p>
          </div>
        </form>
      </AuthCard>
    </main>
  );
}
