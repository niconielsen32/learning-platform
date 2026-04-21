import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/stores/auth";

export function RequireAuth() {
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  const location = useLocation();
  if (!isAuth) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}
