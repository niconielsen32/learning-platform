import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";

import { getLeaderboard } from "@/api/gamification";

export function LeaderboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: getLeaderboard,
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="text-owl-gold" />
        <h1 className="text-3xl font-extrabold">Weekly leaderboard</h1>
      </div>
      <div className="card divide-y divide-owl-mist p-0">
        {isLoading && <p className="p-4">Loading…</p>}
        {data?.map((row, idx) => (
          <div key={row.user_id} className="flex items-center gap-3 px-4 py-3">
            <span className="w-8 text-center font-extrabold text-slate-500">{idx + 1}</span>
            <div className="h-10 w-10 overflow-hidden rounded-full bg-owl-mist">
              {row.avatar_url && (
                <img src={row.avatar_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <span className="flex-1 font-bold">{row.display_name ?? "Anonymous learner"}</span>
            <span className="font-bold text-owl-gold">⚡ {row.weekly_xp}</span>
          </div>
        ))}
        {!isLoading && data?.length === 0 && (
          <p className="p-4 text-center text-slate-500">
            Nobody has earned XP this week yet. Be the first!
          </p>
        )}
      </div>
    </div>
  );
}
