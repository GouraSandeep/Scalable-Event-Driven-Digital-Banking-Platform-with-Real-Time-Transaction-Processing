import { useState, useEffect } from "react";
import api from "../api/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Transactions.css";

export default function Transaction() {
  const [history, setHistory] = useState([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    api.get("/transaction/history").then((res) => setHistory(res.data));
    api.get("/account/my").then((res) => setBalance(res.data.balance));
  }, []);

  const downloadCSV = () => {
    const rows = [["Type", "Amount", "Date"]];

    history.forEach((t) => {
      rows.push([t.type, t.amount, new Date(t.date).toLocaleString()]);
    });

    const csvContent = rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Bank Transaction History", 14, 20);

    const tableColumn = ["Type", "Amount", "Date"];
    const tableRows = [];

    history.forEach((t) => {
      tableRows.push([
        t.type,
        "₹" + t.amount,
        new Date(t.date).toLocaleString(),
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("transactions.pdf");
  };

  return (
    <div className="fintech-tx-page">
      {/* NAVBAR */}
      <nav className="fintech-navbar">
        <div className="fintech-logo">
          <i className="fa-solid fa-building-columns"></i>
          SecureBank
        </div>
      </nav>

      <div className="fintech-tx-container">
        {/* BALANCE */}
        <div className="fintech-balance">
          <p>Available Balance</p>
          <h1>₹ {balance}</h1>
        </div>

        {/* HEADER */}
        <div className="fintech-tx-header">
          <h2>Transactions</h2>

          <div className="exports">
            <button onClick={downloadCSV} className="outline-btn">
              Export CSV
            </button>

            <button onClick={downloadPDF} className="primary-btn">
              Export PDF
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="fintech-tx-list">
          {history.length === 0 && (
            <div className="empty">No transactions yet</div>
          )}

          {history.map((t) => (
            <div className="fintech-tx-card" key={t._id}>
              <div className="left">
                <div className={`icon ${t.type}`}>
                  {t.type === "deposit" && "↓"}
                  {t.type === "withdraw" && "↑"}
                  {t.type === "transfer" && "⇄"}
                </div>

                <div>
                  <h4>{t.type?.toUpperCase()}</h4>
                  <p>
                    {t.date ? new Date(t.date).toLocaleString() : "Processing"}
                  </p>
                </div>
              </div>

              <div className={`amt ${t.type}`}>₹ {t.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
