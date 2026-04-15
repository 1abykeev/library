import { PublicShell } from "@/components/PublicShell";

const items = [
  {
    q: "Нужно ли платить за пользование библиотекой?",
    a: "Нет. Основной каталог бесплатен для студентов и преподавателей университета. Раздел «Бесплатные книги» доступен всем без регистрации.",
  },
  {
    q: "Как взять книгу домой?",
    a: "Приходите в библиотеку с паспортом или студенческим билетом. Администратор оформит выдачу — достаточно назвать фамилию и телефон.",
  },
  {
    q: "Можно ли скачать PDF?",
    a: "Да, для книг из раздела «Бесплатные книги». Остальные издания доступны для чтения онлайн после входа.",
  },
  {
    q: "Что если книга уже выдана?",
    a: "Карточка покажет статус «Выдана». Вы можете оставить заявку, и администратор свяжется с вами, когда книга вернётся.",
  },
];

export default function FaqPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <span className="badge-gray">Вопросы и ответы</span>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
          Часто спрашивают
        </h1>

        <div className="mt-10 space-y-4">
          {items.map((it) => (
            <details key={it.q} className="card group p-6">
              <summary className="cursor-pointer list-none font-display text-lg font-bold">
                {it.q}
                <span className="float-right text-ink-600 group-open:rotate-45 inline-block transition">+</span>
              </summary>
              <p className="mt-3 text-ink-600">{it.a}</p>
            </details>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
