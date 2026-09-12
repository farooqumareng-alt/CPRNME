// Server-only data access for the pricing engine's four tables. Every
// function here uses the secret-key client (getSupabaseAdmin) — this file
// must never be imported from a "use client" component. The one function
// safe to expose to the customer-facing flow is getActiveCustomerPrice(),
// which returns nothing but a price or null — never a cost breakdown.
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { RepairType } from "@/content/repair-taxonomy";
import type { RepairClass } from "@/content/repair-classes";
import { computeMarketStats, type MarketStats } from "@/lib/pricing-calculator";

// ---------------------------------------------------------------- Eligibility
export type EligibilityRow = {
  id: string;
  model_id: string;
  repair_type: string;
  eligible: boolean;
  repair_class: RepairClass | null;
  notes: string | null;
  updated_at: string;
};

export async function getEligibility(modelId: string, repairType: string): Promise<EligibilityRow | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("repair_eligibility")
    .select("*")
    .eq("model_id", modelId)
    .eq("repair_type", repairType)
    .maybeSingle();
  return data ?? null;
}

export async function listEligibility(search?: string): Promise<EligibilityRow[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("repair_eligibility").select("*").order("updated_at", { ascending: false });
  if (search) {
    query = query.or(`model_id.ilike.%${search}%,repair_type.ilike.%${search}%`);
  }
  const { data } = await query.limit(200);
  return data ?? [];
}

export async function upsertEligibility(input: {
  modelId: string;
  repairType: string;
  eligible: boolean;
  repairClass: RepairClass | null;
  notes: string | null;
}) {
  const supabase = getSupabaseAdmin();
  return supabase
    .from("repair_eligibility")
    .upsert(
      {
        model_id: input.modelId,
        repair_type: input.repairType,
        eligible: input.eligible,
        repair_class: input.repairClass,
        notes: input.notes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "model_id,repair_type" }
    );
}

// ------------------------------------------------------ Provider compensation
export type ProviderCompensationRow = {
  id: string;
  repair_class: RepairClass;
  repair_type: string | null;
  model_id: string | null;
  service_method: string;
  compensation_cents: number;
  active: boolean;
};

// Most-specific-match-wins: an exact model+repair_type override beats a
// repair_type-only override, which beats the repair_class default.
export async function getProviderCompensation(
  repairClass: RepairClass,
  repairType: string,
  modelId: string,
  serviceMethod: string
): Promise<ProviderCompensationRow | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("provider_compensation_schedule")
    .select("*")
    .eq("repair_class", repairClass)
    .eq("service_method", serviceMethod)
    .eq("active", true)
    .or(`model_id.eq.${modelId},model_id.is.null`)
    .or(`repair_type.eq.${repairType},repair_type.is.null`);

  if (!data || data.length === 0) return null;
  // Rank: model_id set + repair_type set > repair_type set only > model_id
  // set only > neither (class-level default).
  const ranked = [...data].sort((a, b) => {
    const score = (r: ProviderCompensationRow) => (r.model_id ? 2 : 0) + (r.repair_type ? 1 : 0);
    return score(b) - score(a);
  });
  return ranked[0];
}

export async function listProviderCompensation(): Promise<ProviderCompensationRow[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("provider_compensation_schedule")
    .select("*")
    .order("repair_class", { ascending: true });
  return data ?? [];
}

export async function createProviderCompensation(input: {
  repairClass: RepairClass;
  repairType: string | null;
  modelId: string | null;
  serviceMethod: string;
  compensationCents: number;
  notes: string | null;
}) {
  const supabase = getSupabaseAdmin();
  return supabase.from("provider_compensation_schedule").insert({
    repair_class: input.repairClass,
    repair_type: input.repairType,
    model_id: input.modelId,
    service_method: input.serviceMethod,
    compensation_cents: input.compensationCents,
    notes: input.notes,
  });
}

// --------------------------------------------------------- Market research
export type MarketObservationRow = {
  id: string;
  model_id: string;
  repair_type: string;
  competitor: string;
  location: string | null;
  advertised_price_cents: number;
  part_quality: string | null;
  warranty: string | null;
  service_method: string | null;
  diagnostic_fee_cents: number | null;
  source_url: string | null;
  observed_date: string;
};

export async function getMarketObservations(modelId: string, repairType: string): Promise<MarketObservationRow[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("market_research_observations")
    .select("*")
    .eq("model_id", modelId)
    .eq("repair_type", repairType)
    .order("observed_date", { ascending: false });
  return data ?? [];
}

export async function getMarketStats(modelId: string, repairType: string): Promise<MarketStats | null> {
  const observations = await getMarketObservations(modelId, repairType);
  return computeMarketStats(observations.map((o) => o.advertised_price_cents));
}

export async function addMarketObservation(input: {
  modelId: string;
  repairType: string;
  competitor: string;
  location: string | null;
  advertisedPriceCents: number;
  partQuality: string | null;
  warranty: string | null;
  serviceMethod: string | null;
  diagnosticFeeCents: number | null;
  sourceUrl: string | null;
  observedDate: string;
}) {
  const supabase = getSupabaseAdmin();
  return supabase.from("market_research_observations").insert({
    model_id: input.modelId,
    repair_type: input.repairType,
    competitor: input.competitor,
    location: input.location,
    advertised_price_cents: input.advertisedPriceCents,
    part_quality: input.partQuality,
    warranty: input.warranty,
    service_method: input.serviceMethod,
    diagnostic_fee_cents: input.diagnosticFeeCents,
    source_url: input.sourceUrl,
    observed_date: input.observedDate,
  });
}

// ----------------------------------------------------------- Pricing records
export type PricingRecordRow = {
  id: string;
  model_id: string;
  repair_type: string;
  status: string;
  part_type: string | null;
  part_quality: string | null;
  part_supplier: string | null;
  part_acquisition_cost_cents: number | null;
  part_shipping_cents: number | null;
  part_warranty_info: string | null;
  part_cost_effective_date: string | null;
  provider_compensation_schedule_id: string | null;
  provider_compensation_cents: number | null;
  repair_class: RepairClass | null;
  payment_processing_cents: number | null;
  warranty_reserve_cents: number | null;
  customer_support_allocation_cents: number | null;
  mobile_travel_cost_cents: number | null;
  consumables_cents: number | null;
  overhead_allocation_cents: number | null;
  other_direct_costs_cents: number | null;
  service_method: string | null;
  service_area: string | null;
  travel_allowance_cents: number | null;
  travel_time_minutes: number | null;
  zone_adjustment_cents: number | null;
  required_contribution_floor_cents: number | null;
  economic_floor_cents: number | null;
  market_low_cents: number | null;
  market_median_cents: number | null;
  market_high_cents: number | null;
  market_observation_count: number | null;
  outcome: string | null;
  recommended_price_cents: number | null;
  approved_customer_price_cents: number | null;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  effective_from: string | null;
  review_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function getPricingHistory(modelId: string, repairType: string): Promise<PricingRecordRow[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("pricing_records")
    .select("*")
    .eq("model_id", modelId)
    .eq("repair_type", repairType)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getPricingRecord(id: string): Promise<PricingRecordRow | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("pricing_records").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

export async function savePricingRecord(
  id: string | null,
  fields: Partial<PricingRecordRow> & { model_id: string; repair_type: string }
) {
  const supabase = getSupabaseAdmin();
  const payload = { ...fields, updated_at: new Date().toISOString() };
  if (id) {
    return supabase.from("pricing_records").update(payload).eq("id", id).select("id").single();
  }
  return supabase.from("pricing_records").insert(payload).select("id").single();
}

// Activating a price means exactly one thing may be true at a time for a
// given (model, repair_type): retire whatever was active before, then
// activate this one. Two active rows for the same combination would make
// "the" active price ambiguous, which the customer-facing lookup below
// can't tolerate.
export async function activatePricingRecord(id: string, approvedBy: string) {
  const supabase = getSupabaseAdmin();
  const record = await getPricingRecord(id);
  if (!record) return { error: "Pricing record not found" };
  if (record.approved_customer_price_cents === null) {
    return { error: "Cannot activate a record with no approved customer price" };
  }

  await supabase
    .from("pricing_records")
    .update({ status: "retired", updated_at: new Date().toISOString() })
    .eq("model_id", record.model_id)
    .eq("repair_type", record.repair_type)
    .eq("status", "active");

  const { error } = await supabase
    .from("pricing_records")
    .update({
      status: "active",
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      effective_from: record.effective_from ?? new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return { error: error?.message ?? null };
}

export async function setPricingStatus(id: string, status: string) {
  const supabase = getSupabaseAdmin();
  return supabase.from("pricing_records").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
}

// ------------------------------------------------ The customer-facing gate
// The ONLY function in this file that should ever back a customer-visible
// answer. Returns a price or null — never a cost, never a margin, never a
// draft/pending number. This is Phase 7's "strict active-price gating."
export async function getActiveCustomerPrice(modelId: string, repairType: RepairType): Promise<number | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("pricing_records")
    .select("approved_customer_price_cents, review_by")
    .eq("model_id", modelId)
    .eq("repair_type", repairType)
    .eq("status", "active")
    .maybeSingle();

  if (!data || data.approved_customer_price_cents === null) return null;
  if (data.review_by && new Date(data.review_by) < new Date()) return null; // expired review date
  return data.approved_customer_price_cents;
}

export async function isRepairEligible(modelId: string, repairType: RepairType): Promise<boolean> {
  const row = await getEligibility(modelId, repairType);
  return row?.eligible ?? false;
}
