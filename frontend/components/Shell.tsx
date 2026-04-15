"use client";

import { useCurrentUser } from "@/lib/auth";
import { Navbar } from "./Navbar";

export function Shell({
  children,
  required = true,
  adminOnly = false,
}: {
  children: React.ReactNode;
  required?: boolean;
  adminOnly?: boolean;
}) {
  const { user, loading } = useCurrentUser({ required, adminOnly });

  if (loading && required) {
    return (
      <div className="grid min-h-screen place-items-center text-ink-600">
        Загрузка…
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
