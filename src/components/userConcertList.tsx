"use client";

import { useState, useEffect } from "react";
import styles from "../app/admin/admin.module.css";
import { useAuth } from "@/context/AuthContext";
import { Concert } from "@/types/concert"; // ใช้ type เดียวกับ AdminPage
import Image from "next/image";

interface UserConcertListProps {
  concerts: Concert[];
  onActionComplete?: () => void; // callback สำหรับ refresh data
}

export default function UserConcertList({ concerts: initialConcerts, onActionComplete }: UserConcertListProps) {
  const { token, user, loading: authLoading } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [concerts, setConcerts] = useState<Concert[]>(initialConcerts);

  useEffect(() => {
    setConcerts(initialConcerts); // sync prop updates
  }, [initialConcerts]);

  if (authLoading) return <p>Loading user info...</p>;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleReserve = async (concertId: string) => {
    if (!token || !user?._id) return showToast("Please login first");

    setLoadingId(concertId);
    setToast("");

    try {
      const res = await fetch(`http://localhost:3000/api/v1/reserve/${user._id}/${concertId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to reserve");
      }

      const data = await res.json();

      setConcerts(prev =>
        prev.map(c =>
          c._id === concertId ? { ...c, reservationId: data._id, reservationStatus: "CONFIRMED" } : c
        )
      );

      showToast("Reservation successful!");
      onActionComplete?.(); // เรียก callback ให้ fetch ข้อมูลใหม่
    } catch (err: unknown) {
      if (err instanceof Error) showToast(err.message);
      else showToast("Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancel = async (concertId: string) => {
    if (!token || !user?._id) return showToast("Please login first");

    setLoadingId(concertId);
    setToast("");

    try {
      const res = await fetch(`http://localhost:3000/api/v1/reserve/${user._id}/${concertId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to cancel");
      }

      setConcerts(prev =>
        prev.map(c =>
          c._id === concertId ? { ...c, reservationId: null, reservationStatus: "CANCELLED" } : c
        )
      );

      showToast("Reservation cancelled!");
      onActionComplete?.(); // เรียก callback ให้ fetch ข้อมูลใหม่
    } catch (err: unknown) {
      if (err instanceof Error) showToast(err.message);
      else showToast("Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <div className={styles.concertList}>
        {concerts.length === 0 ? (
          <p>No concerts available.</p>
        ) : (
          concerts.map(c => (
            <div key={c._id} className={styles.concertCard}>
              <h3 className={styles.concertName}>{c.name}</h3>
              <hr />
              <p className={styles.concertDescription}>{c.description}</p>
              <div className={styles.concertCardGrid}>
                <p className={styles.concertCardSeat}>
                  <Image src="/icons/user-black.svg" alt="User" width={30} height={30} />
                  {c.maxSeats}
                </p>
                <button
                  className={c.reservationId ? styles.cancel : styles.reserve}
                  onClick={() => (c.reservationId ? handleCancel(c._id) : handleReserve(c._id))}
                  disabled={loadingId === c._id || !token || !user?._id}
                >
                  {c.reservationId
                    ? loadingId === c._id
                      ? "Cancelling..."
                      : "Cancel"
                    : loadingId === c._id
                    ? "Reserving..."
                    : "Reserve"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {toast && (
        <div className={styles.toast}>
          <span className={styles.toastIcon}>✔️</span>
          <span>{toast}</span>
          <span className={styles.toastClose} onClick={() => setToast("")}>✖️</span>
        </div>
      )}
    </>
  );
}
