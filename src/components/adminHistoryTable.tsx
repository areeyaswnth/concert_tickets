"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/main.module.css"
import { useAuth } from "@/context/AuthContext";
import { fetchAdminTransactions, Transaction, Meta } from "@/api/transactions";

export default function AdminHistory() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const getTransactions = async (page: number) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetchAdminTransactions(token, page, limit);
      setTransactions(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      console.error(err);
      setTransactions([]);
      setMeta(null);
      setToast(err.message || "Something went wrong");
      setTimeout(() => setToast(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTransactions(page);
  }, [token, page]);

  if (loading) return <p>Loading...</p>;
  if (!transactions.length) return <p>No transactions found</p>;

  return (
    <div className={styles.historyPage}>
      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}

      <table className={styles.historyTable}>
        <thead>
          <tr>
            <th>Date time</th>
            <th>Username</th>
            <th>Concert name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t._id}>
              <td>{new Date(t.createdAt).toLocaleString()}</td>
              <td>{t.username}</td>
              <td>{t.concertName}</td>
              <td>{t.action === "CANCELLED" ? "Cancel" : "Reserve"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {meta && meta.pages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
            Previous
          </button>

          {Array.from({ length: meta.pages }, (_, i) => (
            <button
              key={i + 1}
              className={page === i + 1 ? styles.activePage : ""}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button disabled={page >= meta.pages} onClick={() => setPage((prev) => prev + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
