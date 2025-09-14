"use client";

import { useEffect, useState } from "react";
import styles from "../app/admin/admin.module.css";
import { useAuth } from "@/context/AuthContext";

interface Reservation {
  _id: string;
  userId: { name: string };
  concertId: { name: string };
  status: string;
  reservedAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminHistory() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // จำนวนรายการต่อหน้า
  const [meta, setMeta] = useState<Meta | null>(null);

  const fetchReservations = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/v1/reserve?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch reservations");
      const json = await res.json();
      setReservations(json.data);
      setMeta(json.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations(page);
  }, [token, page]);

  if (loading) return <p>Loading...</p>;

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
          {reservations.map((r) => (
            <tr key={r._id}>
              <td>{new Date(r.reservedAt).toLocaleString()}</td>
              <td>{r.userId?.name || "N/A"}</td>
              <td>{r.concertId?.name || "N/A"}</td>
              <td>{r.status === "CANCELLED" ? "Cancel" : "Reserve"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {meta && (
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
