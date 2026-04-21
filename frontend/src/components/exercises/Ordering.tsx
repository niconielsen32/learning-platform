import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import type { ExerciseProps } from "./types";

export function Ordering({ exercise, onAnswerChange, disabled }: ExerciseProps) {
  const items = (exercise.payload.items as string[]) ?? [];
  const [order, setOrder] = useState<number[]>(items.map((_, i) => i));

  useEffect(() => {
    onAnswerChange({ order });
  }, [order, onAnswerChange]);

  const move = (idx: number, dir: -1 | 1) => {
    if (disabled) return;
    const target = idx + dir;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[idx], next[target]] = [next[target], next[idx]];
    setOrder(next);
  };

  return (
    <ol className="space-y-2">
      {order.map((itemIdx, posIdx) => (
        <li
          key={itemIdx}
          className="flex items-center gap-2 rounded-xl border-2 border-owl-mist bg-white px-4 py-3 font-bold"
        >
          <span className="w-6 text-center text-sm opacity-60">{posIdx + 1}.</span>
          <span className="flex-1">{items[itemIdx]}</span>
          <button
            type="button"
            disabled={disabled || posIdx === 0}
            onClick={() => move(posIdx, -1)}
            className="rounded p-1 hover:bg-owl-mist disabled:opacity-30"
          >
            <ChevronUp size={18} />
          </button>
          <button
            type="button"
            disabled={disabled || posIdx === order.length - 1}
            onClick={() => move(posIdx, 1)}
            className="rounded p-1 hover:bg-owl-mist disabled:opacity-30"
          >
            <ChevronDown size={18} />
          </button>
        </li>
      ))}
    </ol>
  );
}
