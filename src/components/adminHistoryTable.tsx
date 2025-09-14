"use client";

import { useEffect, useState } from "react";
import styles from "../app/admin/admin.module.css";
import { useAuth } from "@/context/AuthContext";

interface Transaction {
  _id: string;
  reservationId: string;
  username: string;
  concertName: string;
  action: "CONFIRMED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminHistory() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [meta, setMeta] = useState<Meta | null>(null);

  const fetchTransactions = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/v1/reserve/transactions?admin=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const json: Transaction[] = await res.json();

      setTransactions(json);

      // สร้าง meta เอง
      const total = json.length;
      const totalPages = Math.ceil(total / limit);
      setMeta({
        total,
        page,
        limit,
        totalPages,
      });
    } catch (err) {
      console.error(err);
      setTransactions([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTransactions(page);
  }, [token, page]);

  if (loading) return <p>Loading...</p>;
  if (!transactions.length) return <p>No transactions found</p>;

  // คำนวณ item ของหน้าปัจจุบัน
  const start = (page - 1) * limit;
  const end = start + limit;
  const currentItems = transactions.slice(start, end);

  return (
    <div className={styles.historyPage}>
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
          {currentItems.map((t) => (
            <tr key={t._id}>
              <td>{new Date(t.createdAt).toLocaleString()}</td>
              <td>{t.username}</td>
              <td>{t.concertName}</td>
              <td>{t.action === "CANCELLED" ? "Cancel" : "Reserve"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {meta && meta.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {meta.totalPages}
          </span>
          <button
            disabled={page >= meta.totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
