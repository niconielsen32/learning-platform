import { api } from "./client";
import type { ExerciseResult, LessonCompletionResult, LessonDetail } from "@/types/api";

export async function getLesson(id: string): Promise<LessonDetail> {
  const { data } = await api.get<LessonDetail>(`/lessons/${id}`);
  return data;
}

export async function submitExercise(
  exerciseId: string,
  answer: Record<string, unknown>,
  timeTakenMs = 0
): Promise<ExerciseResult> {
  const { data } = await api.post<ExerciseResult>(
    `/lessons/exercises/${exerciseId}/submit`,
    { answer, time_taken_ms: timeTakenMs }
  );
  return data;
}

export async function completeLesson(lessonId: string): Promise<LessonCompletionResult> {
  const { data } = await api.post<LessonCompletionResult>(`/lessons/${lessonId}/complete`);
  return data;
}
