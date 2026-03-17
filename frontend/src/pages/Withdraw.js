import React, { useState } from "react";
import api from "../api/axios";
import "./Withdraw.css";

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [mpin, setMpin] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const withdraw = async () => {
    try {
      const res = await api.post("/transaction/withdraw", {
        amount,
        mpin,
      });

      console.log("Withdraw success:", res.data);

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setShowPopup(false);
        setAmount("");
        setMpin("");
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Withdraw failed");
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
          <h2>Withdraw Money</h2>
          <p className="fintech-sub">Securely debit money from your account</p>

          <div className="amount-input">
            <span>₹</span>
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <button className="fintech-btn danger big" onClick={openPopup}>
            Continue
          </button>
        </div>
      </div>

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
                      className={i < mpin.length ? "dot filled danger" : "dot"}
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
                    className="confirm danger"
                    disabled={mpin.length !== 4}
                    onClick={withdraw}
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
                <div className="tick danger"></div>
                <p>Withdraw Successful</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
