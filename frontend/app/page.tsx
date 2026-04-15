import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-ink-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-900 text-sm font-bold text-white">
            Б
          </span>
          <span className="font-display text-lg font-bold">Библиотека</span>
        </div>
        <div className="flex gap-2">
          <Link href="/login" className="btn-ghost">Войти</Link>
          <Link href="/register" className="btn-primary">Начать</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col justify-center gap-6">
          <span className="badge-gray w-fit">Электронная библиотека</span>
          <h1 className="font-display text-5xl font-bold leading-tight md:text-6xl">
            Читайте книги
            <br />
            в одном месте.
          </h1>
          <p className="max-w-md text-lg text-ink-600">
            Каталог с аккуратной навигацией по категориям, PDF-читалка и простая
            система выдач для библиотеки.
          </p>
          <div className="flex gap-3">
            <Link href="/register" className="btn-accent text-base">
              Создать аккаунт
            </Link>
            <Link href="/books" className="btn-outline text-base">
              Посмотреть каталог
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

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3">
        {[
          { t: "Каталог", d: "Книги по категориям с обложками и описаниями." },
          { t: "Читалка", d: "Открывайте PDF прямо в браузере." },
          { t: "Выдача", d: "Библиотекарь отмечает выдачи и возвраты." },
        ].map((f) => (
          <div key={f.t} className="card p-6">
            <div className="mb-3 h-10 w-10 rounded-xl bg-accent-soft" />
            <h3 className="font-display text-xl font-bold">{f.t}</h3>
            <p className="mt-1 text-sm text-ink-600">{f.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
