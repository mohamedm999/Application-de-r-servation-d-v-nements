import { PrismaClient, UserRole, EventStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:your_secure_password@localhost:5432/event_booking';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eventbooking.com' },
    update: {},
    create: {
      email: 'admin@eventbooking.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'EventBooking',
      role: UserRole.ADMIN,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create participant users
  const participantPassword = await bcrypt.hash('User123!', 10);

  const participant1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      password: participantPassword,
      firstName: 'Alice',
      lastName: 'Dupont',
      role: UserRole.PARTICIPANT,
    },
  });

  const participant2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      password: participantPassword,
      firstName: 'Bob',
      lastName: 'Martin',
      role: UserRole.PARTICIPANT,
    },
  });
  console.log(`✅ Participant users created: ${participant1.email}, ${participant2.email}`);

  // Create sample events
  const now = new Date();

  const event1 = await prisma.event.create({
    data: {
      title: 'Conférence Tech 2025',
      description:
        'Une journée complète dédiée aux dernières innovations technologiques. Speakers internationaux, ateliers pratiques et networking.',
      date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      location: 'Centre de Congrès, Paris',
      capacity: 200,
      availableSeats: 200,
      status: EventStatus.PUBLISHED,
      createdById: admin.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: 'Workshop React & Next.js',
      description:
        'Atelier pratique pour maîtriser React 18 et Next.js 14. Apportez votre laptop !',
      date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      location: 'La Felicità, Paris 13e',
      capacity: 50,
      availableSeats: 50,
      status: EventStatus.PUBLISHED,
      createdById: admin.id,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: 'Meetup DevOps & Cloud',
      description:
        'Rencontre mensuelle des passionnés de DevOps. Au programme : Kubernetes, CI/CD, et observabilité.',
      date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      location: '42 School, Paris',
      capacity: 80,
      availableSeats: 80,
      status: EventStatus.PUBLISHED,
      createdById: admin.id,
    },
  });

  const event4 = await prisma.event.create({
    data: {
      title: 'Hackathon IA Générative',
      description:
        'Hackathon de 48h sur le thème de l\'IA générative. Prizes, mentors et pizza à volonté.',
      date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      location: 'Station F, Paris',
      capacity: 100,
      availableSeats: 100,
      status: EventStatus.DRAFT,
      createdById: admin.id,
    },
  });

  console.log(`✅ Events created: ${event1.title}, ${event2.title}, ${event3.title}, ${event4.title}`);

  // Create sample reservations
  await prisma.reservation.create({
    data: {
      userId: participant1.id,
      eventId: event1.id,
      numberOfSeats: 2,
      status: 'CONFIRMED',
      confirmedAt: new Date(),
    },
  });

  await prisma.reservation.create({
    data: {
      userId: participant2.id,
      eventId: event2.id,
      numberOfSeats: 1,
      status: 'PENDING',
    },
  });

  // Update available seats
  await prisma.event.update({
    where: { id: event1.id },
    data: { availableSeats: { decrement: 2 } },
  });

  await prisma.event.update({
    where: { id: event2.id },
    data: { availableSeats: { decrement: 1 } },
  });

  console.log('✅ Sample reservations created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Test accounts:');
  console.log('  Admin:       admin@eventbooking.com / Admin123!');
  console.log('  Participant: alice@example.com / User123!');
  console.log('  Participant: bob@example.com / User123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
