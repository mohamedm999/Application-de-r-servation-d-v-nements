import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('EventsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let adminToken: string;
  let participantToken: string;

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
        email: 'admin@test.com',
        password: 'hashedpassword',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
    });

    const participantUser = await prisma.user.create({
      data: {
        email: 'participant@test.com',
        password: 'hashedpassword',
        firstName: 'Participant',
        lastName: 'User',
        role: 'PARTICIPANT',
      },
    });

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
    await prisma.user.deleteMany({
      where: {
        email: { in: ['admin@test.com', 'participant@test.com'] },
      },
    });
    await app.close();
  });

  describe('POST /api/events (Admin only)', () => {
    it('should create an event when authenticated as admin', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'This is a test event description',
        date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        location: 'Test Location',
        capacity: 50,
      };

      return request(app.getHttpServer())
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData)
        .expect(201);
    });

    it('should not create an event when authenticated as participant', async () => {
      const eventData = {
        title: 'Test Event 2',
        description: 'This is another test event description',
        date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        location: 'Test Location 2',
        capacity: 30,
      };

      return request(app.getHttpServer())
        .post('/api/events')
        .set('Authorization', `Bearer ${participantToken}`)
        .send(eventData)
        .expect(403); // Forbidden
    });
  });

  describe('GET /api/events (Public)', () => {
    it('should return published events', async () => {
      return request(app.getHttpServer()).get('/api/events').expect(200);
    });
  });
});
