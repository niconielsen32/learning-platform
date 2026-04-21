import { api } from "./client";
export async function getMyStats() {
    const { data } = await api.get("/users/me/stats");
    return data;
}
export async function getHearts() {
    const { data } = await api.get("/gamification/hearts");
    return data;
}
export async function getLeaderboard() {
    const { data } = await api.get("/gamification/leaderboard");
    return data;
}
