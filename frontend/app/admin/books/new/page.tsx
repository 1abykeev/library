"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Shell } from "@/components/Shell";
import { Book, Category, api } from "@/lib/api";

export default function NewBookPage() {
  return (
    <Shell adminOnly>
      <Form />
    </Shell>
  );
}

function Form() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [cover, setCover] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Category[]>("/categories").then(setCategories).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const book = await api<Book>("/books", {
        method: "POST",
        body: {
          title,
          author,
          published_year: year,
          description: description || null,
          category_id: categoryId || null,
        },
      });
      if (cover) {
        const fd = new FormData();
        fd.append("file", cover);
        await api(`/books/${book.id}/cover`, { method: "POST", formData: fd });
      }
      if (pdf) {
        const fd = new FormData();
        fd.append("file", pdf);
        await api(`/books/${book.id}/pdf`, { method: "POST", formData: fd });
      }
      router.replace(`/books/${book.id}`);
    } catch (e: any) {
      setError(e.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold">Новая книга</h1>
      <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
        <Field label="Название">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
        </Field>
        <Field label="Автор">
          <input required value={author} onChange={(e) => setAuthor(e.target.value)} className="input" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Год издания">
            <input
              type="number"
              required
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Категория">
            <select
              className="input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Обложка (JPG/PNG)">
          <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
        </Field>
        <Field label="PDF-файл книги">
          <input type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files?.[0] ?? null)} />
        </Field>
        {error && (
          <div className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</div>
        )}
        <div className="flex gap-3">
          <button disabled={loading} className="btn-primary">
            {loading ? "Сохраняем…" : "Создать"}
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
