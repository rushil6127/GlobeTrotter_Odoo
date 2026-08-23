import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { SEED_CITIES } from '../src/config/seedData.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting GlobeTrotter database seeding for demo cities & activities...');

  let citiesSeeded = 0;
  let activitiesSeeded = 0;

  for (const cityData of SEED_CITIES) {
    const { activities, ...cityFields } = cityData;

    // Upsert City
    const city = await prisma.city.upsert({
      where: { id: cityFields.id },
      update: {
        name: cityFields.name,
        country: cityFields.country,
        description: cityFields.description,
        image: cityFields.image,
        latitude: cityFields.latitude,
        longitude: cityFields.longitude,
      },
      create: {
        id: cityFields.id,
        name: cityFields.name,
        country: cityFields.country,
        description: cityFields.description,
        image: cityFields.image,
        latitude: cityFields.latitude,
        longitude: cityFields.longitude,
      },
    });

    citiesSeeded++;

    // Upsert Activities for this city
    for (const activityData of activities) {
      await prisma.activity.upsert({
        where: { id: activityData.id },
        update: {
          name: activityData.name,
          description: activityData.description,
          category: activityData.category,
          duration: activityData.duration,
          estimatedCost: activityData.estimatedCost,
          image: activityData.image,
          cityId: city.id,
        },
        create: {
          id: activityData.id,
          name: activityData.name,
          description: activityData.description,
          category: activityData.category,
          duration: activityData.duration,
          estimatedCost: activityData.estimatedCost,
          image: activityData.image,
          cityId: city.id,
        },
      });

      activitiesSeeded++;
    }
  }

  // Seed Demo User
  console.log('👤 Seeding demo user...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {
      name: 'Pushp (Traveler)',
      password: hashedPassword,
    },
    create: {
      id: 'demo-user-id',
      email: 'demo@example.com',
      name: 'Pushp (Traveler)',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&q=80',
    },
  });

  // Seed Sample Trips
  console.log('✈️ Seeding sample trips...');
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const goaTrip = await prisma.trip.upsert({
    where: { id: 'demo-trip-goa-01' },
    update: {},
    create: {
      id: 'demo-trip-goa-01',
      name: 'Goa Coastal Getaway',
      description: 'Sun, sand, historical churches and coastal seafood adventures across North and South Goa.',
      startDate: nextWeek,
      endDate: twoWeeksLater,
      budget: 45000,
      currency: 'INR',
      userId: demoUser.id,
      tripCities: {
        create: [
          {
            cityId: 'c1000000-0000-0000-0000-000000000001',
            order: 0,
          },
        ],
      },
      expenses: {
        create: [
          {
            category: 'accommodation',
            amount: 18000,
            date: nextWeek,
            description: 'Beach Resort Booking',
          },
          {
            category: 'food',
            amount: 8500,
            date: nextWeek,
            description: 'Seafood and cafe dining',
          },
        ],
      },
    },
  });

  const tokyoTrip = await prisma.trip.upsert({
    where: { id: 'demo-trip-tokyo-02' },
    update: {},
    create: {
      id: 'demo-trip-tokyo-02',
      name: 'Tokyo Neon & Temples',
      description: 'Exploring modern Shinjuku skyscrapers, historic Asakusa, and culinary marvels in Tsukiji.',
      startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 37 * 24 * 60 * 60 * 1000),
      budget: 120000,
      currency: 'INR',
      userId: demoUser.id,
      tripCities: {
        create: [
          {
            cityId: 'c1000000-0000-0000-0000-000000000003',
            order: 0,
          },
        ],
      },
    },
  });

  console.log(`✅ Seeding complete! Successfully seeded ${citiesSeeded} cities, ${activitiesSeeded} activities, demo user (demo@example.com), and demo trips.`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
