"use client";

import { useEffect, useState } from "react";

import { Shell } from "@/components/Shell";
import { Book, Borrow, User, api } from "@/lib/api";
import { useCurrentUser } from "@/lib/auth";

export default function BorrowPage() {
  return (
    <Shell>
      <Content />
    </Shell>
  );
}

function Content() {
  const { user } = useCurrentUser({ required: true });
  const [rows, setRows] = useState<Borrow[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const r = await api<Borrow[]>("/borrow");
    setRows(r);
  }

  useEffect(() => {
    load().catch(() => {});
    api<Book[]>("/books").then(setBooks).catch(() => {});
  }, []);

  async function returnBook(id: number) {
    await api(`/borrow/${id}/return`, { method: "POST" });
    await load();
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Выдачи</h1>
          <p className="mt-1 text-ink-600">
            {user?.role === "admin"
              ? "Все записи о выдачах и возвратах."
              : "Ваши выдачи."}
          </p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="btn-accent">
          {showForm ? "Отмена" : "+ Выдать книгу"}
        </button>
      </div>

      {showForm && user && (
        <IssueForm
          user={user}
          books={books}
          onDone={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-600">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Читатель</th>
              <th className="px-4 py-3">Книга</th>
              <th className="px-4 py-3">Выдана</th>
              <th className="px-4 py-3">Возврат</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((b) => (
              <tr key={b.id} className="text-sm">
                <td className="px-4 py-3 font-mono text-ink-600">#{b.id}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{b.user.full_name}</div>
                  <div className="text-xs text-ink-600">{b.user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{b.book.title}</div>
                  <div className="text-xs text-ink-600">{b.book.author}</div>
                </td>
                <td className="px-4 py-3">{fmt(b.borrow_date)}</td>
                <td className="px-4 py-3">
                  {b.return_date ? (
                    fmt(b.return_date)
                  ) : (
                    <span className="badge-green">Активна</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {!b.return_date && (
                    <button
                      onClick={() => returnBook(b.id)}
                      className="btn-outline"
                    >
                      Вернуть
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-ink-600">
                  Записей о выдачах нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IssueForm({
  user,
  books,
  onDone,
}: {
  user: User;
  books: Book[];
  onDone: () => void;
}) {
  const available = books.filter((b) => b.available);
  const [bookId, setBookId] = useState<number | null>(available[0]?.id ?? null);
  const [userId, setUserId] = useState<number>(user.id);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookId) return;
    setError(null);
    setLoading(true);
    try {
      await api("/borrow", {
        method: "POST",
        body: { user_id: userId, book_id: bookId },
      });
      onDone();
    } catch (e: any) {
      setError(e.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card mb-6 grid gap-4 p-6 md:grid-cols-[1fr_1fr_auto]">
      <div>
        <label className="mb-1 block text-sm font-medium">Книга</label>
        <select
          className="input"
          value={bookId ?? ""}
          onChange={(e) => setBookId(Number(e.target.value))}
        >
          {available.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title} — {b.author}
            </option>
          ))}
          {available.length === 0 && <option>Нет доступных книг</option>}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">ID читателя</label>
        <input
          type="number"
          className="input"
          value={userId}
          disabled={user.role !== "admin"}
          onChange={(e) => setUserId(Number(e.target.value))}
        />
      </div>
      <div className="flex items-end">
        <button disabled={loading || !bookId} className="btn-primary w-full">
          {loading ? "…" : "Выдать"}
        </button>
      </div>
      {error && (
        <div className="md:col-span-3 rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
    </form>
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
