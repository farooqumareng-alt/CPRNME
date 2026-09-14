"use server";

// Server Actions for the admin quotes queue. Each re-checks the admin
// session independently — proxy.ts already blocks /admin/*, but per the
// defense-in-depth pattern used everywhere else in this project, a
// mutation never trusts the edge check alone.
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase-session";
import { setQuotePrice, setQuoteStatus, listQuotes, describeQuoteDevice } from "@/lib/quotes-data";
import { markQuoteCompleted } from "@/lib/completed-repairs-data";
import { sendEmail, renderEmailShell, formatMoney, escapeHtml } from "@/lib/email";
import { logJobEvent } from "@/lib/job-events";
import { businessInfo } from "@/content/business-info";

async function requireAdmin() {
  const user = await requireAdminSession();
  if (!user) throw new Error("Not authenticated");
  return user;
}

// Records the real price a human decided on after reviewing the request —
// this is the "human sets a real price" step the whole quote mechanism
// exists for. Never derived automatically; always typed in by a person
// who looked at the actual device/problem/ZIP.
export async function setQuotePriceAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const priceCents = Math.round(Number(formData.get("price")) * 100);
  if (!Number.isFinite(priceCents) || priceCents <= 0) {
    throw new Error("Price must be a positive number");
  }
  const note = (formData.get("note") as string) || null;
  const { data: quote, error } = await setQuotePrice(id, priceCents, note);
  if (error) throw new Error(error.message);

  await logJobEvent({
    eventType: "quote_priced",
    actorType: "admin",
    actorId: admin.id,
    intentEventId: quote?.intent_event_id,
    quoteId: id,
    eventData: { priceCents },
  });

  // Best-effort customer notification — only reaches the subset who gave
  // an email address rather than a phone number; a failed send never
  // undoes the price that was already saved.
  if (quote && quote.contact_method === "email") {
    await sendEmail({
      to: quote.contact_value,
      subject: "Your CPRNME repair quote",
      html: renderEmailShell({
        preheader: `${describeQuoteDevice(quote)} repair — ${formatMoney(priceCents)}`,
        heading: "Your repair quote",
        showFulfillmentCredit: true,
        bodyHtml: `
          <p style="margin:0 0 18px;">Here's the price for your ${escapeHtml(describeQuoteDevice(quote))} repair:</p>
          <p style="margin:0 0 18px; font-size:28px; font-weight:700;">${formatMoney(priceCents)}</p>
          ${note ? `<p style="margin:0 0 18px; color:#55565a;">${escapeHtml(note)}</p>` : ""}
          <p style="margin:0;">Call us at <a href="tel:${businessInfo.phone.e164}" style="color:#202124; font-weight:600;">${escapeHtml(businessInfo.phone.display)}</a> to move forward.</p>
        `,
      }),
    });
  }

  revalidatePath("/admin/quotes");
}

export async function setQuoteStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const status = formData.get("status") as "pending" | "quoted" | "accepted" | "declined" | "expired";
  const { error } = await setQuoteStatus(id, status);
  if (error) throw new Error(error.message);
  await logJobEvent({ eventType: "quote_status_changed", actorType: "admin", actorId: admin.id, quoteId: id, eventData: { status } });
  revalidatePath("/admin/quotes");
}

// The fourth and last stage: a human confirms the repair actually happened
// and logs what was actually collected. Never inferred from the quote's
// own price_cents — that field only defaults the form for convenience.
export async function markQuoteCompletedAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const revenueCents = Math.round(Number(formData.get("revenue")) * 100);
  if (!Number.isFinite(revenueCents) || revenueCents < 0) {
    throw new Error("Amount collected must be a non-negative number");
  }
  const completedDate = String(formData.get("completedDate"));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(completedDate)) throw new Error("Invalid completed date");
  const notes = (formData.get("notes") as string) || null;

  const quotes = await listQuotes();
  const quote = quotes.find((q) => q.id === id);
  if (!quote) throw new Error("Quote not found");

  const { error } = await markQuoteCompleted({
    intentEventId: quote.intent_event_id,
    quoteId: quote.id,
    agreedPriceCents: quote.price_cents,
    revenueCents,
    completedAt: new Date(`${completedDate}T12:00:00`).toISOString(),
    notes,
  });
  if (error) throw new Error(error.message);
  await logJobEvent({
    eventType: "repair_completed",
    actorType: "admin",
    actorId: admin.id,
    intentEventId: quote.intent_event_id,
    quoteId: quote.id,
    eventData: { agreedPriceCents: quote.price_cents, revenueCents },
  });
  revalidatePath("/admin/quotes");
  revalidatePath("/admin/revenue");
}
