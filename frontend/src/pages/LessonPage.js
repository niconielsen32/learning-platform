import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { completeLesson, getLesson, submitExercise } from "@/api/lessons";
import { ExerciseRenderer } from "@/components/exercises/ExerciseRenderer";
import { XPBar } from "@/components/gamification/XPBar";
import { cn } from "@/lib/utils";
export function LessonPage() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { data: lesson, isLoading } = useQuery({
        queryKey: ["lesson", lessonId],
        queryFn: () => getLesson(lessonId),
        enabled: !!lessonId,
    });
    const [phase, setPhase] = useState("intro");
    const [idx, setIdx] = useState(0);
    const [answer, setAnswer] = useState(null);
    const [lastResult, setLastResult] = useState(null);
    const [completion, setCompletion] = useState(null);
    const submit = useMutation({
        mutationFn: (a) => submitExercise(lesson.exercises[idx].id, a),
        onSuccess: (r) => setLastResult(r),
    });
    const finish = useMutation({
        mutationFn: () => completeLesson(lessonId),
        onSuccess: (r) => {
            setCompletion(r);
            setPhase("complete");
            qc.invalidateQueries({ queryKey: ["my-stats"] });
            qc.invalidateQueries({ queryKey: ["my-courses"] });
        },
    });
    const exerciseCount = lesson?.exercises.length ?? 0;
    if (isLoading || !lesson)
        return _jsx("p", { className: "p-6", children: "Loading lesson\u2026" });
    if (phase === "intro") {
        return (_jsx("div", { className: "mx-auto max-w-xl", children: _jsxs("div", { className: "card text-center", children: [_jsx("h1", { className: "text-2xl font-extrabold", children: lesson.title }), _jsx("p", { className: "mt-2 text-slate-600", children: lesson.objective }), lesson.teaching_notes && (_jsxs("div", { className: "mt-4 rounded-xl bg-owl-blue/10 p-4 text-left text-sm", children: [_jsx("p", { className: "mb-1 font-bold text-owl-blue", children: "\uD83D\uDCD8 Mini-lesson" }), _jsx("p", { children: lesson.teaching_notes })] })), _jsx("button", { onClick: () => setPhase("playing"), className: "btn-primary mt-6 w-full", children: "Start" })] }) }));
    }
    if (phase === "complete" && completion) {
        return (_jsx("div", { className: "mx-auto max-w-xl", children: _jsxs(motion.div, { className: "card text-center", initial: { scale: 0.85, opacity: 0 }, animate: { scale: 1, opacity: 1 }, children: [_jsx("div", { className: "text-6xl", children: "\uD83C\uDF89" }), _jsx("h1", { className: "mt-2 text-2xl font-extrabold text-owl-green", children: "Lesson complete!" }), _jsxs("div", { className: "mt-6 grid grid-cols-3 gap-3", children: [_jsx(Stat, { label: "Accuracy", value: `${completion.accuracy}%` }), _jsx(Stat, { label: "XP", value: `+${completion.xp_earned}`, accent: true }), _jsx(Stat, { label: "Streak", value: `${completion.current_streak} 🔥` })] }), _jsx(Link, { to: `/courses/${lesson.id}`, className: "btn-primary mt-6 inline-flex w-full justify-center", children: "Continue" }), _jsx("button", { onClick: () => navigate(-1), className: "btn-secondary mt-2 w-full", children: "Back to course" })] }) }));
    }
    const ex = lesson.exercises[idx];
    const isLast = idx === exerciseCount - 1;
    const handleCheck = () => {
        if (!answer)
            return;
        submit.mutate(answer);
    };
    const handleNext = () => {
        setLastResult(null);
        setAnswer(null);
        if (isLast)
            finish.mutate();
        else
            setIdx((i) => i + 1);
    };
    return (_jsxs("div", { className: "mx-auto max-w-2xl", children: [_jsxs("div", { className: "mb-6", children: [_jsx("button", { onClick: () => navigate(-1), className: "text-sm text-slate-500 hover:underline", children: "\u2190 Quit" }), _jsx("div", { className: "mt-2", children: _jsx(XPBar, { current: idx, total: exerciseCount }) })] }), _jsxs("div", { className: "card min-h-[300px]", children: [_jsxs("p", { className: "mb-4 text-xs font-bold uppercase text-slate-500", children: ["Question ", idx + 1, " of ", exerciseCount] }), _jsx("h2", { className: "mb-6 text-2xl font-extrabold", children: ex.prompt }), _jsx(ExerciseRenderer, { exercise: ex, onAnswerChange: setAnswer, disabled: !!lastResult }, ex.id)] }), lastResult && _jsx(ResultBanner, { result: lastResult }), _jsx("div", { className: "mt-4 flex justify-end", children: !lastResult ? (_jsx("button", { onClick: handleCheck, disabled: !answer || submit.isPending, className: "btn-primary", children: "Check" })) : (_jsx("button", { onClick: handleNext, disabled: finish.isPending, className: "btn-primary", children: isLast ? (finish.isPending ? "Finishing…" : "Finish") : "Next" })) })] }));
}
function Stat({ label, value, accent }) {
    return (_jsxs("div", { className: "rounded-xl border-2 border-owl-mist p-3", children: [_jsx("p", { className: "text-xs uppercase text-slate-500", children: label }), _jsx("p", { className: cn("mt-1 text-xl font-extrabold", accent && "text-owl-gold"), children: value })] }));
}
function ResultBanner({ result }) {
    const ok = result.is_correct;
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: cn("mt-4 flex items-start gap-3 rounded-2xl p-4", ok ? "bg-owl-green/10 text-owl-green-dark" : "bg-owl-red/10 text-owl-red"), children: [_jsx("div", { className: cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white", ok ? "bg-owl-green" : "bg-owl-red"), children: ok ? _jsx(Check, { size: 18 }) : _jsx(X, { size: 18 }) }), _jsxs("div", { children: [_jsx("p", { className: "font-extrabold", children: ok ? "Nice!" : "Not quite." }), result.explanation && _jsx("p", { className: "text-sm", children: result.explanation }), !ok && result.correct_answer && (_jsxs("p", { className: "text-sm", children: ["Correct answer:", " ", _jsx("span", { className: "font-bold", children: JSON.stringify(result.correct_answer)
                                    .replace(/[\[\]{}"]/g, "")
                                    .replace(/_/g, " ") })] }))] })] }));
}
