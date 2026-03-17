import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link, Navigate } from "react-router-dom";
import "./Dashboard.css";

function Section({ title, children }) {
  return (
    <div className="fintech-section">
      <h3>{title}</h3>
      <div className="grid">{children}</div>
    </div>
  );
}

function Card({ link, icon, text }) {
  return (
    <Link to={link} className="service-card">
      <i className={`fa-solid fa-${icon}`}></i>
      <span>{text}</span>
    </Link>
  );
}

export default function Dashboard() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await api.get("/account/my");
        setAccount(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchAccount();
  }, []);

  function ProtectedRoute({ children }) {
    const token = document.cookie.includes("token");

    return token ? children : <Navigate to="/login" />;
  }

  return (
    <div className="fintech-dash">
      {/* NAVBAR */}
      <nav className="fintech-nav">
        <div className="logo">
          <i className="fa-solid fa-building-columns"></i>
          SecureBank
        </div>

        <div className="profile">
          <i className="fa-solid fa-user-circle"></i>
          My Account
        </div>
      </nav>

      <div className="fintech-dash-container">
        {account ? (
          <>
            {/* BALANCE CARD */}
            <div className="fintech-balance-card">
              <div>
                <p className="label">Available Balance</p>
                <h1>₹ {account.balance}</h1>
                <p className="acc-no">{account.accountNumber}</p>
              </div>

              <div className="acc-type">{account.accountType}</div>
            </div>

            {/* QUICK ACTION */}
            <div className="fintech-actions">
              <Link to="/deposit" className="action">
                <i className="fa-solid fa-arrow-down"></i>
                Deposit
              </Link>

              <Link to="/withdraw" className="action">
                <i className="fa-solid fa-arrow-up"></i>
                Withdraw
              </Link>

              <Link to="/transfer" className="action primary">
                <i className="fa-solid fa-paper-plane"></i>
                Transfer
              </Link>
            </div>

            {/* SERVICES */}
            <Section title="Banking">
              <Card
                link="/transactions"
                icon="clock-rotate-left"
                text="Transactions"
              />
              <Card link="/loan" icon="hand-holding-dollar" text="Loans" />
              <Card link="/profile" icon="user" text="Profile" />
              <Card link="/settings" icon="gear" text="Settings" />
            </Section>

            <Section title="Cards">
              <Card link="/debit-card" icon="credit-card" text="Debit Card" />
              <Card link="/credit-card" icon="credit-card" text="Credit Card" />
              <Card
                link="/virtual-card"
                icon="mobile-screen"
                text="Virtual Card"
              />
              <Card link="/atm-card" icon="building-columns" text="ATM Card" />
            </Section>

            <Section title="Recharge & Bills">
              <Card link="/mobile-recharge" icon="mobile" text="Mobile" />
              <Card link="/electricity-bill" icon="bolt" text="Electricity" />
              <Card link="/fastag" icon="car" text="Fastag" />
              <Card
                link="/loan-repayment"
                icon="money-bill-transfer"
                text="Loan Pay"
              />
            </Section>
          </>
        ) : (
          <div className="no-account">
            <h3>No Account Found</h3>
            <Link to="/create-account" className="fintech-btn">
              Create Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
