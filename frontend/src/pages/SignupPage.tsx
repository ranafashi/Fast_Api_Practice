import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { extractApiError } from "../utils/errors";

export function SignupPage() {
  const signup = useAuthStore((s) => s.signup);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: 18,
    city: "",
    postal_Code: 0,
  });

  const set = (key: keyof typeof form, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.age <= 0) {
      toast.error("Age must be greater than 0");
      return;
    }
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        age: Number(form.age),
        address: {
          city: form.city.trim(),
          postal_Code: Number(form.postal_Code),
        },
        role: "customer",
      });
      toast.success("Account created");
      navigate("/");
    } catch (error) {
      toast.error(extractApiError(error, "Signup failed"));
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <p className="eyebrow">BRANDIAYA</p>
        <h1>Create account</h1>
        <p className="lede">Nested address fields match the backend User schema.</p>

        <div className="form-grid">
          <label>
            Name
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} />
          </label>
          <label>
            Age
            <input
              type="number"
              min={1}
              required
              value={form.age}
              onChange={(e) => set("age", Number(e.target.value))}
            />
          </label>
          <label className="span-2">
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </label>
          <label className="span-2">
            Password
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </label>
          <label>
            City
            <input required value={form.city} onChange={(e) => set("city", e.target.value)} />
          </label>
          <label>
            Postal code
            <input
              type="number"
              required
              value={form.postal_Code || ""}
              onChange={(e) => set("postal_Code", Number(e.target.value))}
            />
          </label>
        </div>

        <button type="submit" className="primary-btn wide" disabled={loading}>
          {loading ? "Creating…" : "Sign up"}
        </button>

        <p className="auth-foot">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
