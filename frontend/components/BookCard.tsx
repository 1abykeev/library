"use client";

import Link from "next/link";

import { Book, mediaUrl } from "@/lib/api";
import { Stars } from "./Stars";

export function BookCard({ book }: { book: Book }) {
  const cover = mediaUrl(book.cover_url);
  return (
    <Link
      href={`/books/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={book.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-100 to-ink-200 p-6 text-center font-display text-lg text-ink-600">
            {book.title}
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span className={book.available ? "badge-green" : "badge-red"}>
            {book.available ? "Доступна" : "Выдана"}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 font-display text-base font-bold leading-snug">
          {book.title}
        </h3>
        <p className="text-sm text-ink-600">{book.author}</p>
        {book.rating_count > 0 ? (
          <div className="pt-1">
            <Stars value={book.avg_rating} count={book.rating_count} size="sm" />
          </div>
        ) : (
          <div className="pt-1 text-xs text-ink-600">Без оценок</div>
        )}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-ink-600">
          <span>{book.published_year}</span>
          {book.category && (
            <span className="badge-gray">{book.category.name}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
