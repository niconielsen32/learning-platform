import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { listMyCourses } from "@/api/courses";
import type { Course } from "@/types/api";

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-courses"],
    queryFn: listMyCourses,
    refetchInterval: (q) => {
      const courses = (q.state.data as Course[] | undefined) ?? [];
      return courses.some((c) => c.status === "generating") ? 3_000 : false;
    },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">Your courses</h1>
        <Link to="/create" className="btn-primary">
          <Plus size={18} className="mr-1" /> New course
        </Link>
      </div>

      {isLoading && <p>Loading…</p>}

      {!isLoading && data?.length === 0 && (
        <div className="card text-center">
          <p className="text-lg">You haven't started any courses yet.</p>
          <Link to="/create" className="btn-primary mt-4 inline-flex">
            Create your first course
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data?.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const isReady = course.status === "ready";
  return (
    <Link
      to={`/courses/${course.id}`}
      className="card flex items-start gap-4 transition hover:-translate-y-0.5 hover:shadow-button"
      style={{ borderColor: course.color_hex }}
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl"
        style={{ backgroundColor: `${course.color_hex}22` }}
      >
        {course.icon_emoji}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-extrabold">{course.title}</h3>
        <p className="truncate text-sm text-slate-500">{course.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="pill text-xs">{course.difficulty}</span>
          {!isReady && (
            <span className="pill text-xs text-owl-blue">
              {course.status === "generating" ? "Generating…" : course.status}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
