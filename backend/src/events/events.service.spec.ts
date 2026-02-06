import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { EventStatus } from '../common/enums/event-status.enum';
import { UserRole } from '../common/enums/user-role.enum';

describe('EventsService', () => {
  let service: EventsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: {
            event: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
            },
          },
        },
        {
          provide: MailService,
          useValue: {
            sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
            sendReservationPending: jest.fn().mockResolvedValue(undefined),
            sendReservationConfirmed: jest.fn().mockResolvedValue(undefined),
            sendReservationCanceled: jest.fn().mockResolvedValue(undefined),
            sendEventCanceled: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // Tomorrow's date
      const createEventDto: CreateEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        date: futureDate,
        location: 'Test Location',
        capacity: 50,
      };
      const userId = 'test-user-id';
      const expectedDate = new Date(futureDate);
      const expectedResult = {
        id: 'test-event-id',
        title: 'Test Event',
        description: 'Test Description',
        date: expectedDate,
        location: 'Test Location',
        capacity: 50,
        availableSeats: 50,
        status: EventStatus.DRAFT,
        createdById: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.event, 'create').mockResolvedValue(expectedResult as any);

      const result = await service.create(createEventDto, userId);
      expect(result).toEqual(expectedResult);
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Event',
          description: 'Test Description',
          date: expectedDate,
          location: 'Test Location',
          capacity: 50,
          availableSeats: 50,
          createdBy: {
            connect: { id: userId }
          }
        },
        include: {
          createdBy: true
        }
      });
    });
  });

  describe('findAll', () => {
    it('should return events with pagination for admin', async () => {
      const filters: FilterEventDto = { page: 1, limit: 10 };
      const userId = 'test-user-id';
      const userRole = UserRole.ADMIN;
      const expectedResult = {
        events: [],
        total: 0,
        page: 1,
        totalPages: 0
      };

      jest.spyOn(prisma.event, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.event, 'count').mockResolvedValue(0);

      const result = await service.findAll(filters, userId, userRole);
      expect(result).toEqual(expectedResult);
    });
  });
});