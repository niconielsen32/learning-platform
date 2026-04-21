import { useQuery } from "@tanstack/react-query";
import { BookOpenText, Home, LogOut, Trophy } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { getMyStats } from "@/api/gamification";
import { HeartsDisplay } from "@/components/gamification/HeartsDisplay";
import { StreakBadge } from "@/components/gamification/StreakBadge";
import { useAuthStore } from "@/stores/auth";

export function AppShell() {
  const navigate = useNavigate();
  const clear = useAuthStore((s) => s.clear);
  const { data: stats } = useQuery({ queryKey: ["my-stats"], queryFn: getMyStats });

  const navItem =
    "flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-owl-ink hover:bg-owl-mist";
  const activeNavItem = "bg-owl-mist text-owl-green-dark";

  return (
    <div className="flex h-screen">
      <aside className="hidden w-64 shrink-0 border-r-2 border-owl-mist bg-white p-5 md:block">
        <Link to="/" className="mb-8 block text-2xl font-extrabold text-owl-green">
          🦉 LearnAnything
        </Link>
        <nav className="space-y-1">
          <NavLink to="/" end className={({ isActive }) => `${navItem} ${isActive ? activeNavItem : ""}`}>
            <Home size={22} /> Learn
          </NavLink>
          <NavLink to="/create" className={({ isActive }) => `${navItem} ${isActive ? activeNavItem : ""}`}>
            <BookOpenText size={22} /> New course
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `${navItem} ${isActive ? activeNavItem : ""}`}>
            <Trophy size={22} /> Leaderboard
          </NavLink>
        </nav>
        <button
          onClick={() => {
            clear();
            navigate("/login");
          }}
          className={`${navItem} mt-8 w-full text-left text-owl-red`}
        >
          <LogOut size={22} /> Log out
        </button>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-end gap-3 border-b-2 border-owl-mist bg-white px-6 py-3">
          <span className="pill text-owl-gold">⚡ {stats?.total_xp ?? 0} XP</span>
          <StreakBadge count={stats?.current_streak ?? 0} />
          <HeartsDisplay current={stats?.hearts ?? 5} max={stats?.max_hearts ?? 5} />
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
