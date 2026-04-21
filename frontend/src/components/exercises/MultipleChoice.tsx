import { useState } from "react";

import { cn } from "@/lib/utils";

import type { ExerciseProps } from "./types";

export function MultipleChoice({ exercise, onAnswerChange, disabled }: ExerciseProps) {
  const options = (exercise.payload.options as string[]) ?? [];
  const [selected, setSelected] = useState<number | null>(null);

  const choose = (idx: number) => {
    if (disabled) return;
    setSelected(idx);
    onAnswerChange({ selected_index: idx });
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {options.map((opt, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => choose(idx)}
          disabled={disabled}
          className={cn(
            "rounded-xl border-2 px-4 py-4 text-left font-bold transition",
            selected === idx
              ? "border-owl-blue bg-owl-blue/10 text-owl-blue"
              : "border-owl-mist bg-white hover:border-owl-blue/40"
          )}
        >
          <span className="mr-3 inline-block w-6 text-center text-sm font-extrabold opacity-60">
            {String.fromCharCode(65 + idx)}
          </span>
          {opt}
        </button>
      ))}
    </div>
  );
}
