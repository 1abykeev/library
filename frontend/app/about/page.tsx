import { PublicShell } from "@/components/PublicShell";

export default function AboutPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <span className="badge-gray">О библиотеке</span>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
          Наша миссия — делать знания доступными.
        </h1>
        <p className="mt-6 text-lg text-ink-600">
          Университетская библиотека объединяет классическую литературу, учебные
          пособия и современные исследования в одном цифровом пространстве.
          Студенты и преподаватели могут искать книги по автору, году или
          категории, читать PDF в браузере и заказывать печатные экземпляры.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { n: "10 000+", l: "книг в каталоге" },
            { n: "500+", l: "бесплатных изданий" },
            { n: "24/7", l: "онлайн-доступ" },
          ].map((s) => (
            <div key={s.l} className="card p-6 text-center">
              <div className="font-display text-3xl font-bold">{s.n}</div>
              <div className="mt-1 text-sm text-ink-600">{s.l}</div>
            </div>
          ))}
        </div>

        <h2 className="mt-14 font-display text-2xl font-bold">Наши принципы</h2>
        <ul className="mt-4 space-y-4 text-ink-600">
          <li>
            <strong className="text-ink-900">Открытость.</strong> Бесплатная
            коллекция доступна без регистрации всем желающим.
          </li>
          <li>
            <strong className="text-ink-900">Минимализм.</strong> Интерфейс
            создан, чтобы не отвлекать от главного — чтения.
          </li>
          <li>
            <strong className="text-ink-900">Порядок.</strong> Каждая книга
            отнесена к категории и сопровождается карточкой с описанием.
          </li>
        </ul>
      </section>
    </PublicShell>
  );
}
