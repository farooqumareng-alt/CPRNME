import { NextResponse } from "next/server";
import { rescheduleBookingByToken } from "@/lib/bookings-data";
import { isValidTimeWindow, MAX_ADVANCE_BOOKING_DAYS } from "@/content/time-windows";

// Customer self-service reschedule — authorized purely by possessing the
// unguessable token in the URL (no login system exists). See
// components/ManageBookingClient.tsx for the one call site and
// lib/bookings-data.ts's rescheduleBookingByToken() for why a 'confirmed'
// booking re-checks capacity atomically while a 'requested' one doesn't.

const COARSE_WINDOWS = new Set(["morning", "afternoon", "evening"]);

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { date, window } = body as Record<string, unknown>;

  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate < today) {
    return NextResponse.json({ error: "Date must be today or later" }, { status: 400 });
  }
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + MAX_ADVANCE_BOOKING_DAYS);
  if (parsedDate > maxDate && typeof window === "string" && isValidTimeWindow(window)) {
    // Only the precise-window (real-time / 'confirmed') path has an
    // advance-booking ceiling — a coarse-window ('requested') reschedule
    // has no such limit, same as the original request flow.
    return NextResponse.json({ error: `Date must be within the next ${MAX_ADVANCE_BOOKING_DAYS} days` }, { status: 400 });
  }
  if (typeof window !== "string" || !(isValidTimeWindow(window) || COARSE_WINDOWS.has(window))) {
    return NextResponse.json({ error: "Invalid time window" }, { status: 400 });
  }

  const { data, error } = await rescheduleBookingByToken(token, date, window);

  if (error || !data) {
    if (error?.message?.includes("SLOT_FULL")) {
      return NextResponse.json({ error: "SLOT_FULL" }, { status: 409 });
    }
    if (error?.message?.includes("NOT_FOUND")) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (error?.message?.includes("CANNOT_MODIFY") || error?.message?.includes("ALREADY_COMPLETED")) {
      return NextResponse.json({ error: "This booking can no longer be changed" }, { status: 409 });
    }
    console.error("Failed to reschedule booking:", error?.message);
    return NextResponse.json({ error: "Could not reschedule — please try again" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, date: data.requested_date, window: data.requested_window });
}
