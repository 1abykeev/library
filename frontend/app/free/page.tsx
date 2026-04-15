"use client";

import { useEffect, useState } from "react";

import { PublicShell } from "@/components/PublicShell";
import { Book, Category, api, mediaUrl } from "@/lib/api";

export default function FreeBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const cats = await api<Category[]>("/categories", { auth: false });
        const free = cats.find((c) => c.slug === "free-books");
        if (!free) {
          setBooks([]);
          return;
        }
        const list = await api<Book[]>(`/books?category_id=${free.id}`, { auth: false });
        setBooks(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <span className="badge-gray">Свободный доступ</span>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
            Бесплатные книги
          </h1>
          <p className="mt-2 max-w-xl text-ink-600">
            Коллекция книг, которые можно читать и скачивать без регистрации.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-ink-600">Загрузка…</div>
        ) : books.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white py-20 text-center text-ink-600">
            Пока нет бесплатных книг
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {books.map((b) => {
              const cover = mediaUrl(b.cover_url);
              const pdf = mediaUrl(b.pdf_url);
              return (
                <div key={b.id} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-card">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink-100">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt={b.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-6 text-center font-display text-lg text-ink-600">
                        {b.title}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <h3 className="line-clamp-2 font-display text-base font-bold leading-snug">
                      {b.title}
                    </h3>
                    <p className="text-sm text-ink-600">{b.author}</p>
                    <div className="mt-3 flex gap-2">
                      {pdf ? (
                        <>
                          <a href={pdf} target="_blank" rel="noopener noreferrer" className="btn-outline flex-1">
                            Читать
                          </a>
                          <a href={pdf} download className="btn-accent flex-1">
                            Скачать
                          </a>
                        </>
                      ) : (
                        <span className="text-xs text-ink-600">PDF скоро</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </PublicShell>
  );
}
