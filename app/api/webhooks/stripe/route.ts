import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { markPaymentFailed, markPaymentPaid } from "@/lib/payments-data";
import { logJobEvent } from "@/lib/job-events";

// The only place a `payments` row is ever allowed to become 'paid' — see
// lib/payments-data.ts. Signature verification (stripe.webhooks.constructEvent)
// is what makes this trustworthy: without it, anyone could POST a fake
// "payment succeeded" body. This must read the RAW request body — Next.js's
// request.json() re-serializes and breaks the signature, so request.text()
// is required here.
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid") break;
      const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
      const { data: payment, error } = await markPaymentPaid(session.id, paymentIntentId);
      if (error) {
        console.error("Failed to mark payment paid:", error.message);
        break;
      }
      await logJobEvent({
        eventType: "payment_succeeded",
        actorType: "system",
        bookingId: payment?.booking_id ?? null,
        quoteId: payment?.quote_id ?? null,
        eventData: { stripeCheckoutSessionId: session.id, amountCents: payment?.amount_cents, purpose: payment?.purpose },
      });
      break;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { data: payment, error } = await markPaymentFailed(session.id);
      if (error) {
        console.error("Failed to mark payment failed:", error.message);
        break;
      }
      await logJobEvent({
        eventType: "payment_failed",
        actorType: "system",
        bookingId: payment?.booking_id ?? null,
        quoteId: payment?.quote_id ?? null,
        eventData: { stripeCheckoutSessionId: session.id },
      });
      break;
    }
    default:
      // Ignore event types we didn't subscribe to / don't act on.
      break;
  }

  return NextResponse.json({ received: true });
}
