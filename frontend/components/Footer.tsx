import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-900 text-sm font-bold text-white">
              Б
            </span>
            <span className="font-display text-lg font-bold">Библиотека</span>
          </div>
          <p className="mt-3 text-sm text-ink-600">
            Электронная библиотека университета. Читайте, ищите, берите книги на
            дом.
          </p>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-600">
            Разделы
          </div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/catalog" className="hover:underline">Каталог</Link></li>
            <li><Link href="/free" className="hover:underline">Бесплатные книги</Link></li>
            <li><Link href="/about" className="hover:underline">О библиотеке</Link></li>
            <li><Link href="/contacts" className="hover:underline">Контакты</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-600">
            Аккаунт
          </div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/login" className="hover:underline">Войти</Link></li>
            <li><Link href="/register" className="hover:underline">Регистрация</Link></li>
            <li><Link href="/faq" className="hover:underline">Вопросы</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-600">
            Адрес
          </div>
          <p className="text-sm text-ink-600">
            ул. Университетская, 12<br />
            Бишкек, Кыргызстан<br />
            +996 (700) 00-00-00
          </p>
        </div>
      </div>
      <div className="border-t border-ink-100 py-5 text-center text-xs text-ink-600">
        © {new Date().getFullYear()} Библиотека университета. Все права защищены.
      </div>
    </footer>
  );
}
