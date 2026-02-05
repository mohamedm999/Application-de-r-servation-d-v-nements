import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('ReservationsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let adminToken: string;
  let participantToken: string;
  let testEventId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);
    jwtService = moduleFixture.get(JwtService);

    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Create test users and get tokens
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin-reservation@test.com',
        password: 'hashedpassword',
        firstName: 'Admin',
        lastName: 'Reservation',
        role: 'ADMIN',
      },
    });

    const participantUser = await prisma.user.create({
      data: {
        email: 'participant-reservation@test.com',
        password: 'hashedpassword',
        firstName: 'Participant',
        lastName: 'Reservation',
        role: 'PARTICIPANT',
      },
    });

    // Create a test event
    const testEvent = await prisma.event.create({
      data: {
        title: 'Reservation Test Event',
        description: 'Event for testing reservations',
        date: new Date(Date.now() + 86400000), // Tomorrow
        location: 'Test Location',
        capacity: 50,
        availableSeats: 50,
        status: 'PUBLISHED',
        createdById: adminUser.id,
      },
    });

    testEventId = testEvent.id;

    adminToken = jwtService.sign({
      sub: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    participantToken = jwtService.sign({
      sub: participantUser.id,
      email: participantUser.email,
      role: participantUser.role,
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.event.deleteMany({
      where: {
        title: 'Reservation Test Event',
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: { in: ['admin-reservation@test.com', 'participant-reservation@test.com'] },
      },
    });

    await app.close();
  });

  describe('POST /api/reservations (Authenticated)', () => {
    it('should create a reservation when authenticated', async () => {
      const reservationData = {
        eventId: testEventId,
        numberOfSeats: 2,
      };

      return request(app.getHttpServer())
        .post('/api/reservations')
        .set('Authorization', `Bearer ${participantToken}`)
        .send(reservationData)
        .expect(201);
    });
  });

  describe('GET /api/reservations/my (Authenticated)', () => {
    it('should return user reservations when authenticated', async () => {
      return request(app.getHttpServer())
        .get('/api/reservations/my')
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(200);
    });
  });

  describe('GET /api/reservations (Admin only)', () => {
    it('should return all reservations when authenticated as admin', async () => {
      return request(app.getHttpServer())
        .get('/api/reservations')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should not return all reservations when authenticated as participant', async () => {
      return request(app.getHttpServer())
        .get('/api/reservations')
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(403); // Forbidden
    });
  });
});
