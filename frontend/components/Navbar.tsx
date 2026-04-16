"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { User, clearToken } from "@/lib/api";

export function Navbar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/admin", label: "Панель" },
    { href: "/books", label: "Каталог" },
    { href: "/borrow", label: "Выдачи" },
    { href: "/admin/categories", label: "Категории" },
  ];

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/books" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-900 text-sm font-bold text-white">
              Б
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Библиотека
            </span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {links.map((l) => {
              const active = pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    active
                      ? "bg-ink-900 text-white"
                      : "text-ink-600 hover:bg-ink-100"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-right sm:block">
                <div className="text-sm font-medium">{user.full_name}</div>
                <div className="text-xs text-ink-600">
                  {user.role === "admin" ? "Администратор" : "Читатель"}
                </div>
              </div>
              <button onClick={handleLogout} className="btn-outline">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">Войти</Link>
              <Link href="/register" className="btn-primary">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
