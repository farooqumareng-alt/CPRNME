"use client";

import { useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { track } from "@vercel/analytics";
import { getAnonSessionId } from "@/lib/session-id";
import { isBuiltLocationSlug } from "@/content/location-pages";
import { getModelsForFamily, type DeviceFamily, type DeviceModel } from "@/content/device-catalog";
import { problems as problemOptions } from "@/content/repair-taxonomy";
import type { ResolutionResult } from "@/lib/repair-resolution-server";

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

export function ProblemSelector() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const requestedDevice = searchParams.get("device");
  const requestedProblem = searchParams.get("problem");
  const validDevice = devices.some((d) => d.id === requestedDevice) ? requestedDevice : null;
  const validProblem = problems.some((p) => p.id === requestedProblem) ? requestedProblem : null;
  const [deviceId, setDeviceId] = useState<string | null>(validDevice);
  const [modelId, setModelId] = useState<string | null>(null);
  const [modelSearch, setModelSearch] = useState("");
  const [modelSkipped, setModelSkipped] = useState(false);
  const [problemId, setProblemId] = useState<string | null>(validProblem);
  const [zip, setZip] = useState("");
  const [zipError, setZipError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [intentId, setIntentId] = useState<string | null>(null);
  const [contactValue, setContactValue] = useState("");
  const [quoteState, setQuoteState] = useState<QuoteState>("idle");
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [resolution, setResolution] = useState<ResolutionResult | null>(null);

  const device = devices.find((d) => d.id === deviceId);
  const problem = problems.find((p) => p.id === problemId);

  // "Something else" as a device has no catalog to pick a model from — an
  // unknown device can never be fixed-price, so there's nothing to ask.
  // For iPhone/Android/Tablet, the customer either picks their exact model
  // or explicitly says they don't know it; either way this becomes "true"
  // and the flow moves on to the problem step.
  const needsModelStep = !!device && device.id !== "other";
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
    setContactValue("");
    setResolution(null);
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
    setContactValue("");
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
        setIntentId(typeof data?.id === "string" ? data.id : null);
        // The server computed this against the real pricing database —
        // this component never decides fixed-price-vs-diagnostic itself.
        setResolution(data?.resolution ?? { outcome: "diagnostic" });
        setSubmitState("done");
      } else {
        setSubmitState("error");
      }
    } catch {
      setSubmitState("error");
    }
  }

  async function handleQuoteRequest() {
    if (!intentId) return;
    const trimmed = contactValue.trim();
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
        body: JSON.stringify({ intentEventId: intentId, contactMethod, contactValue: trimmed }),
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

  return (
    <div className="selector">
      <div className="selector-step">
        <h3>1. What device do you have?</h3>
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

      {needsModelStep && !modelStepComplete && (
        <div className="selector-step">
          <h3>2. Which {device!.label} do you have?</h3>
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

      {device && modelStepComplete && (
        <div className="selector-step">
          <h3>3. What&rsquo;s wrong with it?</h3>
          <div className="problem-grid" role="group" aria-label="Choose the problem">
            {problems.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`problem-card${problemId === p.id ? " selected" : ""}`}
                aria-pressed={problemId === p.id}
                onClick={() => {
                  setProblemId(p.id);
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
      )}

      <div className="selector-summary" aria-live="polite">
        {device && problem && (
          <p>
            Got it — {device.label}, {problem.label.toLowerCase()}. Here&rsquo;s what
            happens next.
          </p>
        )}
      </div>

      {device && problem && (
        <div className="selector-step">
          <h3>4. Where are you located?</h3>
          <label htmlFor="repair-zip" style={{ display: "block", fontSize: "14.5px", color: "var(--cp-ink-soft)", marginBottom: "6px" }}>
            ZIP code — so we can tell you what&rsquo;s available near you.
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
        </div>
      )}

      {device && problem && (
        <div className="selector-next">
          <button
            type="button"
            className="btn btn-primary"
            disabled={submitState === "submitting" || submitState === "done"}
            onClick={handleContinue}
          >
            Continue
          </button>
          {submitState === "done" && (
            <p className="selector-note" role="status">
              Got it — request recorded. CPRNME is still early: this tells us there&rsquo;s
              real demand for a repair like yours in your area, but the next step —
              confirming and scheduling an actual repair — isn&rsquo;t live yet.
            </p>
          )}
          {submitState === "error" && (
            <p className="selector-note" role="alert">
              Something went wrong recording your request. Please try again.
            </p>
          )}
        </div>
      )}

      {submitState === "done" && resolution?.outcome === "fixed_price" && (
        <div className="selector-step fixed-price-result">
          <h3>Your price</h3>
          <p className="fixed-price-amount">
            {problem?.label} — {formatPrice(resolution.priceCents)}
          </p>
          <p style={{ color: "var(--cp-ink-soft)", fontSize: "13.5px" }}>
            Scheduling for fixed-price repairs isn&rsquo;t live yet — this is the
            real, approved price for your exact model once it is.
          </p>
        </div>
      )}

      {submitState === "done" && resolution?.outcome === "diagnostic" && intentId && quoteState !== "done" && (
        <div className="selector-step quote-request">
          <h3>Want a real quote for this?</h3>
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
              onClick={handleQuoteRequest}
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
      {quoteState === "done" && (
        <p className="selector-note" role="status">
          Thanks — we&rsquo;ll be in touch soon with your repair options.
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
