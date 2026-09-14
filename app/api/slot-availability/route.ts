import { NextResponse } from "next/server";
import { getSlotAvailability } from "@/lib/bookings-data";
import { MAX_ADVANCE_BOOKING_DAYS } from "@/content/time-windows";

// Read-only: real availability for one real date, computed from actual
// confirmed bookings. See components/ProblemSelector.tsx for the one call
// site — fetched each time a customer picks a candidate date in the
// real-time slots step.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid or missing date" }, { status: 400 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + MAX_ADVANCE_BOOKING_DAYS);
  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate < today || parsedDate > maxDate) {
    return NextResponse.json({ error: `Date must be within the next ${MAX_ADVANCE_BOOKING_DAYS} days` }, { status: 400 });
  }

  const availability = await getSlotAvailability(date);
  return NextResponse.json({ availability });
}
