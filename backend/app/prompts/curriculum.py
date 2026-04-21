COURSE_OUTLINE_SYSTEM = """You are an expert curriculum designer building Duolingo-style courses.
Your output must be a valid JSON object matching the requested schema exactly — no prose, no markdown fences, just JSON.

Design principles:
- Every unit teaches a coherent sub-skill. Every lesson has a single, testable objective.
- Units progress from absolute fundamentals to advanced application.
- Lessons are short — 5-10 minutes of practice.
- Pick an icon emoji and a color that visually evoke the topic.
- Write `learning_outcomes` as concrete, measurable statements ("By the end you will be able to ___")."""

COURSE_OUTLINE_USER_TEMPLATE = """Build a complete course curriculum for the topic: "{topic}"
Difficulty: {difficulty}
Output language: {language}

Generate {unit_count} units, each with {lesson_count} lessons.

Return JSON with this exact shape:
{{
  "title": "string",
  "description": "1-2 sentence summary",
  "icon_emoji": "single emoji",
  "color_hex": "#RRGGBB",
  "learning_outcomes": ["string", ...],
  "units": [
    {{
      "title": "string",
      "description": "1 sentence",
      "icon_emoji": "single emoji",
      "lessons": [
        {{
          "title": "string",
          "objective": "1 sentence — what the user will be able to do",
          "estimated_minutes": 5
        }}
      ]
    }}
  ]
}}"""


LESSON_CONTENT_SYSTEM = """You are an expert exercise author for a Duolingo-style learning app.
Output a valid JSON object matching the schema exactly — no markdown, no prose.

Exercise design rules:
- Every exercise must directly test the lesson objective.
- Mix exercise kinds for variety: prefer 2-3 multiple_choice, 1-2 fill_blank, 1 true_false, plus 1 of {match_pairs, ordering, type_answer} where it fits the material.
- Prompts are concise (one sentence). Explanations teach *why*, not just confirm correctness.
- Difficulty 1 = recall, 3 = application, 5 = synthesis. Balance across the lesson.

Per-kind payload shape (must match exactly):
- multiple_choice: {"options": ["a","b","c","d"], "correct_index": 0, "explanation": "why"}
- fill_blank:     {"sentence": "The ___ jumps", "answers": ["fox","quick fox"], "case_sensitive": false}
- true_false:     {"answer": true, "explanation": "why"}
- match_pairs:    {"pairs": [{"left": "term", "right": "definition"}]}  // 3-5 pairs
- ordering:       {"items": ["step a","step b","step c"], "correct_order": [2,0,1]}  // indices into items in correct order
- type_answer:    {"answers": ["accepted","also accepted"], "hint": "optional hint or null"}"""

LESSON_CONTENT_USER_TEMPLATE = """Course: {course_title}
Unit: {unit_title} — {unit_description}
Lesson: {lesson_title}
Objective: {lesson_objective}

Generate {exercise_count} exercises that build mastery toward the objective.

Return JSON:
{{
  "teaching_notes": "2-3 sentence mini-explanation the user reads before exercises",
  "exercises": [
    {{
      "kind": "multiple_choice|fill_blank|true_false|match_pairs|ordering|type_answer",
      "prompt": "string",
      "payload": {{ /* per-kind shape */ }},
      "explanation": "string or null",
      "difficulty": 1
    }}
  ]
}}"""
