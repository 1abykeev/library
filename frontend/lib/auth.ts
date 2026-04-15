"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { api, getStoredUser, User, clearToken } from "./api";

export function useCurrentUser(options: { required?: boolean; adminOnly?: boolean } = {}) {
  const { required = false, adminOnly = false } = options;
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const cached = getStoredUser();
    if (cached) setUser(cached);

    api<User>("/auth/me")
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        localStorage.setItem("user", JSON.stringify(u));
        if (adminOnly && u.role !== "admin") router.replace("/books");
      })
      .catch(() => {
        if (cancelled) return;
        clearToken();
        setUser(null);
        if (required) router.replace("/login");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, loading };
}

export function logout(router: ReturnType<typeof useRouter>) {
  clearToken();
  router.replace("/login");
}
