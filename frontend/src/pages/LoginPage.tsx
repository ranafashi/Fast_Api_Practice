import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { extractApiError } from "../utils/errors";

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email.trim(), password);
      await fetchCart().catch(() => undefined);
      toast.success("Welcome back");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(extractApiError(error, "Login failed"));
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <p className="eyebrow">BRANDIAYA</p>
        <h1>Sign in</h1>
        <p className="lede">Use your email as the OAuth2 username.</p>

        <label>
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button type="submit" className="primary-btn wide" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="auth-foot">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
