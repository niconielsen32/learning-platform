import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCourse } from "@/api/courses";
const SUGGESTIONS = [
    "Rust ownership and borrowing",
    "Latin American history",
    "Music theory fundamentals",
    "Quantum mechanics for beginners",
    "Cooking French sauces",
    "Investing 101",
];
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
export function CreateCoursePage() {
    const navigate = useNavigate();
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("beginner");
    const m = useMutation({
        mutationFn: () => createCourse(topic, difficulty),
        onSuccess: (c) => navigate(`/courses/${c.id}`),
    });
    return (_jsx("div", { className: "mx-auto max-w-2xl", children: _jsxs("div", { className: "card", children: [_jsxs("div", { className: "mb-4 flex items-center gap-2 text-owl-purple", children: [_jsx(Sparkles, { size: 22 }), _jsx("h1", { className: "text-2xl font-extrabold", children: "Create a course about anything" })] }), _jsxs("form", { onSubmit: (e) => {
                        e.preventDefault();
                        if (topic.trim())
                            m.mutate();
                    }, children: [_jsx("input", { value: topic, onChange: (e) => setTopic(e.target.value), placeholder: "e.g. Photography composition rules", className: "w-full rounded-xl border-2 border-owl-mist px-4 py-3 text-lg focus:border-owl-blue focus:outline-none", autoFocus: true }), _jsxs("div", { className: "mt-4", children: [_jsx("p", { className: "mb-2 text-sm font-bold uppercase text-slate-500", children: "Difficulty" }), _jsx("div", { className: "flex gap-2", children: DIFFICULTIES.map((d) => (_jsx("button", { type: "button", onClick: () => setDifficulty(d), className: `rounded-xl border-2 px-4 py-2 font-bold capitalize transition ${difficulty === d
                                            ? "border-owl-green bg-owl-green text-white"
                                            : "border-owl-mist bg-white text-owl-ink"}`, children: d }, d))) })] }), _jsx("button", { type: "submit", disabled: !topic.trim() || m.isPending, className: "btn-primary mt-6 w-full", children: m.isPending ? "Generating…" : "Generate course" })] }), _jsxs("div", { className: "mt-8", children: [_jsx("p", { className: "mb-2 text-sm font-bold uppercase text-slate-500", children: "Or try one of these" }), _jsx("div", { className: "flex flex-wrap gap-2", children: SUGGESTIONS.map((s) => (_jsx("button", { onClick: () => setTopic(s), className: "pill cursor-pointer hover:bg-owl-mist", children: s }, s))) })] })] }) }));
}
