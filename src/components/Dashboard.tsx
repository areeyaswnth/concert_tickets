
"use client";

import Image from "next/image";
import styles from "../app/admin/admin.module.css";
interface DashboardStats {
  totalSeats: number;
  reservedCount: number;
  cancelledCount: number;
}

interface DashboardProps {
  stats: DashboardStats;
}

export default function Dashboard({ stats }: DashboardProps) {
  return (
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
  );
}
