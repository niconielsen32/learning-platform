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

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="card w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-5xl">🦉</div>
          <h1 className="mt-2 text-3xl font-extrabold text-owl-green">Start learning anything</h1>
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
            placeholder="Display name (optional)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl border-2 border-owl-mist px-4 py-3 focus:border-owl-blue focus:outline-none"
          />
          <input
            type="text"
            required
            minLength={3}
            pattern="[a-zA-Z0-9_.\-]+"
            placeholder="Username (letters, numbers, _ . -)"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border-2 border-owl-mist px-4 py-3 focus:border-owl-blue focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6 chars)"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border-2 border-owl-mist px-4 py-3 focus:border-owl-blue focus:outline-none"
          />
          {m.isError && (
            <p className="text-sm text-owl-red">
              Couldn't create your account. The username may already be taken.
            </p>
          )}
          <button type="submit" disabled={m.isPending} className="btn-primary w-full">
            {m.isPending ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-owl-green">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
