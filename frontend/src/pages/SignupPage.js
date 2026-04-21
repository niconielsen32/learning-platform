import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, register } from "@/api/auth";
import { useAuthStore } from "@/stores/auth";
export function SignupPage() {
    const navigate = useNavigate();
    const setToken = useAuthStore((s) => s.setToken);
    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const m = useMutation({
        mutationFn: async () => {
            await register(username, password, displayName || undefined);
            return login(username, password);
        },
        onSuccess: (token) => {
            setToken(token);
            navigate("/");
        },
    });
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center p-6", children: _jsxs("div", { className: "card w-full max-w-md", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx("div", { className: "text-5xl", children: "\uD83E\uDD89" }), _jsx("h1", { className: "mt-2 text-3xl font-extrabold text-owl-green", children: "Start learning anything" })] }), _jsxs("form", { className: "space-y-4", onSubmit: (e) => {
                        e.preventDefault();
                        m.mutate();
                    }, children: [_jsx("input", { type: "text", placeholder: "Display name (optional)", value: displayName, onChange: (e) => setDisplayName(e.target.value), className: "w-full rounded-xl border-2 border-owl-mist px-4 py-3 focus:border-owl-blue focus:outline-none" }), _jsx("input", { type: "text", required: true, minLength: 3, pattern: "[a-zA-Z0-9_.\\-]+", placeholder: "Username (letters, numbers, _ . -)", autoComplete: "username", value: username, onChange: (e) => setUsername(e.target.value), className: "w-full rounded-xl border-2 border-owl-mist px-4 py-3 focus:border-owl-blue focus:outline-none" }), _jsx("input", { type: "password", required: true, minLength: 6, placeholder: "Password (min 6 chars)", autoComplete: "new-password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full rounded-xl border-2 border-owl-mist px-4 py-3 focus:border-owl-blue focus:outline-none" }), m.isError && (_jsx("p", { className: "text-sm text-owl-red", children: "Couldn't create your account. The username may already be taken." })), _jsx("button", { type: "submit", disabled: m.isPending, className: "btn-primary w-full", children: m.isPending ? "Creating…" : "Create account" })] }), _jsxs("p", { className: "mt-6 text-center text-sm", children: ["Already have an account?", " ", _jsx(Link, { to: "/login", className: "font-bold text-owl-green", children: "Log in" })] })] }) }));
}
