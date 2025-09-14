"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Concert } from "@/types/concert";
import styles from "../app/admin/admin.module.css";
import Image from "next/image";

interface AdminConcertListProps {
  concerts: Concert[];
  onActionComplete?: () => void; // callback สำหรับ refresh data
}

export default function AdminConcertList({ concerts: initialConcerts, onActionComplete }: AdminConcertListProps) {
  const { token } = useAuth();
  const [concertList, setConcertList] = useState<Concert[]>(initialConcerts);
  const [showModal, setShowModal] = useState(false);
  const [selectedConcert, setSelectedConcert] = useState<Concert | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setConcertList(initialConcerts); // sync prop updates
  }, [initialConcerts]);

  const handleDeleteClick = (concert: Concert) => {
    setSelectedConcert(concert);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedConcert || !token) return;
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:3000/api/v1/concerts/${selectedConcert._id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "cancelled" }),
        }
      );

      if (!res.ok) throw new Error("Failed to cancel concert");

      setShowModal(false);
      onActionComplete?.(); // เรียก callback ให้ fetch ข้อมูลใหม่
    } catch (err) {
      console.error(err);
      alert("Cannot cancel concert. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.concertList}>
      {concertList.map(c => (
        <div key={c._id} className={styles.concertCard}>
          <h3 className={styles.concertName}>{c.name}</h3>
          <hr />
          <p className={styles.concertDescription}>{c.description}</p>
          <div className={styles.concertCardGrid}>
            <p className={styles.concertCardSeat}>
              <Image src="/icons/user-black.svg" alt="User" width={30} height={30} />
              {c.maxSeats}
            </p>
            <div className={styles.deleteBtnWrapper}>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDeleteClick(c)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {showModal && selectedConcert && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>✖</div>
            <p className={styles.modalText}>
              Are you sure to cancel? <br />"{selectedConcert.name}"
            </p>
            <div className={styles.modalButtons}>
              <button
                className={styles.modalCancel}
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className={styles.modalConfirm}
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? "Processing..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
