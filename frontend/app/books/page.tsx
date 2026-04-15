"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BookCard } from "@/components/BookCard";
import { Shell } from "@/components/Shell";
import { Book, Category, api } from "@/lib/api";
import { useCurrentUser } from "@/lib/auth";

export default function BooksPage() {
  return (
    <Shell>
      <BooksContent />
    </Shell>
  );
}

function BooksContent() {
  const { user } = useCurrentUser({ required: true });
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (categoryId) p.set("category_id", String(categoryId));
    return p.toString();
  }, [q, categoryId]);

  useEffect(() => {
    api<Category[]>("/categories").then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api<Book[]>(`/books${params ? `?${params}` : ""}`)
        .then(setBooks)
        .catch(() => setBooks([]))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [params]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Каталог книг</h1>
          <p className="mt-1 text-ink-600">
            Всего книг: <span className="font-medium text-ink-900">{books.length}</span>
          </p>
        </div>
        {user?.role === "admin" && (
          <Link href="/admin/books/new" className="btn-accent">
            + Добавить книгу
          </Link>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          placeholder="Поиск по названию или автору…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input max-w-sm"
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryId(null)}
          className={
            categoryId === null
              ? "rounded-full bg-ink-900 px-3 py-1.5 text-sm text-white"
              : "rounded-full border border-ink-200 px-3 py-1.5 text-sm text-ink-600 hover:bg-ink-100"
          }
        >
          Все
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryId(c.id)}
            className={
              categoryId === c.id
                ? "rounded-full bg-ink-900 px-3 py-1.5 text-sm text-white"
                : "rounded-full border border-ink-200 px-3 py-1.5 text-sm text-ink-600 hover:bg-ink-100"
            }
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-ink-600">Загрузка…</div>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 py-20 text-center text-ink-600">
          Книг не найдено
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      )}
    </div>
  );
}
