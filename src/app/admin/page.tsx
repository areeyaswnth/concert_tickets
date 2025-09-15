"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useAuth } from "@/context/AuthContext";
import { Concert } from "@/types/concert";

import AdminConcertList from "@/components/AdminConcertList";
import ConcertForm from "@/components/ConcertForm";
import AdminHistory from "@/components/AdminHistoryTable";
import UserConcertList from "@/components/UserConcertList";
import Forbidden from "@/components/Forbiddenpage";

import { fetchAdminConcerts, fetchUserConcerts, fetchDashboardStats } from "@/api/concerts";
import styles from "./admin.module.css";
import AdminSidebar from "@/components/AdminSideBar";
import Dashboard from "@/components/Dashboard";

interface DashboardStats {
  totalSeats: number;
  reservedCount: number;
  cancelledCount: number;
}

export default function AdminPage() {
  const { role, token, user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalSeats: 0, reservedCount: 0, cancelledCount: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "create" | "history" | "userView">("overview");

  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 5000);
  };

  const handleConcertAction = (message: string, type: "success" | "error") => {
    showToast(message, type);
    refreshData();
  };

  const refreshData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (tab === "userView" && user?._id) {
        const { data, meta } = await fetchUserConcerts(token, user._id, currentPage, itemsPerPage);
        setConcerts(data);
        setTotalPages(meta.pages);
      } else {
        const { data, meta } = await fetchAdminConcerts(token, currentPage, itemsPerPage);
        setConcerts(data);
        setTotalPages(meta.pages);
        if (role === "admin") {
          const statsData = await fetchDashboardStats(token);
          setStats(statsData);
        }
      }
    } catch (err) {
      console.error(err);
      showToast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !token || (tab === "userView" && !user?._id)) return;
    refreshData();
  }, [tab, token, user?._id, currentPage, authLoading]);

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
  const handlePageClick = (page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };

  if (authLoading || loading) return <p>Loading...</p>;
  if (role !== "admin") return <Forbidden redirectPath="/" />;

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <AdminSidebar tab={tab} setTab={setTab} handleLogout={handleLogout} />

      {/* Main */}
      <main className={styles.main}>
        {(tab === "overview" || tab === "create") && (
          <>
            {(tab === "overview" || tab === "create") && <Dashboard stats={stats} />}
            <div className={styles.tabHeader} style={{ marginTop: "24px" }}>
              <button className={tab === "overview" ? styles.activeTab : ""} onClick={() => setTab("overview")}>Overview</button>
              <button className={tab === "create" ? styles.activeTab : ""} onClick={() => setTab("create")}>Create</button>
            </div>
          </>
        )}

        {tab === "overview" && (
          <>
            {concerts.length > 0 ? (
              <>
                <AdminConcertList concerts={concerts} onActionComplete={handleConcertAction} />
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button onClick={handlePrevPage} disabled={currentPage === 1}>Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        className={currentPage === i + 1 ? styles.activePage : ""}
                        onClick={() => handlePageClick(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
                  </div>
                )}
              </>
            ) : <p>No concerts found.</p>}
          </>
        )}
        {tab === "create" && <ConcertForm onCreated={(msg) => showToast(msg, "success")} />}
        {tab === "history" && <AdminHistory />}
        {tab === "userView" && <UserConcertList concerts={concerts} />}
      </main>

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
    </div>
  );
}
