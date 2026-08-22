import { PrismaClient } from '@prisma/client';
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

  console.log(`✅ Seeding complete! Successfully seeded ${citiesSeeded} cities and ${activitiesSeeded} activities.`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
