import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Reservations Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let adminId: string;
  let participant1Token: string;
  let participant1Id: string;
  let participant2Token: string;
  let participant2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);

    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Create test users
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
    });
    adminId = admin.id;

    const participant1 = await prisma.user.create({
      data: {
        email: 'participant1@test.com',
        password: hashedPassword,
        firstName: 'Participant',
        lastName: 'One',
        role: 'PARTICIPANT',
      },
    });
    participant1Id = participant1.id;

    const participant2 = await prisma.user.create({
      data: {
        email: 'participant2@test.com',
        password: hashedPassword,
        firstName: 'Participant',
        lastName: 'Two',
        role: 'PARTICIPANT',
      },
    });
    participant2Id = participant2.id;

    // Login to get tokens
    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Password123!' });
    adminToken = adminLogin.body.accessToken;

    const participant1Login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'participant1@test.com', password: 'Password123!' });
    participant1Token = participant1Login.body.accessToken;

    const participant2Login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'participant2@test.com', password: 'Password123!' });
    participant2Token = participant2Login.body.accessToken;
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({});
    await app.close();
  });

  afterEach(async () => {
    await prisma.reservation.deleteMany({});
    await prisma.event.deleteMany({});
  });

  describe('POST /api/reservations', () => {
    let eventId: string;

    beforeEach(async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Test Event',
          description: 'Description',
          date: new Date(Date.now() + 86400000),
          location: 'Location',
          capacity: 50,
          availableSeats: 50,
          status: 'PUBLISHED',
          createdById: adminId,
        },
      });
      eventId = event.id;
    });

    it('PARTICIPANT: should create a reservation', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/reservations')
        .set('Authorization', `Bearer ${participant1Token}`)
        .send({
          eventId,
          numberOfSeats: 2,
        })
        .expect(201);

      expect(response.body.eventId).toBe(eventId);
      expect(response.body.numberOfSeats).toBe(2);
      expect(response.body.status).toBe('PENDING');
    });

    it('ADMIN: should also be able to create a reservation', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/reservations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          eventId,
          numberOfSeats: 1,
        })
        .expect(201);

      expect(response.body.status).toBe('PENDING');
    });

    it('should fail without authentication (401)', async () => {
      await request(app.getHttpServer())
        .post('/api/reservations')
        .send({
          eventId,
          numberOfSeats: 1,
        })
        .expect(401);
    });

    it('should fail with invalid event ID (404)', async () => {
      await request(app.getHttpServer())
        .post('/api/reservations')
        .set('Authorization', `Bearer ${participant1Token}`)
        .send({
          eventId: '00000000-0000-0000-0000-000000000000',
          numberOfSeats: 1,
        })
        .expect(404);
    });

    it('should fail when exceeding available seats (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/reservations')
        .set('Authorization', `Bearer ${participant1Token}`)
        .send({
          eventId,
          numberOfSeats: 100,
        })
        .expect(400);
    });

    it('should fail with duplicate reservation (400)', async () => {
      // Create first reservation
      await request(app.getHttpServer())
        .post('/api/reservations')
        .set('Authorization', `Bearer ${participant1Token}`)
        .send({
          eventId,
          numberOfSeats: 1,
        })
        .expect(201);

      // Try to create duplicate
      await request(app.getHttpServer())
        .post('/api/reservations')
        .set('Authorization', `Bearer ${participant1Token}`)
        .send({
          eventId,
          numberOfSeats: 1,
        })
        .expect(400);
    });
  });

  describe('GET /api/reservations', () => {
    let event1Id: string;
    let event2Id: string;

    beforeEach(async () => {
      const event1 = await prisma.event.create({
        data: {
          title: 'Event 1',
          description: 'Description',
          date: new Date(Date.now() + 86400000),
          location: 'Location',
          capacity: 50,
          availableSeats: 50,
          status: 'PUBLISHED',
          createdById: adminId,
        },
      });
      event1Id = event1.id;

      const event2 = await prisma.event.create({
        data: {
          title: 'Event 2',
          description: 'Description',
          date: new Date(Date.now() + 172800000),
          location: 'Location',
          capacity: 30,
          availableSeats: 30,
          status: 'PUBLISHED',
          createdById: adminId,
        },
      });
      event2Id = event2.id;

      // Create reservations for both events
      await prisma.reservation.createMany({
        data: [
          {
            eventId: event1Id,
            userId: participant1Id,
            numberOfSeats: 2,
            status: 'CONFIRMED',
          },
          {
            eventId: event2Id,
            userId: participant1Id,
            numberOfSeats: 1,
            status: 'PENDING',
          },
          {
            eventId: event1Id,
            userId: participant2Id,
            numberOfSeats: 3,
            status: 'CONFIRMED',
          },
        ],
      });
    });

    it('ADMIN: should see all reservations', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/reservations')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.reservations.length).toBeGreaterThanOrEqual(3);
    });

    it('PARTICIPANT: should only see their own reservations', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/reservations')
        .set('Authorization', `Bearer ${participant1Token}`)
        .expect(200);

      expect(response.body.reservations.length).toBe(2);
      expect(response.body.reservations.every((r: any) => r.userId === participant1Id)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/reservations?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('totalPages');
    });

    it('should support filtering by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/reservations?status=CONFIRMED')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.reservations.every((r: any) => r.status === 'CONFIRMED')).toBe(true);
    });
  });

  describe('GET /api/reservations/:id', () => {
    let reservationId: string;
    let eventId: string;

    beforeEach(async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Test Event',
          description: 'Description',
          date: new Date(Date.now() + 86400000),
          location: 'Location',
          capacity: 50,
          availableSeats: 50,
          status: 'PUBLISHED',
          createdById: adminId,
        },
      });
      eventId = event.id;

      const reservation = await prisma.reservation.create({
        data: {
          eventId,
          userId: participant1Id,
          numberOfSeats: 2,
          status: 'PENDING',
        },
      });
      reservationId = reservation.id;
    });

    it('PARTICIPANT: should get their own reservation', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${participant1Token}`)
        .expect(200);

      expect(response.body.id).toBe(reservationId);
    });

    it("PARTICIPANT: should fail to get another user's reservation (403)", async () => {
      await request(app.getHttpServer())
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${participant2Token}`)
        .expect(403);
    });

    it('ADMIN: should get any reservation', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(reservationId);
    });
  });

  describe('PATCH /api/reservations/:id/confirm', () => {
    let reservationId: string;

    beforeEach(async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Test Event',
          description: 'Description',
          date: new Date(Date.now() + 86400000),
          location: 'Location',
          capacity: 50,
          availableSeats: 50,
          status: 'PUBLISHED',
          createdById: adminId,
        },
      });

      const reservation = await prisma.reservation.create({
        data: {
          eventId: event.id,
          userId: participant1Id,
          numberOfSeats: 2,
          status: 'PENDING',
        },
      });
      reservationId = reservation.id;
    });

    it('ADMIN: should confirm reservation', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/reservations/${reservationId}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('CONFIRMED');
      expect(response.body.confirmedAt).toBeTruthy();
    });

    it('PARTICIPANT: should fail to confirm reservation (403)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/reservations/${reservationId}/confirm`)
        .set('Authorization', `Bearer ${participant1Token}`)
        .expect(403);
    });
  });

  describe('PATCH /api/reservations/:id/refuse', () => {
    let reservationId: string;

    beforeEach(async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Test Event',
          description: 'Description',
          date: new Date(Date.now() + 86400000),
          location: 'Location',
          capacity: 50,
          availableSeats: 50,
          status: 'PUBLISHED',
          createdById: adminId,
        },
      });

      const reservation = await prisma.reservation.create({
        data: {
          eventId: event.id,
          userId: participant1Id,
          numberOfSeats: 2,
          status: 'PENDING',
        },
      });
      reservationId = reservation.id;
    });

    it('ADMIN: should refuse reservation', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/reservations/${reservationId}/refuse`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('REFUSED');
    });

    it('PARTICIPANT: should fail to refuse reservation (403)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/reservations/${reservationId}/refuse`)
        .set('Authorization', `Bearer ${participant1Token}`)
        .expect(403);
    });
  });

  describe('DELETE /api/reservations/:id (cancel)', () => {
    let reservationId: string;

    beforeEach(async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Test Event',
          description: 'Description',
          date: new Date(Date.now() + 86400000),
          location: 'Location',
          capacity: 50,
          availableSeats: 50,
          status: 'PUBLISHED',
          createdById: adminId,
        },
      });

      const reservation = await prisma.reservation.create({
        data: {
          eventId: event.id,
          userId: participant1Id,
          numberOfSeats: 2,
          status: 'CONFIRMED',
        },
      });
      reservationId = reservation.id;
    });

    it('PARTICIPANT: should cancel their own reservation', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${participant1Token}`)
        .expect(200);

      expect(response.body.status).toBe('CANCELED');
      expect(response.body.canceledAt).toBeTruthy();
    });

    it('ADMIN: should cancel any reservation via admin endpoint', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/reservations/${reservationId}/admin`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('CANCELED');
    });

    it("PARTICIPANT: should fail to cancel another user's reservation (403)", async () => {
      await request(app.getHttpServer())
        .delete(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${participant2Token}`)
        .expect(403);
    });
  });
});
