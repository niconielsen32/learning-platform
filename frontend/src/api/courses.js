import { api } from "./client";
export async function listMyCourses() {
    const { data } = await api.get("/courses");
    return data;
}
export async function getCourse(id) {
    const { data } = await api.get(`/courses/${id}`);
    return data;
}
export async function createCourse(topic, difficulty = "beginner") {
    const { data } = await api.post("/courses", { topic, difficulty, language: "en" });
    return data;
}
export async function deleteCourse(id) {
    await api.delete(`/courses/${id}`);
}
