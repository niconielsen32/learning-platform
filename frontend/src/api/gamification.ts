import { api } from "./client";
import type { HeartsResponse, LeaderboardEntry, UserStats } from "@/types/api";

export async function getMyStats(): Promise<UserStats> {
  const { data } = await api.get<UserStats>("/users/me/stats");
  return data;
}

export async function getHearts(): Promise<HeartsResponse> {
  const { data } = await api.get<HeartsResponse>("/gamification/hearts");
  return data;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data } = await api.get<LeaderboardEntry[]>("/gamification/leaderboard");
  return data;
}
