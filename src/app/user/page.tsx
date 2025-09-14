"use client";

import UserConcertList from "@/components/userConcertList";
import Forbidden from "@/components/forbiddenpage";
import styles from "../admin/admin.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Concert } from "@/types/concert";
import Image from "next/image";

export default function UserPage() {
  const { role, token, user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [totalPages, setTotalPages] = useState(1);

  const fetchConcerts = async (page = 1) => {
    if (!token || !user?._id) return;
    setLoading(true);

    try {
      const url = `http://localhost:3000/api/v1/concerts/list?userId=${user._id}&page=${page}&limit=${itemsPerPage}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch concerts");

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
      setTotalPages(data.meta.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !user?._id || role === "guest") return;
    fetchConcerts(currentPage);
  }, [token, user?._id, role, currentPage]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  if (authLoading || loading) return <p>Loading...</p>;
  if (!token || role === "guest") return <Forbidden redirectPath="/" />;

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>User</h2>
        <nav className={styles.nav}>
     
        </nav>
        <button className={styles.logout} onClick={handleLogout}>
          <Image src="/icons/log-out.svg" alt="LogOut" width={20} height={20} /> Logout</button>
      </aside>

      <main className={styles.main}>
        <UserConcertList concerts={concerts} />

        {/* Pagination */}
        {totalPages > 1 && (
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
