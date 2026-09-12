"use client";

import { useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { track } from "@vercel/analytics";
import { getAnonSessionId } from "@/lib/session-id";

// ---- Data -------------------------------------------------------------
// `followUp` is defined in the type but never populated here on purpose:
// Phase 2 correction #4 asks the component to be *architected* for
// diagnostic branching ("won't charge" -> "intermittent or total?" -> ...)
// without actually building that engine yet. Adding branching later means
// filling this field in, not restructuring the component.
type FollowUp = { question: string; options: string[] };
type Problem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  followUp?: FollowUp;
};

const devices = [
  { id: "iphone", label: "iPhone" },
  { id: "android", label: "Samsung / Android" },
  { id: "tablet", label: "iPad / Tablet" },
  { id: "other", label: "Something else" },
] as const;

const problems: Problem[] = [
  { id: "screen", label: "Screen is cracked", icon: <ScreenIcon /> },
  { id: "charging", label: "Won't charge", icon: <ChargeIcon /> },
  { id: "battery", label: "Battery drains fast", icon: <BatteryIcon /> },
  { id: "power", label: "Won't turn on", icon: <PowerIcon /> },
  { id: "water", label: "Water damage", icon: <WaterIcon /> },
  { id: "camera", label: "Camera issue", icon: <CameraIcon /> },
  { id: "other", label: "Something else", icon: <OtherIcon /> },
];

// Reads ?device=&problem= itself (via useSearchParams) rather than taking
// them as server-passed props. That keeps "/" statically prerendered: a
// server component reading `searchParams` forces the whole route to
// server-render on every request, which is exactly the "fully static"
// property Phase 3 called out as a performance win. The trade-off is this
// component needs a <Suspense> boundary around it (see app/page.tsx) — the
// fallback there mirrors step 1's unselected markup so there's nothing to
// visually flash past.
type SubmitState = "idle" | "submitting" | "done" | "error";

export function ProblemSelector() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const requestedDevice = searchParams.get("device");
  const requestedProblem = searchParams.get("problem");
  const validDevice = devices.some((d) => d.id === requestedDevice) ? requestedDevice : null;
  const validProblem = problems.some((p) => p.id === requestedProblem) ? requestedProblem : null;
  const [deviceId, setDeviceId] = useState<string | null>(validDevice);
  const [problemId, setProblemId] = useState<string | null>(validProblem);
  const [zip, setZip] = useState("");
  const [zipError, setZipError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const device = devices.find((d) => d.id === deviceId);
  const problem = problems.find((p) => p.id === problemId);

  async function handleContinue() {
    const trimmedZip = zip.trim();
    if (!/^\d{5}$/.test(trimmedZip)) {
      setZipError("Enter a valid 5-digit ZIP code.");
      return;
    }
    setZipError(null);
    setSubmitState("submitting");
    track("repair_intent_submitted", {
      device: deviceId ?? "unknown",
      problem: problemId ?? "unknown",
      zip: trimmedZip,
    });
    try {
      const res = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device: deviceId,
          problem: problemId,
          zip: trimmedZip,
          sourcePage: pathname || "/",
          sessionId: getAnonSessionId(),
        }),
      });
      setSubmitState(res.ok ? "done" : "error");
    } catch {
      setSubmitState("error");
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
                track("device_selected", { device: d.id });
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {device && (
        <div className="selector-step">
          <h3>2. What&rsquo;s wrong with it?</h3>
          <div className="problem-grid" role="group" aria-label="Choose the problem">
            {problems.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`problem-card${problemId === p.id ? " selected" : ""}`}
                aria-pressed={problemId === p.id}
                onClick={() => {
                  setProblemId(p.id);
                  setSubmitState("idle");
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
          <h3>3. Where are you located?</h3>
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
              Got it — request recorded. This is a design preview, so the connection
              that completes your booking isn&rsquo;t live yet. That comes online in a
              later phase.
            </p>
          )}
          {submitState === "error" && (
            <p className="selector-note" role="alert">
              Something went wrong recording your request. Please try again.
            </p>
          )}
        </div>
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
