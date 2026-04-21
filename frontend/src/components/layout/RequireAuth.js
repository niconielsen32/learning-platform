import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
export function RequireAuth() {
    const isAuth = useAuthStore((s) => s.isAuthenticated());
    const location = useLocation();
    if (!isAuth)
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    return _jsx(Outlet, {});
}
