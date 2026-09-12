// Server-only data access for the pricing engine's four tables. Every
// function here uses the secret-key client (getSupabaseAdmin) — this file
// must never be imported from a "use client" component. The one function
// safe to expose to the customer-facing flow is getActiveCustomerPrice(),
// which returns nothing but a price or null — never a cost breakdown.
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { RepairType } from "@/content/repair-taxonomy";
import type { RepairClass } from "@/content/repair-classes";
import type { QualityTier } from "@/content/quality-tiers";
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
  quality_tier: QualityTier | null;
  commercial_decision: "sell" | "do_not_sell" | "pending";
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
// given (model, repair_type, quality_tier): retire whatever was active
// before FOR THAT SAME TIER, then activate this one. Unlike the old
// single-tier model, multiple quality tiers of the same repair CAN be
// active simultaneously on purpose — that's the customer choosing Economy
// vs. OEM. What's still never ambiguous is which record is "the" active
// one for one specific tier. Activation also requires an explicit 'sell'
// commercial_decision — an unresolved 'pending' or explicit 'do_not_sell'
// tier can never go live no matter what status it's in.
export async function activatePricingRecord(id: string, approvedBy: string) {
  const supabase = getSupabaseAdmin();
  const record = await getPricingRecord(id);
  if (!record) return { error: "Pricing record not found" };
  if (record.approved_customer_price_cents === null) {
    return { error: "Cannot activate a record with no approved customer price" };
  }
  if (record.commercial_decision !== "sell") {
    return { error: "Cannot activate a record that isn't marked commercial_decision = 'sell'" };
  }

  let retireQuery = supabase
    .from("pricing_records")
    .update({ status: "retired", updated_at: new Date().toISOString() })
    .eq("model_id", record.model_id)
    .eq("repair_type", record.repair_type)
    .eq("status", "active");
  retireQuery = record.quality_tier
    ? retireQuery.eq("quality_tier", record.quality_tier)
    : retireQuery.is("quality_tier", null);
  await retireQuery;

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

// SELL / DO NOT SELL / pending — a separate business call from workflow
// status. "OEM exists as a part" never implies "OEM must be sold"; this is
// the field that keeps that true. This does NOT change `status` itself —
// an active row stays "active" in the workflow sense — but the
// customer-facing gate (getActiveCustomerPriceOptions, below) filters on
// commercial_decision='sell' too, so flipping this away from 'sell' on an
// already-active record hides it from customers immediately, verified
// directly against the live resolution engine. Use setPricingStatus
// separately if you also want the workflow status itself to reflect that
// (e.g. moving it to "paused").
export async function setCommercialDecision(id: string, decision: "sell" | "do_not_sell" | "pending") {
  const supabase = getSupabaseAdmin();
  return supabase
    .from("pricing_records")
    .update({ commercial_decision: decision, updated_at: new Date().toISOString() })
    .eq("id", id);
}

// ---------------------------------------------------- Service-level engine
// Completely separate from repair/quality pricing, per direction — a flat,
// cross-cutting fee applied on top of whichever quality tier the customer
// picks. "active" lets CPRNME turn a level off sitewide (e.g. Urgent, when
// capacity can't support it) without touching any pricing record.
export type ServiceLevelRow = {
  level: "standard" | "priority" | "urgent";
  fee_cents: number;
  description: string | null;
  active: boolean;
};

export async function getServiceLevels(): Promise<ServiceLevelRow[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("service_levels").select("level, fee_cents, description, active").order("fee_cents");
  return data ?? [];
}

export async function setServiceLevelFee(level: string, feeCents: number, active: boolean) {
  const supabase = getSupabaseAdmin();
  return supabase
    .from("service_levels")
    .update({ fee_cents: feeCents, active, updated_at: new Date().toISOString() })
    .eq("level", level);
}

// ------------------------------------------------ The customer-facing gate
// The ONLY function in this file that should ever back a customer-visible
// answer. Returns a list of (quality tier, price) pairs — one per tier
// that is BOTH status='active' AND commercial_decision='sell' — never a
// cost, never a margin, never a draft/pending number, never a tier nobody
// approved selling. An empty list means "route to diagnostic," same as
// null did in the single-price version.
export async function getActiveCustomerPriceOptions(
  modelId: string,
  repairType: RepairType
): Promise<{ qualityTier: QualityTier; priceCents: number }[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("pricing_records")
    .select("quality_tier, approved_customer_price_cents, review_by")
    .eq("model_id", modelId)
    .eq("repair_type", repairType)
    .eq("status", "active")
    .eq("commercial_decision", "sell");

  if (!data) return [];
  const now = new Date();
  return data
    .filter((r) => r.approved_customer_price_cents !== null && r.quality_tier !== null)
    .filter((r) => !r.review_by || new Date(r.review_by) >= now) // exclude expired review dates
    .map((r) => ({ qualityTier: r.quality_tier as QualityTier, priceCents: r.approved_customer_price_cents as number }));
}

export async function isRepairEligible(modelId: string, repairType: RepairType): Promise<boolean> {
  const row = await getEligibility(modelId, repairType);
  return row?.eligible ?? false;
}
