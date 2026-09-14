"use server";

// Server Actions for admin technician management. Each re-checks the
// admin session independently — proxy.ts already blocks /admin/*, but per
// the defense-in-depth pattern used everywhere else in this project, a
// mutation never trusts the edge check alone.
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase-session";
import { createTechnician, setTechnicianActive } from "@/lib/technicians-data";
import { sendEmail, renderEmailShell, escapeHtml } from "@/lib/email";

async function requireAdmin() {
  const user = await requireAdminSession();
  if (!user) throw new Error("Not authenticated");
}

// A real, random temporary password — never chosen by admin, never typed
// anywhere, only ever transmitted once via the credentials email below.
function generateTempPassword(): string {
  return randomBytes(12).toString("base64url");
}

export async function createTechnicianAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  if (!name || !email) throw new Error("Name and email are required");

  const password = generateTempPassword();
  const { data: technician, error } = await createTechnician({ name, email, phone, password });
  if (error || !technician) {
    throw new Error(error?.message ?? "Could not create technician account");
  }

  // Real login credentials, sent once, via this project's own verified
  // email path — not Supabase's own auth email, which hasn't been
  // configured/verified for this project.
  await sendEmail({
    to: email,
    subject: "Your CPRNME technician login",
    html: renderEmailShell({
      preheader: "Your technician panel login for CPRNME",
      heading: "Welcome to CPRNME",
      showFulfillmentCredit: false,
      bodyHtml: `
        <p style="margin:0 0 18px;">You've been added as a technician. Here's how to sign in:</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; background-color:#f5f5f6; border-radius:8px; margin:0 0 18px;">
          <tr><td style="padding:16px 18px;">
            <p style="margin:0 0 4px; font-size:13px; color:#55565a;">Email</p>
            <p style="margin:0 0 12px; font-size:15px; font-weight:700;">${escapeHtml(email)}</p>
            <p style="margin:0 0 4px; font-size:13px; color:#55565a;">Temporary password</p>
            <p style="margin:0; font-size:15px; font-weight:700; font-family:monospace;">${escapeHtml(password)}</p>
          </td></tr>
        </table>
        <p style="margin:0 0 18px;">Sign in and change this password as soon as you can.</p>
        <p style="margin:0;"><a href="https://www.cprnme.com/admin/login?redirect=/technician/jobs" style="display:inline-block; padding:10px 18px; background-color:#2e2f33; color:#ffffff; border-radius:6px; text-decoration:none; font-weight:600; font-size:14px;">Sign in</a></p>
      `,
    }),
  });

  revalidatePath("/admin/technicians");
}

export async function setTechnicianActiveAction(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId"));
  const active = formData.get("active") === "true";
  const { error } = await setTechnicianActive(userId, active);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/technicians");
}
