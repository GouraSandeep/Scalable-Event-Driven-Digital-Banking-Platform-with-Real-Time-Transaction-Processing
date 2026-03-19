import React, { useState } from "react";
import api from "../api/axios";
import "./Deposit.css";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [mpin, setMpin] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const openPopup = () => {
    if (!amount) {
      alert("Enter amount");
      return;
    }
    setShowPopup(true);
  };

  const pressNumber = (num) => {
    if (mpin.length < 4) {
      setMpin(mpin + num);
    }
  };

  const deleteNumber = () => {
    setMpin(mpin.slice(0, -1));
  };

  const deposit = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await api.post("/transaction/deposit", {
        amount,
        mpin,
      });

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setShowPopup(false);
        setAmount("");
        setMpin("");
        setLoading(false);
      }, 2000);
    } catch (err) {
      setLoading(false);
      alert(err.response?.data?.message || "Deposit failed");
    }
  };

  return (
    <div className="fintech-txn-page">
      <nav className="fintech-navbar">
        <div className="fintech-logo">
          <i className="fa-solid fa-building-columns"></i>
          SecureBank
        </div>
      </nav>

      <div className="fintech-txn-wrapper">
        <div className="fintech-txn-card">
          <h2>Deposit Money</h2>
          <p className="fintech-sub">Add money securely to your account</p>

          <div className="amount-input">
            <span>₹</span>
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <button className="fintech-btn big" onClick={openPopup}>
            Continue
          </button>
        </div>
      </div>

      {/* MPIN POPUP */}
      {showPopup && (
        <div className="fintech-mpin-overlay">
          <div className="fintech-mpin-card">
            {!success ? (
              <>
                <h3>Enter MPIN</h3>

                <div className="mpin-dots">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={i < mpin.length ? "dot filled" : "dot"}
                    ></div>
                  ))}
                </div>

                <div className="fintech-keypad">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <button key={n} onClick={() => pressNumber(n)}>
                      {n}
                    </button>
                  ))}

                  <button onClick={deleteNumber}>⌫</button>
                  <button onClick={() => pressNumber(0)}>0</button>

                  <button
                    className="confirm"
                    disabled={mpin.length !== 4}
                    onClick={deposit}
                  >
                    ✔
                  </button>
                </div>

                <button
                  className="cancel"
                  onClick={() => {
                    setShowPopup(false);
                    setMpin("");
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <div className="success">
                <div className="tick"></div>
                <p>Deposit Successful</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
