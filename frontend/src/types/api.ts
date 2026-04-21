export type CourseStatus = "draft" | "generating" | "ready" | "failed";

export type ExerciseKind =
  | "multiple_choice"
  | "fill_blank"
  | "true_false"
  | "match_pairs"
  | "ordering"
  | "type_answer"
  | "select_image"
  | "listening";

export interface UserMe {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface UserStats {
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  hearts: number;
  max_hearts: number;
  lessons_completed: number;
  achievements_unlocked: number;
}

export interface Lesson {
  id: string;
  position: number;
  title: string;
  objective: string;
  estimated_minutes: number;
  xp_reward: number;
  is_generated: boolean;
  completed: boolean;
  best_accuracy: number;
}

export interface Unit {
  id: string;
  position: number;
  title: string;
  description: string;
  icon_emoji: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  creator_id: string;
  topic: string;
  title: string;
  description: string;
  difficulty: string;
  language: string;
  status: CourseStatus;
  icon_emoji: string;
  color_hex: string;
  learning_outcomes: string[];
  is_public: boolean;
  created_at: string;
}

export interface CourseDetail extends Course {
  units: Unit[];
}

export interface Exercise {
  id: string;
  position: number;
  kind: ExerciseKind;
  prompt: string;
  payload: Record<string, unknown>;
  difficulty: number;
}

export interface LessonDetail extends Lesson {
  teaching_notes: string | null;
  exercises: Exercise[];
}

export interface ExerciseResult {
  is_correct: boolean;
  correct_answer: Record<string, unknown>;
  explanation: string | null;
}

export interface LessonCompletionResult {
  lesson_id: string;
  accuracy: number;
  xp_earned: number;
  new_total_xp: number;
  streak_extended: boolean;
  current_streak: number;
  achievements_unlocked: string[];
}

export interface HeartsResponse {
  current: number;
  max: number;
  next_refill_at: string | null;
  seconds_to_next_refill: number | null;
}

export interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  weekly_xp: number;
}
