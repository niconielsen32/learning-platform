import { useState } from "react";

import { cn } from "@/lib/utils";

import type { ExerciseProps } from "./types";

export function TrueFalse({ onAnswerChange, disabled }: ExerciseProps) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const choose = (v: boolean) => {
    if (disabled) return;
    setSelected(v);
    onAnswerChange({ value: v });
  };
  return (
    <div className="flex justify-center gap-4">
      {[true, false].map((v) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => choose(v)}
          disabled={disabled}
          className={cn(
            "min-w-[140px] rounded-2xl border-2 px-6 py-4 text-2xl font-extrabold transition",
            selected === v
              ? v
                ? "border-owl-green bg-owl-green text-white"
                : "border-owl-red bg-owl-red text-white"
              : "border-owl-mist bg-white hover:border-owl-blue/40"
          )}
        >
          {v ? "True" : "False"}
        </button>
      ))}
    </div>
  );
}
