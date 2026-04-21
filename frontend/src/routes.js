import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { CoursePage } from "@/pages/CoursePage";
import { CreateCoursePage } from "@/pages/CreateCoursePage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";
import { LessonPage } from "@/pages/LessonPage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
export const router = createBrowserRouter([
    { path: "/login", element: _jsx(LoginPage, {}) },
    { path: "/signup", element: _jsx(SignupPage, {}) },
    {
        element: _jsx(RequireAuth, {}),
        children: [
            {
                element: _jsx(AppShell, {}),
                children: [
                    { path: "/", element: _jsx(DashboardPage, {}) },
                    { path: "/create", element: _jsx(CreateCoursePage, {}) },
                    { path: "/courses/:courseId", element: _jsx(CoursePage, {}) },
                    { path: "/lessons/:lessonId", element: _jsx(LessonPage, {}) },
                    { path: "/leaderboard", element: _jsx(LeaderboardPage, {}) },
                ],
            },
        ],
    },
]);
