"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthButton } from "@/components/auth/AuthButton";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, isAuthenticated } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordMismatch = useMemo(() => {
    if (!confirmPassword) return false;
    return password !== confirmPassword;
  }, [password, confirmPassword]);

  useEffect(() => {
    if (isAuthenticated) router.replace("/games");
  }, [isAuthenticated, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);
    if (passwordMismatch) return;

    try {
      await register({ name, email, password });
      setSuccess(true);
      router.replace("/games");
    } catch {
      // handled by hook error
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-4 py-12">
      <AuthCard
        title="Criar conta"
        description="Crie seu perfil e comece a organizar seus jogos."
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <AuthInput
            label="Nome"
            placeholder="Seu nome"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            autoComplete="new-password"
            hint="Use pelo menos 8 caracteres."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <AuthInput
            label="Confirmar senha"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            hint={passwordMismatch ? "As senhas não conferem." : undefined}
          />

          <div className="pt-2">
            <AuthButton type="submit" disabled={isLoading || passwordMismatch}>
              {isLoading ? "Criando..." : "Criar conta"}
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
              <Link href="/login">Já tenho conta</Link>
            </AuthButton>
            <p className="text-center text-xs text-zinc-500">
              Ao criar sua conta, você já entra automaticamente.
            </p>
          </div>
        </form>
      </AuthCard>
    </main>
  );
}
