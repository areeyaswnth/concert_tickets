import { API_BASE_URL } from "@/config/api";

export interface Transaction {
  _id: string;
  reservationId: string;
  username: string;
  concertName: string;
  action: "CONFIRMED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedTransactions {
  data: Transaction[];
  meta: Meta;
}

export const fetchAdminTransactions = async (
  token: string,
  page: number = 1,
  limit: number = 5
): Promise<PaginatedTransactions> => {
  const res = await fetch(
    `${API_BASE_URL}/transactions/list?admin=true&page=${page}&limit=${limit}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) throw new Error("Failed to fetch transactions");

  const json = await res.json();
  return { data: json.data, meta: json.meta };
};

export const fetchUserTransactions = async (
  token: string,
  userId: string,
  page: number = 1,
  limit: number = 5
): Promise<PaginatedTransactions> => {
  const res = await fetch(
    `${API_BASE_URL}/transactions/list?userId=${userId}&page=${page}&limit=${limit}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) throw new Error("Failed to fetch user transactions");

  const json = await res.json();
  return { data: json.data, meta: json.meta };
};