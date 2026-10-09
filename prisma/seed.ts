import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@bigwesttours.com';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
      name: 'Big West Admin',
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      heroTitle: { en: 'Explore Kibuye and Lake Kivu', fr: 'Explorez Kibuye et le lac Kivu' },
      heroSubtitle: {
        en: 'Discover amazing islands, scenic boat rides, beaches, and unforgettable local experiences.',
        fr: 'Découvrez des îles magnifiques, des balades en bateau, des plages et des expériences locales inoubliables.',
      },
      aboutTitle: { en: 'About Visit KIBUYE', fr: 'À propos de Visit KIBUYE' },
      aboutText: {
        en: 'We create memorable local tourism experiences around Kibuye and Karongi.',
        fr: 'Nous créons des expériences touristiques locales mémorables autour de Kibuye et Karongi.',
      },
      contactEmail: 'big_west_tour@gmail.com',
      whatsappNumber: '250784921771',
      phoneNumber: '+250 784 921 771',
      location: 'Kibuye, Karongi, Rwanda',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
