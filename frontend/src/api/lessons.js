import { api } from "./client";
export async function getLesson(id) {
    const { data } = await api.get(`/lessons/${id}`);
    return data;
}
export async function submitExercise(exerciseId, answer, timeTakenMs = 0) {
    const { data } = await api.post(`/lessons/exercises/${exerciseId}/submit`, { answer, time_taken_ms: timeTakenMs });
    return data;
}
export async function completeLesson(lessonId) {
    const { data } = await api.post(`/lessons/${lessonId}/complete`);
    return data;
}
