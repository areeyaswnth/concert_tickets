export interface Concert {
  _id: string; 
  name: string;
  description?: string;
  maxSeats: number;
  reservationId?: string | null;
  reservationStatus?: string | null;
}
