"use server";

// Server Actions for the global payment-timing setting. Re-checks the
// admin session independently — see app/admin/bookings/actions.ts's
// comment on why every mutation does this regardless of proxy.ts.
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase-session";
import { setPaymentSettings, type PaymentTiming } from "@/lib/payment-settings-data";

async function requireAdmin() {
  const user = await requireAdminSession();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function setPaymentSettingsAction(formData: FormData) {
  await requireAdmin();
  const paymentTiming = formData.get("paymentTiming") as PaymentTiming;
  if (!["at_completion", "deposit_and_balance", "full_at_booking"].includes(paymentTiming)) {
    throw new Error("Invalid payment timing");
  }

  let depositType: "flat" | "percentage" | null = null;
  let depositFlatCents: number | null = null;
  let depositPercentage: number | null = null;

  if (paymentTiming === "deposit_and_balance") {
    depositType = (formData.get("depositType") as "flat" | "percentage") || null;
    if (depositType === "flat") {
      const dollars = Number(formData.get("depositFlat"));
      if (!Number.isFinite(dollars) || dollars <= 0) throw new Error("Enter a valid flat deposit amount");
      depositFlatCents = Math.round(dollars * 100);
    } else if (depositType === "percentage") {
      const pct = Number(formData.get("depositPercentage"));
      if (!Number.isFinite(pct) || pct <= 0 || pct > 100) throw new Error("Enter a deposit percentage between 1 and 100");
      depositPercentage = pct;
    } else {
      throw new Error("Choose a deposit type");
    }
  }

  const { error } = await setPaymentSettings({
    payment_timing: paymentTiming,
    deposit_type: depositType,
    deposit_flat_cents: depositFlatCents,
    deposit_percentage: depositPercentage,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/payments");
}
