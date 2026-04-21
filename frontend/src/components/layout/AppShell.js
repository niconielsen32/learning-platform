import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const navItem = "flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-owl-ink hover:bg-owl-mist";
    const activeNavItem = "bg-owl-mist text-owl-green-dark";
    return (_jsxs("div", { className: "flex h-screen", children: [_jsxs("aside", { className: "hidden w-64 shrink-0 border-r-2 border-owl-mist bg-white p-5 md:block", children: [_jsx(Link, { to: "/", className: "mb-8 block text-2xl font-extrabold text-owl-green", children: "\uD83E\uDD89 LearnAnything" }), _jsxs("nav", { className: "space-y-1", children: [_jsxs(NavLink, { to: "/", end: true, className: ({ isActive }) => `${navItem} ${isActive ? activeNavItem : ""}`, children: [_jsx(Home, { size: 22 }), " Learn"] }), _jsxs(NavLink, { to: "/create", className: ({ isActive }) => `${navItem} ${isActive ? activeNavItem : ""}`, children: [_jsx(BookOpenText, { size: 22 }), " New course"] }), _jsxs(NavLink, { to: "/leaderboard", className: ({ isActive }) => `${navItem} ${isActive ? activeNavItem : ""}`, children: [_jsx(Trophy, { size: 22 }), " Leaderboard"] })] }), _jsxs("button", { onClick: () => {
                            clear();
                            navigate("/login");
                        }, className: `${navItem} mt-8 w-full text-left text-owl-red`, children: [_jsx(LogOut, { size: 22 }), " Log out"] })] }), _jsxs("div", { className: "flex flex-1 flex-col overflow-hidden", children: [_jsxs("header", { className: "flex items-center justify-end gap-3 border-b-2 border-owl-mist bg-white px-6 py-3", children: [_jsxs("span", { className: "pill text-owl-gold", children: ["\u26A1 ", stats?.total_xp ?? 0, " XP"] }), _jsx(StreakBadge, { count: stats?.current_streak ?? 0 }), _jsx(HeartsDisplay, { current: stats?.hearts ?? 5, max: stats?.max_hearts ?? 5 })] }), _jsx("main", { className: "flex-1 overflow-y-auto bg-slate-50 p-6", children: _jsx(Outlet, {}) })] })] }));
}
