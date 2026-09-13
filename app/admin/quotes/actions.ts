"use server";

// Server Actions for the admin quotes queue. Each re-checks the admin
// session independently — proxy.ts already blocks /admin/*, but per the
// defense-in-depth pattern used everywhere else in this project, a
// mutation never trusts the edge check alone.
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase-session";
import { setQuotePrice, setQuoteStatus, describeQuoteDevice } from "@/lib/quotes-data";
import { sendEmail, renderEmailShell, formatMoney, escapeHtml } from "@/lib/email";
import { businessInfo } from "@/content/business-info";

async function requireAdmin() {
  const user = await requireAdminSession();
  if (!user) throw new Error("Not authenticated");
}

// Records the real price a human decided on after reviewing the request —
// this is the "human sets a real price" step the whole quote mechanism
// exists for. Never derived automatically; always typed in by a person
// who looked at the actual device/problem/ZIP.
export async function setQuotePriceAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const priceCents = Math.round(Number(formData.get("price")) * 100);
  if (!Number.isFinite(priceCents) || priceCents <= 0) {
    throw new Error("Price must be a positive number");
  }
  const note = (formData.get("note") as string) || null;
  const { data: quote, error } = await setQuotePrice(id, priceCents, note);
  if (error) throw new Error(error.message);

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
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = formData.get("status") as "pending" | "quoted" | "accepted" | "declined" | "expired";
  const { error } = await setQuoteStatus(id, status);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/quotes");
}
