"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-ink-900 to-ink-600 p-12 text-white md:flex md:flex-col md:justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-sm font-bold text-ink-900">
            Б
          </span>
          <span className="font-display text-lg font-bold">Библиотека</span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight">
            Добро пожаловать обратно.
          </h2>
          <p className="mt-3 max-w-sm text-ink-100/80">
            Войдите, чтобы продолжить чтение и управлять выдачами.
          </p>
        </div>
        <div className="text-xs text-ink-100/60">© Библиотека университета</div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
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
      </div>
    </div>
  );
}
