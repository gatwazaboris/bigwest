import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const result = await db.clientUser.updateMany({
    where: { emailVerifyToken: null },
    data: { emailVerified: true },
  });
  console.log('Marked existing clients verified:', result.count);
}

main()
  .then(() => db.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
