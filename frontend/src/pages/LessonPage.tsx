import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { completeLesson, getLesson, submitExercise } from "@/api/lessons";
import { ExerciseRenderer } from "@/components/exercises/ExerciseRenderer";
import { XPBar } from "@/components/gamification/XPBar";
import { cn } from "@/lib/utils";
import type { ExerciseResult, LessonCompletionResult } from "@/types/api";

type Phase = "intro" | "playing" | "complete";

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => getLesson(lessonId!),
    enabled: !!lessonId,
  });

  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState<Record<string, unknown> | null>(null);
  const [lastResult, setLastResult] = useState<ExerciseResult | null>(null);
  const [completion, setCompletion] = useState<LessonCompletionResult | null>(null);

  const submit = useMutation({
    mutationFn: (a: Record<string, unknown>) =>
      submitExercise(lesson!.exercises[idx].id, a),
    onSuccess: (r) => setLastResult(r),
  });

  const finish = useMutation({
    mutationFn: () => completeLesson(lessonId!),
    onSuccess: (r) => {
      setCompletion(r);
      setPhase("complete");
      qc.invalidateQueries({ queryKey: ["my-stats"] });
      qc.invalidateQueries({ queryKey: ["my-courses"] });
    },
  });

  const exerciseCount = lesson?.exercises.length ?? 0;

  if (isLoading || !lesson) return <p className="p-6">Loading lesson…</p>;

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-xl">
        <div className="card text-center">
          <h1 className="text-2xl font-extrabold">{lesson.title}</h1>
          <p className="mt-2 text-slate-600">{lesson.objective}</p>
          {lesson.teaching_notes && (
            <div className="mt-4 rounded-xl bg-owl-blue/10 p-4 text-left text-sm">
              <p className="mb-1 font-bold text-owl-blue">📘 Mini-lesson</p>
              <p>{lesson.teaching_notes}</p>
            </div>
          )}
          <button onClick={() => setPhase("playing")} className="btn-primary mt-6 w-full">
            Start
          </button>
        </div>
      </div>
    );
  }

  if (phase === "complete" && completion) {
    return (
      <div className="mx-auto max-w-xl">
        <motion.div
          className="card text-center"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-6xl">🎉</div>
          <h1 className="mt-2 text-2xl font-extrabold text-owl-green">Lesson complete!</h1>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat label="Accuracy" value={`${completion.accuracy}%`} />
            <Stat label="XP" value={`+${completion.xp_earned}`} accent />
            <Stat label="Streak" value={`${completion.current_streak} 🔥`} />
          </div>
          <Link to={`/courses/${lesson.id}`} className="btn-primary mt-6 inline-flex w-full justify-center">
            Continue
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary mt-2 w-full"
          >
            Back to course
          </button>
        </motion.div>
      </div>
    );
  }

  const ex = lesson.exercises[idx];
  const isLast = idx === exerciseCount - 1;

  const handleCheck = () => {
    if (!answer) return;
    submit.mutate(answer);
  };

  const handleNext = () => {
    setLastResult(null);
    setAnswer(null);
    if (isLast) finish.mutate();
    else setIdx((i) => i + 1);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:underline">
          ← Quit
        </button>
        <div className="mt-2">
          <XPBar current={idx} total={exerciseCount} />
        </div>
      </div>

      <div className="card min-h-[300px]">
        <p className="mb-4 text-xs font-bold uppercase text-slate-500">
          Question {idx + 1} of {exerciseCount}
        </p>
        <h2 className="mb-6 text-2xl font-extrabold">{ex.prompt}</h2>
        <ExerciseRenderer
          key={ex.id}
          exercise={ex}
          onAnswerChange={setAnswer}
          disabled={!!lastResult}
        />
      </div>

      {lastResult && <ResultBanner result={lastResult} />}

      <div className="mt-4 flex justify-end">
        {!lastResult ? (
          <button onClick={handleCheck} disabled={!answer || submit.isPending} className="btn-primary">
            Check
          </button>
        ) : (
          <button onClick={handleNext} disabled={finish.isPending} className="btn-primary">
            {isLast ? (finish.isPending ? "Finishing…" : "Finish") : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border-2 border-owl-mist p-3">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={cn("mt-1 text-xl font-extrabold", accent && "text-owl-gold")}>{value}</p>
    </div>
  );
}

function ResultBanner({ result }: { result: ExerciseResult }) {
  const ok = result.is_correct;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "mt-4 flex items-start gap-3 rounded-2xl p-4",
        ok ? "bg-owl-green/10 text-owl-green-dark" : "bg-owl-red/10 text-owl-red"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white",
          ok ? "bg-owl-green" : "bg-owl-red"
        )}
      >
        {ok ? <Check size={18} /> : <X size={18} />}
      </div>
      <div>
        <p className="font-extrabold">{ok ? "Nice!" : "Not quite."}</p>
        {result.explanation && <p className="text-sm">{result.explanation}</p>}
        {!ok && result.correct_answer && (
          <p className="text-sm">
            Correct answer:{" "}
            <span className="font-bold">
              {JSON.stringify(result.correct_answer)
                .replace(/[\[\]{}"]/g, "")
                .replace(/_/g, " ")}
            </span>
          </p>
        )}
      </div>
    </motion.div>
  );
}
