import { api } from "./client";
export async function login(username, password) {
    const form = new URLSearchParams({ username, password });
    const { data } = await api.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return data.access_token;
}
export async function register(username, password, displayName) {
    const { data } = await api.post("/auth/register", {
        username,
        password,
        display_name: displayName,
    });
    return data;
}
export async function me() {
    const { data } = await api.get("/users/me");
    return data;
}
