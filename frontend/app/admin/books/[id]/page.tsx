"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Shell } from "@/components/Shell";
import { Book, Category, api } from "@/lib/api";

export default function EditBookPage() {
  return (
    <Shell adminOnly>
      <Form />
    </Shell>
  );
}

function Form() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<Book>(`/books/${id}`).then(setBook).catch(() => {});
    api<Category[]>("/categories").then(setCategories).catch(() => {});
  }, [id]);

  if (!book) return <div className="text-ink-600">Загрузка…</div>;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!book) return;
    setSaving(true);
    setError(null);
    try {
      await api(`/books/${id}`, {
        method: "PUT",
        body: {
          title: book.title,
          author: book.author,
          published_year: book.published_year,
          description: book.description,
          category_id: book.category?.id ?? null,
        },
      });
      router.replace(`/books/${id}`);
    } catch (e: any) {
      setError(e.message || "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function uploadCover(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const b = await api<Book>(`/books/${id}/cover`, { method: "POST", formData: fd });
    setBook(b);
  }

  async function uploadPdf(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const b = await api<Book>(`/books/${id}/pdf`, { method: "POST", formData: fd });
    setBook(b);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold">Редактировать книгу</h1>
      <form onSubmit={save} className="card mt-6 space-y-4 p-6">
        <Field label="Название">
          <input
            className="input"
            value={book.title}
            onChange={(e) => setBook({ ...book, title: e.target.value })}
          />
        </Field>
        <Field label="Автор">
          <input
            className="input"
            value={book.author}
            onChange={(e) => setBook({ ...book, author: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Год издания">
            <input
              type="number"
              className="input"
              value={book.published_year}
              onChange={(e) => setBook({ ...book, published_year: Number(e.target.value) })}
            />
          </Field>
          <Field label="Категория">
            <select
              className="input"
              value={book.category?.id ?? ""}
              onChange={(e) => {
                const cid = e.target.value ? Number(e.target.value) : null;
                const cat = categories.find((c) => c.id === cid) || null;
                setBook({ ...book, category: cat });
              }}
            >
              <option value="">— не выбрана —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Описание">
          <textarea
            rows={4}
            className="input"
            value={book.description ?? ""}
            onChange={(e) => setBook({ ...book, description: e.target.value })}
          />
        </Field>
        <Field label="Заменить обложку">
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} />
        </Field>
        <Field label="Заменить PDF">
          <input type="file" accept="application/pdf" onChange={(e) => e.target.files?.[0] && uploadPdf(e.target.files[0])} />
        </Field>
        {error && <div className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</div>}
        <div className="flex gap-3">
          <button disabled={saving} className="btn-primary">
            {saving ? "Сохраняем…" : "Сохранить"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-outline">
            Отмена
          </button>
        </div>
      </form>
    </div>
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
