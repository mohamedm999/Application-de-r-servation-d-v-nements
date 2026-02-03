import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { EventStatus } from '../common/enums/event-status.enum';
import { ReservationStatus } from '../common/enums/reservation-status.enum';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto, userId: string) {
    const { title, description, date, location, capacity } = createEventDto;

    // Validate that date is in the future
    if (new Date(date) <= new Date()) {
      throw new BadRequestException('Event date must be in the future');
    }

    const event = await this.prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        capacity,
        availableSeats: capacity, // Initialize available seats with capacity
        createdBy: {
          connect: { id: userId },
        },
      },
      include: {
        createdBy: true,
      },
    });

    return event;
  }

  async findAll(filters: FilterEventDto, userId: string, userRole: UserRole) {
    const isAdmin = userRole === UserRole.ADMIN;

    // Build where clause based on user role
    const whereClause: any = {};

    if (!isAdmin) {
      // Non-admins only see published events
      whereClause.status = EventStatus.PUBLISHED;
    }

    // Apply filters
    if (filters.search) {
      whereClause.title = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    if (filters.fromDate) {
      whereClause.date = {
        gte: new Date(filters.fromDate),
      };
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where: whereClause,
        include: {
          createdBy: {
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
          date: 'asc',
        },
      }),
      this.prisma.event.count({ where: whereClause }),
    ]);

    return {
      events,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const isAdmin = userRole === UserRole.ADMIN;

    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Non-admins can only see published events
    if (!isAdmin && event.status !== EventStatus.PUBLISHED) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto, userId: string, userRole: UserRole) {
    const isAdmin = userRole === UserRole.ADMIN;

    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Only admins can modify events, and they can't modify canceled events
    if (!isAdmin || event.status === EventStatus.CANCELED) {
      throw new ForbiddenException('Cannot modify this event');
    }

    // Check if the user is the creator of the event (for admin role verification)
    if (event.createdById !== userId) {
      throw new ForbiddenException('You can only update events you created');
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: {
        ...updateEventDto,
        ...(updateEventDto.date && { date: new Date(updateEventDto.date) }),
      },
      include: {
        createdBy: true,
      },
    });

    return updatedEvent;
  }

  async publish(id: string, userId: string, userRole: UserRole) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can publish events');
    }

    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    if (event.status !== EventStatus.DRAFT) {
      throw new BadRequestException('Can only publish draft events');
    }

    // Check if the user is the creator of the event
    if (event.createdById !== userId) {
      throw new ForbiddenException('You can only publish events you created');
    }

    const publishedEvent = await this.prisma.event.update({
      where: { id },
      data: {
        status: EventStatus.PUBLISHED,
      },
      include: {
        createdBy: true,
      },
    });

    return publishedEvent;
  }

  async cancel(id: string, userId: string, userRole: UserRole) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can cancel events');
    }

    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        reservations: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Check if the user is the creator of the event
    if (event.createdById !== userId) {
      throw new ForbiddenException('You can only cancel events you created');
    }

    // Update event status to CANCELED
    const canceledEvent = await this.prisma.$transaction(async (tx) => {
      // First, update all related reservations to CANCELED
      await tx.reservation.updateMany({
        where: {
          eventId: id,
          status: {
            in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED], // Update only active reservations
          },
        },
        data: {
          status: EventStatus.CANCELED,
          canceledAt: new Date(),
        },
      });

      // Then update the event status to CANCELED
      return await tx.event.update({
        where: { id },
        data: {
          status: EventStatus.CANCELED,
        },
        include: {
          createdBy: true,
        },
      });
    });

    return canceledEvent;
  }

  async getEventStats(userId: string, userRole: UserRole) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can access event statistics');
    }

    // Get upcoming events
    const upcomingEventsCount = await this.prisma.event.count({
      where: {
        date: {
          gte: new Date(),
        },
        status: EventStatus.PUBLISHED,
      },
    });

    // Get total reservations
    const totalReservations = await this.prisma.reservation.count({
      where: {
        event: {
          createdById: userId,
        },
      },
    });

    // Calculate average fill rate for published events
    const publishedEvents = await this.prisma.event.findMany({
      where: {
        createdById: userId,
        status: EventStatus.PUBLISHED,
      },
      select: {
        capacity: true,
        availableSeats: true,
      },
    });

    const avgFillRate =
      publishedEvents.length > 0
        ? publishedEvents.reduce(
            (sum, event) => sum + ((event.capacity - event.availableSeats) / event.capacity) * 100,
            0,
          ) / publishedEvents.length
        : 0;

    // Get status distribution
    const statusDistribution = await this.prisma.event.groupBy({
      by: ['status'],
      where: {
        createdById: userId,
      },
      _count: {
        status: true,
      },
    });

    return {
      upcomingEvents: upcomingEventsCount,
      totalReservations,
      avgFillRate: parseFloat(avgFillRate.toFixed(2)),
      statusDistribution: statusDistribution.reduce((acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      }, {}),
    };
  }

  async getEventReservations(eventId: string, userId: string, userRole: UserRole) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can view event reservations');
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Check if the user is the creator of the event
    if (event.createdById !== userId) {
      throw new ForbiddenException('You can only view reservations for events you created');
    }

    const reservations = await this.prisma.reservation.findMany({
      where: {
        eventId: eventId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reservations;
  }
}
