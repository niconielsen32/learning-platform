import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { getLeaderboard } from "@/api/gamification";
export function LeaderboardPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["leaderboard"],
        queryFn: getLeaderboard,
    });
    return (_jsxs("div", { className: "mx-auto max-w-2xl", children: [_jsxs("div", { className: "mb-4 flex items-center gap-2", children: [_jsx(Trophy, { className: "text-owl-gold" }), _jsx("h1", { className: "text-3xl font-extrabold", children: "Weekly leaderboard" })] }), _jsxs("div", { className: "card divide-y divide-owl-mist p-0", children: [isLoading && _jsx("p", { className: "p-4", children: "Loading\u2026" }), data?.map((row, idx) => (_jsxs("div", { className: "flex items-center gap-3 px-4 py-3", children: [_jsx("span", { className: "w-8 text-center font-extrabold text-slate-500", children: idx + 1 }), _jsx("div", { className: "h-10 w-10 overflow-hidden rounded-full bg-owl-mist", children: row.avatar_url && (_jsx("img", { src: row.avatar_url, alt: "", className: "h-full w-full object-cover" })) }), _jsx("span", { className: "flex-1 font-bold", children: row.display_name ?? "Anonymous learner" }), _jsxs("span", { className: "font-bold text-owl-gold", children: ["\u26A1 ", row.weekly_xp] })] }, row.user_id))), !isLoading && data?.length === 0 && (_jsx("p", { className: "p-4 text-center text-slate-500", children: "Nobody has earned XP this week yet. Be the first!" }))] })] }));
}
