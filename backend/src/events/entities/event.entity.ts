import { EventStatus } from '../../common/enums/event-status.enum';

export class Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  availableSeats: number;
  status: EventStatus;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}
