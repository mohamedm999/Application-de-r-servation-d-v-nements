import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { PdfService } from '../pdf/pdf.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { FilterReservationDto } from './dto/filter-reservation.dto';
import { ReservationStatus } from '../common/enums/reservation-status.enum';
import { EventStatus } from '../common/enums/event-status.enum';
import { UserRole } from '../common/enums/user-role.enum';

const mockReservationModel = {
  create: jest.fn(),
  findMany: jest.fn(),
  findFirst: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
  count: jest.fn(),
};

const mockEventModel = {
  findUnique: jest.fn(),
  update: jest.fn(),
};

const mockTransaction = jest.fn();

describe('ReservationsService', () => {
  let service: ReservationsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: {
            reservation: mockReservationModel,
            event: mockEventModel,
            $transaction: mockTransaction,
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
        {
          provide: PdfService,
          useValue: {
            generateTicket: jest.fn().mockResolvedValue(Buffer.from('fake-pdf')),
          },
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a reservation', async () => {
      const createReservationDto: CreateReservationDto = {
        eventId: 'test-event-id',
        numberOfSeats: 2,
      };
      const userId = 'test-user-id';

      const event = {
        id: 'test-event-id',
        title: 'Test Event',
        description: 'Test Description',
        date: new Date(),
        location: 'Test Location',
        capacity: 50,
        availableSeats: 10,
        status: EventStatus.PUBLISHED,
        createdById: 'creator-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const reservation = {
        id: 'test-reservation-id',
        eventId: 'test-event-id',
        userId: 'test-user-id',
        status: ReservationStatus.PENDING,
        numberOfSeats: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        confirmedAt: null,
        canceledAt: null,
      };

      mockEventModel.findUnique.mockResolvedValue(event);
      mockEventModel.update.mockResolvedValue({ ...event, availableSeats: 8 } as any);
      mockReservationModel.findFirst.mockResolvedValue(null);
      mockReservationModel.create.mockResolvedValue(reservation as any);
      mockTransaction.mockImplementation(async (callback: any) => {
        const prismaProxy = {
          reservation: mockReservationModel,
          event: mockEventModel,
        };
        return await callback(prismaProxy);
      });

      const result = await service.create(createReservationDto, userId);
      expect(result).toEqual(
        expect.objectContaining({
          id: 'test-reservation-id',
          eventId: 'test-event-id',
          userId: 'test-user-id',
          status: ReservationStatus.PENDING,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return reservations with pagination for admin', async () => {
      const filters: FilterReservationDto = { page: 1, limit: 10 };
      const userId = 'test-user-id';
      const userRole = UserRole.ADMIN;
      const expectedResult = {
        reservations: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };

      mockReservationModel.findMany.mockResolvedValue([]);
      mockReservationModel.count.mockResolvedValue(0);

      const result = await service.findAll(filters, userId, userRole);
      expect(result).toEqual(expectedResult);
    });
  });
});
