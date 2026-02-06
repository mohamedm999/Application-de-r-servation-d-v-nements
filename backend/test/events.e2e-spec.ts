import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Events Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let adminId: string;
  let participantToken: string;
  let _participantId: string;

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

    const participant = await prisma.user.create({
      data: {
        email: 'participant@test.com',
        password: hashedPassword,
        firstName: 'Participant',
        lastName: 'User',
        role: 'PARTICIPANT',
      },
    });
    _participantId = participant.id;

    // Login to get tokens
    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Password123!' });
    adminToken = adminLogin.body.accessToken;

    const participantLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'participant@test.com', password: 'Password123!' });
    participantToken = participantLogin.body.accessToken;
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

  describe('POST /api/events', () => {
    it('ADMIN: should create an event', async () => {
      const eventData = {
        title: 'Admin Event',
        description: 'Event created by admin',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Admin Location',
        capacity: 50,
      };

      const response = await request(app.getHttpServer())
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData)
        .expect(201);

      expect(response.body.title).toBe(eventData.title);
      expect(response.body.status).toBe('DRAFT');
      expect(response.body.availableSeats).toBe(50);
    });

    it('PARTICIPANT: should fail to create an event (403)', async () => {
      const eventData = {
        title: 'Participant Event',
        description: 'Event by participant',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Location',
        capacity: 50,
      };

      await request(app.getHttpServer())
        .post('/api/events')
        .set('Authorization', `Bearer ${participantToken}`)
        .send(eventData)
        .expect(403);
    });

    it('should fail without authentication (401)', async () => {
      const eventData = {
        title: 'No Auth Event',
        description: 'Event without auth',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Location',
        capacity: 50,
      };

      await request(app.getHttpServer()).post('/api/events').send(eventData).expect(401);
    });

    it('should fail with invalid data (400)', async () => {
      await request(app.getHttpServer())
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '',
          capacity: -5,
        })
        .expect(400);
    });
  });

  describe('GET /api/events', () => {
    beforeEach(async () => {
      await prisma.event.createMany({
        data: [
          {
            title: 'Published Event',
            description: 'Description',
            date: new Date(Date.now() + 86400000),
            location: 'Location',
            capacity: 50,
            availableSeats: 50,
            status: 'PUBLISHED',
            createdById: adminId,
          },
          {
            title: 'Draft Event',
            description: 'Description',
            date: new Date(Date.now() + 86400000),
            location: 'Location',
            capacity: 30,
            availableSeats: 30,
            status: 'DRAFT',
            createdById: adminId,
          },
        ],
      });
    });

    it('ADMIN: should see all events including drafts', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.events.length).toBeGreaterThanOrEqual(2);
    });

    it('PARTICIPANT: should only see published events', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/events')
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(200);

      expect(response.body.events.length).toBeGreaterThanOrEqual(1);
      expect(response.body.events.every((e: any) => e.status === 'PUBLISHED')).toBe(true);
    });

    it('should work without authentication', async () => {
      const response = await request(app.getHttpServer()).get('/api/events').expect(200);

      expect(response.body).toHaveProperty('events');
      expect(Array.isArray(response.body.events)).toBe(true);
    });
  });

  describe('GET /api/events/:id', () => {
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

    it('should get event by ID', async () => {
      const response = await request(app.getHttpServer()).get(`/api/events/${eventId}`).expect(200);

      expect(response.body.id).toBe(eventId);
      expect(response.body.title).toBe('Test Event');
    });

    it('should fail with invalid ID (404)', async () => {
      await request(app.getHttpServer())
        .get('/api/events/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PATCH /api/events/:id', () => {
    let eventId: string;

    beforeEach(async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Original Title',
          description: 'Description',
          date: new Date(Date.now() + 86400000),
          location: 'Location',
          capacity: 50,
          availableSeats: 50,
          status: 'DRAFT',
          createdById: adminId,
        },
      });
      eventId = event.id;
    });

    it('ADMIN: should update event', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
    });

    it('PARTICIPANT: should fail to update event (403)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ title: 'Unauthorized Update' })
        .expect(403);
    });
  });

  describe('PATCH /api/events/:id/publish', () => {
    let eventId: string;

    beforeEach(async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Draft Event',
          description: 'Description',
          date: new Date(Date.now() + 86400000),
          location: 'Location',
          capacity: 50,
          availableSeats: 50,
          status: 'DRAFT',
          createdById: adminId,
        },
      });
      eventId = event.id;
    });

    it('ADMIN: should publish event', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/events/${eventId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('PUBLISHED');
    });

    it('PARTICIPANT: should fail to publish (403)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/events/${eventId}/publish`)
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(403);
    });
  });

  describe('PATCH /api/events/:id/cancel', () => {
    let eventId: string;

    beforeEach(async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Published Event',
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

    it('ADMIN: should cancel event', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/events/${eventId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('CANCELED');
    });

    it('PARTICIPANT: should fail to cancel (403)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/events/${eventId}/cancel`)
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(403);
    });
  });

  describe('DELETE /api/events/:id', () => {
    let eventId: string;

    beforeEach(async () => {
      const event = await prisma.event.create({
        data: {
          title: 'Event to Delete',
          description: 'Description',
          date: new Date(Date.now() + 86400000),
          location: 'Location',
          capacity: 50,
          availableSeats: 50,
          status: 'DRAFT',
          createdById: adminId,
        },
      });
      eventId = event.id;
    });

    it('ADMIN: should delete event', async () => {
      await request(app.getHttpServer())
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const deleted = await prisma.event.findUnique({ where: { id: eventId } });
      expect(deleted).toBeNull();
    });

    it('PARTICIPANT: should fail to delete (403)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(403);
    });
  });
});
