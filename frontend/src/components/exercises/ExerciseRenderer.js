import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FillBlank } from "./FillBlank";
import { MatchPairs } from "./MatchPairs";
import { MultipleChoice } from "./MultipleChoice";
import { Ordering } from "./Ordering";
import { TrueFalse } from "./TrueFalse";
import { TypeAnswer } from "./TypeAnswer";
export function ExerciseRenderer({ exercise, onAnswerChange, disabled }) {
    const props = { exercise, onAnswerChange, disabled };
    switch (exercise.kind) {
        case "multiple_choice":
        case "select_image":
            return _jsx(MultipleChoice, { ...props });
        case "fill_blank":
            return _jsx(FillBlank, { ...props });
        case "true_false":
            return _jsx(TrueFalse, { ...props });
        case "match_pairs":
            return _jsx(MatchPairs, { ...props });
        case "ordering":
            return _jsx(Ordering, { ...props });
        case "type_answer":
        case "listening":
            return _jsx(TypeAnswer, { ...props });
        default:
            return _jsxs("p", { className: "text-owl-red", children: ["Unsupported exercise kind: ", exercise.kind] });
    }
}
