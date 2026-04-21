import { api } from "./client";
import type { UserMe } from "@/types/api";

export async function login(username: string, password: string): Promise<string> {
  const form = new URLSearchParams({ username, password });
  const { data } = await api.post<{ access_token: string }>("/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data.access_token;
}

export async function register(
  username: string,
  password: string,
  displayName?: string
): Promise<UserMe> {
  const { data } = await api.post<UserMe>("/auth/register", {
    username,
    password,
    display_name: displayName,
  });
  return data;
}

export async function me(): Promise<UserMe> {
  const { data } = await api.get<UserMe>("/users/me");
  return data;
}
