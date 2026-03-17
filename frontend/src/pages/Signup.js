import React, { useState } from "react";
import api from "../api/axios.js";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/signup", form);
      alert(res.data.message);

      setForm({
        username: "",
        email: "",
        password: "",
      });

      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="fintech-signup-page">
      {/* NAVBAR */}
      <nav className="fintech-navbar">
        <div className="fintech-logo">
          <i className="fa-solid fa-building-columns"></i>
          SecureBank
        </div>
      </nav>

      <div className="fintech-signup-wrapper">
        {/* LEFT LANDING */}
        <div className="fintech-left">
          <h1>Digital Banking System</h1>
          <p>
            Experience lightning fast transfers, powerful account control, and
            enterprise-grade security.
          </p>

          <div className="fintech-features">
            <div>
              <i className="fa-solid fa-shield-halved"></i>
              Bank-level Security
            </div>
            <div>
              <i className="fa-solid fa-bolt"></i>
              Instant Transfers
            </div>
            <div>
              <i className="fa-solid fa-mobile-screen"></i>
              Smart Mobile Banking
            </div>
          </div>
        </div>

        {/* FORM CARD */}
        <div className="fintech-signup-card">
          <h2>Create Account</h2>
          <p className="fintech-sub">Open your account in under 30 seconds</p>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="fintech-input">
              <i className="fa-solid fa-user"></i>
              <input
                type="text"
                placeholder="Username"
                required
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>

            <div className="fintech-input">
              <i className="fa-solid fa-envelope"></i>
              <input
                type="email"
                placeholder="Email"
                required
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="fintech-input password">
              <i className="fa-solid fa-lock"></i>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              <span onClick={() => setShowPassword(!showPassword)}>
                <i
                  className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                ></i>
              </span>
            </div>

            <button className="fintech-btn">Create Account</button>
          </form>

          <p className="fintech-login-link">
            Already have account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
