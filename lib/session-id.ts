// Anonymous demand-tracking id — no PII, no account, nothing tied to a real
// identity. Persisted in localStorage (not sessionStorage) so that repeat
// visits from the same browser can be grouped/deduplicated, which is the
// stated purpose of the session_id column. Never sent anywhere except our
// own /api/intent route.
const STORAGE_KEY = "cprnme_anon_id";

export function getAnonSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    // Storage blocked (private mode, etc.) — fall back to a per-call id
    // rather than throwing. Demand data still records; dedup just won't
    // span multiple visits from this visitor.
    return crypto.randomUUID();
  }
}
