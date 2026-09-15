// Server-only data access for real Stripe payments. A payment record
// existing here does NOT mean a repair was completed (see
// lib/completed-repairs-data.ts) and completed_repairs.revenue_cents is
// never auto-derived from this table — admin still enters what was
// actually collected by hand; this is the real record of Stripe activity
// itself, for creating and reconciling charges.
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { businessInfo } from "@/content/business-info";

export type PaymentPurpose = "deposit" | "balance" | "full" | "completion";
export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "refunded";

export type PaymentRow = {
  id: string;
  created_at: string;
  booking_id: string | null;
  quote_id: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  purpose: PaymentPurpose;
  status: PaymentStatus;
  paid_at: string | null;
};

// Creates a real Stripe Checkout Session and the matching payments row in
// one step — the row starts 'pending' and only ever becomes 'paid' via
// the webhook (app/api/webhooks/stripe/route.ts) confirming Stripe's own
// signed event, never from the client-side redirect alone. Returns the
// real, hosted Stripe URL to send the customer.
export async function createPaymentLink(input: {
  bookingId?: string | null;
  quoteId?: string | null;
  amountCents: number;
  purpose: PaymentPurpose;
  description: string;
  customerEmail?: string | null;
}): Promise<{ url: string; paymentId: string } | { error: string }> {
  if (input.amountCents <= 0) return { error: "Amount must be a positive number" };

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: input.description },
          unit_amount: input.amountCents,
        },
        quantity: 1,
      },
    ],
    customer_email: input.customerEmail ?? undefined,
    success_url: `${businessInfo.siteUrl}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${businessInfo.siteUrl}/pay/cancelled`,
    metadata: {
      bookingId: input.bookingId ?? "",
      quoteId: input.quoteId ?? "",
      purpose: input.purpose,
    },
  });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("payments")
    .insert({
      booking_id: input.bookingId ?? null,
      quote_id: input.quoteId ?? null,
      stripe_checkout_session_id: session.id,
      amount_cents: input.amountCents,
      purpose: input.purpose,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Could not record payment" };
  }
  if (!session.url) {
    return { error: "Stripe did not return a checkout URL" };
  }
  return { url: session.url, paymentId: data.id };
}

export async function listAllPayments(): Promise<PaymentRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load payments:", error.message);
    return [];
  }
  return data ?? [];
}

export async function listPaymentsForBooking(bookingId: string): Promise<PaymentRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("payments").select("*").eq("booking_id", bookingId).order("created_at");
  if (error) {
    console.error("Failed to load payments for booking:", error.message);
    return [];
  }
  return data ?? [];
}

export async function listPaymentsForQuote(quoteId: string): Promise<PaymentRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("payments").select("*").eq("quote_id", quoteId).order("created_at");
  if (error) {
    console.error("Failed to load payments for quote:", error.message);
    return [];
  }
  return data ?? [];
}

// The one place a payment ever becomes 'paid' — called only from the
// webhook route after Stripe's signature has been verified.
export async function markPaymentPaid(stripeCheckoutSessionId: string, paymentIntentId: string | null) {
  const supabase = getSupabaseAdmin();
  return supabase
    .from("payments")
    .update({ status: "paid", paid_at: new Date().toISOString(), stripe_payment_intent_id: paymentIntentId })
    .eq("stripe_checkout_session_id", stripeCheckoutSessionId)
    .select()
    .single();
}

export async function markPaymentFailed(stripeCheckoutSessionId: string) {
  const supabase = getSupabaseAdmin();
  return supabase.from("payments").update({ status: "failed" }).eq("stripe_checkout_session_id", stripeCheckoutSessionId).select().single();
}
