import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { FilterReservationDto } from './dto/filter-reservation.dto';
import { ReservationStatus } from '../common/enums/reservation-status.enum';
import { EventStatus } from '../common/enums/event-status.enum';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(createReservationDto: CreateReservationDto, userId: string) {
    const { eventId, numberOfSeats = 1 } = createReservationDto;

    // Check if event exists and is published
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Cannot reserve an unpublished event');
    }

    // Check if there are enough available seats
    if (event.availableSeats < numberOfSeats) {
      throw new BadRequestException(
        `Not enough seats available. Only ${event.availableSeats} seats left.`,
      );
    }

    // Check if user already has an active reservation for this event
    const existingReservation = await this.prisma.reservation.findFirst({
      where: {
        userId,
        eventId,
        status: {
          in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        },
      },
    });

    if (existingReservation) {
      throw new BadRequestException('You already have an active reservation for this event');
    }

    // Create reservation in a transaction to ensure data consistency
    const reservation = await this.prisma.$transaction(async (tx) => {
      // Create the reservation
      const newReservation = await tx.reservation.create({
        data: {
          eventId,
          userId,
          numberOfSeats,
          status: ReservationStatus.PENDING,
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
              capacity: true,
              availableSeats: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Decrease available seats
      await tx.event.update({
        where: { id: eventId },
        data: {
          availableSeats: {
            decrement: numberOfSeats,
          },
        },
      });

      return newReservation;
    });

    return reservation;
  }

  async findAll(filters: FilterReservationDto, userId: string, userRole: UserRole) {
    const isAdmin = userRole === UserRole.ADMIN;

    // Build where clause based on user role
    const whereClause: any = {};

    if (!isAdmin) {
      // Non-admins can only see their own reservations
      whereClause.userId = userId;
    }

    // Apply filters
    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.eventId) {
      whereClause.eventId = filters.eventId;
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [reservations, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where: whereClause,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
              status: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.reservation.count({ where: whereClause }),
    ]);

    return {
      reservations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findMyReservations(userId: string) {
    const reservations = await this.prisma.reservation.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reservations;
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const isAdmin = userRole === UserRole.ADMIN;

    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    // Non-admins can only access their own reservations
    if (!isAdmin && reservation.userId !== userId) {
      throw new ForbiddenException('You can only access your own reservations');
    }

    return reservation;
  }

  async confirm(id: string, adminUserId: string) {
    // Find the reservation
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    // Only allow confirmation of pending reservations
    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Only pending reservations can be confirmed');
    }

    // Update reservation status to confirmed
    const updatedReservation = await this.prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updatedReservation;
  }

  async refuse(id: string, adminUserId: string) {
    // Find the reservation
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    // Only allow refusal of pending reservations
    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Only pending reservations can be refused');
    }

    // Update reservation status to refused and increment available seats
    const updatedReservation = await this.prisma.$transaction(async (tx) => {
      // Update reservation status
      const updated = await tx.reservation.update({
        where: { id },
        data: {
          status: ReservationStatus.REFUSED,
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Increment available seats in the event
      await tx.event.update({
        where: { id: reservation.eventId },
        data: {
          availableSeats: {
            increment: reservation.numberOfSeats,
          },
        },
      });

      return updated;
    });

    return updatedReservation;
  }

  async cancelByUser(reservationId: string, userId: string) {
    // Find the reservation
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        event: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${reservationId} not found`);
    }

    // Check if the reservation belongs to the user
    if (reservation.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own reservations');
    }

    // Only allow cancellation of pending or confirmed reservations
    if (
      reservation.status !== ReservationStatus.PENDING &&
      reservation.status !== ReservationStatus.CONFIRMED
    ) {
      throw new BadRequestException('Cannot cancel this reservation');
    }

    // Cancel the reservation and update available seats
    const cancelledReservation = await this.prisma.$transaction(async (tx) => {
      // Update reservation status
      const updatedReservation = await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: ReservationStatus.CANCELED,
          canceledAt: new Date(),
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Increment available seats in the event
      await tx.event.update({
        where: { id: reservation.eventId },
        data: {
          availableSeats: {
            increment: reservation.numberOfSeats,
          },
        },
      });

      return updatedReservation;
    });

    return cancelledReservation;
  }

  async cancelByAdmin(reservationId: string, adminUserId: string) {
    // Find the reservation
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        event: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${reservationId} not found`);
    }

    // Allow admin to cancel any reservation regardless of status
    const cancelledReservation = await this.prisma.$transaction(async (tx) => {
      // Update reservation status
      const updatedReservation = await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: ReservationStatus.CANCELED,
          canceledAt: new Date(),
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Increment available seats in the event
      await tx.event.update({
        where: { id: reservation.eventId },
        data: {
          availableSeats: {
            increment: reservation.numberOfSeats,
          },
        },
      });

      return updatedReservation;
    });

    return cancelledReservation;
  }

  async getTicketPdf(reservationId: string, userId: string) {
    // Find the reservation with related data
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            description: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${reservationId} not found`);
    }

    // Check if the reservation belongs to the user
    if (reservation.userId !== userId) {
      throw new ForbiddenException('You can only download tickets for your own reservations');
    }

    // Only allow PDF download for confirmed reservations
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new ForbiddenException('Ticket can only be downloaded for confirmed reservations');
    }

    // Note: The actual PDF generation would happen here using pdfkit or puppeteer
    // For now, we'll return the reservation data that would be used for PDF generation
    return {
      reservationId: reservation.id,
      status: reservation.status,
      numberOfSeats: reservation.numberOfSeats,
      createdAt: reservation.createdAt,
      confirmedAt: reservation.confirmedAt,
      event: reservation.event,
      user: reservation.user,
    };
  }
}
