import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "./CreateAccount.css";

export default function CreateAccount() {
  const [accountType, setAccountType] = useState("savings");
  const [mpin, setMpin] = useState("");
  const [confirmMpin, setConfirmMpin] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const createAccount = async () => {
    if (mpin.length !== 4) {
      alert("MPIN must be 4 digits");
      return;
    }

    if (mpin !== confirmMpin) {
      alert("MPIN does not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/account/create", {
        accountType,
        mpin,
      });

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Account creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fintech-page">
      {/* NAVBAR */}
      <nav className="fintech-navbar">
        <div className="fintech-logo">
          <i className="fa-solid fa-building-columns"></i>
          SecureBank
        </div>
      </nav>

      <div className="fintech-wrapper">
        <div className="fintech-card">
          <h2>Create Your Account</h2>
          <p className="fintech-sub">
            Open your digital bank account in seconds
          </p>

          {/* ACCOUNT TYPE */}
          <div className="fintech-accounts">
            <div
              className={`fintech-option ${
                accountType === "savings" ? "active" : ""
              }`}
              onClick={() => setAccountType("savings")}
            >
              <i className="fa-solid fa-piggy-bank"></i>
              <span>Savings</span>
            </div>

            <div
              className={`fintech-option ${
                accountType === "current" ? "active" : ""
              }`}
              onClick={() => setAccountType("current")}
            >
              <i className="fa-solid fa-briefcase"></i>
              <span>Current</span>
            </div>
          </div>

          {/* MPIN */}
          <div className="fintech-mpin">
            <input
              type="password"
              maxLength="4"
              placeholder="Create MPIN"
              value={mpin}
              onChange={(e) => setMpin(e.target.value)}
            />

            <input
              type="password"
              maxLength="4"
              placeholder="Confirm MPIN"
              value={confirmMpin}
              onChange={(e) => setConfirmMpin(e.target.value)}
            />
          </div>

          <button
            className="fintech-btn"
            onClick={createAccount}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
