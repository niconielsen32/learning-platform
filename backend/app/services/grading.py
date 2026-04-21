from app.models.course import Exercise, ExerciseKind


def _normalize(s: str, *, case_sensitive: bool = False) -> str:
    s = s.strip()
    return s if case_sensitive else s.lower()


def grade(exercise: Exercise, answer: dict) -> tuple[bool, dict]:
    """Return (is_correct, correct_answer_payload).

    `answer` shape per kind:
      multiple_choice: {"selected_index": int}
      fill_blank:      {"text": str}
      true_false:      {"value": bool}
      match_pairs:     {"matches": [{"left": str, "right": str}]}
      ordering:        {"order": [int]}
      type_answer:     {"text": str}
      select_image:    {"selected_index": int}
      listening:       {"text": str}
    """
    payload = exercise.payload
    kind = exercise.kind

    if kind == ExerciseKind.MULTIPLE_CHOICE:
        is_correct = answer.get("selected_index") == payload["correct_index"]
        return is_correct, {"correct_index": payload["correct_index"]}

    if kind == ExerciseKind.FILL_BLANK:
        case = bool(payload.get("case_sensitive", False))
        submitted = _normalize(str(answer.get("text", "")), case_sensitive=case)
        accepted = {_normalize(a, case_sensitive=case) for a in payload["answers"]}
        return submitted in accepted, {"answers": payload["answers"]}

    if kind == ExerciseKind.TRUE_FALSE:
        return bool(answer.get("value")) == bool(payload["answer"]), {"answer": payload["answer"]}

    if kind == ExerciseKind.MATCH_PAIRS:
        expected = {(p["left"], p["right"]) for p in payload["pairs"]}
        submitted = {(m.get("left"), m.get("right")) for m in answer.get("matches", [])}
        return submitted == expected, {"pairs": payload["pairs"]}

    if kind == ExerciseKind.ORDERING:
        return list(answer.get("order", [])) == list(payload["correct_order"]), {
            "correct_order": payload["correct_order"]
        }

    if kind in (ExerciseKind.TYPE_ANSWER, ExerciseKind.LISTENING):
        submitted = _normalize(str(answer.get("text", "")))
        accepted = {_normalize(a) for a in payload["answers"]}
        return submitted in accepted, {"answers": payload["answers"]}

    if kind == ExerciseKind.SELECT_IMAGE:
        is_correct = answer.get("selected_index") == payload["correct_index"]
        return is_correct, {"correct_index": payload["correct_index"]}

    return False, {}
