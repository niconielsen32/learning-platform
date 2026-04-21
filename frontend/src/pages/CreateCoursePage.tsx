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

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

export function CreateCoursePage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>("beginner");

  const m = useMutation({
    mutationFn: () => createCourse(topic, difficulty),
    onSuccess: (c) => navigate(`/courses/${c.id}`),
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card">
        <div className="mb-4 flex items-center gap-2 text-owl-purple">
          <Sparkles size={22} />
          <h1 className="text-2xl font-extrabold">Create a course about anything</h1>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (topic.trim()) m.mutate();
          }}
        >
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Photography composition rules"
            className="w-full rounded-xl border-2 border-owl-mist px-4 py-3 text-lg focus:border-owl-blue focus:outline-none"
            autoFocus
          />

          <div className="mt-4">
            <p className="mb-2 text-sm font-bold uppercase text-slate-500">Difficulty</p>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`rounded-xl border-2 px-4 py-2 font-bold capitalize transition ${
                    difficulty === d
                      ? "border-owl-green bg-owl-green text-white"
                      : "border-owl-mist bg-white text-owl-ink"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!topic.trim() || m.isPending}
            className="btn-primary mt-6 w-full"
          >
            {m.isPending ? "Generating…" : "Generate course"}
          </button>
        </form>

        <div className="mt-8">
          <p className="mb-2 text-sm font-bold uppercase text-slate-500">Or try one of these</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setTopic(s)}
                className="pill cursor-pointer hover:bg-owl-mist"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
