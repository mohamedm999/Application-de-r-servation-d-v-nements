import { defineConfig } from 'prisma/config';

let dotenvLoaded = false;
try {
  require('dotenv/config');
  dotenvLoaded = true;
} catch {
  // dotenv not available in production — env vars set by Docker/system
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:your_secure_password@localhost:5432/event_booking',
  },
});
