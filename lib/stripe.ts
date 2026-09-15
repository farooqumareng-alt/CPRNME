// Server-only Stripe client — never import this from a "use client"
// component. STRIPE_SECRET_KEY is currently a test-mode key (sk_test_...);
// swapping to a live key is a deliberate, separate step the site owner
// makes explicitly, never something this code does on its own.
import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key);
  }
  return client;
}
