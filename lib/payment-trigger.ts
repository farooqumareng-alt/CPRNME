// The automatic half of payment collection — the manual half is each
// admin queue's own "Send payment link" button. This only fires for the
// two upfront-payment modes (full_at_booking, deposit_and_balance); in
// at_completion mode (the default) nothing here does anything, and the
// admin sends a link by hand once the repair is actually done.
import { getPaymentSettings, computeDepositCents } from "@/lib/payment-settings-data";
import { createPaymentLink } from "@/lib/payments-data";
import { sendEmail, renderEmailShell, formatMoney, escapeHtml } from "@/lib/email";
import { logJobEvent } from "@/lib/job-events";

export async function maybeSendBookingPaymentLink(booking: {
  id: string;
  price_cents: number;
  contact_method: string;
  contact_value: string;
  intent_event_id?: string | null;
}): Promise<void> {
  try {
    const settings = await getPaymentSettings();
    if (settings.payment_timing === "at_completion") return;
    if (booking.contact_method !== "email") return; // no channel to send an automated link through

    let amountCents: number;
    let purpose: "full" | "deposit";
    if (settings.payment_timing === "full_at_booking") {
      amountCents = booking.price_cents;
      purpose = "full";
    } else {
      const deposit = computeDepositCents(settings, booking.price_cents);
      if (deposit === null || deposit <= 0) {
        console.error("deposit_and_balance is active but no deposit rule is configured — skipping payment link for booking", booking.id);
        return;
      }
      amountCents = deposit;
      purpose = "deposit";
    }

    const result = await createPaymentLink({
      bookingId: booking.id,
      amountCents,
      purpose,
      description: purpose === "deposit" ? "CPRNME repair deposit" : "CPRNME repair — full payment",
      customerEmail: booking.contact_value,
    });
    if ("error" in result) {
      console.error("Failed to create payment link for booking", booking.id, result.error);
      return;
    }

    await logJobEvent({
      eventType: "payment_link_created",
      actorType: "system",
      intentEventId: booking.intent_event_id,
      bookingId: booking.id,
      eventData: { amountCents, purpose },
    });

    await sendEmail({
      to: booking.contact_value,
      subject: purpose === "deposit" ? "Complete your CPRNME deposit" : "Complete your CPRNME payment",
      html: renderEmailShell({
        preheader: `${formatMoney(amountCents)} due to confirm your appointment`,
        heading: purpose === "deposit" ? "One more step — your deposit" : "One more step — payment",
        showFulfillmentCredit: true,
        bodyHtml: `
          <p style="margin:0 0 18px;">
            ${purpose === "deposit" ? "A deposit is required to hold your appointment:" : "Please complete payment to hold your appointment:"}
          </p>
          <p style="margin:0 0 18px; font-size:24px; font-weight:700;">${formatMoney(amountCents)}</p>
          <p style="margin:0;">
            <a href="${escapeHtml(result.url)}" style="display:inline-block; padding:10px 18px; background-color:#2e2f33; color:#ffffff; border-radius:6px; text-decoration:none; font-weight:600; font-size:14px;">Pay now</a>
          </p>
        `,
      }),
    });
  } catch (err) {
    // Never let a payment-link failure undo or block the booking itself.
    console.error("maybeSendBookingPaymentLink threw:", err instanceof Error ? err.message : err);
  }
}
