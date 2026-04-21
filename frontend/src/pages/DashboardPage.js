import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { listMyCourses } from "@/api/courses";
export function DashboardPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["my-courses"],
        queryFn: listMyCourses,
        refetchInterval: (q) => {
            const courses = q.state.data ?? [];
            return courses.some((c) => c.status === "generating") ? 3_000 : false;
        },
    });
    return (_jsxs("div", { className: "mx-auto max-w-4xl", children: [_jsxs("div", { className: "mb-6 flex items-center justify-between", children: [_jsx("h1", { className: "text-3xl font-extrabold", children: "Your courses" }), _jsxs(Link, { to: "/create", className: "btn-primary", children: [_jsx(Plus, { size: 18, className: "mr-1" }), " New course"] })] }), isLoading && _jsx("p", { children: "Loading\u2026" }), !isLoading && data?.length === 0 && (_jsxs("div", { className: "card text-center", children: [_jsx("p", { className: "text-lg", children: "You haven't started any courses yet." }), _jsx(Link, { to: "/create", className: "btn-primary mt-4 inline-flex", children: "Create your first course" })] })), _jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: data?.map((c) => _jsx(CourseCard, { course: c }, c.id)) })] }));
}
function CourseCard({ course }) {
    const isReady = course.status === "ready";
    return (_jsxs(Link, { to: `/courses/${course.id}`, className: "card flex items-start gap-4 transition hover:-translate-y-0.5 hover:shadow-button", style: { borderColor: course.color_hex }, children: [_jsx("div", { className: "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl", style: { backgroundColor: `${course.color_hex}22` }, children: course.icon_emoji }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("h3", { className: "truncate font-extrabold", children: course.title }), _jsx("p", { className: "truncate text-sm text-slate-500", children: course.description }), _jsxs("div", { className: "mt-2 flex items-center gap-2", children: [_jsx("span", { className: "pill text-xs", children: course.difficulty }), !isReady && (_jsx("span", { className: "pill text-xs text-owl-blue", children: course.status === "generating" ? "Generating…" : course.status }))] })] })] }));
}
