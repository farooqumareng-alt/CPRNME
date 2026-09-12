"use client";

// The internal decision tool from the build directive's Phase 2/14 — never
// customer-facing. Recalculates live as an admin types, using the exact
// same pure functions (lib/pricing-calculator.ts) the server snapshots on
// save, so what the admin sees here is guaranteed to match what gets
// stored. Submitting calls the Server Action directly; there's no
// client-side database access anywhere in this file.
import { useState } from "react";
import { computeEconomicFloor, classifyOutcome, type MarketStats } from "@/lib/pricing-calculator";
import { savePricingRecordAction } from "./actions";
import type { PricingRecordRow } from "@/lib/pricing-data";
import type { RepairClass } from "@/content/repair-classes";

const CENTS_FIELDS = [
  ["partAcquisitionCost", "part_acquisition_cost_cents", "Part acquisition cost"],
  ["partShipping", "part_shipping_cents", "Part shipping/handling"],
  ["providerCompensation", "provider_compensation_cents", "Provider compensation"],
  ["paymentProcessing", "payment_processing_cents", "Payment processing"],
  ["warrantyReserve", "warranty_reserve_cents", "Warranty reserve"],
  ["customerSupportAllocation", "customer_support_allocation_cents", "Customer support allocation"],
  ["mobileTravelCost", "mobile_travel_cost_cents", "Mobile/travel cost"],
  ["consumables", "consumables_cents", "Consumables"],
  ["overheadAllocation", "overhead_allocation_cents", "Overhead allocation"],
  ["otherDirectCosts", "other_direct_costs_cents", "Other direct costs"],
  ["requiredContributionFloor", "required_contribution_floor_cents", "Required CPRNME contribution floor"],
] as const;

function toDollarsStr(cents: number | null | undefined): string {
  return cents === null || cents === undefined ? "" : (cents / 100).toFixed(2);
}
function fromDollarsStr(v: string): number {
  const n = Math.round(parseFloat(v || "0") * 100);
  return Number.isFinite(n) ? n : 0;
}

export function PricingCalculatorForm({
  modelId,
  repairType,
  existing,
  market,
  defaultRepairClass,
}: {
  modelId: string;
  repairType: string;
  existing: PricingRecordRow | null;
  market: MarketStats | null;
  defaultRepairClass: RepairClass | null;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const [formKey, dbKey] of CENTS_FIELDS) {
      v[formKey] = toDollarsStr(existing?.[dbKey as keyof PricingRecordRow] as number | null);
    }
    return v;
  });
  const [recommendedPrice, setRecommendedPrice] = useState(toDollarsStr(existing?.recommended_price_cents));
  const [approvedPrice, setApprovedPrice] = useState(toDollarsStr(existing?.approved_customer_price_cents));

  const inputsCents = Object.fromEntries(
    CENTS_FIELDS.map(([formKey]) => [formKey, fromDollarsStr(values[formKey])])
  ) as Record<(typeof CENTS_FIELDS)[number][0], number>;

  const economicFloorCents = computeEconomicFloor({
    partAcquisitionCostCents: inputsCents.partAcquisitionCost,
    partShippingCents: inputsCents.partShipping,
    providerCompensationCents: inputsCents.providerCompensation,
    paymentProcessingCents: inputsCents.paymentProcessing,
    warrantyReserveCents: inputsCents.warrantyReserve,
    customerSupportAllocationCents: inputsCents.customerSupportAllocation,
    mobileTravelCostCents: inputsCents.mobileTravelCost,
    consumablesCents: inputsCents.consumables,
    overheadAllocationCents: inputsCents.overheadAllocation,
    otherDirectCostsCents: inputsCents.otherDirectCosts,
    requiredContributionFloorCents: inputsCents.requiredContributionFloor,
  });
  const outcome = classifyOutcome(economicFloorCents, market);
  const outcomeLabel = { healthy: "Healthy", market_sensitive: "Market-sensitive — needs review", not_viable: "Not economically viable" }[outcome];
  const outcomeColor = { healthy: "var(--pass, #2f6f4f)", market_sensitive: "var(--gap, #8a5a15)", not_viable: "var(--cp-error)" }[outcome];

  const partCostCents = inputsCents.partAcquisitionCost + inputsCents.partShipping;
  const directServiceCostsCents =
    inputsCents.customerSupportAllocation + inputsCents.mobileTravelCost + inputsCents.consumables + inputsCents.overheadAllocation + inputsCents.otherDirectCosts;
  const approvedCents = fromDollarsStr(approvedPrice);
  const contributionCents = approvedCents ? approvedCents - partCostCents - inputsCents.providerCompensation - directServiceCostsCents : null;

  return (
    <form action={savePricingRecordAction} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <input type="hidden" name="id" value={existing?.id ?? ""} />
      <input type="hidden" name="modelId" value={modelId} />
      <input type="hidden" name="repairType" value={repairType} />
      <input type="hidden" name="repairClass" value={defaultRepairClass ?? ""} />
      <input type="hidden" name="economicFloor" value={(economicFloorCents / 100).toFixed(2)} />
      <input type="hidden" name="marketLow" value={market ? (market.lowCents / 100).toFixed(2) : ""} />
      <input type="hidden" name="marketMedian" value={market ? (market.medianCents / 100).toFixed(2) : ""} />
      <input type="hidden" name="marketHigh" value={market ? (market.highCents / 100).toFixed(2) : ""} />
      <input type="hidden" name="marketObservationCount" value={market ? String(market.count) : "0"} />
      <input type="hidden" name="outcome" value={outcome} />

      <fieldset style={{ border: "1px solid var(--cp-line)", borderRadius: 10, padding: 14 }}>
        <legend style={{ fontSize: 13, fontWeight: 700, padding: "0 6px" }}>Cost components</legend>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {CENTS_FIELDS.map(([formKey, , label]) => (
            <label key={formKey} style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
              {label}
              <input
                name={formKey}
                type="number"
                step="0.01"
                min="0"
                value={values[formKey]}
                onChange={(e) => setValues((v) => ({ ...v, [formKey]: e.target.value }))}
                style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, fontSize: 14 }}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset style={{ border: "1px solid var(--cp-line)", borderRadius: 10, padding: 14 }}>
        <legend style={{ fontSize: 13, fontWeight: 700, padding: "0 6px" }}>Part &amp; service detail</legend>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <TextField name="partType" label="Part type" defaultValue={existing?.part_type} />
          <TextField name="partQuality" label="Part quality (OEM / aftermarket / refurb)" defaultValue={existing?.part_quality} />
          <TextField name="partSupplier" label="Supplier" defaultValue={existing?.part_supplier} />
          <TextField name="partWarrantyInfo" label="Part warranty info" defaultValue={existing?.part_warranty_info} />
          <TextField name="partCostEffectiveDate" label="Part cost effective date" type="date" defaultValue={existing?.part_cost_effective_date} />
          <SelectField name="serviceMethod" label="Service method" options={["shop", "mobile", "other"]} defaultValue={existing?.service_method ?? "shop"} />
          <TextField name="serviceArea" label="Service area / zone" defaultValue={existing?.service_area} />
          <TextField name="travelTimeMinutes" label="Travel time (minutes)" type="number" defaultValue={existing?.travel_time_minutes?.toString()} />
        </div>
      </fieldset>

      <div style={{ background: "var(--cp-accent-soft)", borderRadius: 10, padding: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Calculator (internal only)</h3>
        <Row label="Part cost" value={partCostCents} />
        <Row label="Provider compensation" value={inputsCents.providerCompensation} />
        <Row label="Direct service costs" value={directServiceCostsCents} />
        <Row label="Warranty reserve" value={inputsCents.warrantyReserve} />
        <Row label="Payment/transaction cost" value={inputsCents.paymentProcessing} />
        <Row label="Required CPRNME contribution floor" value={inputsCents.requiredContributionFloor} />
        <Row label="Economic floor" value={economicFloorCents} bold />
        <div style={{ borderTop: "1px dashed var(--cp-line-strong)", margin: "10px 0" }} />
        <Row label="Market low" value={market?.lowCents ?? null} />
        <Row label="Market median" value={market?.medianCents ?? null} />
        <Row label="Market high" value={market?.highCents ?? null} />
        <p style={{ fontSize: 12.5, color: "var(--cp-ink-faint)", marginTop: 4 }}>
          {market ? `Based on ${market.count} observation${market.count === 1 ? "" : "s"}` : "No market observations recorded yet"}
        </p>
        <p style={{ marginTop: 10, fontWeight: 700, color: outcomeColor }}>Outcome: {outcomeLabel}</p>
      </div>

      <fieldset style={{ border: "1px solid var(--cp-line)", borderRadius: 10, padding: 14 }}>
        <legend style={{ fontSize: 13, fontWeight: 700, padding: "0 6px" }}>Price decision</legend>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
            Recommended price ($)
            <input
              name="recommendedPrice"
              type="number"
              step="0.01"
              min="0"
              value={recommendedPrice}
              onChange={(e) => setRecommendedPrice(e.target.value)}
              style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, fontSize: 14 }}
            />
          </label>
          <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
            Approved customer price ($) — leave blank until approved
            <input
              name="approvedCustomerPrice"
              type="number"
              step="0.01"
              min="0"
              value={approvedPrice}
              onChange={(e) => setApprovedPrice(e.target.value)}
              style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, fontSize: 14 }}
            />
          </label>
        </div>
        {contributionCents !== null && (
          <p style={{ fontSize: 13, marginTop: 10 }}>
            Expected CPRNME contribution at this approved price:{" "}
            <strong>${(contributionCents / 100).toFixed(2)}</strong>
            <span style={{ color: "var(--cp-ink-faint)" }}> (not called "profit" — direct fulfillment costs only, no business overhead applied)</span>
          </p>
        )}
        <TextField name="notes" label="Notes" defaultValue={existing?.notes} textarea />
      </fieldset>

      <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
        Save as draft
      </button>
    </form>
  );
}

function Row({ label, value, bold }: { label: string; value: number | null; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: bold ? 700 : 400, padding: "2px 0" }}>
      <span>{label}</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{value === null ? "—" : `$${(value / 100).toFixed(2)}`}</span>
    </div>
  );
}

function TextField({
  name,
  label,
  defaultValue,
  type = "text",
  textarea = false,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4, gridColumn: textarea ? "1 / -1" : undefined }}>
      {label}
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue ?? ""} rows={2} style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, fontSize: 14, fontFamily: "inherit" }} />
      ) : (
        <input name={name} type={type} defaultValue={defaultValue ?? ""} style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, fontSize: 14 }} />
      )}
    </label>
  );
}

function SelectField({ name, label, options, defaultValue }: { name: string; label: string; options: string[]; defaultValue: string }) {
  return (
    <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
      {label}
      <select name={name} defaultValue={defaultValue} style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, fontSize: 14 }}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
