"use server";

// Server Actions for the admin bookings queue. Each re-checks the admin
// session independently — proxy.ts already blocks /admin/*, but per the
// defense-in-depth pattern used everywhere else in this project, a
// mutation never trusts the edge check alone.
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase-session";
import { confirmBooking, setBookingStatus, type BookingWindow } from "@/lib/bookings-data";
import { sendEmail, formatMoney, escapeHtml } from "@/lib/email";
import { getQualityTierLabel, type QualityTier } from "@/content/quality-tiers";

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
  const { data: booking, error } = await confirmBooking(id, date, window, note);
  if (error) throw new Error(error.message);

  // Best-effort customer notification — only reaches the subset who gave
  // an email address rather than a phone number; a failed send never
  // undoes the confirmation that was already saved.
  if (booking && booking.contact_method === "email") {
    await sendEmail({
      to: booking.contact_value,
      subject: "Your CPRNME appointment is confirmed",
      html: `
        <p>Your appointment is confirmed for <strong>${escapeHtml(date)}</strong> (${escapeHtml(window)}).</p>
        <p>${escapeHtml(getQualityTierLabel(booking.quality_tier as QualityTier))} · ${escapeHtml(booking.service_level)} · <strong>${formatMoney(booking.price_cents)}</strong></p>
        ${note ? `<p>${escapeHtml(note)}</p>` : ""}
      `,
    });
  }

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
