import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function upsertUser(params: {
  email: string;
  name: string;
  password: string;
  role: Role;
}) {
  const hashedPassword = await bcrypt.hash(params.password, 10);

  await prisma.user.upsert({
    where: { email: params.email },
    update: {
      name: params.name,
      role: params.role,
      password: hashedPassword,
    },
    create: {
      email: params.email,
      name: params.name,
      role: params.role,
      password: hashedPassword,
    },
  });
}

async function main() {
  await upsertUser({
    email: process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com',
    name: process.env.SEED_ADMIN_NAME ?? 'Test Admin',
    password: process.env.SEED_ADMIN_PASSWORD ?? '12345678',
    role: Role.ADMIN,
  });

  await upsertUser({
    email: process.env.SEED_CUSTOMER_EMAIL ?? 'customer@example.com',
    name: process.env.SEED_CUSTOMER_NAME ?? 'Test Customer',
    password: process.env.SEED_CUSTOMER_PASSWORD ?? '12345678',
    role: Role.CUSTOMER,
  });
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
