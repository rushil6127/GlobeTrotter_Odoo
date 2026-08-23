import React, { Suspense } from "react";
import { CinematicLanding } from "@/components/cinematic/CinematicLanding";

export default function RootPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b1110]" />}>
      <CinematicLanding />
    </Suspense>
  );
}
