"use client";

import Image from "next/image";
import styles from "@/styles/main.module.css"

interface AdminSidebarProps {
  tab: "overview" | "create" | "history" | "userView";
  setTab: (tab: "overview" | "create" | "history" | "userView") => void;
  handleLogout: () => void;
}

export default function AdminSidebar({ tab, setTab, handleLogout }: AdminSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      {tab !== "userView" ? (
        <>
          <h2 className={styles.logo}>Admin</h2>
          <nav className={styles.nav}>
            <button className={styles.sidebarText} onClick={() => setTab("overview")}>
              <Image src="/icons/home.svg" alt="Home" width={24} height={24} />
              <span>Home</span>
            </button>
            <button className={styles.sidebarText} onClick={() => setTab("history")}>
              <Image src="/icons/history.svg" alt="History" width={24} height={24} />
              <span>History</span>
            </button>
            <button className={styles.sidebarText} onClick={() => setTab("userView")}>
              <Image src="/icons/switch.svg" alt="User" width={24} height={24} />
              <span>Switch to user</span>
            </button>
          </nav>
        </>
      ) : (
        <>
          <h2 className={styles.logo}>User</h2>
          <nav className={styles.nav}>
            <button className={styles.sidebarText} onClick={() => setTab("overview")}>
              <Image src="/icons/switch.svg" alt="User" width={24} height={24} />
              <span>Switch to admin</span>
            </button>
          </nav>
        </>
      )}
      <button className={styles.logout} onClick={handleLogout}>
        <Image src="/icons/log-out.svg" alt="LogOut" width={20} height={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
