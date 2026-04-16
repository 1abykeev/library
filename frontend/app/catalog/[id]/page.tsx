"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PublicShell } from "@/components/PublicShell";
import { Stars } from "@/components/Stars";
import { Book, BookReview, api, mediaUrl } from "@/lib/api";

export default function PublicBookPage() {
  const params = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<BookReview[]>([]);

  useEffect(() => {
    api<Book>(`/books/${params.id}`, { auth: false }).then(setBook).catch(() => {});
    api<BookReview[]>(`/stats/books/${params.id}/reviews`, { auth: false })
      .then(setReviews)
      .catch(() => {});
  }, [params.id]);

  if (!book) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-6xl px-6 py-16 text-ink-600">Загрузка…</div>
      </PublicShell>
    );
  }

  const cover = mediaUrl(book.cover_url);
  const pdf = mediaUrl(book.pdf_url);
  const isFree = book.category?.slug === "free-books";

  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <Link href="/catalog" className="text-sm text-ink-600 hover:text-ink-900">
          ← Назад в каталог
        </Link>
        <div className="mt-6 grid gap-10 md:grid-cols-[320px_1fr]">
          <div>
            <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-ink-100 shadow-card">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt={book.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-6 text-center font-display text-xl text-ink-600">
                  {book.title}
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {isFree && pdf ? (
                <>
                  <a href={pdf} target="_blank" rel="noopener noreferrer" className="btn-accent w-full">
                    Читать
                  </a>
                  <a href={pdf} download className="btn-primary w-full">
                    Скачать PDF
                  </a>
                </>
              ) : (
                <Link href="/login" className="btn-primary w-full">
                  Войдите, чтобы читать
                </Link>
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {book.category && <span className="badge-gray">{book.category.name}</span>}
              <span className={book.available ? "badge-green" : "badge-red"}>
                {book.available ? "Доступна" : "Выдана"}
              </span>
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight">
              {book.title}
            </h1>
            <p className="mt-2 text-lg text-ink-600">{book.author}</p>
            <div className="mt-3">
              <Stars value={book.avg_rating} count={book.rating_count} size="lg" />
            </div>
            <div className="mt-6 grid max-w-sm grid-cols-2 gap-4 rounded-2xl bg-white p-5 shadow-card">
              <div>
                <div className="text-xs text-ink-600">Год</div>
                <div className="font-medium">{book.published_year}</div>
              </div>
              <div>
                <div className="text-xs text-ink-600">ID</div>
                <div className="font-medium">#{book.id}</div>
              </div>
            </div>
            {book.description && (
              <div className="mt-8">
                <h2 className="font-display text-xl font-bold">Описание</h2>
                <p className="mt-2 whitespace-pre-line leading-relaxed text-ink-600">
                  {book.description}
                </p>
              </div>
            )}

            <div className="mt-10">
              <h2 className="font-display text-xl font-bold">Отзывы читателей</h2>
              {reviews.length === 0 ? (
                <p className="mt-2 text-ink-600">Пока никто не оставил отзыв.</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {reviews.map((r, i) => (
                    <li key={i} className="card p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {r.borrower_name} {r.borrower_surname}
                        </div>
                        <Stars value={r.rating} size="sm" />
                      </div>
                      {r.review && (
                        <p className="mt-2 text-sm text-ink-600">{r.review}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
