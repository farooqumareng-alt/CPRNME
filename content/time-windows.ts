// The 8 real 2-hour booking windows for the real-time slots feature —
// 6:00 AM to 10:00 PM, confirmed operating hours. Each window's capacity
// (3 repairs) is enforced at the database level (see the
// claim_booking_slot / confirm_booking_with_capacity functions created
// alongside the bookings table), not just here — this file is display
// labels and the canonical list, not the source of truth for the cap.
export type TimeWindow = { id: string; label: string };

export const TIME_WINDOWS: TimeWindow[] = [
  { id: "06:00-08:00", label: "6:00 – 8:00 AM" },
  { id: "08:00-10:00", label: "8:00 – 10:00 AM" },
  { id: "10:00-12:00", label: "10:00 AM – 12:00 PM" },
  { id: "12:00-14:00", label: "12:00 – 2:00 PM" },
  { id: "14:00-16:00", label: "2:00 – 4:00 PM" },
  { id: "16:00-18:00", label: "4:00 – 6:00 PM" },
  { id: "18:00-20:00", label: "6:00 – 8:00 PM" },
  { id: "20:00-22:00", label: "8:00 – 10:00 PM" },
];

export const SLOT_CAPACITY = 3;

// How far ahead a customer can pick a real-time slot. A placeholder
// operational default, not a confirmed business fact — flagged as such
// rather than silently assumed; change freely.
export const MAX_ADVANCE_BOOKING_DAYS = 14;

export function getTimeWindowLabel(id: string): string {
  return TIME_WINDOWS.find((w) => w.id === id)?.label ?? id;
}

export function isValidTimeWindow(id: string): boolean {
  return TIME_WINDOWS.some((w) => w.id === id);
}
