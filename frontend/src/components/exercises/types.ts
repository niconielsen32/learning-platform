import type { Exercise } from "@/types/api";

export interface ExerciseProps {
  exercise: Exercise;
  onAnswerChange: (answer: Record<string, unknown> | null) => void;
  disabled?: boolean;
}
