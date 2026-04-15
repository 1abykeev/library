"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { PublicShell } from "@/components/PublicShell";
import { api, setStoredUser, setToken, User } from "@/lib/api";

type LoginResp = { access_token: string; token_type: string; user: User };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api<LoginResp>("/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
      });
      setToken(data.access_token);
      setStoredUser(data.user);
      router.replace("/books");
    } catch (err: any) {
      setError(err.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicShell>
      <section className="mx-auto flex max-w-md flex-col px-6 py-16">
        <div className="card p-8">
          <h1 className="font-display text-3xl font-bold">Вход</h1>
          <p className="mt-1 text-sm text-ink-600">
            Введите email и пароль, чтобы продолжить.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Пароль</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
              />
            </div>
            {error && (
              <div className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
            <button
              disabled={loading}
              className="btn-primary w-full text-base"
              type="submit"
            >
              {loading ? "Входим…" : "Войти"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-600">
            Нет аккаунта?{" "}
            <Link href="/register" className="font-medium text-ink-900 underline">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
