import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { Check, Lock, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getCourse } from "@/api/courses";
export function CoursePage() {
    const { courseId } = useParams();
    const { data: course, isLoading } = useQuery({
        queryKey: ["course", courseId],
        queryFn: () => getCourse(courseId),
        enabled: !!courseId,
        refetchInterval: (q) => (q.state.data?.status === "generating" ? 3_000 : false),
    });
    if (isLoading || !course)
        return _jsx("p", { className: "p-6", children: "Loading course\u2026" });
    if (course.status === "generating") {
        return (_jsx("div", { className: "mx-auto max-w-md text-center", children: _jsxs("div", { className: "card animate-pulse", children: [_jsx("div", { className: "text-4xl", children: course.icon_emoji }), _jsx("h2", { className: "mt-2 text-xl font-extrabold", children: "Building your curriculum\u2026" }), _jsx("p", { className: "text-sm text-slate-500", children: "This usually takes 20\u201360 seconds." })] }) }));
    }
    if (course.status === "failed") {
        return (_jsx("div", { className: "mx-auto max-w-md text-center", children: _jsxs("div", { className: "card", children: [_jsx("h2", { className: "text-xl font-extrabold text-owl-red", children: "Generation failed" }), _jsx("p", { className: "text-sm text-slate-500", children: "Try creating the course again." })] }) }));
    }
    return (_jsxs("div", { className: "mx-auto max-w-2xl", children: [_jsxs("header", { className: "mb-6", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl", style: { backgroundColor: `${course.color_hex}22` }, children: course.icon_emoji }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-extrabold", children: course.title }), _jsx("p", { className: "text-slate-600", children: course.description })] })] }), course.learning_outcomes.length > 0 && (_jsxs("details", { className: "mt-4", children: [_jsx("summary", { className: "cursor-pointer font-bold text-owl-blue", children: "Learning outcomes" }), _jsx("ul", { className: "mt-2 list-inside list-disc space-y-1 text-sm", children: course.learning_outcomes.map((o) => (_jsx("li", { children: o }, o))) })] }))] }), _jsx("div", { className: "space-y-8", children: course.units.map((unit, idx) => (_jsx(UnitSection, { unit: unit, color: course.color_hex, unitIndex: idx, previousUnitComplete: idx === 0 || course.units[idx - 1].lessons.every((l) => l.completed) }, unit.id))) })] }));
}
function UnitSection({ unit, color, unitIndex, previousUnitComplete, }) {
    return (_jsxs("section", { children: [_jsxs("div", { className: "mb-4 rounded-2xl px-5 py-4 text-white", style: { backgroundColor: color }, children: [_jsxs("p", { className: "text-xs uppercase opacity-80", children: ["Unit ", unitIndex + 1] }), _jsxs("h2", { className: "text-xl font-extrabold", children: [unit.icon_emoji, " ", unit.title] }), _jsx("p", { className: "text-sm opacity-90", children: unit.description })] }), _jsx("div", { className: "flex flex-col items-center gap-4", children: unit.lessons.map((lesson, idx) => {
                    const previousLessonsComplete = unit.lessons
                        .slice(0, idx)
                        .every((l) => l.completed);
                    const unlocked = previousUnitComplete && previousLessonsComplete;
                    const offset = (idx % 4) * 60 - 90;
                    return (_jsx("div", { style: { marginLeft: offset }, children: _jsx(LessonNode, { lesson: lesson, unlocked: unlocked, color: color }) }, lesson.id));
                }) })] }));
}
function LessonNode({ lesson, unlocked, color, }) {
    const completed = lesson.completed;
    const node = (_jsx("div", { className: `flex h-20 w-20 items-center justify-center rounded-full border-4 text-3xl shadow-button transition ${unlocked ? "hover:-translate-y-1" : "opacity-50"}`, style: {
            backgroundColor: completed ? color : unlocked ? "white" : "#E5E5E5",
            borderColor: completed ? color : "#E5E5E5",
            color: completed ? "white" : "#3C3C3C",
        }, children: completed ? _jsx(Check, { size: 32 }) : unlocked ? _jsx(Star, { size: 28 }) : _jsx(Lock, { size: 24 }) }));
    return (_jsxs("div", { className: "flex flex-col items-center", children: [unlocked ? (_jsx(Link, { to: `/lessons/${lesson.id}`, title: lesson.title, children: node })) : (node), _jsx("p", { className: "mt-2 max-w-[140px] text-center text-xs font-bold", children: lesson.title })] }));
}
