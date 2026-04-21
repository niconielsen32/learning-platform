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
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/create", element: <CreateCoursePage /> },
          { path: "/courses/:courseId", element: <CoursePage /> },
          { path: "/lessons/:lessonId", element: <LessonPage /> },
          { path: "/leaderboard", element: <LeaderboardPage /> },
        ],
      },
    ],
  },
]);
