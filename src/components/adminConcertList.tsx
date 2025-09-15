"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Concert } from "@/types/concert";
import styles from "../app/admin/admin.module.css";
import Image from "next/image";
import { cancelConcert } from "@/api/concerts";

interface AdminConcertListProps {
  concerts: Concert[];
  onActionComplete?: (message: string, type: "success" | "error") => void;
}

export default function AdminConcertList({ concerts: initialConcerts, onActionComplete }: AdminConcertListProps) {
  const { token } = useAuth();
  const [concertList, setConcertList] = useState<Concert[]>(initialConcerts);
  const [showModal, setShowModal] = useState(false);
  const [selectedConcert, setSelectedConcert] = useState<Concert | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setConcertList(initialConcerts);
  }, [initialConcerts]);

  const handleDeleteClick = (concert: Concert) => {
    setSelectedConcert(concert);
    setShowModal(true);
  };

const confirmDelete = async () => {
  if (!selectedConcert || !token) return;
  setLoading(true);

  try {
    await cancelConcert(token, selectedConcert._id);
    setShowModal(false);
    onActionComplete?.("Concert cancelled successfully!", "success");
  } catch (err) {
    console.error(err);
    onActionComplete?.(
      err instanceof Error ? err.message : "Something went wrong",
      "error"
    );
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
                className={styles.delete}
                onClick={() => handleDeleteClick(c)}
                disabled={loading}
              >
                <Image src="/icons/trash.svg" alt="Delete" width={24} height={24} />
                {loading && selectedConcert?._id === c._id ? "Processing..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ))}

      {showModal && selectedConcert && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalTop}>
              <Image src="/icons/cancel.svg" alt="cancel" width={48} height={48} />
              <p className={styles.modalText}>
                Are you sure you want to delete "{selectedConcert.name}"?
              </p>
            </div>
            <div className={styles.modalButtons}>
              <button className={styles.modalCancel} onClick={() => setShowModal(false)} disabled={loading}>
                Cancel
              </button>
              <button className={styles.modalConfirm} onClick={confirmDelete} disabled={loading}>
                {loading ? "Processing..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
