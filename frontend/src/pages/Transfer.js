import React, { useState } from "react";
import api from "../api/axios";
import "./Transfer.css";

export default function Transfer() {
  const [receiverAccount, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [mpin, setMpin] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [success, setSuccess] = useState(false);

  const openPopup = () => {
    if (!receiverAccount || !amount) {
      alert("Enter receiver account and amount");
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

  const transfer = async () => {
    try {
      await api.post("/transaction/transfer", {
        receiverAccount,
        amount,
        mpin,
      });

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setShowPopup(false);

        setReceiver("");
        setAmount("");
        setMpin("");
      }, 2000);
    } catch (err) {
      console.error("Transfer error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Transfer failed");
    }
  };

  return (
    <div className="fintech-txn-page">
      {/* NAVBAR */}
      <nav className="fintech-navbar">
        <div className="fintech-logo">
          <i className="fa-solid fa-building-columns"></i>
          SecureBank
        </div>
      </nav>

      <div className="fintech-txn-wrapper">
        <div className="fintech-txn-card">
          <h2>Send Money</h2>
          <p className="fintech-sub">Transfer instantly & securely</p>

          <div className="fintech-input big">
            <i className="fa-solid fa-id-card"></i>
            <input
              placeholder="Receiver Account Number"
              value={receiverAccount}
              onChange={(e) => setReceiver(e.target.value)}
            />
          </div>

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
            Continue Transfer
          </button>
        </div>
      </div>

      {/* MPIN POPUP */}
      {showPopup && (
        <div className="fintech-mpin-overlay">
          <div className="fintech-mpin-card">
            {!success ? (
              <>
                <h3>Confirm with MPIN</h3>

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
                    className="confirm primary"
                    disabled={mpin.length !== 4}
                    onClick={transfer}
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
                <p>Transfer Successful</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
