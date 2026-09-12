"use server";

// Server Actions for the pricing admin. Every one re-checks the admin
// session independently — proxy.ts already blocks /admin/*, but per the
// defense-in-depth pattern used everywhere else in this project (see
// app/admin/demand/page.tsx), a mutation this sensitive never trusts the
// edge check alone.
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase-session";
import {
  upsertEligibility,
  addMarketObservation,
  savePricingRecord,
  activatePricingRecord,
  setPricingStatus,
  createProviderCompensation,
} from "@/lib/pricing-data";
import type { RepairClass } from "@/content/repair-classes";

async function requireAdmin() {
  const user = await requireAdminSession();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function saveEligibilityAction(formData: FormData) {
  await requireAdmin();
  const modelId = String(formData.get("modelId"));
  const repairType = String(formData.get("repairType"));
  const eligible = formData.get("eligible") === "on";
  const repairClass = (formData.get("repairClass") as RepairClass) || null;
  const notes = (formData.get("notes") as string) || null;

  await upsertEligibility({ modelId, repairType, eligible, repairClass, notes });
  revalidatePath("/admin/pricing");
  revalidatePath("/admin/pricing/manage");
}

export async function addMarketObservationAction(formData: FormData) {
  await requireAdmin();
  const modelId = String(formData.get("modelId"));
  const repairType = String(formData.get("repairType"));
  const advertisedPriceCents = Math.round(Number(formData.get("advertisedPrice")) * 100);

  if (!Number.isFinite(advertisedPriceCents) || advertisedPriceCents <= 0) {
    throw new Error("Advertised price must be a positive number");
  }

  await addMarketObservation({
    modelId,
    repairType,
    competitor: String(formData.get("competitor") || ""),
    location: (formData.get("location") as string) || null,
    advertisedPriceCents,
    partQuality: (formData.get("partQuality") as string) || null,
    warranty: (formData.get("warranty") as string) || null,
    serviceMethod: (formData.get("serviceMethod") as string) || null,
    diagnosticFeeCents: formData.get("diagnosticFee")
      ? Math.round(Number(formData.get("diagnosticFee")) * 100)
      : null,
    sourceUrl: (formData.get("sourceUrl") as string) || null,
    observedDate: String(formData.get("observedDate") || new Date().toISOString().slice(0, 10)),
  });
  revalidatePath("/admin/pricing/manage");
}

export async function createProviderCompensationAction(formData: FormData) {
  await requireAdmin();
  const compensationCents = Math.round(Number(formData.get("compensationCents")) * 100);
  if (!Number.isFinite(compensationCents) || compensationCents <= 0) {
    throw new Error("Compensation must be a positive number");
  }
  await createProviderCompensation({
    repairClass: formData.get("repairClass") as RepairClass,
    repairType: (formData.get("repairType") as string) || null,
    modelId: (formData.get("modelId") as string) || null,
    serviceMethod: String(formData.get("serviceMethod") || "shop"),
    compensationCents,
    notes: (formData.get("notes") as string) || null,
  });
  revalidatePath("/admin/pricing/manage");
}

function centsOrNull(formData: FormData, key: string): number | null {
  const raw = formData.get(key);
  if (raw === null || raw === "") return null;
  const cents = Math.round(Number(raw) * 100);
  return Number.isFinite(cents) ? cents : null;
}

// Saves the full cost-breakdown form as a pricing_records row. Deliberately
// does NOT compute or store the economic floor / outcome here — that's
// done by the calculator on the manage page from the same inputs, and the
// admin explicitly re-runs "Calculate" before saving a recommended price,
// so the stored snapshot always reflects a value a human actually saw.
export async function savePricingRecordAction(formData: FormData) {
  const user = await requireAdmin();
  const id = (formData.get("id") as string) || null;
  const modelId = String(formData.get("modelId"));
  const repairType = String(formData.get("repairType"));

  const { error } = await savePricingRecord(id, {
    model_id: modelId,
    repair_type: repairType,
    status: "draft",
    part_type: (formData.get("partType") as string) || null,
    part_quality: (formData.get("partQuality") as string) || null,
    part_supplier: (formData.get("partSupplier") as string) || null,
    part_acquisition_cost_cents: centsOrNull(formData, "partAcquisitionCost"),
    part_shipping_cents: centsOrNull(formData, "partShipping"),
    part_warranty_info: (formData.get("partWarrantyInfo") as string) || null,
    part_cost_effective_date: (formData.get("partCostEffectiveDate") as string) || null,
    provider_compensation_cents: centsOrNull(formData, "providerCompensation"),
    repair_class: (formData.get("repairClass") as RepairClass) || null,
    payment_processing_cents: centsOrNull(formData, "paymentProcessing"),
    warranty_reserve_cents: centsOrNull(formData, "warrantyReserve"),
    customer_support_allocation_cents: centsOrNull(formData, "customerSupportAllocation"),
    mobile_travel_cost_cents: centsOrNull(formData, "mobileTravelCost"),
    consumables_cents: centsOrNull(formData, "consumables"),
    overhead_allocation_cents: centsOrNull(formData, "overheadAllocation"),
    other_direct_costs_cents: centsOrNull(formData, "otherDirectCosts"),
    service_method: (formData.get("serviceMethod") as string) || "shop",
    service_area: (formData.get("serviceArea") as string) || null,
    travel_allowance_cents: centsOrNull(formData, "travelAllowance"),
    travel_time_minutes: formData.get("travelTimeMinutes") ? Number(formData.get("travelTimeMinutes")) : null,
    zone_adjustment_cents: centsOrNull(formData, "zoneAdjustment"),
    required_contribution_floor_cents: centsOrNull(formData, "requiredContributionFloor"),
    economic_floor_cents: centsOrNull(formData, "economicFloor"),
    market_low_cents: centsOrNull(formData, "marketLow"),
    market_median_cents: centsOrNull(formData, "marketMedian"),
    market_high_cents: centsOrNull(formData, "marketHigh"),
    market_observation_count: formData.get("marketObservationCount")
      ? Number(formData.get("marketObservationCount"))
      : null,
    outcome: (formData.get("outcome") as string) || null,
    recommended_price_cents: centsOrNull(formData, "recommendedPrice"),
    approved_customer_price_cents: centsOrNull(formData, "approvedCustomerPrice"),
    created_by: id ? undefined : (user.email ?? "admin"),
    notes: (formData.get("notes") as string) || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/pricing/manage");
  revalidatePath("/admin/pricing");
}

export async function setStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await setPricingStatus(id, status);
  revalidatePath("/admin/pricing/manage");
  revalidatePath("/admin/pricing");
}

// The ONLY path that makes a price real for customers. Requires the record
// to already carry an approved_customer_price_cents (enforced in
// lib/pricing-data.ts, not just here) and retires any prior active row for
// the same (model, repair_type) so exactly one is ever active at a time.
export async function activatePricingRecordAction(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id"));
  const result = await activatePricingRecord(id, user.email ?? "admin");
  if (result.error) throw new Error(result.error);
  revalidatePath("/admin/pricing/manage");
  revalidatePath("/admin/pricing");
}
