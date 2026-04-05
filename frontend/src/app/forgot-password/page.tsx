"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";

function getBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  return typeof raw === "string" && raw.trim() ? raw.trim() : "http://localhost:3001";
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`${getBaseUrl()}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data?.error ?? "Erro ao enviar e-mail. Tente novamente.");
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch {
      setErrorMsg("Não foi possível conectar ao servidor.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-4 py-12">
        <AuthCard
          title="E-mail enviado"
          description="Verifique sua caixa de entrada."
        >
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Se o endereço <span className="text-zinc-200">{email}</span> estiver cadastrado,
              você receberá um link para redefinir sua senha em instantes.
            </p>
            <p className="text-xs text-zinc-500">
              Não recebeu? Verifique o spam ou{" "}
              <button
                className="text-zinc-400 underline underline-offset-2 hover:text-zinc-200"
                onClick={() => setStatus("idle")}
              >
                tente novamente
              </button>
              .
            </p>
            <AuthButton asChild variant="secondary">
              <Link href="/login">Voltar para o login</Link>
            </AuthButton>
          </div>
        </AuthCard>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-4 py-12">
      <AuthCard
        title="Esqueceu a senha?"
        description="Informe seu e-mail e enviaremos um link para redefinição."
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <AuthInput
            label="E-mail"
            type="email"
            placeholder="voce@exemplo.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="pt-2">
            <AuthButton type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Enviando..." : "Enviar link"}
            </AuthButton>
          </div>

          {status === "error" && (
            <p className="text-sm text-red-400" role="alert">
              {errorMsg}
            </p>
          )}

          <AuthButton asChild variant="secondary">
            <Link href="/login">Voltar para o login</Link>
          </AuthButton>
        </form>
      </AuthCard>
    </main>
  );
}
