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

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="card w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-5xl">🦉</div>
          <h1 className="mt-2 text-3xl font-extrabold text-owl-green">Welcome back</h1>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            m.mutate();
          }}
        >
          <input
            type="text"
            required
            placeholder="Username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border-2 border-owl-mist px-4 py-3 focus:border-owl-blue focus:outline-none"
          />
          <input
            type="password"
            required
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border-2 border-owl-mist px-4 py-3 focus:border-owl-blue focus:outline-none"
          />
          {m.isError && (
            <p className="text-sm text-owl-red">Login failed. Check your username and password.</p>
          )}
          <button type="submit" disabled={m.isPending} className="btn-primary w-full">
            {m.isPending ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="mt-4 rounded-xl bg-owl-blue/10 p-3 text-center text-sm">
          <p className="font-bold text-owl-blue">Try the demo account</p>
          <p className="font-mono text-xs">
            {DEMO_USERNAME} / {DEMO_PASSWORD}
          </p>
          <button onClick={fillDemo} className="mt-2 text-xs font-bold text-owl-blue underline">
            Fill in for me
          </button>
        </div>

        <p className="mt-6 text-center text-sm">
          New here?{" "}
          <Link to="/signup" className="font-bold text-owl-green">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
