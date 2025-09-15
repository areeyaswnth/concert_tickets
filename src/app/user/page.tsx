"use client";

import UserConcertList from "@/components/UserConcertList";
import UserHistory from "@/components/UserHistoryTable";
import Forbidden from "@/components/Forbiddenpage";
import styles from "../admin/admin.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Concert } from "@/types/concert";
import Image from "next/image";
import UserSidebar from "@/components/UserSideBar";
import { API_BASE_URL } from "@/config/api";

export default function UserPage() {
  const { role, token, user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [totalPages, setTotalPages] = useState(1);
  const [tab, setTab] = useState<"overview" | "history">("overview");
  const [toast, setToast] = useState<string | null>(null);

  const fetchConcerts = async (page = 1) => {
    if (!token) return;
    if (!user?._id) {
      setToast("User not found");
      setTimeout(() => setToast(null), 5000);
      return;
    }

    setLoading(true);
    try {
      const url = `${API_BASE_URL}/concerts/list?userId=${user._id}&page=${page}&limit=${itemsPerPage}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to fetch concerts");
      }

      const data = await res.json();
      const mapped: Concert[] = data.data.map((c: any) => ({
        _id: c._id,
        name: c.name,
        description: c.description,
        maxSeats: c.maxSeats,
        reservationId: c.reservationId ?? null,
        reservationStatus: c.reservationStatus ?? null,
        status: c.status,
      }));

      setConcerts(mapped);
      setCurrentPage(data.meta.page);
      setTotalPages(data.meta.pages);
    } catch (err: any) {
      console.error(err);
      setToast(err.message || "Something went wrong");
      setTimeout(() => setToast(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !token || role === "guest") return;

    if (tab === "overview") fetchConcerts(currentPage);
  }, [authLoading, token, user?._id, role, currentPage, tab]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  if (authLoading || loading) return <p>Loading...</p>;
  if (!token || role === "guest") return <Forbidden redirectPath="/" />;

  return (
    <div className={styles.container}>
      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}
      <UserSidebar tab={tab} setTab={setTab} handleLogout={handleLogout} />
      <main className={styles.main}>
        {tab === "overview" && <UserConcertList concerts={concerts} />}
        {tab === "history" && <UserHistory token={token} userId={user?._id} setToast={setToast} />}

        {/* Pagination */}
        {tab === "overview" && totalPages > 1 && (
          <div className={styles.pagination}>
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
              Prev
            </button>
            <span>{currentPage} / {totalPages}</span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        )}
            
      </main>
    </div>
  );
}
