import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "@/api/auth";
import { useAuthStore } from "@/stores/auth";
const DEMO_USERNAME = "demo";
const DEMO_PASSWORD = "learnnow";
export function LoginPage() {
    const navigate = useNavigate();
    const setToken = useAuthStore((s) => s.setToken);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const m = useMutation({
        mutationFn: () => login(username, password),
        onSuccess: (token) => {
            setToken(token);
            navigate("/");
        },
    });
    const fillDemo = () => {
        setUsername(DEMO_USERNAME);
        setPassword(DEMO_PASSWORD);
    };
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center p-6", children: _jsxs("div", { className: "card w-full max-w-md", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx("div", { className: "text-5xl", children: "\uD83E\uDD89" }), _jsx("h1", { className: "mt-2 text-3xl font-extrabold text-owl-green", children: "Welcome back" })] }), _jsxs("form", { className: "space-y-4", onSubmit: (e) => {
                        e.preventDefault();
                        m.mutate();
                    }, children: [_jsx("input", { type: "text", required: true, placeholder: "Username", autoComplete: "username", value: username, onChange: (e) => setUsername(e.target.value), className: "w-full rounded-xl border-2 border-owl-mist px-4 py-3 focus:border-owl-blue focus:outline-none" }), _jsx("input", { type: "password", required: true, placeholder: "Password", autoComplete: "current-password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full rounded-xl border-2 border-owl-mist px-4 py-3 focus:border-owl-blue focus:outline-none" }), m.isError && (_jsx("p", { className: "text-sm text-owl-red", children: "Login failed. Check your username and password." })), _jsx("button", { type: "submit", disabled: m.isPending, className: "btn-primary w-full", children: m.isPending ? "Logging in…" : "Log in" })] }), _jsxs("div", { className: "mt-4 rounded-xl bg-owl-blue/10 p-3 text-center text-sm", children: [_jsx("p", { className: "font-bold text-owl-blue", children: "Try the demo account" }), _jsxs("p", { className: "font-mono text-xs", children: [DEMO_USERNAME, " / ", DEMO_PASSWORD] }), _jsx("button", { onClick: fillDemo, className: "mt-2 text-xs font-bold text-owl-blue underline", children: "Fill in for me" })] }), _jsxs("p", { className: "mt-6 text-center text-sm", children: ["New here?", " ", _jsx(Link, { to: "/signup", className: "font-bold text-owl-green", children: "Create an account" })] })] }) }));
}
