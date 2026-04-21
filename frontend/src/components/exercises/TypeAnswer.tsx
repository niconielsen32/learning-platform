import { useState } from "react";

import type { ExerciseProps } from "./types";

export function TypeAnswer({ exercise, onAnswerChange, disabled }: ExerciseProps) {
  const hint = exercise.payload.hint as string | null | undefined;
  const [value, setValue] = useState("");
  return (
    <div>
      <input
        type="text"
        value={value}
        disabled={disabled}
        autoFocus
        onChange={(e) => {
          setValue(e.target.value);
          onAnswerChange(e.target.value ? { text: e.target.value } : null);
        }}
        placeholder="Type your answer…"
        className="w-full rounded-xl border-2 border-owl-mist px-4 py-3 text-lg focus:border-owl-blue focus:outline-none"
      />
      {hint && <p className="mt-2 text-sm text-slate-500">💡 {hint}</p>}
    </div>
  );
}
