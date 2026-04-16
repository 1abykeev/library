import Link from "next/link";

import { PublicShell } from "@/components/PublicShell";

export default function HomePage() {
  return (
    <PublicShell>
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
        <div className="flex flex-col justify-center gap-6">
          <span className="badge-gray w-fit">Электронная библиотека</span>
          <h1 className="font-display text-5xl font-bold leading-tight md:text-6xl">
            Книги, которые
            <br />
            ждут вас.
          </h1>
          <p className="max-w-md text-lg text-ink-600">
            Листайте каталог, читайте PDF онлайн, скачивайте бесплатные книги и
            берите издания в библиотеке — в один клик.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/free" className="btn-accent text-base">
              Бесплатные книги
            </Link>
            <Link href="/catalog" className="btn-primary text-base">
              Каталог
            </Link>
            <Link href="/about" className="btn-outline text-base">
              О библиотеке
            </Link>
          </div>
        </div>
        <div className="relative hidden aspect-square md:block">
          <div className="absolute inset-0 grid grid-cols-3 gap-3">
            {["#ffedd5", "#e0f2fe", "#fce7f3", "#f0fdf4", "#ede9fe", "#fef3c7", "#fee2e2", "#e0e7ff", "#f1f5f9"].map((c, i) => (
              <div
                key={i}
                className="rounded-xl shadow-card"
                style={{
                  background: c,
                  transform: `translateY(${(i % 3) * 10}px)`,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-12 md:grid-cols-3">
        {[
          { t: "Каталог", d: "Книги по категориям с обложками и описаниями." },
          { t: "Читалка", d: "Открывайте PDF прямо в браузере." },
          { t: "Бесплатно", d: "Целая полка книг без регистрации." },
        ].map((f) => (
          <div key={f.t} className="card p-6">
            <div className="mb-3 h-10 w-10 rounded-xl bg-accent-soft" />
            <h3 className="font-display text-xl font-bold">{f.t}</h3>
            <p className="mt-1 text-sm text-ink-600">{f.d}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="card grid items-center gap-8 p-10 md:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="font-display text-3xl font-bold">
              Приходите в библиотеку
            </h2>
            <p className="mt-2 max-w-lg text-ink-600">
              Бесплатные книги доступны онлайн. Остальные издания можно взять
              у администратора библиотеки — без регистрации на сайте.
            </p>
          </div>
          <div className="flex gap-3 md:justify-end">
            <Link href="/catalog" className="btn-accent">Открыть каталог</Link>
            <Link href="/contacts" className="btn-outline">Контакты</Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
