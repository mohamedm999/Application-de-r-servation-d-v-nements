import { ReservationStatus } from '../../common/enums/reservation-status.enum';

export class Reservation {
  id: number;
  eventId: number;
  userId: number;
  status: ReservationStatus;
  numberOfSeats: number;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  canceledAt?: Date;
}
