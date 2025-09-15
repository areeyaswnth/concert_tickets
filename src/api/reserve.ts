import { API_BASE_URL } from "@/config/api";

export enum ReservationStatus {
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export const reserveConcert = async (token: string, userId: string, concertId: string) => {
  const res = await fetch(`${API_BASE_URL}/reserve/${userId}/${concertId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.message || "Failed to reserve");
  }
  return await res.json();
};

export const cancelReservation = async (token: string, userId: string, concertId: string) => {
  const res = await fetch(`${API_BASE_URL}/reserve/${userId}/${concertId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.message || "Failed to cancel");
  }
  return await res.json();
};
