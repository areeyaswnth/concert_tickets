"use client";

import { useEffect, useState, Dispatch, SetStateAction } from "react";
import styles from "@/styles/main.module.css"
import { fetchUserTransactions, Transaction, Meta } from "@/api/transactions";

interface UserHistoryProps {
  token: string;
  userId?: string;
  setToast: Dispatch<SetStateAction<string | null>>;
}

export default function UserHistory({ token, userId, setToast }: UserHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [meta, setMeta] = useState<Meta | null>(null);

  const getTransactions = async (page: number) => {
    if (!userId) {
      setToast("User not found");
      setTimeout(() => setToast(null), 5000);
      return;
    }

    setLoading(true);
    try {
      const res = await fetchUserTransactions(token, userId, page, limit);
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
    if (token && userId) getTransactions(page);
  }, [token, page, userId]);

  if (loading) return <p>Loading...</p>;
  if (!transactions.length) return <p>No transactions found</p>;

  return (
    <div className={styles.historyPage}>
      <table className={styles.historyTable}>
        <thead>
          <tr>
            <th>Date time</th>
            <th>Concert name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t._id}>
              <td>{new Date(t.createdAt).toLocaleString()}</td>
              <td>{t.concertName}</td>
              <td>{t.action === "CANCELLED" ? "Cancel" : "Reserve"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {meta && meta.pages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>Previous</button>
          {Array.from({ length: meta.pages }, (_, i) => (
            <button
              key={i + 1}
              className={page === i + 1 ? styles.activePage : ""}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button disabled={page >= meta.pages} onClick={() => setPage((prev) => prev + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
