"use client";

import { useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { track } from "@vercel/analytics";
import { getAnonSessionId } from "@/lib/session-id";
import { isBuiltLocationSlug } from "@/content/location-pages";
import { getModelsForFamily, type DeviceFamily, type DeviceModel } from "@/content/device-catalog";
import { problems as problemOptions, canEverBeFixedPrice } from "@/content/repair-taxonomy";
import { getQualityTierLabel, getQualityTierDescription, type QualityTier } from "@/content/quality-tiers";
import type { ResolutionResult, ServiceLevelOption } from "@/lib/repair-resolution-server";
import { isEligibleForRealTimeSlots } from "@/content/booking-radius";
import { MAX_ADVANCE_BOOKING_DAYS } from "@/content/time-windows";

// ---- Data -------------------------------------------------------------
// Problem labels/ids come from content/repair-taxonomy.ts (the single
// source of truth the resolution engine and the API route both read) —
// only the icon mapping lives here, since icons are a display-only detail.
const problemIcons: Record<string, React.ReactNode> = {
  screen: <ScreenIcon />,
  charging: <ChargeIcon />,
  battery: <BatteryIcon />,
  power: <PowerIcon />,
  water: <WaterIcon />,
  camera: <CameraIcon />,
  other: <OtherIcon />,
};
const problems = problemOptions.map((p) => ({ ...p, icon: problemIcons[p.id] ?? <OtherIcon /> }));

const devices = [
  { id: "iphone", label: "iPhone" },
  { id: "android", label: "Samsung / Android" },
  { id: "tablet", label: "iPad / Tablet" },
  { id: "other", label: "Something else" },
] as const;

// Cents -> "$149" (or "$149.50" when the price isn't a whole dollar amount).
// The only place a price is ever formatted for display — every number it
// receives came from the server's /api/intent response (ultimately
// lib/pricing-data.ts's getActiveCustomerPrice()), never a literal in this
// component. This component never queries pricing data itself.
function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`;
}

// Groups a family's models by series (iPhone 15, Galaxy A, ...) for the
// picker, preserving device-catalog.ts's own ordering rather than
// re-sorting alphabetically.
function groupBySeries(models: DeviceModel[]): [string, DeviceModel[]][] {
  const map = new Map<string, DeviceModel[]>();
  for (const m of models) {
    if (!map.has(m.series)) map.set(m.series, []);
    map.get(m.series)!.push(m);
  }
  return [...map.entries()];
}

function serviceLevelLabel(level: string): string {
  return level[0].toUpperCase() + level.slice(1);
}

// "2026-09-20" + "morning" -> "Sunday, September 20 (morning)". Parsed as
// local midnight (not UTC) to match the <input type="date"> value it came
// from — see todayISO()'s comment for why that distinction matters here.
function formatBookingWhen(dateStr: string, window: BookingWindow | null): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const dateLabel = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return window ? `${dateLabel} (${window})` : dateLabel;
}

// Reads ?device=&problem= itself (via useSearchParams) rather than taking
// them as server-passed props. That keeps "/" statically prerendered: a
// server component reading `searchParams` forces the whole route to
// server-render on every request, which is exactly the "fully static"
// property Phase 3 called out as a performance win. The trade-off is this
// component needs a <Suspense> boundary around it (see app/page.tsx) — the
// fallback there mirrors step 1's unselected markup so there's nothing to
// visually flash past.
type SubmitState = "idle" | "submitting" | "done" | "error";
type QuoteState = "idle" | "submitting" | "done" | "error";
type BookingState = "idle" | "submitting" | "done" | "error";
type BookingWindow = "morning" | "afternoon" | "evening";
type SlotAvailability = { window: string; label: string; bookedCount: number; capacity: number; full: boolean };

const bookingWindows: { id: BookingWindow; label: string }[] = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
];

// yyyy-mm-dd in local time (not UTC) — a date <input>'s value/min both use
// this format, and using toISOString() here would shift the date backward
// for anyone west of UTC in the evening.
function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// The last date real-time slots can be booked against — see
// content/time-windows.ts's MAX_ADVANCE_BOOKING_DAYS comment; the
// out-of-radius request-based path has no such limit, since a human
// reviews any date regardless.
function maxAdvanceDateISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + MAX_ADVANCE_BOOKING_DAYS);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ProblemSelector() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const requestedDevice = searchParams.get("device");
  const requestedProblem = searchParams.get("problem");
  const validDevice = devices.some((d) => d.id === requestedDevice) ? requestedDevice : null;
  const validProblem = problems.some((p) => p.id === requestedProblem) ? requestedProblem : null;

  // Problem comes first now — "something's wrong with my phone" is how a
  // real visitor actually starts, not "here is my device." Reordering this
  // is purely presentational; the ?device=/?problem= prefill used by the
  // repair-guide pages doesn't care which step renders first.
  const [problemId, setProblemId] = useState<string | null>(validProblem);
  const [deviceId, setDeviceId] = useState<string | null>(validDevice);
  const [modelId, setModelId] = useState<string | null>(null);
  const [modelSearch, setModelSearch] = useState("");
  const [modelSkipped, setModelSkipped] = useState(false);
  const [zip, setZip] = useState("");
  const [zipError, setZipError] = useState<string | null>(null);
  const [contactValue, setContactValue] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [intentId, setIntentId] = useState<string | null>(null);
  const [quoteState, setQuoteState] = useState<QuoteState>("idle");
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [resolution, setResolution] = useState<ResolutionResult | null>(null);
  const [selectedTier, setSelectedTier] = useState<QualityTier | null>(null);
  const [selectedServiceLevel, setSelectedServiceLevel] = useState<ServiceLevelOption["level"]>("standard");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingWindow, setBookingWindow] = useState<BookingWindow | null>(null);
  const [bookingState, setBookingState] = useState<BookingState>("idle");
  const [bookingError, setBookingError] = useState<string | null>(null);
  // Only ever asked for once a booking is actually being made — the site
  // never collects a full address just to record repair intent, only ZIP.
  const [bookingAddress, setBookingAddress] = useState("");
  // Real-time slots only (see content/booking-radius.ts) — a live look at
  // actual capacity for the selected date, fetched fresh each time the
  // date changes so it never shows stale availability.
  const [selectedSlotWindow, setSelectedSlotWindow] = useState<string | null>(null);
  const [slotAvailability, setSlotAvailability] = useState<SlotAvailability[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookedInstantly, setBookedInstantly] = useState(false);

  const problem = problems.find((p) => p.id === problemId);
  const device = devices.find((d) => d.id === deviceId);
  // Real-time slots only apply within the real, sourced eligibility radius
  // (content/booking-radius.ts) — everywhere else keeps the existing
  // request-based, admin-confirmed flow unchanged.
  const realTimeEligible = zip.length === 5 && isEligibleForRealTimeSlots(zip);

  // The single biggest step-count reduction available: for a problem whose
  // every candidate repair type is always-diagnostic (water damage, won't
  // turn on, "something else"), no exact model could ever change the
  // outcome — so don't ask for one. Decided from the problem alone, before
  // the device is even picked.
  const modelStepMatters = problem ? canEverBeFixedPrice(problem.id) : false;
  const needsModelStep = !!device && device.id !== "other" && modelStepMatters;
  const modelStepComplete = !needsModelStep || modelId !== null || modelSkipped;
  const familyModels = needsModelStep ? getModelsForFamily(device!.id as DeviceFamily) : [];
  const trimmedModelSearch = modelSearch.trim().toLowerCase();
  const filteredModels = trimmedModelSearch
    ? familyModels.filter((m) => `${m.name} ${m.series}`.toLowerCase().includes(trimmedModelSearch))
    : familyModels;
  const groupedModels = groupBySeries(filteredModels);

  function resetSubmission() {
    setSubmitState("idle");
    setIntentId(null);
    setQuoteState("idle");
    setResolution(null);
    setSelectedTier(null);
    setSelectedServiceLevel("standard");
    resetBooking();
  }

  function resetBooking() {
    setBookingDate("");
    setBookingWindow(null);
    setBookingState("idle");
    setBookingError(null);
    setSelectedSlotWindow(null);
    setSlotAvailability(null);
    setSlotsLoading(false);
    setBookedInstantly(false);
  }

  // Real-time slots only — fetches actual current capacity for one date.
  // Called whenever the date changes, never cached, since availability is
  // real and can change between one customer's page load and the next.
  async function loadSlotAvailability(date: string) {
    setSlotsLoading(true);
    setSelectedSlotWindow(null);
    try {
      const res = await fetch(`/api/slot-availability?date=${date}`);
      if (res.ok) {
        const data = await res.json().catch(() => null);
        setSlotAvailability(Array.isArray(data?.availability) ? data.availability : null);
      } else {
        setSlotAvailability(null);
        setBookingError("Couldn't load availability for that date. Try another.");
      }
    } catch {
      setSlotAvailability(null);
      setBookingError("Couldn't load availability for that date. Try another.");
    } finally {
      setSlotsLoading(false);
    }
  }

  // If this visitor arrived via a location page's "Find My Repair" CTA
  // (?from=<slug>), that's real provenance worth recording as the
  // originating page — this selector only lives at "/", so pathname alone
  // would otherwise always report "/" no matter where the journey started.
  // Only a slug matching a real, built location page is trusted; anything
  // else falls back to the actual pathname rather than being recorded as-is.
  const fromSlug = searchParams.get("from");
  const originPage =
    fromSlug && isBuiltLocationSlug(fromSlug) ? `/locations/${fromSlug}` : pathname || "/";

  // Submits the contact info against an already-created intent. Callable
  // both from the fallback "Request a quote" button AND automatically,
  // right after a diagnostic outcome, when the customer already gave
  // contact info in the combined ZIP+contact step — that's the step this
  // saves for anyone willing to fill in both at once.
  async function submitQuote(forIntentId: string, contact: string) {
    const trimmed = contact.trim();
    if (trimmed.length === 0) {
      setQuoteError("Enter a phone number or email.");
      return;
    }
    const contactMethod = trimmed.includes("@") ? "email" : "phone";
    setQuoteError(null);
    setQuoteState("submitting");
    try {
      const res = await fetch("/api/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intentEventId: forIntentId, contactMethod, contactValue: trimmed }),
      });
      if (res.ok) {
        setQuoteState("done");
      } else {
        const data = await res.json().catch(() => null);
        setQuoteError(typeof data?.error === "string" ? data.error : "Something went wrong. Please try again.");
        setQuoteState("error");
      }
    } catch {
      setQuoteError("Something went wrong. Please try again.");
      setQuoteState("error");
    }
  }

  // Records a preferred day/window against an already-priced fixed-price
  // repair. This is a REQUEST, not a confirmation — see
  // app/api/booking-request/route.ts and lib/bookings-data.ts. Only
  // reachable once a quality tier is selected, so there's always a real
  // repairType + price to attach it to.
  async function submitBooking() {
    if (!intentId || !resolution || resolution.outcome !== "fixed_price" || !selectedTier) return;
    const trimmedContact = contactValue.trim();
    if (trimmedContact.length === 0) {
      setBookingError("Enter a phone number or email so we can confirm your appointment.");
      return;
    }
    if (!bookingDate) {
      setBookingError("Pick a preferred date.");
      return;
    }
    if (!bookingWindow) {
      setBookingError("Pick a preferred time of day.");
      return;
    }
    const trimmedAddress = bookingAddress.trim();
    if (trimmedAddress.length < 5) {
      setBookingError("Enter the address for the repair.");
      return;
    }
    const contactMethod = trimmedContact.includes("@") ? "email" : "phone";
    const tierOption = resolution.options.find((o) => o.qualityTier === selectedTier);
    const serviceOption = resolution.serviceLevels.find((s) => s.level === selectedServiceLevel);
    const totalCents = (tierOption?.priceCents ?? 0) + (serviceOption?.feeCents ?? 0);
    setBookingError(null);
    setBookingState("submitting");
    track("booking_requested", { repairType: resolution.repairType, qualityTier: selectedTier });
    try {
      const res = await fetch("/api/booking-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intentEventId: intentId,
          repairType: resolution.repairType,
          qualityTier: selectedTier,
          serviceLevel: selectedServiceLevel,
          priceCents: totalCents,
          contactMethod,
          contactValue: trimmedContact,
          requestedDate: bookingDate,
          requestedWindow: bookingWindow,
          address: trimmedAddress,
        }),
      });
      if (res.ok) {
        setBookingState("done");
      } else {
        const data = await res.json().catch(() => null);
        setBookingError(typeof data?.error === "string" ? data.error : "Something went wrong. Please try again.");
        setBookingState("error");
      }
    } catch {
      setBookingError("Something went wrong. Please try again.");
      setBookingState("error");
    }
  }

  // Real-time slots only — an atomic claim against actual capacity (see
  // app/api/book-slot/route.ts and the claim_booking_slot() Postgres
  // function). Unlike submitBooking() above, success here means a real,
  // final 'confirmed' row, not a request awaiting a human.
  async function submitRealTimeSlot() {
    if (!intentId || !resolution || resolution.outcome !== "fixed_price" || !selectedTier) return;
    const trimmedContact = contactValue.trim();
    if (trimmedContact.length === 0) {
      setBookingError("Enter a phone number or email so we can confirm your appointment.");
      return;
    }
    if (!bookingDate) {
      setBookingError("Pick a date.");
      return;
    }
    if (!selectedSlotWindow) {
      setBookingError("Pick an available time.");
      return;
    }
    const trimmedAddress = bookingAddress.trim();
    if (trimmedAddress.length < 5) {
      setBookingError("Enter the address for the repair.");
      return;
    }
    const contactMethod = trimmedContact.includes("@") ? "email" : "phone";
    const tierOption = resolution.options.find((o) => o.qualityTier === selectedTier);
    const serviceOption = resolution.serviceLevels.find((s) => s.level === selectedServiceLevel);
    const totalCents = (tierOption?.priceCents ?? 0) + (serviceOption?.feeCents ?? 0);
    setBookingError(null);
    setBookingState("submitting");
    track("slot_booked", { repairType: resolution.repairType, qualityTier: selectedTier });
    try {
      const res = await fetch("/api/book-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intentEventId: intentId,
          repairType: resolution.repairType,
          qualityTier: selectedTier,
          serviceLevel: selectedServiceLevel,
          priceCents: totalCents,
          contactMethod,
          contactValue: trimmedContact,
          date: bookingDate,
          window: selectedSlotWindow,
          address: trimmedAddress,
        }),
      });
      if (res.ok) {
        setBookedInstantly(true);
        setBookingState("done");
      } else if (res.status === 409) {
        // Someone else claimed the last spot in the moment between this
        // customer loading availability and submitting — real capacity
        // changed, so refresh it rather than showing a generic error.
        setBookingError("That time just filled up — pick a different one below.");
        setBookingState("error");
        loadSlotAvailability(bookingDate);
      } else {
        const data = await res.json().catch(() => null);
        setBookingError(typeof data?.error === "string" ? data.error : "Something went wrong. Please try again.");
        setBookingState("error");
      }
    } catch {
      setBookingError("Something went wrong. Please try again.");
      setBookingState("error");
    }
  }

  async function handleContinue() {
    const trimmedZip = zip.trim();
    if (!/^\d{5}$/.test(trimmedZip)) {
      setZipError("Enter a valid 5-digit ZIP code.");
      return;
    }
    setZipError(null);
    setSubmitState("submitting");
    setIntentId(null);
    setQuoteState("idle");
    setResolution(null);
    track("repair_intent_submitted", {
      device: deviceId ?? "unknown",
      deviceModel: modelId ?? "unspecified",
      problem: problemId ?? "unknown",
      zip: trimmedZip,
    });
    try {
      const res = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device: deviceId,
          deviceModel: modelId,
          problem: problemId,
          zip: trimmedZip,
          sourcePage: originPage,
          sessionId: getAnonSessionId(),
        }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        const newIntentId = typeof data?.id === "string" ? data.id : null;
        const newResolution: ResolutionResult = data?.resolution ?? { outcome: "diagnostic" };
        setIntentId(newIntentId);
        setResolution(newResolution);
        setSubmitState("done");
        // The step-saving move: if this turned out to need a look, and the
        // customer already told us how to reach them, don't make them do
        // it again in a second step — send it now.
        if (newResolution.outcome === "diagnostic" && newIntentId && contactValue.trim()) {
          submitQuote(newIntentId, contactValue);
        }
      } else {
        setSubmitState("error");
      }
    } catch {
      setSubmitState("error");
    }
  }

  let stepNumber = 0;
  const nextStep = () => ++stepNumber;

  return (
    <div className="selector">
      <div className="selector-step">
        <h3>{nextStep()}. What&rsquo;s wrong with it?</h3>
        <div className="problem-grid" role="group" aria-label="Choose the problem">
          {problems.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`problem-card${problemId === p.id ? " selected" : ""}`}
              aria-pressed={problemId === p.id}
              onClick={() => {
                setProblemId(p.id);
                setModelId(null);
                setModelSearch("");
                setModelSkipped(false);
                resetSubmission();
                track("problem_selected", { device: deviceId ?? "unknown", problem: p.id });
              }}
            >
              <span aria-hidden="true">{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {problem && (
        <div className="selector-step">
          <h3>{nextStep()}. What device do you have?</h3>
          <div className="chip-row" role="group" aria-label="Choose your device">
            {devices.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`chip${deviceId === d.id ? " selected" : ""}`}
                aria-pressed={deviceId === d.id}
                onClick={() => {
                  setDeviceId(d.id);
                  setModelId(null);
                  setModelSearch("");
                  setModelSkipped(false);
                  resetSubmission();
                  track("device_selected", { device: d.id });
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {needsModelStep && !modelStepComplete && (
        <div className="selector-step">
          <h3>{nextStep()}. Which {device!.label} do you have?</h3>
          <input
            type="text"
            className="zip-input model-search"
            placeholder="Search your exact model…"
            value={modelSearch}
            onChange={(e) => setModelSearch(e.target.value)}
            aria-label="Search for your exact device model"
          />
          <div className="model-picker-results" role="listbox" aria-label="Matching models">
            {groupedModels.length === 0 && (
              <p style={{ color: "var(--cp-ink-faint)", fontSize: "13.5px", padding: "8px 0" }}>
                No matches — try a different search, or skip below.
              </p>
            )}
            {groupedModels.map(([series, models]) => (
              <div key={series} className="model-picker-group">
                <p className="model-picker-series">{series}</p>
                {models.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="model-picker-option"
                    onClick={() => {
                      setModelId(m.id);
                      setModelSkipped(false);
                      resetSubmission();
                    }}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-tertiary"
            style={{ marginTop: "10px" }}
            onClick={() => {
              setModelSkipped(true);
              setModelId(null);
              resetSubmission();
            }}
          >
            I don&rsquo;t know my exact model
          </button>
        </div>
      )}

      {needsModelStep && modelStepComplete && (
        <p className="selector-model-summary">
          {modelId
            ? `Model: ${familyModels.find((m) => m.id === modelId)?.name ?? modelId}`
            : "Exact model not provided"}{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setModelId(null);
              setModelSkipped(false);
              setModelSearch("");
              resetSubmission();
            }}
          >
            Change
          </button>
        </p>
      )}

      <div className="selector-summary" aria-live="polite">
        {device && problem && (
          <p>
            Got it — {device.label}, {problem.label.toLowerCase()}. Here&rsquo;s what
            happens next.
          </p>
        )}
      </div>

      {device && modelStepComplete && (
        <div className="selector-step">
          <h3>{nextStep()}. Where are you, and how should we reach you?</h3>
          <label htmlFor="repair-zip" style={{ display: "block", fontSize: "14.5px", color: "var(--cp-ink-soft)", marginBottom: "6px" }}>
            ZIP code — this is what we use to route your request today.
          </label>
          <input
            id="repair-zip"
            type="text"
            inputMode="numeric"
            pattern="\d{5}"
            maxLength={5}
            autoComplete="postal-code"
            className="zip-input"
            placeholder="e.g. 75201"
            value={zip}
            aria-invalid={zipError ? true : undefined}
            aria-describedby={zipError ? "repair-zip-error" : undefined}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 5);
              setZip(digitsOnly);
              if (zipError) setZipError(null);
              if (submitState !== "idle") setSubmitState("idle");
            }}
          />
          {zipError && (
            <p id="repair-zip-error" role="alert" style={{ color: "var(--cp-error)", fontSize: "13.5px", marginTop: "6px" }}>
              {zipError}
            </p>
          )}

          <label htmlFor="repair-contact" style={{ display: "block", fontSize: "14.5px", color: "var(--cp-ink-soft)", margin: "14px 0 6px" }}>
            Phone or email (optional) — only needed if your repair turns out to require a quick review.
          </label>
          <input
            id="repair-contact"
            type="text"
            autoComplete="tel"
            className="zip-input"
            style={{ width: "220px" }}
            placeholder="Optional"
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
          />
        </div>
      )}

      {device && modelStepComplete && (
        <div className="selector-next">
          <button
            type="button"
            className="btn btn-primary"
            disabled={submitState === "submitting" || submitState === "done"}
            onClick={handleContinue}
          >
            Continue
          </button>
          {submitState === "error" && (
            <p className="selector-note" role="alert">
              Something went wrong recording your request. Please try again.
            </p>
          )}
        </div>
      )}

      {submitState === "done" && resolution?.outcome === "fixed_price" && (
        <div className="selector-step fixed-price-result">
          <h3>{problem?.label} — choose your repair quality</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
            {resolution.options.map((opt) => (
              <button
                key={opt.qualityTier}
                type="button"
                className={`quality-option-row${selectedTier === opt.qualityTier ? " selected" : ""}`}
                onClick={() => {
                  setSelectedTier(opt.qualityTier);
                  resetBooking();
                }}
              >
                <span>
                  <strong>{getQualityTierLabel(opt.qualityTier)}</strong>
                  <br />
                  <span style={{ fontSize: "12.5px", color: "var(--cp-ink-soft)", fontWeight: 400 }}>
                    {getQualityTierDescription(opt.qualityTier)}
                  </span>
                </span>
                <span className="fixed-price-amount">{formatPrice(opt.priceCents)}</span>
              </button>
            ))}
          </div>

          {selectedTier && resolution.serviceLevels.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <p style={{ fontSize: "13.5px", fontWeight: 600, marginBottom: "6px" }}>How soon do you need it?</p>
              <div className="chip-row" role="group" aria-label="Choose service speed">
                {resolution.serviceLevels.map((s) => (
                  <button
                    key={s.level}
                    type="button"
                    className={`chip${selectedServiceLevel === s.level ? " selected" : ""}`}
                    aria-pressed={selectedServiceLevel === s.level}
                    onClick={() => {
                      setSelectedServiceLevel(s.level);
                      resetBooking();
                    }}
                  >
                    {serviceLevelLabel(s.level)}
                    {s.feeCents > 0 ? ` (+${formatPrice(s.feeCents)})` : ""}
                  </button>
                ))}
              </div>
              <p style={{ marginTop: "12px", fontSize: "14.5px" }}>
                Total:{" "}
                <strong className="fixed-price-amount" style={{ fontSize: "18px" }}>
                  {formatPrice(
                    (resolution.options.find((o) => o.qualityTier === selectedTier)?.priceCents ?? 0) +
                      (resolution.serviceLevels.find((s) => s.level === selectedServiceLevel)?.feeCents ?? 0)
                  )}
                </strong>
              </p>
            </div>
          )}

          {selectedTier && bookingState === "done" && bookedInstantly && (
            <p className="selector-note" role="status" style={{ marginTop: "16px" }}>
              You&rsquo;re booked — confirmed for {formatBookingWhen(bookingDate, null)}
              {selectedSlotWindow ? `, ${slotAvailability?.find((s) => s.window === selectedSlotWindow)?.label ?? selectedSlotWindow}` : ""}. We&rsquo;ll
              see you then.
            </p>
          )}

          {selectedTier && bookingState === "done" && !bookedInstantly && (
            <p className="selector-note" role="status" style={{ marginTop: "16px" }}>
              Got it — we&rsquo;ll confirm your appointment for {formatBookingWhen(bookingDate, bookingWindow)} shortly.
            </p>
          )}

          {selectedTier && bookingState !== "done" && realTimeEligible && (
            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--cp-line)" }}>
              <h4 style={{ fontSize: "14.5px", fontWeight: 700, marginBottom: "6px" }}>Book your appointment</h4>
              <p style={{ color: "var(--cp-ink-soft)", fontSize: "13.5px", marginBottom: "10px" }}>
                Pick a date and an open time — this reserves it instantly, no waiting on a
                callback.
              </p>

              <label htmlFor="slot-date" style={{ display: "block", fontSize: "13.5px", color: "var(--cp-ink-soft)", marginBottom: "6px" }}>
                Date
              </label>
              <input
                id="slot-date"
                type="date"
                min={todayISO()}
                max={maxAdvanceDateISO()}
                className="zip-input"
                style={{ width: "170px" }}
                value={bookingDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setBookingDate(newDate);
                  if (bookingError) setBookingError(null);
                  if (newDate) loadSlotAvailability(newDate);
                }}
              />

              {bookingDate && (
                <div style={{ marginTop: "14px" }}>
                  <p style={{ fontSize: "13.5px", color: "var(--cp-ink-soft)", marginBottom: "6px" }}>Available times</p>
                  {slotsLoading && <p style={{ fontSize: "13.5px", color: "var(--cp-ink-faint)" }}>Loading availability…</p>}
                  {!slotsLoading && slotAvailability && (
                    <div className="chip-row" role="group" aria-label="Choose an available time">
                      {slotAvailability.map((s) => (
                        <button
                          key={s.window}
                          type="button"
                          disabled={s.full}
                          className={`chip${selectedSlotWindow === s.window ? " selected" : ""}`}
                          aria-pressed={selectedSlotWindow === s.window}
                          style={s.full ? { opacity: 0.45, cursor: "not-allowed", textDecoration: "line-through" } : undefined}
                          onClick={() => {
                            setSelectedSlotWindow(s.window);
                            if (bookingError) setBookingError(null);
                          }}
                        >
                          {s.label}
                          {s.full ? " — Full" : ""}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!contactValue.trim() && (
                <>
                  <label htmlFor="slot-contact" style={{ display: "block", fontSize: "13.5px", color: "var(--cp-ink-soft)", margin: "14px 0 6px" }}>
                    Phone or email — needed so we can confirm your appointment.
                  </label>
                  <input
                    id="slot-contact"
                    type="text"
                    autoComplete="tel"
                    className="zip-input"
                    style={{ width: "220px" }}
                    placeholder="Phone or email"
                    value={contactValue}
                    onChange={(e) => {
                      setContactValue(e.target.value);
                      if (bookingError) setBookingError(null);
                    }}
                  />
                </>
              )}

              <label htmlFor="slot-address" style={{ display: "block", fontSize: "13.5px", color: "var(--cp-ink-soft)", margin: "14px 0 6px" }}>
                Address for the repair
              </label>
              <input
                id="slot-address"
                type="text"
                autoComplete="street-address"
                className="zip-input"
                style={{ width: "100%", maxWidth: "320px" }}
                placeholder="Street, apt/unit, city"
                value={bookingAddress}
                onChange={(e) => {
                  setBookingAddress(e.target.value);
                  if (bookingError) setBookingError(null);
                }}
              />

              <div style={{ marginTop: "14px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={bookingState === "submitting" || !selectedSlotWindow}
                  onClick={submitRealTimeSlot}
                >
                  {bookingState === "submitting" ? "Booking…" : "Confirm booking"}
                </button>
              </div>
              {bookingError && (
                <p role="alert" style={{ color: "var(--cp-error)", fontSize: "13.5px", marginTop: "8px" }}>
                  {bookingError}
                </p>
              )}
            </div>
          )}

          {selectedTier && bookingState !== "done" && !realTimeEligible && (
            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--cp-line)" }}>
              <h4 style={{ fontSize: "14.5px", fontWeight: 700, marginBottom: "6px" }}>
                Want to reserve a time?
              </h4>
              <p style={{ color: "var(--cp-ink-soft)", fontSize: "13.5px", marginBottom: "10px" }}>
                Pick a day and a general time that works, and we&rsquo;ll confirm the exact
                appointment with you. This isn&rsquo;t an instant booking — a real person
                confirms it.
              </p>

              <label htmlFor="booking-date" style={{ display: "block", fontSize: "13.5px", color: "var(--cp-ink-soft)", marginBottom: "6px" }}>
                Preferred date
              </label>
              <input
                id="booking-date"
                type="date"
                min={todayISO()}
                className="zip-input"
                style={{ width: "170px" }}
                value={bookingDate}
                onChange={(e) => {
                  setBookingDate(e.target.value);
                  if (bookingError) setBookingError(null);
                }}
              />

              <p style={{ fontSize: "13.5px", color: "var(--cp-ink-soft)", margin: "14px 0 6px" }}>
                Preferred time of day
              </p>
              <div className="chip-row" role="group" aria-label="Choose a preferred time of day">
                {bookingWindows.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    className={`chip${bookingWindow === w.id ? " selected" : ""}`}
                    aria-pressed={bookingWindow === w.id}
                    onClick={() => {
                      setBookingWindow(w.id);
                      if (bookingError) setBookingError(null);
                    }}
                  >
                    {w.label}
                  </button>
                ))}
              </div>

              {!contactValue.trim() && (
                <>
                  <label htmlFor="booking-contact" style={{ display: "block", fontSize: "13.5px", color: "var(--cp-ink-soft)", margin: "14px 0 6px" }}>
                    Phone or email — needed so we can confirm your appointment.
                  </label>
                  <input
                    id="booking-contact"
                    type="text"
                    autoComplete="tel"
                    className="zip-input"
                    style={{ width: "220px" }}
                    placeholder="Phone or email"
                    value={contactValue}
                    onChange={(e) => {
                      setContactValue(e.target.value);
                      if (bookingError) setBookingError(null);
                    }}
                  />
                </>
              )}

              <label htmlFor="booking-address" style={{ display: "block", fontSize: "13.5px", color: "var(--cp-ink-soft)", margin: "14px 0 6px" }}>
                Address for the repair
              </label>
              <input
                id="booking-address"
                type="text"
                autoComplete="street-address"
                className="zip-input"
                style={{ width: "100%", maxWidth: "320px" }}
                placeholder="Street, apt/unit, city"
                value={bookingAddress}
                onChange={(e) => {
                  setBookingAddress(e.target.value);
                  if (bookingError) setBookingError(null);
                }}
              />

              <div style={{ marginTop: "14px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={bookingState === "submitting"}
                  onClick={submitBooking}
                >
                  {bookingState === "submitting" ? "Requesting…" : "Request this time"}
                </button>
              </div>
              {bookingError && (
                <p role="alert" style={{ color: "var(--cp-error)", fontSize: "13.5px", marginTop: "8px" }}>
                  {bookingError}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {submitState === "done" && resolution?.outcome === "diagnostic" && quoteState === "done" && (
        <p className="selector-note" role="status">
          Thanks — we&rsquo;ll be in touch soon with your repair options.
        </p>
      )}

      {submitState === "done" && resolution?.outcome === "diagnostic" && intentId && quoteState !== "done" && !contactValue.trim() && (
        <div className="selector-step quote-request">
          <h3>This one needs a quick review</h3>
          <p style={{ color: "var(--cp-ink-soft)", fontSize: "14.5px", marginBottom: "10px" }}>
            Leave a phone number or email and we&rsquo;ll review your request and get
            back to you as soon as possible with your repair options.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-start" }}>
            <input
              id="quote-contact"
              type="text"
              autoComplete="tel"
              className="zip-input"
              style={{ width: "220px" }}
              placeholder="Phone or email"
              value={contactValue}
              aria-invalid={quoteError ? true : undefined}
              aria-describedby={quoteError ? "quote-contact-error" : undefined}
              onChange={(e) => {
                setContactValue(e.target.value);
                if (quoteError) setQuoteError(null);
              }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              disabled={quoteState === "submitting"}
              onClick={() => intentId && submitQuote(intentId, contactValue)}
            >
              {quoteState === "submitting" ? "Sending…" : "Request a quote"}
            </button>
          </div>
          {quoteError && (
            <p id="quote-contact-error" role="alert" style={{ color: "var(--cp-error)", fontSize: "13.5px", marginTop: "8px" }}>
              {quoteError}
            </p>
          )}
        </div>
      )}

      {submitState === "done" && resolution?.outcome === "diagnostic" && quoteState === "submitting" && contactValue.trim() && (
        <p className="selector-note" role="status">
          Sending your request…
        </p>
      )}
    </div>
  );
}

// ---- Icons --------------------------------------------------------------
// Simple line icons built from basic shapes (rect/circle/path with straight
// or single-curve segments) — no hand-authored complex path data.
function ScreenIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M7 3 L17 15 M13 8 L9 21" />
    </svg>
  );
}
function ChargeIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="9" y="2" width="6" height="10" rx="1" />
      <path d="M12 12 L9 16 L12 16 L11 22 L16 14 L13 14 Z" />
    </svg>
  );
}
function BatteryIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="2" y="8" width="17" height="8" rx="1.5" />
      <path d="M21 10.5 V13.5" />
      <rect x="4" y="10" width="5" height="4" fill="currentColor" stroke="none" />
    </svg>
  );
}
function PowerIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 7 V12" />
    </svg>
  );
}
function WaterIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 3 C12 3 6 11 6 15 a6 6 0 0 0 12 0 C18 11 12 3 12 3 Z" />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <circle cx="12" cy="13.5" r="4" />
      <path d="M9 7 L10.5 4 H13.5 L15 7" />
    </svg>
  );
}
function OtherIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
