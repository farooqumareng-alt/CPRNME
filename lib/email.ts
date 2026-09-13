// Server-only email sending via Resend's HTTP API — no SDK dependency,
// since a single POST is all this project needs. Never import this from a
// "use client" component; RESEND_API_KEY is a secret, same handling as the
// Supabase keys (server-only env var, never NEXT_PUBLIC_-prefixed).
//
// Every call site treats a failed send as non-fatal: an admin alert email
// bouncing must never break the customer's actual booking/quote submission,
// and a customer confirmation email failing must never undo the real
// confirmation that already happened in the database. Failures are logged,
// not thrown.

const FROM_ADDRESS = "CPRNME <notifications@cprnme.com>";

export async function sendEmail(input: { to: string; subject: string; html: string }): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set — email not sent:", input.subject);
    return { ok: false, error: "RESEND_API_KEY not set" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Resend send failed:", res.status, body);
      return { ok: false, error: `Resend responded ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("Resend send threw:", err instanceof Error ? err.message : err);
    return { ok: false, error: "Network error sending email" };
  }
}

// Where new-request alerts go. Real customer data (contact info, device,
// problem, price) is sent here on every new booking/quote request — a
// deliberate exception to CPRNME's normal separation from FixVise,
// explicitly confirmed by the site owner, not an oversight. See
// memory/fixvise-not-part-of-cprnme.md for the general rule this overrides.
export const ADMIN_ALERT_EMAIL = "fixvise@gmail.com";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export { escapeHtml };
