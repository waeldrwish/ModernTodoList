"use client";

import { apiBaseUrl } from "./config";

export type User = { id: string; name: string; email: string };
export type Task = {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  status?: "todo" | "in_progress" | "done";
  priority?: "low" | "medium" | "high";
  importance?: "normal" | "important" | "critical";
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

const TOKEN_KEY = "todo_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

async function request(path: string, init?: RequestInit) {
  const token = getStoredToken();
  const headers = new Headers(init?.headers || {});
  if (!headers.has("Content-Type") && init?.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${apiBaseUrl()}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });
  if (!res.ok) {
    let message = "Request failed";
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

export async function login(email: string, password: string) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data?.token) setStoredToken(data.token);
  return data as { token: string; user: User };
}

export async function signup(name: string, email: string, password: string) {
  const data = await request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  if (data?.token) setStoredToken(data.token);
  return data as { token: string; user: User };
}

export async function logout() {
  try {
    await request("/auth/logout", { method: "POST" });
  } finally {
    setStoredToken(null);
  }
}

export async function me(): Promise<User | null> {
  try {
    const data = await request("/auth/me");
    return data?.user ?? null;
  } catch {
    return null;
  }
}

export async function listTasks(opts?: {
  q?: string;
  status?: Task["status"];
  priority?: Task["priority"] | "all";
  importance?: Task["importance"] | "all";
  completed?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "dueDate" | "title" | "priority" | "importance" | "status" | "completed";
  sortOrder?: "asc" | "desc";
}): Promise<Task[]> {
  const params = new URLSearchParams();
  if (opts?.q) params.set("q", opts.q);
  if (opts?.status) params.set("status", opts.status);
  if (opts?.priority && opts.priority !== "all") params.set("priority", opts.priority);
  if (opts?.importance && opts.importance !== "all") params.set("importance", opts.importance);
  if (typeof opts?.completed === "boolean") params.set("completed", String(opts.completed));
  if (opts?.sortBy) params.set("sortBy", opts.sortBy);
  if (opts?.sortOrder) params.set("sortOrder", opts.sortOrder);
  const qs = params.toString();
  return request(`/tasks${qs ? `?${qs}` : ""}`);
}

export async function createTask(input: { title: string; description?: string; dueDate?: string | null; priority?: Task["priority"]; importance?: Task["importance"]; }): Promise<Task> {
  return request("/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTask(id: string, updates: Partial<Pick<Task, "title" | "description" | "completed" | "dueDate" | "priority" | "importance" | "status">>): Promise<Task> {
  return request(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function toggleTask(id: string): Promise<Task> {
  return request(`/tasks/${id}/toggle`, {
    method: "PATCH",
  });
}

export async function deleteTask(id: string): Promise<void> {
  await request(`/tasks/${id}`, { method: "DELETE" });
}
