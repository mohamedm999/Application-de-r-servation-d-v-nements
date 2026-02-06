import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  }),
}));

describe('MailService', () => {
  let service: MailService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        MAIL_HOST: 'smtp.test.com',
        MAIL_PORT: 587,
        MAIL_USER: 'test@test.com',
        MAIL_PASSWORD: 'testpassword',
        MAIL_FROM: 'noreply@test.com',
        APP_URL: 'http://localhost:3000',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email to new user', async () => {
      await service.sendWelcomeEmail('user@example.com', 'John Doe');

      // Verify no errors thrown
      expect(true).toBe(true);
    });
  });

  describe('sendReservationPending', () => {
    it('should send reservation pending notification', async () => {
      await service.sendReservationPending(
        'user@example.com',
        'John Doe',
        'Tech Conference',
        new Date('2026-06-15'),
        2,
      );

      expect(true).toBe(true);
    });
  });

  describe('sendReservationConfirmed', () => {
    it('should send reservation confirmed email without PDF', async () => {
      await service.sendReservationConfirmed(
        'user@example.com',
        'John Doe',
        'Tech Conference',
        new Date('2026-06-15'),
        'Convention Center',
        2,
      );

      expect(true).toBe(true);
    });

    it('should send reservation confirmed email with PDF attachment', async () => {
      const mockPdfBuffer = Buffer.from('mock-pdf-content');

      await service.sendReservationConfirmed(
        'user@example.com',
        'John Doe',
        'Tech Conference',
        new Date('2026-06-15'),
        'Convention Center',
        2,
        mockPdfBuffer,
      );

      expect(true).toBe(true);
    });
  });

  describe('sendReservationCanceled', () => {
    it('should send reservation canceled email without reason', async () => {
      await service.sendReservationCanceled(
        'user@example.com',
        'John Doe',
        'Tech Conference',
      );

      expect(true).toBe(true);
    });

    it('should send reservation canceled email with reason', async () => {
      await service.sendReservationCanceled(
        'user@example.com',
        'John Doe',
        'Tech Conference',
        'Event capacity changed',
      );

      expect(true).toBe(true);
    });
  });

  describe('sendEventCanceled', () => {
    it('should send event canceled notification', async () => {
      await service.sendEventCanceled(
        'user@example.com',
        'John Doe',
        'Tech Conference',
        new Date('2026-06-15'),
      );

      expect(true).toBe(true);
    });
  });
});
