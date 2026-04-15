import { PublicShell } from "@/components/PublicShell";

export default function ContactsPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <span className="badge-gray">Контакты</span>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
          Мы на связи.
        </h1>
        <p className="mt-3 text-ink-600">
          Напишите или приходите — рады помочь с выбором литературы.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="card p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-600">
              Адрес
            </div>
            <div className="mt-2 font-display text-lg">
              ул. Университетская, 12<br />
              Бишкек, Кыргызстан
            </div>
          </div>
          <div className="card p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-600">
              Часы работы
            </div>
            <div className="mt-2 font-display text-lg">
              Пн–Пт: 09:00 — 20:00<br />
              Сб: 10:00 — 16:00
            </div>
          </div>
          <div className="card p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-600">
              Телефон
            </div>
            <div className="mt-2 font-display text-lg">+996 (700) 00-00-00</div>
          </div>
          <div className="card p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-600">
              Email
            </div>
            <div className="mt-2 font-display text-lg">library@univ.kg</div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
