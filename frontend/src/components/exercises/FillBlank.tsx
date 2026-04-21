import { useState } from "react";

import type { ExerciseProps } from "./types";

export function FillBlank({ exercise, onAnswerChange, disabled }: ExerciseProps) {
  const sentence = (exercise.payload.sentence as string) ?? "";
  const [value, setValue] = useState("");
  const [before, after] = sentence.split("___");

  return (
    <div className="text-xl">
      <span>{before}</span>
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => {
          setValue(e.target.value);
          onAnswerChange(e.target.value ? { text: e.target.value } : null);
        }}
        autoFocus
        className="mx-2 inline-block min-w-[120px] border-b-4 border-owl-blue bg-transparent px-2 py-1 text-center font-bold focus:outline-none"
      />
      <span>{after}</span>
    </div>
  );
}
