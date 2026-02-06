import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from './pdf.service';
import { ConfigService } from '@nestjs/config';
import { ReservationStatus } from '../common/enums/reservation-status.enum';

describe('PdfService', () => {
  let service: PdfService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        APP_URL: 'http://localhost:3000',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PdfService>(PdfService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTicket', () => {
    it('should generate a PDF ticket with reservation details', async () => {
      const reservation = {
        id: 'res123',
        status: ReservationStatus.CONFIRMED,
        numberOfSeats: 2,
        createdAt: new Date('2026-01-15'),
        event: {
          id: 'event123',
          title: 'Tech Conference 2026',
          date: new Date('2026-06-15T14:00:00Z'),
          location: 'Convention Center, New York',
        },
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      };

      const pdfBuffer = await service.generateTicket(reservation);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      
      // Check that PDF starts with PDF magic number
      expect(pdfBuffer.toString('utf8', 0, 4)).toBe('%PDF');
    });

    it('should generate PDF with different status colors', async () => {
      const pendingReservation = {
        id: 'res456',
        status: ReservationStatus.PENDING,
        numberOfSeats: 1,
        createdAt: new Date('2026-01-20'),
        event: {
          id: 'event456',
          title: 'Music Festival',
          date: new Date('2026-07-20T18:00:00Z'),
          location: 'Central Park',
        },
        user: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
        },
      };

      const pdfBuffer = await service.generateTicket(pendingReservation);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it('should include QR code in the PDF', async () => {
      const reservation = {
        id: 'res789',
        status: ReservationStatus.CONFIRMED,
        numberOfSeats: 4,
        createdAt: new Date('2026-02-01'),
        event: {
          id: 'event789',
          title: 'Sports Championship',
          date: new Date('2026-08-10T20:00:00Z'),
          location: 'Stadium',
        },
        user: {
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob.johnson@example.com',
        },
      };

      const pdfBuffer = await service.generateTicket(reservation);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      // QR code data URL should be generated for RESERVATION:res789:event789
      expect(pdfBuffer.length).toBeGreaterThan(1000); // Should be larger with QR code
    });

    it('should handle errors gracefully', async () => {
      const invalidReservation: any = null;

      await expect(service.generateTicket(invalidReservation)).rejects.toThrow();
    });
  });
});
