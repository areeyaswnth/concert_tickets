import { API_BASE_URL } from "@/config/api";
import { Concert } from "@/types/concert";

interface PaginationResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
export interface CreateConcertPayload {
  name: string;
  description: string;
  maxSeats: number;
}

export const fetchAdminConcerts = async (token: string, page = 1, limit = 5): Promise<PaginationResponse<Concert>> => {
  const res = await fetch(`${API_BASE_URL}/concerts/list?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch concerts");

  const json = await res.json();
  const data: Concert[] = json.data.map((c: any) => ({
    _id: c._id,
    name: c.name,
    description: c.description ?? "",
    maxSeats: c.maxSeats,
    reservationId: c.reservationId ?? null,
    reservationStatus: c.reservationStatus ?? null,
  }));

  return { data, meta: json.meta };
};

export const fetchUserConcerts = async (token: string, userId: string, page = 1, limit = 5): Promise<PaginationResponse<Concert>> => {
  const res = await fetch(`${API_BASE_URL}/concerts/list?userId=${userId}&page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch user concerts");

  const json = await res.json();
  const data: Concert[] = json.data.map((c: any) => ({
    _id: c._id,
    name: c.name,
    description: c.description ?? "",
    maxSeats: c.maxSeats,
    reservationId: c.reservationId ?? null,
    reservationStatus: c.reservationStatus ?? null,
  }));

  return { data, meta: json.meta };
};

export const fetchDashboardStats = async (token: string) => {
  const res = await fetch(`${API_BASE_URL}/reserve/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");

  return await res.json();
};

export const cancelConcert = async (token: string, concertId: string) => {
  const res = await fetch(`${API_BASE_URL}/concerts/${concertId}/cancel`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: "cancelled" }),
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData?.message || "Failed to cancel concert");
  }

  return await res.json();
};

export const createConcert = async (payload: CreateConcertPayload, token: string) => {
  const res = await fetch(`${API_BASE_URL}/concerts/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to create concert");
  }

  return data;
};