import { ReservationStatus } from '@prisma/client';

export interface ReservationWithRelations {
  id: string;
  status: ReservationStatus;
  numberOfSeats: number;
  createdAt: Date;
  event: {
    id: string;
    title: string;
    date: Date;
    location: string;
  };
  user: {
    name?: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
