import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Lock, Star } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";

import { getCourse } from "@/api/courses";
import type { Lesson, Unit } from "@/types/api";

export function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const qc = useQueryClient();
  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId!),
    enabled: !!courseId,
    refetchInterval: (q) => (q.state.data?.status === "generating" ? 3_000 : false),
  });

  // When generation finishes, refresh the dashboard list so the card reflects READY.
  const prevStatus = useRef(course?.status);
  useEffect(() => {
    if (prevStatus.current === "generating" && course?.status === "ready") {
      qc.invalidateQueries({ queryKey: ["my-courses"] });
    }
    prevStatus.current = course?.status;
  }, [course?.status, qc]);

  if (isLoading || !course) return <p className="p-6">Loading course…</p>;

  if (course.status === "generating") {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="card animate-pulse">
          <div className="text-4xl">{course.icon_emoji}</div>
          <h2 className="mt-2 text-xl font-extrabold">Building your curriculum…</h2>
          <p className="text-sm text-slate-500">This usually takes 20–60 seconds.</p>
        </div>
      </div>
    );
  }

  if (course.status === "failed") {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="card">
          <h2 className="text-xl font-extrabold text-owl-red">Generation failed</h2>
          <p className="text-sm text-slate-500">Try creating the course again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <div className="flex items-start gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl"
            style={{ backgroundColor: `${course.color_hex}22` }}
          >
            {course.icon_emoji}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">{course.title}</h1>
            <p className="text-slate-600">{course.description}</p>
          </div>
        </div>
        {course.learning_outcomes.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer font-bold text-owl-blue">
              Learning outcomes
            </summary>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
              {course.learning_outcomes.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </details>
        )}
      </header>

      <div className="space-y-8">
        {course.units.map((unit, idx) => (
          <UnitSection
            key={unit.id}
            unit={unit}
            color={course.color_hex}
            unitIndex={idx}
            previousUnitComplete={
              idx === 0 || course.units[idx - 1].lessons.every((l) => l.completed)
            }
          />
        ))}
      </div>
    </div>
  );
}

function UnitSection({
  unit,
  color,
  unitIndex,
  previousUnitComplete,
}: {
  unit: Unit;
  color: string;
  unitIndex: number;
  previousUnitComplete: boolean;
}) {
  return (
    <section>
      <div
        className="mb-4 rounded-2xl px-5 py-4 text-white"
        style={{ backgroundColor: color }}
      >
        <p className="text-xs uppercase opacity-80">Unit {unitIndex + 1}</p>
        <h2 className="text-xl font-extrabold">
          {unit.icon_emoji} {unit.title}
        </h2>
        <p className="text-sm opacity-90">{unit.description}</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        {unit.lessons.map((lesson, idx) => {
          const previousLessonsComplete = unit.lessons
            .slice(0, idx)
            .every((l) => l.completed);
          const unlocked = previousUnitComplete && previousLessonsComplete;
          const offset = (idx % 4) * 60 - 90;
          return (
            <div key={lesson.id} style={{ marginLeft: offset }}>
              <LessonNode lesson={lesson} unlocked={unlocked} color={color} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LessonNode({
  lesson,
  unlocked,
  color,
}: {
  lesson: Lesson;
  unlocked: boolean;
  color: string;
}) {
  const completed = lesson.completed;
  const node = (
    <div
      className={`flex h-20 w-20 items-center justify-center rounded-full border-4 text-3xl shadow-button transition ${
        unlocked ? "hover:-translate-y-1" : "opacity-50"
      }`}
      style={{
        backgroundColor: completed ? color : unlocked ? "white" : "#E5E5E5",
        borderColor: completed ? color : "#E5E5E5",
        color: completed ? "white" : "#3C3C3C",
      }}
    >
      {completed ? <Check size={32} /> : unlocked ? <Star size={28} /> : <Lock size={24} />}
    </div>
  );
  return (
    <div className="flex flex-col items-center">
      {unlocked ? (
        <Link to={`/lessons/${lesson.id}`} title={lesson.title}>
          {node}
        </Link>
      ) : (
        node
      )}
      <p className="mt-2 max-w-[140px] text-center text-xs font-bold">{lesson.title}</p>
    </div>
  );
}
