import { api } from "./client";
import type { Course, CourseDetail } from "@/types/api";

export async function listMyCourses(): Promise<Course[]> {
  const { data } = await api.get<Course[]>("/courses");
  return data;
}

export async function getCourse(id: string): Promise<CourseDetail> {
  const { data } = await api.get<CourseDetail>(`/courses/${id}`);
  return data;
}

export async function createCourse(topic: string, difficulty = "beginner"): Promise<Course> {
  const { data } = await api.post<Course>("/courses", { topic, difficulty, language: "en" });
  return data;
}

export async function deleteCourse(id: string): Promise<void> {
  await api.delete(`/courses/${id}`);
}
