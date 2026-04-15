"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { PublicShell } from "@/components/PublicShell";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api("/auth/register", {
        method: "POST",
        body: { full_name: fullName, email, password },
        auth: false,
      });
      router.replace("/login");
    } catch (err: any) {
      setError(err.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicShell>
      <section className="mx-auto flex max-w-md flex-col px-6 py-16">
        <div className="card p-8">
          <h1 className="font-display text-3xl font-bold">Регистрация</h1>
          <p className="mt-1 text-sm text-ink-600">
            Создайте аккаунт, чтобы получить доступ к каталогу.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Полное имя</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иван Иванов"
                className="input"
              />
            </div>
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="input"
              />
            </div>
            {error && (
              <div className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
            <button disabled={loading} className="btn-primary w-full text-base">
              {loading ? "Создаём…" : "Зарегистрироваться"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-600">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="font-medium text-ink-900 underline">
              Войти
            </Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
