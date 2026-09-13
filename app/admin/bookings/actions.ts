"use server";

// Server Actions for the admin bookings queue. Each re-checks the admin
// session independently — proxy.ts already blocks /admin/*, but per the
// defense-in-depth pattern used everywhere else in this project, a
// mutation never trusts the edge check alone.
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase-session";
import { confirmBooking, setBookingStatus, type BookingWindow } from "@/lib/bookings-data";

async function requireAdmin() {
  const user = await requireAdminSession();
  if (!user) throw new Error("Not authenticated");
}

// The real commitment step — a human looked at the request and an actual
// day/window and decided it can be honored. Defaults to what the customer
// asked for (the form's hidden inputs), but an admin can edit the date/
// window fields before submitting if a different time was agreed instead.
export async function confirmBookingAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const date = String(formData.get("confirmedDate"));
  const window = formData.get("confirmedWindow") as BookingWindow;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date");
  if (!["morning", "afternoon", "evening"].includes(window)) throw new Error("Invalid window");
  const note = (formData.get("note") as string) || null;
  const { error } = await confirmBooking(id, date, window, note);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/bookings");
}

export async function setBookingStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = formData.get("status") as "cancelled" | "no_show" | "requested";
  const note = (formData.get("note") as string) || null;
  const { error } = await setBookingStatus(id, status, note);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/bookings");
}
