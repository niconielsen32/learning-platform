import type { Exercise } from "@/types/api";

import { FillBlank } from "./FillBlank";
import { MatchPairs } from "./MatchPairs";
import { MultipleChoice } from "./MultipleChoice";
import { Ordering } from "./Ordering";
import { TrueFalse } from "./TrueFalse";
import { TypeAnswer } from "./TypeAnswer";

interface Props {
  exercise: Exercise;
  onAnswerChange: (a: Record<string, unknown> | null) => void;
  disabled?: boolean;
}

export function ExerciseRenderer({ exercise, onAnswerChange, disabled }: Props) {
  const props = { exercise, onAnswerChange, disabled };
  switch (exercise.kind) {
    case "multiple_choice":
    case "select_image":
      return <MultipleChoice {...props} />;
    case "fill_blank":
      return <FillBlank {...props} />;
    case "true_false":
      return <TrueFalse {...props} />;
    case "match_pairs":
      return <MatchPairs {...props} />;
    case "ordering":
      return <Ordering {...props} />;
    case "type_answer":
    case "listening":
      return <TypeAnswer {...props} />;
    default:
      return <p className="text-owl-red">Unsupported exercise kind: {exercise.kind}</p>;
  }
}
