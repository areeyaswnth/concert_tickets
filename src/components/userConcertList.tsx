"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/main.module.css";
import Image from "next/image";
import { Concert } from "@/types/concert";
import { useAuth } from "@/context/AuthContext";
import { reserveConcert, cancelReservation, ReservationStatus } from "@/api/reserve";

interface UserConcertListProps {
  concerts: Concert[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function UserConcertList({
  concerts: initialConcerts,
  currentPage,
  totalPages,
  onPageChange
}: UserConcertListProps) {
  const [concerts, setConcerts] = useState<Concert[]>(initialConcerts);
  const { user, token, loading: authLoading } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    setConcerts(initialConcerts);
  }, [initialConcerts]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 5000);
  };

  const handleReserveClick = async (concertId: string) => {
    if (!token || !user?._id) return showToast("Unauthorized", "error");
    setLoadingId(concertId);
    try {
      const data = await reserveConcert(token, user._id, concertId);
      setConcerts(prev =>
        prev.map(c =>
          c._id === concertId
            ? { ...c, reservationId: data._id, reservationStatus: ReservationStatus.CONFIRMED }
            : c
        )
      );
      showToast("Reservation successful", "success");
    } catch (err: any) {
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancelClick = async (concertId: string) => {
    if (!token || !user?._id) return showToast("Unauthorized", "error");
    setLoadingId(concertId);
    try {
      await cancelReservation(token, user._id, concertId);
      setConcerts(prev =>
        prev.map(c =>
          c._id === concertId
            ? { ...c, reservationId: null, reservationStatus: ReservationStatus.CANCELLED }
            : c
        )
      );
      showToast("Reservation cancelled!", "success");
    } catch (err: any) {
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setLoadingId(null);
    }
  };

  if (authLoading) return <p>Loading...</p>; // รอ auth ก่อน render

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
                  className={
                    c.reservationStatus === ReservationStatus.CANCELLED
                      ? `${styles.cancel} ${styles.disabled}`
                      : c.reservationId
                        ? styles.cancel
                        : styles.reserve
                  }
                  onClick={() => {
                    if (!token || !user?._id) return;
                    if (c.reservationStatus === ReservationStatus.CANCELLED) return;
                    if (c.reservationId) {
                      handleCancelClick(c._id);
                    } else {
                      handleReserveClick(c._id);
                    }
                  }}
                  disabled={
                    c.reservationStatus === ReservationStatus.CANCELLED ||
                    loadingId === c._id ||
                    !token ||
                    !user?._id
                  }
                >
                  {c.reservationStatus === ReservationStatus.CANCELLED
                    ? "Cancelled"
                    : c.reservationId
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={currentPage === i + 1 ? styles.activePage : ""}
              onClick={() => onPageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toastType === "error" ? styles.toastError : styles.toastSuccess}`}>
          <span className={styles.toastIcon}>
            <Image src={toastType === "error" ? "/icons/cancel.svg" : "/icons/check.svg"} alt={toastType} width={24} height={24} />
          </span>
          <span>{toast}</span>
          <span className={styles.toastClose} onClick={() => setToast("")}>
            <Image src="/icons/CloseFilled.svg" alt="x" width={20} height={20} />
          </span>
        </div>
      )}
    </>
  );
}
