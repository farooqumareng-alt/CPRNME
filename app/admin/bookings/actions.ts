"use server";

// Server Actions for the admin bookings queue. Each re-checks the admin
// session independently — proxy.ts already blocks /admin/*, but per the
// defense-in-depth pattern used everywhere else in this project, a
// mutation never trusts the edge check alone.
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase-session";
import { confirmBooking, setBookingStatus, type BookingWindow } from "@/lib/bookings-data";
import { sendEmail, renderEmailShell, formatMoney, escapeHtml } from "@/lib/email";
import { getQualityTierLabel, type QualityTier } from "@/content/quality-tiers";

async function requireAdmin() {
  const user = await requireAdminSession();
  if (!user) throw new Error("Not authenticated");
}

// Parsed as local midnight, matching the date the customer/admin picked in
// a plain date <input> — see components/ProblemSelector.tsx's todayISO()
// comment for why that distinction matters.
function formatFriendlyDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
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
    const friendlyDate = formatFriendlyDate(date);
    await sendEmail({
      to: booking.contact_value,
      subject: "Your CPRNME appointment is confirmed",
      html: renderEmailShell({
        preheader: `Confirmed for ${friendlyDate} (${window}) · ${formatMoney(booking.price_cents)}`,
        heading: "Your appointment is confirmed",
        showFulfillmentCredit: true,
        bodyHtml: `
          <p style="margin:0 0 18px;">Your appointment is confirmed for:</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; background-color:#f5f5f6; border-radius:8px; margin:0 0 18px;">
            <tr>
              <td style="padding:16px 18px;">
                <p style="margin:0 0 4px; font-size:17px; font-weight:700; color:#202124;">${escapeHtml(friendlyDate)}</p>
                <p style="margin:0; font-size:14px; color:#55565a; text-transform:capitalize;">${escapeHtml(window)}</p>
              </td>
            </tr>
          </table>
          <p style="margin:0 0 6px;">${escapeHtml(getQualityTierLabel(booking.quality_tier as QualityTier))} · ${escapeHtml(booking.service_level)}</p>
          <p style="margin:0 0 18px; font-size:20px; font-weight:700;">${formatMoney(booking.price_cents)}</p>
          ${note ? `<p style="margin:0; color:#55565a;">${escapeHtml(note)}</p>` : ""}
        `,
      }),
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
