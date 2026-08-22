import { prisma } from '../config/prisma.js';
import { GetActivitiesQueryInput } from '../validators/activity.validator.js';

export class ActivityService {
  /**
   * Retrieve paginated list of activities with filtering by cityId, category, maxCost, duration, search, and sorting.
   */
  static async getActivities(query: GetActivitiesQueryInput) {
    const {
      cityId,
      category,
      maxCost,
      duration,
      search,
      q,
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (cityId) {
      where.cityId = cityId;
    }

    if (category) {
      where.category = {
        contains: category,
        mode: 'insensitive',
      };
    }

    if (maxCost !== undefined) {
      where.estimatedCost = {
        lte: maxCost,
      };
    }

    if (duration !== undefined) {
      where.duration = {
        lte: duration,
      };
    }

    const searchTerm = search || q;
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { category: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const orderBy = { [sortBy]: sortOrder };

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          city: {
            select: {
              id: true,
              name: true,
              country: true,
              image: true,
            },
          },
        },
      }),
      prisma.activity.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 0;

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Retrieve a single activity by unique ID with full city details.
   */
  static async getActivityById(activityId: string) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        city: true,
      },
    });

    if (!activity) {
      const error: any = new Error(`Activity with ID '${activityId}' not found`);
      error.statusCode = 404;
      error.code = 'ACTIVITY_NOT_FOUND';
      throw error;
    }

    return activity;
  }
}
