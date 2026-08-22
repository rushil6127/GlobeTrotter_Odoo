import type { TripStatus } from "@/components/cards/TripCard";

/* ───────── Trip type ───────── */

export interface Trip {
  id: string;
  name: string;
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  coverImage: string;
  citiesCount: number;
  activitiesCount: number;
  status: TripStatus;
  budget: number;
  currency: string;
  progress: number;
  members: { name: string; avatar?: string }[];
}

/* ───────── Sample data ───────── */

export const mockTrips: Trip[] = [
  {
    id: "trip-paris",
    name: "Parisian Escape",
    destination: "Paris, France",
    description:
      "Stroll along the Seine, savour croissants beneath the Eiffel Tower, and lose yourself in the Louvre.",
    startDate: "Sep 10",
    endDate: "Sep 16",
    durationDays: 7,
    coverImage:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
    citiesCount: 1,
    activitiesCount: 14,
    status: "upcoming",
    budget: 2500,
    currency: "€",
    progress: 80,
    members: [{ name: "Pushp" }, { name: "Pearl" }],
  },
  {
    id: "trip-goa",
    name: "Goa Beach Vibes",
    destination: "Goa, India",
    description:
      "Sun-kissed beaches, vibrant nightlife, and the best seafood on the Konkan coast.",
    startDate: "Oct 1",
    endDate: "Oct 5",
    durationDays: 5,
    coverImage:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80",
    citiesCount: 2,
    activitiesCount: 10,
    status: "upcoming",
    budget: 35000,
    currency: "₹",
    progress: 55,
    members: [{ name: "Rushil" }, { name: "Heer" }, { name: "Pushp" }],
  },
  {
    id: "trip-dubai",
    name: "Dubai Luxe Tour",
    destination: "Dubai, UAE",
    description:
      "Sky-high architecture, golden deserts, and world-class shopping in the city of gold.",
    startDate: "Nov 20",
    endDate: "Nov 26",
    durationDays: 7,
    coverImage:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80",
    citiesCount: 1,
    activitiesCount: 12,
    status: "upcoming",
    budget: 4000,
    currency: "$",
    progress: 30,
    members: [{ name: "Pearl" }],
  },
  {
    id: "trip-rajasthan",
    name: "Royal Rajasthan",
    destination: "Rajasthan, India",
    description:
      "Majestic forts, colourful bazaars, and the timeless charm of the Thar Desert.",
    startDate: "Aug 5",
    endDate: "Aug 12",
    durationDays: 8,
    coverImage:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
    citiesCount: 4,
    activitiesCount: 18,
    status: "ongoing",
    budget: 45000,
    currency: "₹",
    progress: 90,
    members: [{ name: "Pushp" }, { name: "Heer" }],
  },
  {
    id: "trip-mumbai",
    name: "Mumbai City Trail",
    destination: "Mumbai, India",
    description:
      "Street food, Bollywood, colonial architecture, and the unstoppable energy of the Maximum City.",
    startDate: "Jul 15",
    endDate: "Jul 18",
    durationDays: 4,
    coverImage:
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80",
    citiesCount: 1,
    activitiesCount: 8,
    status: "completed",
    budget: 20000,
    currency: "₹",
    progress: 100,
    members: [{ name: "Rushil" }, { name: "Pearl" }, { name: "Pushp" }],
  },
  {
    id: "trip-manali",
    name: "Manali Mountains",
    destination: "Manali, India",
    description:
      "Snow-capped peaks, riverside camping, and adventure sports in the heart of Himachal.",
    startDate: "Dec 22",
    endDate: "Dec 28",
    durationDays: 7,
    coverImage:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80",
    citiesCount: 2,
    activitiesCount: 11,
    status: "upcoming",
    budget: 30000,
    currency: "₹",
    progress: 15,
    members: [{ name: "Heer" }, { name: "Pushp" }],
  },
];

/* ───────── Helpers ───────── */

/** Return the soonest upcoming trip (for "Upcoming Trip" section). */
export function getUpcomingTrip(trips: Trip[]): Trip | undefined {
  return trips.find((t) => t.status === "upcoming");
}
