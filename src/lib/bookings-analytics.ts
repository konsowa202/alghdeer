import type {
  BookingRecord,
  BookingStatus,
} from "./bookings-types";
import {
  BOOKING_FLOW_STATUSES,
  BOOKING_STATUSES,
} from "./bookings-types";

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const RIYADH_OFFSET_MS = 3 * HOUR_MS;

export type DailyBookingPoint = {
  date: string;
  label: string;
  count: number;
  website: number;
  staff: number;
};

export type BookingActivity = {
  booking: BookingRecord;
  status: BookingStatus;
  at: string;
};

function timeOf(iso: string): number {
  const value = Date.parse(iso);
  return Number.isFinite(value) ? value : 0;
}

/** Saudi Arabia has a fixed UTC+3 offset, which makes day buckets deterministic. */
function riyadhDayKey(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return new Date(date.getTime() + RIYADH_OFFSET_MS).toISOString().slice(0, 10);
}

function startOfRiyadhDay(now: Date): number {
  return Date.parse(`${riyadhDayKey(now)}T00:00:00.000Z`) - RIYADH_OFFSET_MS;
}

function averageHours(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function firstTransitionAt(
  row: BookingRecord,
  statuses: BookingStatus[],
  after = 0
): number | null {
  const entry = row.history.find((item) => {
    const at = timeOf(item.at);
    return statuses.includes(item.status) && at >= after;
  });
  return entry ? timeOf(entry.at) : null;
}

export function formatDuration(hours: number | null): string {
  if (hours === null || !Number.isFinite(hours)) return "لا توجد عينة كافية";
  if (hours < 1) return "أقل من ساعة";
  if (hours < 24) return `${Math.max(1, Math.round(hours))} ساعة`;
  const days = hours / 24;
  return `${days >= 10 ? Math.round(days) : days.toFixed(1)} يوم`;
}

export function getBookingLastActivityAt(row: BookingRecord): string {
  const latest = row.history[row.history.length - 1];
  return latest?.at || row.updatedAt || row.createdAt;
}

export function buildBookingAnalytics(
  rows: BookingRecord[],
  now = new Date()
) {
  const nowMs = now.getTime();
  const todayStart = startOfRiyadhDay(now);
  const currentWeekStart = todayStart - 6 * DAY_MS;
  const previousWeekStart = todayStart - 13 * DAY_MS;
  const nonCancelled = rows.filter((row) => row.status !== "cancelled");
  const completed = rows.filter((row) => row.status === "completed").length;
  const cancelled = rows.filter((row) => row.status === "cancelled").length;
  const reachedConfirmation = rows.filter((row) =>
    ["confirmed", "deposit", "completed"].includes(row.status)
  ).length;

  const currentWeek = rows.filter((row) => {
    const at = timeOf(row.createdAt);
    return at >= currentWeekStart && at <= nowMs;
  }).length;
  const previousWeek = rows.filter((row) => {
    const at = timeOf(row.createdAt);
    return at >= previousWeekStart && at < currentWeekStart;
  }).length;
  const weeklyDelta =
    previousWeek > 0
      ? Math.round(((currentWeek - previousWeek) / previousWeek) * 100)
      : null;

  const dailySeries: DailyBookingPoint[] = Array.from({ length: 30 }, (_, index) => {
    const dayStart = todayStart - (29 - index) * DAY_MS;
    const date = riyadhDayKey(new Date(dayStart));
    const dayRows = rows.filter(
      (row) => timeOf(row.createdAt) > 0 && riyadhDayKey(row.createdAt) === date
    );
    return {
      date,
      label: new Intl.DateTimeFormat("ar-EG", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }).format(new Date(`${date}T12:00:00.000Z`)),
      count: dayRows.length,
      website: dayRows.filter((row) => row.source === "website").length,
      staff: dayRows.filter((row) => row.source === "staff").length,
    };
  });

  const statusDistribution = BOOKING_STATUSES.map((status) => {
    const count = rows.filter((row) => row.status === status).length;
    return {
      status,
      count,
      percentage: rows.length > 0 ? Math.round((count / rows.length) * 100) : 0,
    };
  });

  const flowCounts: Record<(typeof BOOKING_FLOW_STATUSES)[number], number> = {
    pending: nonCancelled.length,
    confirmed: rows.filter((row) =>
      ["confirmed", "deposit", "completed"].includes(row.status)
    ).length,
    deposit: rows.filter((row) => ["deposit", "completed"].includes(row.status)).length,
    completed,
  };
  const flow = BOOKING_FLOW_STATUSES.map((status, index) => ({
    status,
    count: flowCounts[status],
    percentage:
      flowCounts.pending > 0
        ? Math.round((flowCounts[status] / flowCounts.pending) * 100)
        : 0,
    dropOff:
      index === 0
        ? 0
        : Math.max(0, flowCounts[BOOKING_FLOW_STATUSES[index - 1]!] - flowCounts[status]),
  }));

  const upcoming = rows
    .filter(
      (row) =>
        row.status !== "cancelled" &&
        row.status !== "completed" &&
        timeOf(row.preferredAt) >= nowMs
    )
    .sort((a, b) => timeOf(a.preferredAt) - timeOf(b.preferredAt));
  const upcoming7 = upcoming.filter(
    (row) => timeOf(row.preferredAt) <= nowMs + 7 * DAY_MS
  );
  const expectedGuests = upcoming
    .filter((row) => row.status === "confirmed" || row.status === "deposit")
    .reduce((sum, row) => sum + row.groupSize, 0);

  const reviewDurations: number[] = [];
  const depositDurations: number[] = [];
  const completionDurations: number[] = [];
  for (const row of rows) {
    const createdAt = timeOf(row.createdAt);
    const confirmedAt = firstTransitionAt(row, ["confirmed", "deposit", "completed"], createdAt);
    if (confirmedAt !== null && createdAt > 0) {
      reviewDurations.push(Math.max(0, (confirmedAt - createdAt) / HOUR_MS));
    }
    const explicitConfirmedAt = firstTransitionAt(row, ["confirmed"], createdAt);
    const depositAt = firstTransitionAt(row, ["deposit", "completed"], explicitConfirmedAt ?? createdAt);
    if (explicitConfirmedAt !== null && depositAt !== null) {
      depositDurations.push(Math.max(0, (depositAt - explicitConfirmedAt) / HOUR_MS));
    }
    const completedAt = firstTransitionAt(row, ["completed"], createdAt);
    if (completedAt !== null && createdAt > 0) {
      completionDurations.push(Math.max(0, (completedAt - createdAt) / HOUR_MS));
    }
  }

  const activity: BookingActivity[] = rows
    .flatMap((booking) =>
      booking.history.map((entry) => ({
        booking,
        status: entry.status,
        at: entry.at,
      }))
    )
    .sort((a, b) => timeOf(b.at) - timeOf(a.at))
    .slice(0, 8);

  return {
    total: rows.length,
    active: nonCancelled.filter((row) => row.status !== "completed").length,
    pending: rows.filter((row) => row.status === "pending").length,
    overduePending: rows.filter(
      (row) =>
        row.status === "pending" &&
        timeOf(row.createdAt) > 0 &&
        nowMs - timeOf(row.createdAt) >= DAY_MS
    ).length,
    today: rows.filter((row) => timeOf(row.createdAt) >= todayStart).length,
    currentWeek,
    previousWeek,
    weeklyDelta,
    totalGuests: nonCancelled.reduce((sum, row) => sum + row.groupSize, 0),
    expectedGuests,
    averageGroupSize:
      nonCancelled.length > 0
        ? Math.round(
            (nonCancelled.reduce((sum, row) => sum + row.groupSize, 0) /
              nonCancelled.length) *
              10
          ) / 10
        : 0,
    conversionRate:
      rows.length > 0 ? Math.round((reachedConfirmation / rows.length) * 100) : 0,
    completionRate: rows.length > 0 ? Math.round((completed / rows.length) * 100) : 0,
    cancellationRate: rows.length > 0 ? Math.round((cancelled / rows.length) * 100) : 0,
    dailySeries,
    statusDistribution,
    flow,
    upcoming: upcoming.slice(0, 6),
    upcoming7Count: upcoming7.length,
    recentBookings: [...rows]
      .sort((a, b) => timeOf(b.createdAt) - timeOf(a.createdAt))
      .slice(0, 5),
    activity,
    processDurations: [
      {
        key: "review",
        label: "من الطلب إلى التأكيد",
        hours: averageHours(reviewDurations),
        samples: reviewDurations.length,
      },
      {
        key: "deposit",
        label: "من التأكيد إلى الديبوزيت",
        hours: averageHours(depositDurations),
        samples: depositDurations.length,
      },
      {
        key: "completion",
        label: "من الطلب إلى الإتمام",
        hours: averageHours(completionDurations),
        samples: completionDurations.length,
      },
    ],
    sources: {
      website: rows.filter((row) => row.source === "website").length,
      staff: rows.filter((row) => row.source === "staff").length,
    },
  };
}

export type BookingAnalytics = ReturnType<typeof buildBookingAnalytics>;
