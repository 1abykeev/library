"use client";

import { FormEvent, useEffect, useState } from "react";

import { Shell } from "@/components/Shell";
import { Category, api } from "@/lib/api";

export default function CategoriesPage() {
  return (
    <Shell adminOnly>
      <Content />
    </Shell>
  );
}

function Content() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setItems(await api<Category[]>("/categories"));
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api("/categories", { method: "POST", body: { name } });
      setName("");
      await load();
    } catch (e: any) {
      setError(e.message || "Ошибка");
    }
  }

  async function remove(id: number) {
    if (!confirm("Удалить категорию?")) return;
    await api(`/categories/${id}`, { method: "DELETE" });
    load();
  }

  async function rename(c: Category) {
    const next = prompt("Новое название", c.name);
    if (!next) return;
    await api(`/categories/${c.id}`, { method: "PUT", body: { name: next } });
    load();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold">Категории</h1>
      <form onSubmit={create} className="mt-6 flex gap-3">
        <input
          required
          className="input"
          placeholder="Название категории"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn-primary">Добавить</button>
      </form>
      {error && (
        <div className="mt-3 rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      <ul className="mt-8 divide-y divide-ink-100 rounded-2xl bg-white shadow-card">
        {items.map((c) => {
          const locked = c.slug === "free-books";
          return (
            <li key={c.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="font-medium">
                  {c.name}
                  {locked && <span className="badge-gray ml-2">системная</span>}
                </div>
                <div className="text-xs text-ink-600">{c.slug}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => rename(c)} disabled={locked} className="btn-outline">
                  Переименовать
                </button>
                <button
                  onClick={() => remove(c.id)}
                  disabled={locked}
                  className="btn-ghost text-rose-700"
                >
                  Удалить
                </button>
              </div>
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="px-4 py-10 text-center text-ink-600">Категорий пока нет</li>
        )}
      </ul>
    </div>
  );
}
