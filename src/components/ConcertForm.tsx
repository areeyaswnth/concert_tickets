"use client";

import { useState } from "react";
import styles from "../app/admin/admin.module.css";
import Image from "next/image";
interface ConcertFormProps {
  onCreated?: () => void; 
}

export default function ConcertForm({ onCreated }: ConcertFormProps) {
  const [concertName, setConcertName] = useState("");
  const [totalSeat, setTotalSeat] = useState(500);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast("");

    try {
      const res = await fetch("http://localhost:3000/api/v1/concerts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: concertName,
          description,
          maxSeats: totalSeat,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create concert");
      }

      setToast("Create successfully");

      // รีเซ็ตฟอร์ม
      setConcertName("");
      setTotalSeat(500);
      setDescription("");

      // เรียก callback หลังสร้างสำเร็จ
      if (onCreated) onCreated();

      setTimeout(() => setToast(""), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) setToast(err.message);
      else setToast("Something went wrong");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className={styles.formCard} onSubmit={handleSubmit}>
        <h2 className={styles.formTitle}>Create Concert</h2>
        <hr />
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Concert Name</label>
            <input
              type="text"
              value={concertName}
              onChange={(e) => setConcertName(e.target.value)}
              placeholder="Please input concert name"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Total Seats</label>
            <div className={styles.inputWrapper}>
              <input
                type="number"
                value={totalSeat}
                onChange={(e) => setTotalSeat(Number(e.target.value))}
                min={1}
                required
              />
              <span className={styles.inputIcon}>
                <Image src="/icons/user-black.svg" alt="Seats" width={20} height={20} />
              </span>
            </div>
          </div>

        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please input description"
            required
          />
        </div>

        <div className={styles.formActions}>
          <button type="submit" disabled={loading}>
            <Image src="/icons/save.svg" alt="Save" width={24} height={24} />
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>

    {toast && (
  <div className={`${styles.toast}`} id="toast">
    <span className={styles.toastIcon}>✔️</span>
    <span>{toast}</span>
    <span className={styles.toastClose} onClick={() => setToast("")}>✖️</span>
  </div>
)}

    </>
  );
}
