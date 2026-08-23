"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { RadioGroup } from "@/components/ui/Radio";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { ToastContainer, ToastData, ToastVariant } from "@/components/ui/Toast";
import { Spinner, FullPageLoader, Skeleton, CardSkeleton } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Navbar, MobileNav } from "@/components/navigation/Navbar";
import { Sidebar } from "@/components/navigation/Sidebar";
import { TripCard } from "@/components/cards/TripCard";
import { CityCard } from "@/components/cards/CityCard";
import { ActivityCard } from "@/components/cards/ActivityCard";
import { BudgetCard } from "@/components/cards/BudgetCard";
import {
  DestinationBadge,
  CategoryBadge,
  PriceIndicator,
  DateBadge,
  DurationBadge,
  LocationBadge,
  RatingBadge,
  TripStatusBadge,
} from "@/components/travel/TravelBadges";
import {
  DayHeader,
  ActivityTimelineCard,
  CityTransition,
  AddActivityButton,
} from "@/components/timeline/Timeline";
import {
  ExpenseCategoryBadge,
  BudgetProgressBar,
  ExpenseRow,
  BudgetSummaryCard,
  CategoryBreakdown,
} from "@/components/budget/Budget";
import {
  CalendarHeader,
  CalendarDay,
  CalendarGrid,
} from "@/components/calendar/Calendar";
import { Home, Compass, Map, User } from "lucide-react";

export default function DesignSystemShowcase() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const addToast = (variant: ToastVariant) => {
    setToasts((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        variant,
        title: `This is a ${variant} toast`,
        description: "It provides contextual feedback for user actions.",
      },
    ]);
  };

  return (
    <div className="flex h-screen overflow-hidden relative glass-theme">
      {/* Blurred Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/nature-bg.jpg')" }}
      />
      <div className="absolute inset-0 z-0 bg-white/10 backdrop-blur-[2px]" />

      {/* Sidebar - Desktop Only */}
      <div className="hidden md:block relative z-10 bg-white/40">
        <Sidebar currentPath="/" className="bg-transparent" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Navbar */}
        <Navbar currentPath="/" userName="Pearl Design" />

        {/* Scrollable Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-6xl mx-auto space-y-24 pb-32">

            {/* Header Section */}
            <section className="space-y-6 text-center pt-8">
              <h1 className="text-4xl md:text-6xl font-display text-primary">
                Globe<span className="text-neutral-900">Trotter</span>
              </h1>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                A modern, premium design system inspired by the warm earth tones and emerald waters of Mostar.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="primary" size="lg">Explore Components</Button>
                <Button variant="outline" size="lg">View Source</Button>
              </div>
            </section>

            {/* Typography & Colors */}
            <section className="space-y-8">
              <div className="border-b border-neutral-200 pb-4">
                <h2 className="text-2xl font-display text-neutral-900">Foundation</h2>
                <p className="text-neutral-500">Colors and typography system.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="h-24 rounded-2xl bg-primary flex items-end p-4 shadow-sm">
                    <span className="text-white font-medium">Primary (Teal)</span>
                  </div>
                  <div className="h-24 rounded-2xl bg-secondary flex items-end p-4 shadow-sm">
                    <span className="text-white font-medium">Secondary (Stone)</span>
                  </div>
                  <div className="h-24 rounded-2xl bg-accent flex items-end p-4 shadow-sm">
                    <span className="text-white font-medium">Accent (Amber)</span>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6 bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
                  <h1 className="text-5xl font-display">Display Heading 1</h1>
                  <h2 className="text-4xl font-display">Display Heading 2</h2>
                  <h3 className="text-2xl font-bold text-neutral-900">Section Title</h3>
                  <p className="text-base text-neutral-600">
                    Body text uses Plus Jakarta Sans for high legibility and a modern, geometric feel. It contrasts beautifully with the elegant Playfair Display used for major headings.
                  </p>
                  <p className="text-sm text-neutral-500">Small supporting text for captions, hints, and secondary information.</p>
                </div>
              </div>
            </section>

            {/* Buttons & Badges */}
            <section className="space-y-8">
              <div className="border-b border-neutral-200 pb-4">
                <h2 className="text-2xl font-display text-neutral-900">UI Primitives</h2>
                <p className="text-neutral-500">Buttons, badges, and interactive elements.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
                  <h3 className="font-semibold text-neutral-900 mb-4">Button Variants</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large Button</Button>
                    <Button loading>Loading</Button>
                    <Button variant="icon"><Home className="h-4 w-4" /></Button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
                  <h3 className="font-semibold text-neutral-900 mb-4">Badges & Avatars</h3>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="accent">Accent</Badge>
                    <Badge variant="success" dot>Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="error" removable>Error</Badge>
                  </div>
                  <div className="flex items-center gap-6 pt-4 border-t border-neutral-100">
                    <AvatarGroup
                      avatars={[
                        { name: "Pushp" },
                        { name: "Pearl" },
                        { name: "Heer" },
                        { name: "Rushil" },
                        { name: "Extra" }
                      ]}
                      max={4}
                    />
                    <Avatar name="User Online" status="online" size="lg" />
                  </div>
                </div>
              </div>
            </section>

            {/* Form Elements */}
            <section className="space-y-8">
              <div className="border-b border-neutral-200 pb-4">
                <h2 className="text-2xl font-display text-neutral-900">Forms & Inputs</h2>
                <p className="text-neutral-500">Input fields, selects, and toggles.</p>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <Input label="Email Address" placeholder="hello@globetrotter.com" />
                    <Input label="Password" type="password" placeholder="••••••••" />
                    <Input label="Search Destination" variant="search" placeholder="Where to next?" />
                    <Input label="Error State" error="This field is required" defaultValue="Invalid input" />
                  </div>
                  <div className="space-y-5">
                    <Select
                      label="Travel Style"
                      options={[
                        { value: "luxury", label: "Luxury" },
                        { value: "budget", label: "Backpacking" },
                        { value: "family", label: "Family Friendly" }
                      ]}
                      placeholder="Select a style..."
                    />
                    <Textarea label="Trip Notes" placeholder="Add some notes about this trip..." showCount maxLength={200} />

                    <div className="flex items-start gap-8 pt-2">
                      <div className="space-y-3">
                        <Checkbox label="Remember me" />
                        <Checkbox label="Send updates" description="Weekly newsletter" />
                      </div>
                      <div className="space-y-3">
                        <Toggle label="Public Trip" checked />
                        <Toggle label="Notifications" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Travel Components & Cards */}
            <section className="space-y-8">
              <div className="border-b border-neutral-200 pb-4">
                <h2 className="text-2xl font-display text-neutral-900">Travel & Cards</h2>
                <p className="text-neutral-500">Domain-specific components for the travel experience.</p>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <DestinationBadge city="Mostar" country="Bosnia" />
                <CategoryBadge category="food" />
                <CategoryBadge category="adventure" />
                <PriceIndicator level={2} />
                <RatingBadge rating={4.8} />
                <DateBadge date="Oct 12 - Oct 15" />
                <TripStatusBadge status="ongoing" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <TripCard
                  name="Balkan Adventure"
                  destination="Mostar, Bosnia"
                  startDate="Oct 12"
                  endDate="Oct 18"
                  citiesCount={3}
                  activitiesCount={12}
                  status="upcoming"
                  budget={1500}
                  currency="€"
                  progress={65}
                  members={[{ name: "Pearl" }, { name: "Pushp" }]}
                  coverImage="https://images.unsplash.com/photo-1600257374020-00d33e144a2c?auto=format&fit=crop&w=600&q=80"
                />

                <div className="space-y-6">
                  <CityCard
                    name="Mostar"
                    country="Bosnia and Herzegovina"
                    description="A stone arch, emerald water, and a compact old city."
                    priceLevel={2}
                    image="https://images.unsplash.com/photo-1600257374020-00d33e144a2c?auto=format&fit=crop&w=600&q=80"
                    added
                  />
                  <BudgetCard
                    totalBudget={2000}
                    spent={1450}
                    currency="€"
                  />
                </div>

                <div className="space-y-6">
                  <ActivityCard
                    name="Stari Most Bridge Jump"
                    category="adventure"
                    location="Old Town"
                    duration="2 hours"
                    estimatedCost={25}
                    currency="€"
                    rating={4.9}
                    image="https://images.unsplash.com/photo-1600257374020-00d33e144a2c?auto=format&fit=crop&w=600&q=80"
                  />
                  <ActivityCard
                    name="Old Bazaar Tour"
                    category="culture"
                    location="Neretva River"
                    duration="3 hours"
                    rating={4.6}
                    added
                  />
                </div>
              </div>
            </section>

            {/* Timeline & Itinerary */}
            <section className="space-y-8">
              <div className="border-b border-neutral-200 pb-4">
                <h2 className="text-2xl font-display text-neutral-900">Itinerary & Timeline</h2>
                <p className="text-neutral-500">Visualizing the trip schedule.</p>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-100 p-6 md:p-8 shadow-sm max-w-3xl">
                <DayHeader dayNumber={1} date="Monday, Oct 12" city="Mostar" activityCount={3} className="mb-6" />

                <div className="relative">
                  <div className="absolute left-[11px] top-4 bottom-12 w-0.5 bg-neutral-200" />

                  <ActivityTimelineCard
                    time="09:00 AM"
                    title="Breakfast near Stari Most"
                    category="food"
                    duration="1 hr"
                    location="Old Town Cafe"
                    completed
                  />

                  <ActivityTimelineCard
                    time="11:00 AM"
                    title="Bridge Jump Watching"
                    category="adventure"
                    duration="2 hrs"
                    location="Stari Most"
                    active
                  />

                  <CityTransition fromCity="Mostar" toCity="Sarajevo" transportMode="Train" />

                  <ActivityTimelineCard
                    time="16:00 PM"
                    title="Check-in to Hotel"
                    category="accommodation"
                    location="Sarajevo City Center"
                  />

                  <div className="pl-12 pt-2">
                    <AddActivityButton />
                  </div>
                </div>
              </div>
            </section>

            {/* Overlays & Feedback */}
            <section className="space-y-8">
              <div className="border-b border-neutral-200 pb-4">
                <h2 className="text-2xl font-display text-neutral-900">Feedback & Modals</h2>
                <p className="text-neutral-500">Dialogs, toasts, and loading states.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col items-center justify-center gap-4 min-h-[300px]">
                  <Button onClick={() => setModalOpen(true)}>Open Standard Modal</Button>
                  <Button variant="danger" onClick={() => setConfirmOpen(true)}>Open Confirm Modal</Button>

                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => addToast("success")}>Success Toast</Button>
                    <Button size="sm" variant="outline" onClick={() => addToast("error")}>Error Toast</Button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
                  <h3 className="font-semibold text-neutral-900">Loading States</h3>
                  <div className="flex items-center gap-4">
                    <Spinner size="sm" />
                    <Spinner size="md" />
                    <Spinner size="lg" />
                  </div>
                  <div className="space-y-3 pt-4 border-t border-neutral-100">
                    <Skeleton className="h-10 w-full" variant="rounded" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </div>
            </section>

          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav currentPath="/" />
      </div>

      {/* Modals & Toasts */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Plan New Activity" description="Add a new activity to your itinerary.">
        <div className="space-y-4 py-2">
          <Input label="Activity Name" placeholder="e.g. Visit Museum" />
          <Select label="Category" options={[{ value: "culture", label: "Culture" }]} />
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-neutral-100">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={() => setModalOpen(false)}>Save Activity</Button>
        </div>
      </Modal>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => setConfirmOpen(false)}
        title="Delete Trip"
        message="Are you sure you want to delete this trip? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  );
}
