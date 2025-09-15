"use client";

import Image from "next/image";
import styles from "@/styles/main.module.css"

interface UserSidebarProps {
  tab: "overview" | "create" | "history" | "userView";
  setTab: (tab: "overview" | "history" ) => void;
  handleLogout: () => void;
}

export default function UserSidebar({ tab, setTab, handleLogout }: UserSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.logo}>User</h2>
      <nav className={styles.nav}>
        <button className={styles.sidebarText} onClick={() => setTab("overview")}>
          <Image src="/icons/home.svg" alt="Home" width={24} height={24} />
          <span>Home</span>
        </button>
        <button className={styles.sidebarText} onClick={() => setTab("history")}>
          <Image src="/icons/history.svg" alt="History" width={24} height={24} />
          <span>History</span>
        </button>
      </nav>
      <button className={styles.logout} onClick={handleLogout}>
        <Image src="/icons/log-out.svg" alt="LogOut" width={20} height={20} /> Logout
      </button>
    </aside>
  );
}
