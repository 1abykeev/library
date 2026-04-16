"use client";

import { useEffect, useState } from "react";

import { Shell } from "@/components/Shell";
import { Stars, StarInput } from "@/components/Stars";
import { Book, Borrow, api } from "@/lib/api";

export default function BorrowPage() {
  return (
    <Shell adminOnly>
      <Content />
    </Shell>
  );
}

function Content() {
  const [rows, setRows] = useState<Borrow[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [returning, setReturning] = useState<Borrow | null>(null);

  async function load() {
    const r = await api<Borrow[]>("/borrow");
    setRows(r);
  }

  useEffect(() => {
    load().catch(() => {});
    api<Book[]>("/books").then(setBooks).catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Выдачи</h1>
          <p className="mt-1 text-ink-600">
            Журнал выдач книг. Оценка ставится при возврате.
          </p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="btn-accent">
          {showForm ? "Отмена" : "+ Выдать книгу"}
        </button>
      </div>

      {showForm && (
        <IssueForm
          books={books.filter((b) => b.available)}
          onDone={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Читатель</th>
                <th className="px-4 py-3">Контакты</th>
                <th className="px-4 py-3">Книга</th>
                <th className="px-4 py-3">Выдана</th>
                <th className="px-4 py-3">Возврат</th>
                <th className="px-4 py-3">Оценка</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((b) => (
                <tr key={b.id} className="text-sm align-top">
                  <td className="px-4 py-3 font-mono text-ink-600">#{b.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{b.borrower_name} {b.borrower_surname}</div>
                    {b.borrower_passport && (
                      <div className="text-xs text-ink-600">Паспорт: {b.borrower_passport}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div>{b.borrower_phone}</div>
                    {b.borrower_email && (
                      <div className="text-xs text-ink-600">{b.borrower_email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{b.book.title}</div>
                    <div className="text-xs text-ink-600">{b.book.author}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{fmt(b.borrow_date)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {b.return_date ? (
                      fmt(b.return_date)
                    ) : (
                      <span className="badge-green">Активна</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {b.rating ? (
                      <div>
                        <Stars value={b.rating} size="sm" />
                        {b.review && (
                          <div className="mt-1 max-w-xs text-xs text-ink-600 line-clamp-2">
                            {b.review}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-ink-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!b.return_date && (
                      <button
                        onClick={() => setReturning(b)}
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
                  <td colSpan={8} className="px-4 py-12 text-center text-ink-600">
                    Записей о выдачах нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {returning && (
        <ReturnModal
          borrow={returning}
          onClose={() => setReturning(null)}
          onDone={() => {
            setReturning(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ReturnModal({
  borrow,
  onClose,
  onDone,
}: {
  borrow: Borrow;
  onClose: () => void;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api(`/borrow/${borrow.id}/return`, {
        method: "POST",
        body: {
          rating: rating || null,
          review: review || null,
        },
      });
      onDone();
    } catch (e: any) {
      setError(e.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-2xl font-bold">Возврат книги</h2>
        <p className="mt-1 text-sm text-ink-600">
          «{borrow.book.title}» — {borrow.borrower_name} {borrow.borrower_surname}
        </p>
        <p className="mt-4 text-sm text-ink-600">
          Спросите читателя, как ему книга, и поставьте оценку:
        </p>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-ink-50 p-5">
            <StarInput value={rating} onChange={setRating} />
            <div className="text-xs text-ink-600">
              {rating === 0 ? "Без оценки" : `${rating} из 5`}
            </div>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Отзыв (опционально)</span>
            <textarea
              rows={3}
              className="input"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Слова читателя о книге…"
            />
          </label>
          {error && (
            <div className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-outline">
              Отмена
            </button>
            <button disabled={loading} className="btn-primary">
              {loading ? "…" : "Подтвердить возврат"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function IssueForm({ books, onDone }: { books: Book[]; onDone: () => void }) {
  const [bookId, setBookId] = useState<number | null>(books[0]?.id ?? null);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [passport, setPassport] = useState("");
  const [note, setNote] = useState("");
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
        body: {
          book_id: bookId,
          borrower_name: name,
          borrower_surname: surname,
          borrower_phone: phone,
          borrower_email: email || null,
          borrower_passport: passport || null,
          note: note || null,
        },
      });
      onDone();
    } catch (e: any) {
      setError(e.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card mb-6 grid gap-4 p-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Книга</label>
        <select
          className="input"
          value={bookId ?? ""}
          onChange={(e) => setBookId(Number(e.target.value))}
        >
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title} — {b.author}
            </option>
          ))}
          {books.length === 0 && <option>Нет доступных книг</option>}
        </select>
      </div>
      <Field label="Имя">
        <input required className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван" />
      </Field>
      <Field label="Фамилия">
        <input required className="input" value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Иванов" />
      </Field>
      <Field label="Телефон">
        <input required className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+996 700 000 000" />
      </Field>
      <Field label="Email (опционально)">
        <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </Field>
      <Field label="Паспорт / ID (опционально)">
        <input className="input" value={passport} onChange={(e) => setPassport(e.target.value)} placeholder="AN1234567" />
      </Field>
      <Field label="Заметка">
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="—" />
      </Field>
      {error && (
        <div className="md:col-span-2 rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      <div className="md:col-span-2 flex gap-3">
        <button disabled={loading || !bookId} className="btn-primary">
          {loading ? "Выдаём…" : "Выдать книгу"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
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
