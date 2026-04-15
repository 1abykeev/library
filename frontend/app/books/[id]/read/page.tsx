"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Book, api, mediaUrl } from "@/lib/api";
import { useCurrentUser } from "@/lib/auth";

export default function ReadPage() {
  useCurrentUser({ required: true });
  const params = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
    api<Book>(`/books/${params.id}`).then(setBook).catch(() => {});
  }, [params.id]);

  const pdf = mediaUrl(book?.pdf_url);

  return (
    <div className="flex h-screen flex-col bg-ink-900 text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-3">
        <Link href={`/books/${params.id}`} className="text-sm text-white/70 hover:text-white">
          ← {book?.title || "Назад"}
        </Link>
        <div className="text-sm text-white/70">{book?.author}</div>
      </header>
      <div className="flex-1">
        {pdf ? (
          <iframe
            src={pdf}
            title={book?.title}
            className="h-full w-full border-0 bg-white"
          />
        ) : (
          <div className="grid h-full place-items-center text-white/70">
            PDF недоступен
          </div>
        )}
      </div>
    </div>
  );
}
