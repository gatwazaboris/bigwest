import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@bigwesttours.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name: 'Big West Admin' },
    create: {
      email,
      passwordHash,
      name: 'Big West Admin',
    },
  });

  const defaultHeroImages = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80',
  ];

  const existingSettings = await prisma.siteSettings.findUnique({ where: { id: 'main' } });
  const existingHeroImages = Array.isArray(existingSettings?.heroImages)
    ? (existingSettings?.heroImages as string[])
    : [];

  await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: existingHeroImages.length
      ? {}
      : {
          heroImages: defaultHeroImages,
        },
    create: {
      id: 'main',
      companyName: 'Visit KIBUYE',
      companyTagline: 'Kibuye • Karongi • Lake Kivu',
      logoImage: '',
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
      heroImages: defaultHeroImages,
      pages: {},
      contactEmail: 'big_west_tour@gmail.com',
      whatsappNumber: '250784921771',
      phoneNumber: '+250 784 921 771',
      location: 'Kibuye, Karongi, Rwanda',
      facebookUrl: '',
      instagramUrl: '',
      tiktokUrl: '',
      youtubeUrl: '',
      twitterUrl: '',
    },
  });

  const tourCount = await prisma.tour.count();
  if (tourCount === 0) {
    await prisma.tour.createMany({
      data: [
        {
          name: { en: 'Kibuye to Rubavu', fr: 'Kibuye vers Rubavu' },
          description: {
            en: 'Full-day scenic boat transfer across Lake Kivu with stops for photos and local stories.',
            fr: 'Transfert en bateau d’une journée sur le lac Kivu avec arrêts photos et histoires locales.',
          },
          duration: { en: 'Full day', fr: 'Journée complète' },
          category: 'boat',
          priceUsd: 120,
          status: 'published',
          featured: true,
          images: [],
        },
        {
          name: { en: 'Private Boat Tours', fr: 'Excursions privées en bateau' },
          description: {
            en: 'Custom private boat tour tailored to your group size and preferred islands.',
            fr: 'Excursion privée personnalisée selon la taille du groupe et les îles souhaitées.',
          },
          duration: { en: 'Flexible', fr: 'Flexible' },
          category: 'boat',
          priceUsd: 150,
          status: 'published',
          featured: true,
          images: [],
        },
      ],
    });
  }

  console.log('Seed complete');
  console.log(`Admin login: ${email} / ${password}`);
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
