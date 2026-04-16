"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PublicShell } from "@/components/PublicShell";
import { Stars } from "@/components/Stars";
import { Book, Category, api, mediaUrl } from "@/lib/api";

export default function PublicCatalog() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (categoryId) p.set("category_id", String(categoryId));
    return p.toString();
  }, [q, categoryId]);

  useEffect(() => {
    api<Category[]>("/categories", { auth: false }).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api<Book[]>(`/books${qs ? `?${qs}` : ""}`, { auth: false })
        .then(setBooks)
        .catch(() => setBooks([]))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [qs]);

  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="badge-gray">Публичный каталог</span>
            <h1 className="mt-2 font-display text-4xl font-bold">Каталог книг</h1>
            <p className="mt-1 text-ink-600">Найдено: {books.length}</p>
          </div>
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
                : "rounded-full border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-600 hover:bg-ink-100"
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
                  : "rounded-full border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-600 hover:bg-ink-100"
              }
            >
              {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-ink-600">Загрузка…</div>
        ) : books.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white py-20 text-center text-ink-600">
            Книг не найдено
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {books.map((b) => {
              const cover = mediaUrl(b.cover_url);
              return (
                <Link
                  key={b.id}
                  href={`/catalog/${b.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink-100">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt={b.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-6 text-center font-display text-lg text-ink-600">
                        {b.title}
                      </div>
                    )}
                    <div className="absolute left-3 top-3">
                      <span className={b.available ? "badge-green" : "badge-red"}>
                        {b.available ? "Доступна" : "Выдана"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <h3 className="line-clamp-2 font-display text-base font-bold">
                      {b.title}
                    </h3>
                    <p className="text-sm text-ink-600">{b.author}</p>
                    {b.rating_count > 0 && (
                      <div className="pt-1">
                        <Stars value={b.avg_rating} count={b.rating_count} size="sm" />
                      </div>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2 text-xs text-ink-600">
                      <span>{b.published_year}</span>
                      {b.category && <span className="badge-gray">{b.category.name}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </PublicShell>
  );
}
