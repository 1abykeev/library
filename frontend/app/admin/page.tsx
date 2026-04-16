"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Shell } from "@/components/Shell";
import { Stars } from "@/components/Stars";
import { api } from "@/lib/api";

type TopBook = { id: number; title: string; author: string; count: number; avg_rating: number };
type Stats = {
  total_books: number;
  available_books: number;
  total_borrows: number;
  active_borrows: number;
  total_categories: number;
  avg_rating: number;
  top_books: TopBook[];
};
type ClientRow = {
  borrow_id: number;
  name: string;
  surname: string;
  phone: string | null;
  email: string | null;
  book_id: number;
  book_title: string;
  borrow_date: string;
  return_date: string | null;
  rating: number | null;
  active: boolean;
};

export default function AdminDashboard() {
  return (
    <Shell adminOnly>
      <Dashboard />
    </Shell>
  );
}

function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "returned">("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    api<Stats>("/stats/dashboard").then(setStats).catch(() => {});
    api<ClientRow[]>("/stats/clients").then(setClients).catch(() => {});
  }, []);

  const filtered = clients
    .filter((c) => (filter === "active" ? c.active : filter === "returned" ? !c.active : true))
    .filter((c) => {
      if (!q) return true;
      const s = q.toLowerCase();
      return (
        c.name.toLowerCase().includes(s) ||
        c.surname.toLowerCase().includes(s) ||
        c.book_title.toLowerCase().includes(s) ||
        (c.phone || "").includes(s)
      );
    });

  return (
    <div>
      <h1 className="font-display text-4xl font-bold">Панель администратора</h1>
      <p className="mt-1 text-ink-600">Обзор библиотеки и журнал читателей.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Всего книг" value={stats?.total_books ?? "…"} hint={`${stats?.available_books ?? 0} доступно`} />
        <StatCard label="Активных выдач" value={stats?.active_borrows ?? "…"} hint={`из ${stats?.total_borrows ?? 0} за всё время`} />
        <StatCard label="Категорий" value={stats?.total_categories ?? "…"} />
        <StatCard
          label="Средняя оценка"
          value={stats?.avg_rating ? stats.avg_rating.toFixed(1) : "—"}
          hint="по всем возвратам"
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-display text-xl font-bold">Топ-5 книг</h2>
          <p className="mt-1 text-xs text-ink-600">По числу выдач</p>
          <ul className="mt-4 space-y-3">
            {(stats?.top_books ?? []).map((b, i) => (
              <li key={b.id} className="flex items-center gap-3 rounded-xl bg-ink-50 p-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-ink-900 text-xs font-bold text-white">
                  {i + 1}
                </div>
                <div className="flex-1 overflow-hidden">
                  <Link href={`/books/${b.id}`} className="line-clamp-1 font-medium hover:underline">
                    {b.title}
                  </Link>
                  <div className="line-clamp-1 text-xs text-ink-600">{b.author}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-bold">{b.count}</div>
                  {b.avg_rating > 0 && <Stars value={b.avg_rating} size="sm" />}
                </div>
              </li>
            ))}
            {stats && stats.top_books.length === 0 && (
              <li className="text-center text-sm text-ink-600">Пока нет выдач</li>
            )}
          </ul>
        </div>

        <div className="card p-6 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold">Читатели</h2>
            <input
              placeholder="Поиск по имени, книге, телефону…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="input max-w-xs"
            />
          </div>
          <div className="mt-4 flex gap-2">
            {(["all", "active", "returned"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  filter === f
                    ? "rounded-full bg-ink-900 px-3 py-1.5 text-xs text-white"
                    : "rounded-full border border-ink-200 px-3 py-1.5 text-xs text-ink-600 hover:bg-ink-100"
                }
              >
                {f === "all" ? "Все" : f === "active" ? "На руках" : "Возвращённые"}
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-ink-600">
                <tr>
                  <th className="py-2">Читатель</th>
                  <th className="py-2">Книга</th>
                  <th className="py-2">Выдана</th>
                  <th className="py-2">Возврат</th>
                  <th className="py-2">Оценка</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((c) => (
                  <tr key={c.borrow_id} className="align-top">
                    <td className="py-3">
                      <div className="font-medium">{c.name} {c.surname}</div>
                      {c.phone && <div className="text-xs text-ink-600">{c.phone}</div>}
                    </td>
                    <td className="py-3">
                      <Link href={`/books/${c.book_id}`} className="hover:underline">
                        {c.book_title}
                      </Link>
                    </td>
                    <td className="py-3 whitespace-nowrap text-xs">{fmt(c.borrow_date)}</td>
                    <td className="py-3 whitespace-nowrap">
                      {c.active ? (
                        <span className="badge-green">На руках</span>
                      ) : (
                        <span className="text-xs">{c.return_date && fmt(c.return_date)}</span>
                      )}
                    </td>
                    <td className="py-3">
                      {c.rating ? <Stars value={c.rating} size="sm" /> : <span className="text-xs text-ink-600">—</span>}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-ink-600">
                      Нет записей
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wide text-ink-600">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-600">{hint}</div>}
    </div>
  );
}

function fmt(d: string) {
  return new Date(d).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
