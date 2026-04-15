export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function setToken(token: string) {
  localStorage.setItem("access_token", token);
}

export function clearToken() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  return raw ? (JSON.parse(raw) as User) : null;
}

export function setStoredUser(user: User) {
  localStorage.setItem("user", JSON.stringify(user));
}

export type User = {
  id: number;
  full_name: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
};

export type Category = { id: number; name: string; slug: string };

export type Book = {
  id: number;
  title: string;
  author: string;
  published_year: number;
  description: string | null;
  cover_url: string | null;
  pdf_url: string | null;
  available: boolean;
  category: Category | null;
  created_at: string;
};

export type Borrow = {
  id: number;
  borrow_date: string;
  return_date: string | null;
  borrower_name: string | null;
  borrower_surname: string | null;
  borrower_phone: string | null;
  borrower_email: string | null;
  borrower_passport: string | null;
  note: string | null;
  book: { id: number; title: string; author: string };
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Opts = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  formData?: FormData;
};

export async function api<T>(path: string, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const init: RequestInit = { method: opts.method || "GET" };

  if (opts.formData) {
    init.body = opts.formData;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(opts.body);
  }

  if (opts.auth !== false) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  init.headers = headers;

  const res = await fetch(`${API_URL}${path}`, init);

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg =
      (data && (data.detail?.message || data.detail || data.message)) ||
      "Ошибка запроса";
    if (res.status === 401 && typeof window !== "undefined") {
      clearToken();
    }
    throw new ApiError(typeof msg === "string" ? msg : "Ошибка запроса", res.status);
  }

  return data as T;
}

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}
