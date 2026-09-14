"use client";

// Client-side reschedule form only — the rest of the manage-booking page
// is server-rendered. Splits into two very different flows depending on
// the booking's status (mirrors the split in components/ProblemSelector.tsx
// between the real-time and request-based booking steps):
//   - 'confirmed': a real committed slot. Reschedule shows LIVE
//     availability (same /api/slot-availability the real-time path uses)
//     and re-checks capacity atomically on submit.
//   - 'requested': not yet a committed slot (always the out-of-radius
//     path — real-time bookings never sit in 'requested'). Reschedule is
//     just a coarse date + morning/afternoon/evening preference, no
//     capacity check, matching what the original request flow collected.
import { useState } from "react";

type SlotAvailability = { window: string; label: string; bookedCount: number; capacity: number; full: boolean };

const coarseWindows = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
];

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function maxAdvanceISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ManageBookingClient({
  token,
  isConfirmed,
  maxAdvanceDays,
}: {
  token: string;
  isConfirmed: boolean;
  maxAdvanceDays: number;
}) {
  const [mode, setMode] = useState<"idle" | "reschedule">("idle");
  const [date, setDate] = useState("");
  const [coarseWindow, setCoarseWindow] = useState<string | null>(null);
  const [preciseWindow, setPreciseWindow] = useState<string | null>(null);
  const [availability, setAvailability] = useState<SlotAvailability[] | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function loadAvailability(d: string) {
    setLoadingAvailability(true);
    setPreciseWindow(null);
    try {
      const res = await fetch(`/api/slot-availability?date=${d}`);
      const data = await res.json().catch(() => null);
      setAvailability(res.ok && Array.isArray(data?.availability) ? data.availability : null);
    } catch {
      setAvailability(null);
    } finally {
      setLoadingAvailability(false);
    }
  }

  async function submit() {
    if (!date) {
      setError("Pick a date.");
      return;
    }
    const selectedWindow = isConfirmed ? preciseWindow : coarseWindow;
    if (!selectedWindow) {
      setError("Pick a time.");
      return;
    }
    setError(null);
    setSubmitState("submitting");
    try {
      const res = await fetch(`/api/manage-booking/${token}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, window: selectedWindow }),
      });
      if (res.ok) {
        setSubmitState("done");
        setTimeout(() => location.reload(), 1200);
      } else if (res.status === 409) {
        setError("That time just filled up — pick a different one.");
        setSubmitState("error");
        loadAvailability(date);
      } else {
        const data = await res.json().catch(() => null);
        setError(typeof data?.error === "string" ? data.error : "Something went wrong. Please try again.");
        setSubmitState("error");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitState("error");
    }
  }

  if (mode === "idle") {
    return (
      <button type="button" className="btn btn-secondary" onClick={() => setMode("reschedule")}>
        Reschedule
      </button>
    );
  }

  if (submitState === "done") {
    return (
      <p className="selector-note" role="status">
        Updated — refreshing…
      </p>
    );
  }

  return (
    <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--cp-line)" }}>
      <label htmlFor="reschedule-date" style={{ display: "block", fontSize: "13.5px", color: "var(--cp-ink-soft)", marginBottom: "6px" }}>
        New date
      </label>
      <input
        id="reschedule-date"
        type="date"
        min={todayISO()}
        max={isConfirmed ? maxAdvanceISO(maxAdvanceDays) : undefined}
        className="zip-input"
        style={{ width: "170px" }}
        value={date}
        onChange={(e) => {
          const d = e.target.value;
          setDate(d);
          setError(null);
          if (isConfirmed && d) loadAvailability(d);
        }}
      />

      {isConfirmed ? (
        date && (
          <div style={{ marginTop: "12px" }}>
            <p style={{ fontSize: "13.5px", color: "var(--cp-ink-soft)", marginBottom: "6px" }}>Available times</p>
            {loadingAvailability && <p style={{ fontSize: "13.5px", color: "var(--cp-ink-faint)" }}>Loading…</p>}
            {!loadingAvailability && availability && (
              <div className="chip-row" role="group" aria-label="Choose a new time">
                {availability.map((s) => (
                  <button
                    key={s.window}
                    type="button"
                    disabled={s.full}
                    className={`chip${preciseWindow === s.window ? " selected" : ""}`}
                    style={s.full ? { opacity: 0.45, cursor: "not-allowed", textDecoration: "line-through" } : undefined}
                    onClick={() => {
                      setPreciseWindow(s.window);
                      setError(null);
                    }}
                  >
                    {s.label}
                    {s.full ? " — Full" : ""}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      ) : (
        <div className="chip-row" role="group" aria-label="Choose a new preferred time of day" style={{ marginTop: "12px" }}>
          {coarseWindows.map((w) => (
            <button
              key={w.id}
              type="button"
              className={`chip${coarseWindow === w.id ? " selected" : ""}`}
              onClick={() => {
                setCoarseWindow(w.id);
                setError(null);
              }}
            >
              {w.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: "14px", display: "flex", gap: "8px" }}>
        <button type="button" className="btn btn-primary" disabled={submitState === "submitting"} onClick={submit}>
          {submitState === "submitting" ? "Saving…" : "Save new time"}
        </button>
        <button type="button" className="btn btn-tertiary" onClick={() => setMode("idle")}>
          Cancel
        </button>
      </div>
      {error && (
        <p role="alert" style={{ color: "var(--cp-error)", fontSize: "13.5px", marginTop: "8px" }}>
          {error}
        </p>
      )}
    </div>
  );
}
