"use client";

import React, { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import StaffBookingsPanel from "./StaffBookingsPanel";
import BookingsMobilePanel from "./BookingsMobilePanel";

/**
 * Picks a genuinely different interface per device class — the mobile view
 * is its own component tree (cards, bottom sheets, FAB), not a shrunken
 * version of the desktop table.
 */
export default function DashboardSwitcher() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 rounded-full border-2 border-[#cba135] border-t-transparent animate-spin" />
      </div>
    );
  }

  return isMobile ? <BookingsMobilePanel /> : <StaffBookingsPanel />;
}
