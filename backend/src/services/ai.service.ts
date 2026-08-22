import { prisma } from '../config/prisma.js';
import { config } from '../config/index.js';
import { SEED_CITIES, SeedCity } from '../config/seedData.js';
import { ItineraryService } from './itinerary.service.js';
import {
  GenerateAiItineraryInput,
  SaveAiItineraryInput,
  AiItineraryItemDraft,
} from '../validators/ai.validator.js';

export interface GeneratedItineraryResponse {
  destination: string;
  summary: string;
  daysCount: number;
  currency: string;
  travelers: number;
  budget: number;
  totalEstimatedCost: number;
  budgetStatus: 'WITHIN_BUDGET' | 'OVER_BUDGET';
  budgetBreakdown: {
    transport: number;
    food: number;
    activities: number;
    accommodation: number;
    shopping: number;
    other: number;
  };
  routeOrder: string[];
  suggestedActivities: Array<{
    name: string;
    category: string;
    duration: number;
    estimatedCost: number;
    dayNumber: number;
    timeSlot: string;
    notes: string;
  }>;
  days: Array<{
    dayNumber: number;
    title: string;
    items: AiItineraryItemDraft[];
  }>;
}

export class AIService {
  /**
   * Main entry point for generating travel itineraries.
   * Dispatches to LLM provider if API key is configured, or uses the intelligent local synthesis engine.
   */
  static async generateItinerary(input: GenerateAiItineraryInput): Promise<GeneratedItineraryResponse> {
    const destination = input.destination || (await this.selectOptimalDestination(input.style));

    let generated: GeneratedItineraryResponse;

    if (config.aiApiKey) {
      try {
        generated = await this.generateWithExternalLLM(destination, input);
      } catch (err) {
        console.warn('External AI call failed or timed out. Falling back to local AI travel synthesis engine:', err);
        generated = await this.generateWithLocalEngine(destination, input);
      }
    } else {
      generated = await this.generateWithLocalEngine(destination, input);
    }

    // Strict validation of the AI output before returning
    this.validateGeneratedOutput(generated, input);

    return generated;
  }

  /**
   * Helper to pick a destination from DB / static catalog if not provided, matching user style.
   */
  private static async selectOptimalDestination(styles: string[]): Promise<string> {
    const lowerStyles = styles.map((s) => s.toLowerCase());

    if (lowerStyles.some((s) => s.includes('beach') || s.includes('relax') || s.includes('party'))) {
      return 'Goa';
    }
    if (lowerStyles.some((s) => s.includes('culture') || s.includes('history') || s.includes('sightseeing'))) {
      return 'Paris';
    }
    if (lowerStyles.some((s) => s.includes('food') || s.includes('adventure'))) {
      return 'Tokyo';
    }

    if (process.env.DATABASE_URL) {
      try {
        const firstCity = await prisma.city.findFirst({ orderBy: { name: 'asc' } });
        if (firstCity) return firstCity.name;
      } catch {
        // Fallback if DB is unavailable
      }
    }

    return SEED_CITIES[0]?.name || 'Goa';
  }

  /**
   * External LLM Provider Integration (OpenAI/Gemini compatible REST invocation).
   */
  private static async generateWithExternalLLM(
    destination: string,
    input: GenerateAiItineraryInput
  ): Promise<GeneratedItineraryResponse> {
    const prompt = `You are GlobeTrotter's expert AI travel planner.
Generate a structured JSON itinerary for a ${input.days}-day trip to ${destination}.
Travel styles: ${input.style.join(', ')}.
Total Budget: ${input.budget} ${input.currency}.
Number of Travelers: ${input.travelers}.

Output JSON matching this exact structure:
{
  "destination": "${destination}",
  "summary": "Short 2-sentence trip summary",
  "daysCount": ${input.days},
  "currency": "${input.currency}",
  "travelers": ${input.travelers},
  "budget": ${input.budget},
  "totalEstimatedCost": number,
  "budgetStatus": "WITHIN_BUDGET" or "OVER_BUDGET",
  "budgetBreakdown": {
    "transport": number,
    "food": number,
    "activities": number,
    "accommodation": number,
    "shopping": number,
    "other": number
  },
  "routeOrder": ["Neighborhood/City Stop 1", "Neighborhood/City Stop 2"],
  "suggestedActivities": [
    {
      "name": "string",
      "category": "Sightseeing | Food | Adventure | Culture | Relaxing",
      "duration": number_in_minutes,
      "estimatedCost": number,
      "dayNumber": number,
      "timeSlot": "Morning | Afternoon | Evening",
      "notes": "string"
    }
  ],
  "days": [
    {
      "dayNumber": 1,
      "title": "Arrival & Welcome",
      "items": [
        {
          "title": "Activity title",
          "dayNumber": 1,
          "startTime": "09:30",
          "endTime": "12:00",
          "notes": "Helpful tip",
          "estimatedCost": 25
        }
      ]
    }
  ]
}

Important Rules:
1. Every item MUST have a valid 24h format startTime (HH:mm) and endTime (HH:mm) where startTime <= endTime.
2. estimatedCost MUST be a non-negative number.
3. dayNumber must be an integer between 1 and ${input.days}.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.aiApiKey}`,
        },
        body: JSON.stringify({
          model: config.aiModel || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You output only valid JSON matching the requested schema.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI Provider responded with status ${response.status}`);
      }

      const data = (await response.json()) as any;
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty AI response');

      return JSON.parse(content);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Deterministic, Local Synthesis Engine that matches DB / catalog cities, activities, and budget constraints.
   */
  private static async generateWithLocalEngine(
    destination: string,
    input: GenerateAiItineraryInput
  ): Promise<GeneratedItineraryResponse> {
    let cityName = destination;
    let cityActivities: Array<{ id: string; name: string; category: string; duration: number; estimatedCost: number }> = [];

    if (process.env.DATABASE_URL) {
      try {
        const cityFromDb = await prisma.city.findFirst({
          where: {
            OR: [
              { name: { contains: destination, mode: 'insensitive' } },
              { country: { contains: destination, mode: 'insensitive' } },
            ],
          },
          include: {
            activities: true,
          },
        });

        if (cityFromDb) {
          cityName = cityFromDb.name;
          cityActivities = cityFromDb.activities;
        }
      } catch {
        // Fallback to static catalog if DB is not available
      }
    }

    if (cityActivities.length === 0) {
      const matchedSeedCity =
        SEED_CITIES.find(
          (c) =>
            c.name.toLowerCase() === destination.toLowerCase() ||
            c.country.toLowerCase() === destination.toLowerCase()
        ) || SEED_CITIES[0];

      if (matchedSeedCity) {
        cityName = matchedSeedCity.name;
        cityActivities = matchedSeedCity.activities;
      }
    }

    // Build Day-wise activities
    const days: GeneratedItineraryResponse['days'] = [];
    const suggestedActivities: GeneratedItineraryResponse['suggestedActivities'] = [];

    const timeSlots = [
      { slot: 'Morning', start: '09:30', end: '12:30' },
      { slot: 'Afternoon', start: '14:00', end: '17:00' },
      { slot: 'Evening', start: '18:30', end: '21:00' },
    ];

    let totalActivitiesCost = 0;

    for (let d = 1; d <= input.days; d++) {
      const dayItems: AiItineraryItemDraft[] = [];
      const dayThemes = [
        'Arrival & Highlights',
        'Cultural Exploration & Landmark Tour',
        'Hidden Gems & Local Flavors',
        'Adventure & Panoramic Views',
        'Leisure, Shopping & Departure',
      ];
      const dayTitle = dayThemes[(d - 1) % dayThemes.length];

      // Schedule 2 items per day
      for (let s = 0; s < 2; ++s) {
        const slot = timeSlots[s];
        const activityIndex = ((d - 1) * 2 + s) % Math.max(1, cityActivities.length);
        const act = cityActivities[activityIndex];

        const itemTitle = act
          ? act.name
          : `${cityName} ${slot.slot} Tour (${input.style[0] || 'Sightseeing'})`;
        const cost = act ? act.estimatedCost : Math.round((input.budget * 0.04) / input.days);
        const category = act ? act.category : 'Sightseeing';

        totalActivitiesCost += cost;

        const item: AiItineraryItemDraft = {
          title: itemTitle,
          dayNumber: d,
          startTime: slot.start,
          endTime: slot.end,
          notes: `Optimized for ${input.style.join(', ')} style travel in ${cityName}.`,
          estimatedCost: cost,
          activityId: act ? act.id : null,
          order: s,
        };

        dayItems.push(item);

        suggestedActivities.push({
          name: itemTitle,
          category,
          duration: 150,
          estimatedCost: cost,
          dayNumber: d,
          timeSlot: slot.slot,
          notes: item.notes || '',
        });
      }

      days.push({
        dayNumber: d,
        title: `Day ${d}: ${dayTitle}`,
        items: dayItems,
      });
    }

    // Compute Budget Breakdown
    const accommodation = Math.round(input.budget * 0.35);
    const food = Math.round(input.budget * 0.25);
    const transport = Math.round(input.budget * 0.15);
    const activities = totalActivitiesCost;
    const other = Math.max(0, Math.round(input.budget * 0.05));
    const shopping = Math.max(0, input.budget - (accommodation + food + transport + activities + other));

    const totalEstimatedCost = accommodation + food + transport + activities + other + shopping;

    return {
      destination: cityName,
      summary: `A customized ${input.days}-day ${input.style.join(' & ')} itinerary for ${cityName}, balancing iconic highlights, culinary experiences, and leisure within your ${input.budget} ${input.currency} budget.`,
      daysCount: input.days,
      currency: input.currency,
      travelers: input.travelers,
      budget: input.budget,
      totalEstimatedCost,
      budgetStatus: totalEstimatedCost <= input.budget ? 'WITHIN_BUDGET' : 'OVER_BUDGET',
      budgetBreakdown: {
        accommodation,
        food,
        transport,
        activities,
        shopping,
        other,
      },
      routeOrder: [
        `${cityName} Central / Old Quarter`,
        `${cityName} Cultural & Historic District`,
        `${cityName} Waterfront & Scenic Views`,
      ],
      suggestedActivities,
      days,
    };
  }

  /**
   * Validates that the generated output strictly complies with all business logic rules.
   */
  private static validateGeneratedOutput(
    output: GeneratedItineraryResponse,
    input: GenerateAiItineraryInput
  ): void {
    if (!output || !Array.isArray(output.days) || output.days.length === 0) {
      throw new Error('AI failed to generate a valid day-wise schedule');
    }

    for (const day of output.days) {
      if (typeof day.dayNumber !== 'number' || day.dayNumber < 1 || day.dayNumber > input.days) {
        throw new Error(`Generated dayNumber ${day.dayNumber} is out of bounds (1-${input.days})`);
      }

      for (const item of day.items) {
        if (!item.title || item.title.trim().length === 0) {
          throw new Error('Generated itinerary item is missing a title');
        }

        if (item.startTime && item.endTime && item.startTime > item.endTime) {
          // Auto-correct reversed time order if generated erroneously
          const temp = item.startTime;
          item.startTime = item.endTime;
          item.endTime = temp;
        }

        if (typeof item.estimatedCost !== 'number' || item.estimatedCost < 0) {
          item.estimatedCost = 0;
        }
      }
    }
  }

  /**
   * POST /api/trips/:tripId/itinerary/from-ai
   * Persists an AI-generated itinerary draft to a trip with full permission & date boundary checks.
   */
  static async saveAiDraftToTrip(tripId: string, userId: string, input: SaveAiItineraryInput) {
    // 1. Verify trip exists and user has edit permissions (OWNER or EDITOR)
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
      const error: any = new Error('Unauthorized to modify this trip itinerary');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    // 2. Validate all items against trip dates and schema
    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);

    const itemsToCreate: Array<{
      tripId: string;
      title: string;
      date: Date;
      dayNumber: number;
      activityId: string | null;
      startTime: string | null;
      endTime: string | null;
      notes: string | null;
      estimatedCost: number;
      order: number;
    }> = [];

    for (let i = 0; i < input.items.length; i++) {
      const item = input.items[i];

      // Derive date if omitted: trip.startDate + (dayNumber - 1) days
      let itemDate: Date;
      if (item.date) {
        itemDate = new Date(item.date);
      } else {
        itemDate = new Date(tripStart);
        itemDate.setUTCDate(itemDate.getUTCDate() + (item.dayNumber - 1));
      }

      // Enforce strict date range check within trip
      ItineraryService.validateDateWithinTrip(itemDate, trip);

      // Verify activityId exists if provided
      if (item.activityId) {
        const actExists = await prisma.activity.findUnique({
          where: { id: item.activityId },
        });
        if (!actExists) {
          item.activityId = null; // Detach invalid reference safely
        }
      }

      itemsToCreate.push({
        tripId,
        title: item.title,
        date: itemDate,
        dayNumber: item.dayNumber,
        activityId: item.activityId || null,
        startTime: item.startTime || null,
        endTime: item.endTime || null,
        notes: item.notes || null,
        estimatedCost: item.estimatedCost || 0,
        order: item.order !== undefined ? item.order : i,
      });
    }

    // 3. Batch insert transactionally
    await prisma.itineraryItem.createMany({
      data: itemsToCreate,
    });

    // 4. Return the full structured itinerary
    return ItineraryService.getTripItinerary(tripId, userId);
  }
}
