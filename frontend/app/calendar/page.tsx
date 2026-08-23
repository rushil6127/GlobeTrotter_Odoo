"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PageShell } from "@/components/navigation/PlaceholderPage";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Loader";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { useApiData } from "@/lib/hooks/useApiData";
import { getTrips, type Trip } from "@/lib/api/trips";
import {
  getTripItinerary,
  type ItineraryResponse,
  type ItineraryItem,
  type ItineraryDay,
} from "@/lib/api/itinerary";
import {
  CalendarHeader,
  CalendarGrid,
  CalendarDayCellProps,
  CalendarEventData,
} from "@/components/calendar/Calendar";
import {
  CalendarDays,
  Clock,
  Plus,
  ArrowRight,
  ChevronDown,
  Calendar as CalendarIcon,
  AlertCircle,
  RefreshCw,
  Wallet,
  Sparkles,
  MapPin,
} from "lucide-react";

/* ── Helpers ── */
function formatMonthYear(date: Date) {
  return {
    month: date.toLocaleString("en-US", { month: "long" }),
    year: date.getFullYear(),
  };
}

function toDateString(d: Date | string) {
  const dateObj = typeof d === "string" ? new Date(d) : d;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fmtDatePretty(d: Date | string) {
  const dateObj = typeof d === "string" ? new Date(d) : d;
  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function currencySymbol(c: string) {
  return c === "INR" ? "₹" : c === "USD" ? "$" : c === "EUR" ? "€" : c || "₹";
}

/* ═════════════════════════════════════════
   DAY INSPECTOR MODAL
   ═════════════════════════════════════════ */
function DayDetailModal({
  open,
  onClose,
  date,
  trip,
  tripDayNumber,
  events,
}: {
  open: boolean;
  onClose: () => void;
  date: Date | null;
  trip: Trip | null;
  tripDayNumber?: number;
  events: CalendarEventData[];
}) {
  if (!date) return null;

  const sym = trip ? currencySymbol(trip.currency) : "₹";
  const totalCost = events.reduce((sum, e) => sum + (e.estimatedCost || 0), 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={fmtDatePretty(date)}
      size="md"
    >
      <div className="space-y-4">
        {trip && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-indigo-50/80 border border-primary/20">
            <div>
              <p className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
                {trip.name}
              </p>
              <p className="text-sm font-bold text-neutral-900 mt-0.5">
                {tripDayNumber ? `Day ${tripDayNumber} of trip schedule` : "Scheduled Date"}
              </p>
            </div>
            {totalCost > 0 && (
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 uppercase font-bold">
                  Day Estimated Cost
                </span>
                <p className="text-base font-extrabold text-neutral-900">
                  {sym}{totalCost.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {events.length === 0 ? (
            <div className="py-10 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 space-y-2.5">
              <Clock className="h-8 w-8 text-neutral-300 mx-auto" />
              <p className="text-xs text-neutral-500 font-medium">
                No activities scheduled for this date.
              </p>
              {trip && (
                <Link
                  href={`/trips/${trip.id}/itinerary`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Schedule in Itinerary
                </Link>
              )}
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-bold text-neutral-900">{event.title}</h4>
                  {event.estimatedCost != null && event.estimatedCost > 0 && (
                    <span className="text-xs font-extrabold text-neutral-900 shrink-0">
                      {sym}{event.estimatedCost.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {event.startTime && (
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg text-[11px]">
                      <Clock className="h-3 w-3" />
                      {event.startTime}
                      {event.endTime ? ` - ${event.endTime}` : ""}
                    </span>
                  )}
                  {event.category && (
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-neutral-100 text-neutral-700">
                      {event.category}
                    </span>
                  )}
                </div>

                {event.notes && (
                  <p className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 leading-relaxed">
                    {event.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          {trip ? (
            <Link
              href={`/trips/${trip.id}/itinerary`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              Open Day-by-Day View <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <div />
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ═════════════════════════════════════════
   MAIN CALENDAR PAGE COMPONENT
   ═════════════════════════════════════════ */
export default function CalendarPage() {
  const { user } = useAuth();

  // Load all user trips
  const {
    data: trips,
    isLoading: tripsLoading,
    error: tripsError,
    refetch: refetchTrips,
  } = useApiData<Trip[]>(() => getTrips());

  // Active selected trip state
  const [userSelectedTripId, setUserSelectedTripId] = useState<string>("");
  const selectedTripId = userSelectedTripId || (trips?.[0]?.id ?? "");

  const activeTrip = useMemo(() => {
    return trips?.find((t) => t.id === selectedTripId) ?? null;
  }, [trips, selectedTripId]);

  // Load itinerary data for selected trip (reuses existing getTripItinerary endpoint)
  const {
    data: itineraryData,
    isLoading: itinLoading,
  } = useApiData<ItineraryResponse>(
    () => (selectedTripId ? getTripItinerary(selectedTripId) : Promise.reject()),
    [selectedTripId]
  );

  // Active calendar view month/year state
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDayModal, setSelectedDayModal] = useState<{
    date: Date;
    events: CalendarEventData[];
    tripDayNumber?: number;
  } | null>(null);

  function handleSelectTrip(tripId: string) {
    setUserSelectedTripId(tripId);
    const target = trips?.find((t) => t.id === tripId);
    if (target?.startDate) {
      const tripStart = new Date(target.startDate);
      if (!isNaN(tripStart.getTime())) {
        setCurrentDate(new Date(tripStart.getFullYear(), tripStart.getMonth(), 1));
      }
    }
  }

  const { month, year } = useMemo(() => formatMonthYear(currentDate), [currentDate]);

  function handlePrevMonth() {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  function handleJumpToTripStart() {
    if (activeTrip?.startDate) {
      const d = new Date(activeTrip.startDate);
      setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }

  // Build mapping from YYYY-MM-DD to itinerary events & day numbers
  const { dateEventMap, tripDatesSet, tripDayIndexMap } = useMemo(() => {
    const eventMap: Record<string, CalendarEventData[]> = {};
    const tripSet = new Set<string>();
    const dayIndexMap: Record<string, number> = {};

    if (!activeTrip) {
      return { dateEventMap: eventMap, tripDatesSet: tripSet, tripDayIndexMap: dayIndexMap };
    }

    const start = new Date(activeTrip.startDate);
    const end = new Date(activeTrip.endDate);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const curr = new Date(start);
      let dayIdx = 1;
      while (curr <= end) {
        const dateStr = toDateString(curr);
        tripSet.add(dateStr);
        dayIndexMap[dateStr] = dayIdx;
        curr.setDate(curr.getDate() + 1);
        dayIdx++;
      }
    }

    // Map itinerary items from API response
    if (itineraryData?.days) {
      itineraryData.days.forEach((day: ItineraryDay) => {
        // If date exists on day object, use it; otherwise compute from trip start + (dayNumber - 1)
        let dateKey = "";
        if (day.date) {
          dateKey = toDateString(day.date);
        } else if (activeTrip.startDate) {
          const d = new Date(activeTrip.startDate);
          d.setDate(d.getDate() + (day.dayNumber - 1));
          dateKey = toDateString(d);
        }

        if (dateKey) {
          if (!eventMap[dateKey]) {
            eventMap[dateKey] = [];
          }
          day.items.forEach((item: ItineraryItem) => {
            eventMap[dateKey].push({
              id: item.id,
              title: item.title,
              category: item.activity?.category ?? null,
              startTime: item.startTime,
              endTime: item.endTime,
              estimatedCost: item.estimatedCost,
              dayNumber: item.dayNumber,
              notes: item.notes,
            });
          });
        }
      });
    }

    return { dateEventMap: eventMap, tripDatesSet: tripSet, tripDayIndexMap: dayIndexMap };
  }, [activeTrip, itineraryData]);

  // Construct Calendar Grid Cells for the displayed month
  const calendarDays: CalendarDayCellProps[] = useMemo(() => {
    const yearNum = currentDate.getFullYear();
    const monthNum = currentDate.getMonth();

    const firstDayOfMonth = new Date(yearNum, monthNum, 1);
    const lastDayOfMonth = new Date(yearNum, monthNum + 1, 0);

    const startWeekday = firstDayOfMonth.getDay(); // 0 (Sun) .. 6 (Sat)
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const todayStr = toDateString(new Date());
    const tripStartStr = activeTrip ? toDateString(activeTrip.startDate) : "";
    const tripEndStr = activeTrip ? toDateString(activeTrip.endDate) : "";

    const days: CalendarDayCellProps[] = [];

    // Padding days from previous month
    const prevMonthLastDay = new Date(yearNum, monthNum, 0).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) {
      const prevDate = new Date(yearNum, monthNum - 1, prevMonthLastDay - i);
      const prevDateStr = toDateString(prevDate);
      const events = dateEventMap[prevDateStr] || [];
      const isTripDay = tripDatesSet.has(prevDateStr);

      days.push({
        date: prevDate,
        dateStr: prevDateStr,
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: prevDateStr === todayStr,
        isTripDay,
        isTripStart: prevDateStr === tripStartStr,
        isTripEnd: prevDateStr === tripEndStr,
        tripDayNumber: tripDayIndexMap[prevDateStr],
        events,
        onClick: () =>
          setSelectedDayModal({
            date: prevDate,
            events,
            tripDayNumber: tripDayIndexMap[prevDateStr],
          }),
      });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const currDate = new Date(yearNum, monthNum, d);
      const currDateStr = toDateString(currDate);
      const events = dateEventMap[currDateStr] || [];
      const isTripDay = tripDatesSet.has(currDateStr);

      days.push({
        date: currDate,
        dateStr: currDateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: currDateStr === todayStr,
        isTripDay,
        isTripStart: currDateStr === tripStartStr,
        isTripEnd: currDateStr === tripEndStr,
        tripDayNumber: tripDayIndexMap[currDateStr],
        events,
        onClick: () =>
          setSelectedDayModal({
            date: currDate,
            events,
            tripDayNumber: tripDayIndexMap[currDateStr],
          }),
      });
    }

    // Trailing days for next month to complete standard 35 or 42 grid slots
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let n = 1; n <= remaining; n++) {
      const nextDate = new Date(yearNum, monthNum + 1, n);
      const nextDateStr = toDateString(nextDate);
      const events = dateEventMap[nextDateStr] || [];
      const isTripDay = tripDatesSet.has(nextDateStr);

      days.push({
        date: nextDate,
        dateStr: nextDateStr,
        dayNumber: n,
        isCurrentMonth: false,
        isToday: nextDateStr === todayStr,
        isTripDay,
        isTripStart: nextDateStr === tripStartStr,
        isTripEnd: nextDateStr === tripEndStr,
        tripDayNumber: tripDayIndexMap[nextDateStr],
        events,
        onClick: () =>
          setSelectedDayModal({
            date: nextDate,
            events,
            tripDayNumber: tripDayIndexMap[nextDateStr],
          }),
      });
    }

    return days;
  }, [currentDate, dateEventMap, tripDatesSet, tripDayIndexMap, activeTrip]);

  const isLoading = tripsLoading || itinLoading;

  return (
    <PageShell currentPath="/calendar" userName={user?.name ?? undefined}>
      <div className="max-w-6xl mx-auto space-y-8 pb-32 pt-2 md:pt-4">
        {/* Page Header with Trip Selection */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-neutral-900 tracking-tight">
              Trip Calendar
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Visualize your day-by-day travel schedules, activities, and duration across calendar dates.
            </p>
          </div>

          {/* Trip Selector & Quick Action Controls */}
          {trips && trips.length > 0 && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative">
                <select
                  value={selectedTripId}
                  onChange={(e) => handleSelectTrip(e.target.value)}
                  className="h-11 pl-4 pr-10 rounded-2xl border border-neutral-200 text-sm font-bold bg-white text-neutral-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({toDateString(t.startDate)} – {toDateString(t.endDate)})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              </div>

              {activeTrip && (
                <Button
                  size="md"
                  variant="outline"
                  leftIcon={<CalendarIcon className="h-4 w-4 text-primary" />}
                  onClick={handleJumpToTripStart}
                  className="shadow-xs"
                >
                  Jump to Trip Dates
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton variant="rounded" height={60} />
            <Skeleton variant="rounded" height={420} />
          </div>
        )}

        {/* Error State */}
        {!isLoading && tripsError && (
          <div className="bg-red-50/90 border border-red-200 rounded-3xl p-8 text-center space-y-4">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <h3 className="font-bold text-neutral-900">Failed to load calendar data</h3>
            <p className="text-xs text-neutral-600">{tripsError.message}</p>
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refetchTrips}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State: No Trips Created */}
        {!isLoading && !tripsError && trips && trips.length === 0 && (
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-neutral-200/60 p-10 sm:p-14 shadow-sm text-center">
            <EmptyState
              variant="trips"
              title="No trips created yet"
              description="Plan your first trip to view daily scheduled activities and destination timelines on the calendar."
              action={
                <Link href="/trips/new">
                  <Button variant="primary" size="lg" leftIcon={<Plus className="h-5 w-5" />}>
                    Create Your First Trip
                  </Button>
                </Link>
              }
            />
          </div>
        )}

        {/* Calendar View */}
        {!isLoading && !tripsError && trips && trips.length > 0 && (
          <div className="space-y-5">
            {/* Active Trip Info Bar */}
            {activeTrip && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-xl rounded-3xl border border-neutral-200/80 p-5 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-neutral-900">{activeTrip.name}</h3>
                    <p className="text-xs text-neutral-500 font-medium">
                      {fmtDatePretty(activeTrip.startDate)} – {fmtDatePretty(activeTrip.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/trips/${activeTrip.id}/itinerary`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors"
                  >
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    Open Itinerary
                  </Link>
                  <Link
                    href={`/trips/${activeTrip.id}/budget`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors"
                  >
                    <Wallet className="h-3.5 w-3.5 text-secondary-600" />
                    Budget Tracker
                  </Link>
                </div>
              </div>
            )}

            {/* Calendar Controls & Month Header */}
            <CalendarHeader
              month={month}
              year={year}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
              onToday={handleToday}
            />

            {/* Main Interactive Calendar Grid */}
            <CalendarGrid days={calendarDays} />

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-2 px-1">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-3 w-3 rounded-full bg-primary" />
                Trip Active Days
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                Today
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-3 w-3 rounded-md bg-sky-100 border border-sky-300" />
                Scheduled Activity (Click any day to view details)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Day Inspector Modal */}
      {selectedDayModal && (
        <DayDetailModal
          open={Boolean(selectedDayModal)}
          onClose={() => setSelectedDayModal(null)}
          date={selectedDayModal.date}
          trip={activeTrip}
          tripDayNumber={selectedDayModal.tripDayNumber}
          events={selectedDayModal.events}
        />
      )}
    </PageShell>
  );
}
