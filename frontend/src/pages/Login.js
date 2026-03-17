import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post("/auth/login", form);

      alert(res.data.message);

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fintech-login-page">
      {/* NAVBAR */}
      <nav className="fintech-navbar">
        <div className="fintech-logo">
          <i className="fa-solid fa-building-columns"></i>
          SecureBank
        </div>
      </nav>

      <div className="fintech-login-wrapper">
        {/* LEFT LANDING */}
        <div className="fintech-left">
          <h1>Welcome Back</h1>
          <p>
            Access your digital bank instantly. Track transactions, transfer
            money and manage accounts securely.
          </p>

          <div className="fintech-features">
            <div>
              <i className="fa-solid fa-shield-halved"></i>
              Secure Payments
            </div>
            <div>
              <i className="fa-solid fa-bolt"></i>
              Instant Transfers
            </div>
            <div>
              <i className="fa-solid fa-clock"></i>
              24/7 Banking Access
            </div>
          </div>
        </div>

        {/* LOGIN CARD */}
        <div className="fintech-login-card">
          <h2>Login</h2>
          <p className="fintech-sub">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} autoComplete="on">
            <div className="fintech-input">
              <i className="fa-solid fa-envelope"></i>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                autoComplete="email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="fintech-input password">
              <i className="fa-solid fa-lock"></i>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                autoComplete="current-password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />

              <span onClick={() => setShowPassword(!showPassword)}>
                <i
                  className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                ></i>
              </span>
            </div>

            <button className="fintech-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="fintech-login-link">
            Don’t have an account? <Link to="/signup">Signup</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
