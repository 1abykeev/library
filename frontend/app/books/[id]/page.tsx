"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Shell } from "@/components/Shell";
import { Book, api, mediaUrl } from "@/lib/api";
import { useCurrentUser } from "@/lib/auth";

export default function BookDetailPage() {
  return (
    <Shell>
      <Detail />
    </Shell>
  );
}

function Detail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const { user } = useCurrentUser({ required: true });
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const b = await api<Book>(`/books/${id}`);
      setBook(b);
    } catch (e: any) {
      setError(e.message || "Не удалось загрузить книгу");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function remove() {
    if (!confirm("Удалить книгу?")) return;
    await api(`/books/${id}`, { method: "DELETE" });
    router.replace("/books");
  }

  if (error) return <div className="text-rose-700">{error}</div>;
  if (!book) return <div className="text-ink-600">Загрузка…</div>;

  const cover = mediaUrl(book.cover_url);
  const pdf = mediaUrl(book.pdf_url);

  return (
    <div>
      <Link href="/books" className="text-sm text-ink-600 hover:text-ink-900">
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
            {pdf && (
              <Link href={`/books/${book.id}/read`} className="btn-accent w-full">
                Читать
              </Link>
            )}
            {user?.role === "admin" && (
              <>
                <Link href={`/admin/books/${book.id}`} className="btn-outline w-full">
                  Редактировать
                </Link>
                <button onClick={remove} className="btn-ghost w-full text-rose-700">
                  Удалить
                </button>
              </>
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
          <div className="mt-6 grid max-w-sm grid-cols-2 gap-4 rounded-2xl bg-white p-5 shadow-card">
            <div>
              <div className="text-xs text-ink-600">Год издания</div>
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
        </div>
      </div>
    </div>
  );
}
