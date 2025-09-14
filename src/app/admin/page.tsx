"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useAuth } from "@/context/AuthContext";
import { Concert } from "@/types/concert";

import AdminConcertList from "@/components/adminConcertList";
import ConcertForm from "@/components/ConcertForm";
import AdminHistory from "@/components/adminHistoryTable";
import UserConcertList from "@/components/userConcertList";
import Forbidden from "@/components/forbiddenpage";

import styles from "./admin.module.css";

interface DashboardStats {
  totalSeats: number;
  reservedCount: number;
  cancelledCount: number;
}

export default function AdminPage() {
  const { role, token, user, logout } = useAuth();
  const router = useRouter();

  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalSeats: 0, reservedCount: 0, cancelledCount: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "create" | "history" | "userView">("overview");
  const [toast, setToast] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  // Fetch concerts for admin
  const fetchConcerts = async (page = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/concerts/list?page=${page}&limit=${itemsPerPage}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch concerts");
      const json = await res.json();
      const mapped: Concert[] = json.data.map((c: any) => ({
        _id: c._id,
        name: c.name,
        description: c.description ?? "",
        maxSeats: c.maxSeats,
        reservationId: c.reservationId ?? null,
        reservationStatus: c.reservationStatus ?? null,
      }));
      setConcerts(mapped);
      setTotalPages(json.meta.totalPages);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch concerts for user
  const fetchUserConcerts = async (page = currentPage) => {
    if (!token || !user?._id) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/v1/concerts/list?userId=${user._id}&page=${page}&limit=${itemsPerPage}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch user concerts");
      const json = await res.json();
      const mapped: Concert[] = json.data.map((c: any) => ({
        _id: c._id,
        name: c.name,
        description: c.description ?? "",
        maxSeats: c.maxSeats,
        reservationId: c.reservationId ?? null,
        reservationStatus: c.reservationStatus ?? null,
      }));
      setConcerts(mapped);
      setTotalPages(json.meta.totalPages);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    if (!token || role !== "admin") return;
    try {
      const res = await fetch("http://localhost:3000/api/v1/reserve/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Refresh data function
  const refreshData = () => {
    if (tab === "userView") fetchUserConcerts(currentPage);
    else {
      fetchConcerts(currentPage);
      if (role === "admin") fetchStats();
    }
  };

  // Reload data when tab or page changes
  useEffect(() => {
    if (!token) return;
    refreshData();
  }, [tab, token, user?._id, currentPage]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };
  const handlePageClick = (page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };

  if (loading) return <p>Loading...</p>;
  if (role !== "admin") return <Forbidden redirectPath="/" />;

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>Admin</h2>
        <nav className={styles.nav}>
          <button className="sidebar-text flex items-center gap-2" onClick={() => setTab("overview")}>
            <Image src="/icons/home.svg" alt="Home" width={20} height={20} /> Home
          </button>
          <button className="sidebar-text flex items-center gap-2" onClick={() => setTab("history")}>
            <Image src="/icons/history.svg" alt="History" width={20} height={20} /> History
          </button>
          <button className="sidebar-text flex items-center gap-2" onClick={() => setTab("userView")}>
            <Image src="/icons/switch.svg" alt="User" width={20} height={20} /> User View
          </button>
        </nav>
        <button className={styles.logout} onClick={handleLogout}>
          <Image src="/icons/log-out.svg" alt="LogOut" width={20} height={20} /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Dashboard + Tabs only for overview/create */}
        {(tab === "overview" || tab === "create") && (
          <>
            <div className={styles.cards}>
              <div className={`${styles.dashboardCard} ${styles.dashboardCardBlue}`}>
                <Image src="/icons/user.svg" alt="User" width={30} height={30} />
                <p>Total Seats</p>
                <h2>{stats.totalSeats}</h2>
              </div>
              <div className={`${styles.dashboardCard} ${styles.dashboardCardGreen}`}>
                <Image src="/icons/award.svg" alt="Reserve" width={30} height={30} />
                <p>Reserved</p>
                <h2>{stats.reservedCount}</h2>
              </div>
              <div className={`${styles.dashboardCard} ${styles.dashboardCardRed}`}>
                <Image src="/icons/x-circle.svg" alt="Cancel" width={30} height={30} />
                <p>Cancelled</p>
                <h2>{stats.cancelledCount}</h2>
              </div>
            </div>

            <div className={styles.tabHeader} style={{ marginTop: "24px" }}>
              <button className={tab === "overview" ? styles.activeTab : ""} onClick={() => setTab("overview")}>Overview</button>
              <button className={tab === "create" ? styles.activeTab : ""} onClick={() => setTab("create")}>Create</button>
            </div>
          </>
        )}

        {/* Tab Content */}
        {tab === "overview" && (
          <>
            {concerts.length > 0 ? (
              <>
                <AdminConcertList
                  concerts={concerts}
                  onActionComplete={() => {
                    setToast("Action completed");
                    refreshData();
                  }}
                />
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button onClick={handlePrevPage} disabled={currentPage === 1}>Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i + 1} className={currentPage === i + 1 ? styles.activePage : ""} onClick={() => handlePageClick(i + 1)}>{i + 1}</button>
                    ))}
                    <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
                  </div>
                )}
              </>
            ) : <p>No concerts available</p>}
          </>
        )}

        {tab === "create" && (
          <section style={{ marginTop: "24px" }}>
            <ConcertForm onCreated={() => { setToast("Create successfully"); refreshData(); }} />
          </section>
        )}

        {tab === "history" && <AdminHistory />}
        {tab === "userView" && (
          <>
            <UserConcertList
              concerts={concerts}
              onActionComplete={() => {
                setToast("Action completed");
                refreshData();
              }}
            />
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button onClick={handlePrevPage} disabled={currentPage === 1}>Prev</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} className={currentPage === i + 1 ? styles.activePage : ""} onClick={() => handlePageClick(i + 1)}>{i + 1}</button>
                ))}
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
              </div>
            )}
          </>
        )}

        {/* Toast */}
        {toast && (
          <div className={styles.toast}>
            <span>✔️</span>
            <span>{toast}</span>
            <span onClick={() => setToast("")}>✖️</span>
          </div>
        )}
      </main>
    </div>
  );
}
