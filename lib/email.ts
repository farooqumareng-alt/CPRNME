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
import { businessInfo, getFulfillmentCredit } from "@/content/business-info";

const FROM_ADDRESS = "CPRNME <notifications@cprnme.com>";

// notifications@cprnme.com is a sending-only identity — nobody reads that
// inbox. Every email sets Reply-To to the one address that IS actually
// monitored, so hitting "Reply" on any CPRNME email (an admin replying to
// their own alert, or a customer replying to a confirmation) lands
// somewhere real instead of vanishing. Overridable per-send for the rare
// case a different reply destination is genuinely correct.
export async function sendEmail(input: { to: string; subject: string; html: string; replyTo?: string }): Promise<{ ok: boolean; error?: string }> {
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
        text: htmlToText(input.html),
        reply_to: input.replyTo ?? ADMIN_ALERT_EMAIL,
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
// deliberate, confirmed choice, not an oversight: FixVise operates CPRNME
// internally even though the two are public-facing separate brands. See
// memory/fixvise-not-part-of-cprnme.md — the public-facing separation rule
// this doesn't touch still fully applies to every customer-facing email
// built in this file (no FixVise name or branding in renderEmailShell()).
export const ADMIN_ALERT_EMAIL = "fixvise@gmail.com";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Crude but effective plain-text fallback: every mail client that renders
// `html` also gets a real `text` alternative instead of Resend synthesizing
// one from raw markup. Good enough for the simple <p>/<strong> content
// every template here produces — not meant to handle arbitrary HTML.
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// The one visual identity every CPRNME email shares — same graphite/silver
// palette as the live site (app/globals.css's --cp-* tokens), reused here
// rather than invented fresh, and the same "styled wordmark, no image" logo
// treatment the site itself uses (components/SiteHeader.tsx has no logo
// graphic either — there isn't a real logo asset in this project to embed,
// and a fabricated one would be less honest than matching what's already
// live). Built as HTML tables, not flexbox/grid — the only layout method
// that renders consistently across Outlook, Gmail, and mobile mail clients.
const INK = "#202124";
const INK_SOFT = "#55565a";
const INK_FAINT = "#8a8b90";
const BG = "#f5f5f6";
const SURFACE = "#ffffff";
const LINE = "#e3e3e5";
const ACCENT = "#2e2f33";

export function renderEmailShell(input: { preheader: string; heading: string; bodyHtml: string; showFulfillmentCredit?: boolean }): string {
  const credit = input.showFulfillmentCredit ? getFulfillmentCredit() : null;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charSet="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(input.heading)}</title>
</head>
<body style="margin:0; padding:0; background-color:${BG}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${escapeHtml(input.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:${SURFACE}; border-radius:12px; overflow:hidden; border:1px solid ${LINE};">
          <tr>
            <td style="background-color:${ACCENT}; padding:22px 28px;">
              <span style="font-size:20px; font-weight:800; letter-spacing:2px; color:#ffffff; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                CPRNME
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 8px;">
              <h1 style="margin:0 0 18px; font-size:19px; font-weight:700; color:${INK};">${escapeHtml(input.heading)}</h1>
              <div style="font-size:15px; line-height:1.6; color:${INK};">
                ${input.bodyHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 28px;">
              <hr style="border:none; border-top:1px solid ${LINE}; margin:0 0 20px;" />
              <p style="margin:0 0 4px; font-size:13px; color:${INK_SOFT}; font-weight:600;">${escapeHtml(businessInfo.fullName)}</p>
              <p style="margin:0; font-size:13px; color:${INK_SOFT};">
                <a href="tel:${businessInfo.phone.e164}" style="color:${INK_SOFT}; text-decoration:none;">${escapeHtml(businessInfo.phone.display)}</a>
                &nbsp;·&nbsp;
                <a href="${businessInfo.siteUrl}" style="color:${INK_SOFT}; text-decoration:none;">${businessInfo.domain}</a>
              </p>
              ${
                credit
                  ? `<p style="margin:14px 0 0; font-size:11px; color:${INK_FAINT};"><a href="${credit.href}" style="color:${INK_FAINT}; text-decoration:none;">${escapeHtml(credit.text)}</a></p>`
                  : ""
              }
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export { escapeHtml };
