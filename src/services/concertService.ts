import { Concert } from "@/types/concert";

const API_BASE = "http://localhost:3000/api/v1";

export interface DashboardStats {
  totalSeats: number;
  reservedCount: number;
  cancelledCount: number;
}

export const fetchConcerts = async (
  token: string,
  tab: "overview" | "create" | "history" | "userView",
  userId?: string,
  page = 1,
  limit = 5
): Promise<{ concerts: Concert[]; totalPages: number }> => {
  let url = `${API_BASE}/concerts/list?page=${page}&limit=${limit}`;
  if (tab === "userView" && userId) {
    url += `&userId=${userId}`;
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch concerts");

  const json = await res.json();
  const mapped: Concert[] = json.data.map((c: any) => ({
    _id: c._id,
    name: c.name,
    description: c.description ?? "",
    maxSeats: tab === "userView" ? c.reservedSeats ?? 0 : c.maxSeats,
    reservationId: c.reservationId ?? null,
    reservationStatus: c.reservationStatus ?? null,
  }));

  return { concerts: mapped, totalPages: json.meta.totalPages };
};

export const fetchDashboardStats = async (
  token: string
): Promise<DashboardStats> => {
  const res = await fetch(`${API_BASE}/reserve/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
};
