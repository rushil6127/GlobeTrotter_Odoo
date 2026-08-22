import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import { CreateShareLinkInput } from '../validators/share.validator.js';

export class ShareService {
  /**
   * Helper to verify trip existence and user edit permissions (OWNER or EDITOR).
   */
  private static async verifyTripEditPermission(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { tripMembers: true },
    });

    if (!trip) {
      const error: any = new Error('Trip not found');
      error.statusCode = 404;
      error.code = 'TRIP_NOT_FOUND';
      throw error;
    }

    const isOwner = trip.userId === userId;
    const isEditor = trip.tripMembers.some(
      (m) => m.userId === userId && (m.role === 'OWNER' || m.role === 'EDITOR')
    );

    if (!isOwner && !isEditor) {
      const error: any = new Error('Unauthorized to manage sharing for this trip');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return trip;
  }

  /**
   * Create or retrieve an existing active share link for a trip.
   */
  static async createShareLink(tripId: string, userId: string, input?: CreateShareLinkInput) {
    await this.verifyTripEditPermission(tripId, userId);

    const shouldRegenerate = input?.regenerate ?? false;

    // Check for existing active share link
    if (!shouldRegenerate) {
      const existingLink = await prisma.shareLink.findFirst({
        where: {
          tripId,
          isActive: true,
        },
      });

      if (existingLink) {
        // Check if expired
        const isExpired = existingLink.expiresAt && new Date() > new Date(existingLink.expiresAt);
        if (!isExpired) {
          return {
            ...existingLink,
            shareUrl: `/shared/${existingLink.shareKey}`,
          };
        }
      }
    }

    // Deactivate previous active links if regenerating
    await prisma.shareLink.updateMany({
      where: {
        tripId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Generate cryptographically secure random token (32 hex characters)
    const secureShareKey = crypto.randomBytes(16).toString('hex');
    const expiresAt = input?.expiresAt ? new Date(input.expiresAt) : null;

    const shareLink = await prisma.shareLink.create({
      data: {
        tripId,
        shareKey: secureShareKey,
        expiresAt,
        isActive: true,
      },
    });

    return {
      ...shareLink,
      shareUrl: `/shared/${shareLink.shareKey}`,
    };
  }

  /**
   * Revoke/deactivate all share links for a trip.
   */
  static async revokeShareLink(tripId: string, userId: string) {
    await this.verifyTripEditPermission(tripId, userId);

    const result = await prisma.shareLink.updateMany({
      where: {
        tripId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return {
      tripId,
      isShared: false,
      revokedCount: result.count,
    };
  }

  /**
   * Retrieve active share status for a trip (owner/editor inspects sharing status).
   */
  static async getTripShareStatus(tripId: string, userId: string) {
    await this.verifyTripEditPermission(tripId, userId);

    const activeLink = await prisma.shareLink.findFirst({
      where: {
        tripId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeLink) {
      return {
        isShared: false,
        shareLink: null,
      };
    }

    const isExpired = activeLink.expiresAt && new Date() > new Date(activeLink.expiresAt);

    return {
      isShared: !isExpired,
      shareLink: {
        ...activeLink,
        shareUrl: `/shared/${activeLink.shareKey}`,
        isExpired: Boolean(isExpired),
      },
    };
  }

  /**
   * Public retrieval of shared trip details using secure shareKey.
   * STRICT SECURITY POLICY: Exposes ONLY non-private trip metadata, destinations, and itinerary.
   * NEVER exposes passwords, emails, user IDs, trip members, or financial expenses.
   */
  static async getPublicSharedTrip(shareKey: string) {
    const shareLink = await prisma.shareLink.findUnique({
      where: { shareKey },
      include: {
        trip: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
            tripCities: {
              orderBy: { order: 'asc' },
              include: {
                city: {
                  select: {
                    id: true,
                    name: true,
                    country: true,
                    image: true,
                    description: true,
                    latitude: true,
                    longitude: true,
                  },
                },
              },
            },
            itineraryItems: {
              orderBy: [
                { date: 'asc' },
                { dayNumber: 'asc' },
                { order: 'asc' },
                { startTime: 'asc' },
              ],
              include: {
                activity: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    duration: true,
                    image: true,
                    city: {
                      select: { id: true, name: true, country: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!shareLink || !shareLink.isActive) {
      const error: any = new Error('This share link is invalid or has been revoked');
      error.statusCode = 404;
      error.code = 'SHARE_LINK_NOT_FOUND';
      throw error;
    }

    // Check expiration
    if (shareLink.expiresAt && new Date() > new Date(shareLink.expiresAt)) {
      const error: any = new Error('This share link has expired');
      error.statusCode = 410;
      error.code = 'SHARE_LINK_EXPIRED';
      throw error;
    }

    const { trip } = shareLink;

    // Group itinerary items by day for frontend
    const daysMap = new Map<number, typeof trip.itineraryItems>();
    for (const item of trip.itineraryItems) {
      const day = item.dayNumber;
      if (!daysMap.has(day)) {
        daysMap.set(day, []);
      }
      daysMap.get(day)!.push(item);
    }

    const days = Array.from(daysMap.entries()).map(([dayNumber, dayItems]) => ({
      dayNumber,
      date: dayItems[0]?.date ? dayItems[0].date.toISOString().split('T')[0] : null,
      itemsCount: dayItems.length,
      items: dayItems.map((item) => ({
        id: item.id,
        dayNumber: item.dayNumber,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
        title: item.title,
        notes: item.notes,
        activity: item.activity,
      })),
    }));

    return {
      trip: {
        id: trip.id,
        name: trip.name,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        currency: trip.currency,
        createdAt: trip.createdAt,
      },
      organizer: {
        name: trip.user.name,
        avatar: trip.user.avatar,
      },
      cities: trip.tripCities.map((tc) => ({
        id: tc.id,
        order: tc.order,
        arrivalDate: tc.arrivalDate,
        departureDate: tc.departureDate,
        city: tc.city,
      })),
      itinerary: trip.itineraryItems.map((item) => ({
        id: item.id,
        dayNumber: item.dayNumber,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
        title: item.title,
        notes: item.notes,
        activity: item.activity,
      })),
      days,
    };
  }
}
