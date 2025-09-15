"use client";

import { useState, useEffect } from "react";
import styles from "../app/admin/admin.module.css";
import Image from "next/image";
import { Concert } from "@/types/concert";
import { useAuth } from "@/context/AuthContext";

export enum ReservationStatus {
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

interface UserConcertListProps {
  concerts: Concert[];
}

export default function UserConcertList({ concerts: initialConcerts }: UserConcertListProps) {
  const [concerts, setConcerts] = useState<Concert[]>(initialConcerts);
  const { user, token } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    setConcerts(initialConcerts); // sync prop updates
  }, [initialConcerts]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 5000);
  };

  const handleReserve = async (concertId: string) => {
    if (!token || !user?._id) return showToast("Unauthorized", "error");
    setLoadingId(concertId);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/reserve/${user._id}/${concertId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to reserve");
      }
      const data = await res.json();
      setConcerts(prev =>
        prev.map(c =>
          c._id === concertId
            ? { ...c, reservationId: data._id, reservationStatus: ReservationStatus.CONFIRMED }
            : c
        )
      );
      showToast("Reservation successful!", "success");
    } catch (err: any) {
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancel = async (concertId: string) => {
    if (!token || !user?._id) return showToast("Unauthorized", "error");
    setLoadingId(concertId);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/reserve/${user._id}/${concertId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to cancel");
      }
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

  return (
    <>
      <div className={styles.concertList}>
        {concerts.length === 0 ? (
          <p>No concerts available.</p>
        ) : (
          concerts.map(c => (
            <div key={c._id} className={styles.concertCard}>
              <h3 className={styles.concertName}>{c.name}</h3>
              <hr></hr>
              <p className={styles.concertDescription}>{c.description}</p>
              <div className={styles.concertCardGrid}>
                <p className={styles.concertCardSeat}>
                  <Image src="/icons/user-black.svg" alt="User" width={30} height={30} />
                  {c.maxSeats}
                </p>
                <button
                  className={
                    c.reservationStatus === ReservationStatus.CANCELLED
                      ? styles.cancel + " " + styles.disabled
                      : c.reservationId
                        ? styles.cancel
                        : styles.reserve
                  }
                  onClick={() =>
                    c.reservationStatus === ReservationStatus.CANCELLED
                      ? undefined
                      : c.reservationId
                        ? handleCancel(c._id)
                        : handleReserve(c._id)
                  }
                  disabled={c.reservationStatus === ReservationStatus.CANCELLED || loadingId === c._id}
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

      {toast && (
        <div className={`${styles.toast} ${toastType === "error" ? styles.toastError : styles.toastSuccess}`}>

          <span className={styles.toastIcon}>{toastType === "error" ? (<Image src="/icons/cancel.svg" alt="error" width={24} height={24} />
          ) : (
            <Image src="/icons/check.svg" alt="check" width={24} height={24} />
          )}</span>
          <span>{toast}</span>
          <span className={styles.toastClose} onClick={() => setToast("")}> <Image src="/icons/CloseFilled.svg" alt="x" width={20} height={20} />
          </span>
        </div>
      )}
    </>
  );
}
