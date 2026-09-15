// Server-only data access for the one global payment-timing setting. A
// singleton row (id always 1) — per direction, all three timing modes are
// built as real infrastructure, but only one governs the live customer
// flow at a time, changeable here rather than requiring a code deploy.
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type PaymentTiming = "at_completion" | "deposit_and_balance" | "full_at_booking";

export type PaymentSettings = {
  payment_timing: PaymentTiming;
  deposit_type: "flat" | "percentage" | null;
  deposit_flat_cents: number | null;
  deposit_percentage: number | null;
};

const DEFAULT_SETTINGS: PaymentSettings = {
  payment_timing: "at_completion",
  deposit_type: null,
  deposit_flat_cents: null,
  deposit_percentage: null,
};

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("payment_settings").select("*").eq("id", 1).maybeSingle();
  if (error || !data) {
    if (error) console.error("Failed to load payment_settings:", error.message);
    return DEFAULT_SETTINGS;
  }
  return {
    payment_timing: data.payment_timing,
    deposit_type: data.deposit_type,
    deposit_flat_cents: data.deposit_flat_cents,
    deposit_percentage: data.deposit_percentage,
  };
}

export async function setPaymentSettings(input: PaymentSettings) {
  const supabase = getSupabaseAdmin();
  return supabase
    .from("payment_settings")
    .update({
      payment_timing: input.payment_timing,
      deposit_type: input.deposit_type,
      deposit_flat_cents: input.deposit_flat_cents,
      deposit_percentage: input.deposit_percentage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
}

// The real amount a deposit should be, given the current setting and a
// real total price — never a guess, always derived from the one real
// configured rule. Returns null when the mode isn't deposit_and_balance
// or the setting is incomplete, so callers never silently charge $0.
export function computeDepositCents(settings: PaymentSettings, totalCents: number): number | null {
  if (settings.payment_timing !== "deposit_and_balance") return null;
  if (settings.deposit_type === "flat" && settings.deposit_flat_cents) {
    return Math.min(settings.deposit_flat_cents, totalCents);
  }
  if (settings.deposit_type === "percentage" && settings.deposit_percentage) {
    return Math.round(totalCents * (settings.deposit_percentage / 100));
  }
  return null;
}
