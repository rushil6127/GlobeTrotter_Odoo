import { prisma } from '../config/prisma.js';
import { GetCitiesQueryInput, SearchCitiesQueryInput } from '../validators/city.validator.js';

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class CityService {
  /**
   * Retrieve paginated list of cities with optional filtering by country, search term, and sorting.
   */
  static async getCities(query: GetCitiesQueryInput) {
    const {
      page = 1,
      limit = 10,
      search,
      country,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (country) {
      where.country = {
        contains: country,
        mode: 'insensitive',
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy = { [sortBy]: sortOrder };

    const [cities, total] = await Promise.all([
      prisma.city.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: { activities: true },
          },
        },
      }),
      prisma.city.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 0;

    const formattedCities = cities.map((city) => {
      const { _count, ...rest } = city;
      return {
        ...rest,
        activitiesCount: _count?.activities ?? 0,
      };
    });

    return {
      cities: formattedCities,
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
   * Fast city search by keyword across name, country, and description.
   */
  static async searchCities(query: SearchCitiesQueryInput) {
    const { q, limit = 10 } = query;

    const cities = await prisma.city.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { country: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { activities: true },
        },
      },
    });

    return cities.map((city) => {
      const { _count, ...rest } = city;
      return {
        ...rest,
        activitiesCount: _count?.activities ?? 0,
      };
    });
  }

  /**
   * Retrieve city details by unique cityId, including all associated activities.
   */
  static async getCityById(cityId: string) {
    const city = await prisma.city.findUnique({
      where: { id: cityId },
      include: {
        activities: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { activities: true },
        },
      },
    });

    if (!city) {
      const error: any = new Error(`City with ID '${cityId}' not found`);
      error.statusCode = 404;
      error.code = 'CITY_NOT_FOUND';
      throw error;
    }

    const { _count, ...rest } = city;
    return {
      ...rest,
      activitiesCount: _count?.activities ?? 0,
    };
  }
}
