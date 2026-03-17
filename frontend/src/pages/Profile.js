import { useState, useEffect } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/account/my");
        setProfile(res.data);
      } catch (err) {
        alert("Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  const changeMpin = async () => {
    const oldMpin = prompt("Enter old MPIN");
    const newMpin = prompt("Enter new MPIN");

    if (!oldMpin || !newMpin) return;

    try {
      await api.post("/account/change-mpin", {
        oldMpin,
        newMpin,
      });

      alert("MPIN changed successfully");
    } catch (err) {
      alert(err.response?.data?.message || "MPIN change failed");
    }
  };

  const changePassword = async () => {
    const oldPassword = prompt("Enter old password");
    const newPassword = prompt("Enter new password");

    if (!oldPassword || !newPassword) return;

    try {
      await api.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });

      alert("Password changed successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Password change failed");
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/login");
    } catch (err) {
      alert("Logout failed");
    }
  };

  return (
    <div className="fintech-profile-page">
      {/* NAVBAR */}
      <nav className="fintech-navbar">
        <div className="fintech-logo">
          <i className="fa-solid fa-building-columns"></i>
          SecureBank
        </div>

        <Link to="/dashboard" className="back-link">
          ← Dashboard
        </Link>
      </nav>

      <div className="fintech-profile-wrapper">
        <div className="fintech-profile-card">
          <div className="profile-top">
            <div className="avatar">
              <i className="fa-solid fa-user"></i>
            </div>

            <div>
              <h3>{profile?.username || "Loading..."}</h3>
              <p>{profile?.email}</p>
            </div>
          </div>

          {profile && (
            <>
              <div className="profile-info">
                <div className="row">
                  <span>Account Number</span>
                  <p>{profile.accountNumber}</p>
                </div>

                <div className="row">
                  <span>Account Type</span>
                  <p className="cap">{profile.accountType}</p>
                </div>

                <div className="row">
                  <span>Available Balance</span>
                  <p className="balance">₹ {profile.balance}</p>
                </div>
              </div>

              <div className="profile-actions">
                <button className="fintech-btn outline" onClick={changeMpin}>
                  Change MPIN
                </button>

                <button
                  className="fintech-btn outline"
                  onClick={changePassword}
                >
                  Change Password
                </button>

                <button className="fintech-btn danger" onClick={logout}>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
