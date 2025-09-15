"use client";

import { useState } from "react";
import styles from "../app/admin/admin.module.css";
import Image from "next/image";

interface ConcertFormProps {
  onCreated?: (message: string) => void;
}

export default function ConcertForm({ onCreated }: ConcertFormProps) {
  const [concertName, setConcertName] = useState("");
  const [totalSeat, setTotalSeat] = useState(500);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch("http://localhost:3000/api/v1/concerts/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ name: concertName, description, maxSeats: totalSeat }),
    });

    const data = await res.json();

    if (!res.ok) {
      setToastType("error");
      setToast(data?.message || "Failed to create concert");
    } else {
      setToastType("success");
      setToast("Concert created successfully!");
      setConcertName("");
      setTotalSeat(500);
      setDescription("");
      // เรียก callback ส่งข้อความ toast
      if (onCreated) onCreated("Concert created successfully!");
    }
  } catch (err: unknown) {
    setToastType("error");
    setToast(err instanceof Error ? err.message : "Something went wrong");
  } finally {
    setLoading(false);
    setTimeout(() => {
      setToast("");
      setToastType("success");
    }, 5000);
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
        <div
          className={`${styles.toast} ${toastType === "error" ? styles.toastError : styles.toastSuccess}`}
        >
          <span className={styles.toastIcon}>
            {toastType === "error" ? (
              <Image src="/icons/cancel.svg" alt="error" width={24} height={24} />
            ) : (
              <Image src="/icons/check.svg" alt="check" width={24} height={24} />
            )}
          </span>
          <span>{toast}</span>
          <span
            className={styles.toastClose}
            onClick={() => {
              setToast("");
              setToastType("success");
            }}
          >
            <Image src="/icons/CloseFilled.svg" alt="x" width={20} height={20} />
          </span>
        </div>
      )}
    </>
  );
}
