import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/supabase-session";
import { listTechnicians } from "@/lib/technicians-data";
import { createTechnicianAction, setTechnicianActiveAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminTechniciansPage() {
  const user = await requireAdminSession();
  if (!user) redirect("/admin/login?redirect=/admin/technicians");

  const technicians = await listTechnicians();

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--cp-ink-faint)" }}>
          CPRNME Admin
        </span>
        <nav style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 13 }}>
          <a href="/admin">Today</a>
          <a href="/admin/demand">Demand</a>
          <a href="/admin/pricing">Pricing</a>
          <a href="/admin/quotes">Quotes</a>
          <a href="/admin/bookings">Bookings</a>
          <a href="/admin/revenue">Revenue</a>
          <a href="/admin/taxonomy">Taxonomy</a>
          <form action="/admin/logout" method="POST">
            <button type="submit" className="btn btn-secondary" style={{ fontSize: 13, padding: "6px 14px" }}>
              Log out
            </button>
          </form>
        </nav>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 20 }}>Technicians</h1>
      <p style={{ color: "var(--cp-ink-soft)", fontSize: 13.5, marginTop: 4, maxWidth: "62ch" }}>
        Real accounts with their own login — a technician only ever sees jobs assigned to them in{" "}
        <code>/technician/jobs</code>, never the rest of this admin panel.
      </p>

      <form
        action={createTechnicianAction}
        style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginTop: 20, padding: 16, border: "1.5px solid var(--cp-line)", borderRadius: 10 }}
      >
        <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
          Name
          <input name="name" required style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, width: 160 }} />
        </label>
        <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
          Email
          <input name="email" type="email" required style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, width: 200 }} />
        </label>
        <label style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
          Phone (optional)
          <input name="phone" type="tel" style={{ padding: "6px 8px", border: "1px solid var(--cp-line)", borderRadius: 6, width: 160 }} />
        </label>
        <button type="submit" className="btn btn-primary" style={{ fontSize: 13, padding: "8px 14px" }}>
          Add technician
        </button>
      </form>
      <p style={{ fontSize: 12.5, color: "var(--cp-ink-faint)", marginTop: 6 }}>
        A real login is created immediately and the technician is emailed a temporary password.
      </p>

      {technicians.length === 0 ? (
        <div style={{ marginTop: 24, padding: 24, border: "1.5px dashed var(--cp-line-strong)", borderRadius: 12, color: "var(--cp-ink-soft)" }}>
          <p style={{ fontWeight: 600, color: "var(--cp-ink)" }}>No technicians yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
          {technicians.map((t) => (
            <div
              key={t.user_id}
              style={{ border: "1.5px solid var(--cp-line)", borderRadius: 10, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}
            >
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</p>
                <p style={{ fontSize: 13, color: "var(--cp-ink-soft)", marginTop: 2 }}>
                  {t.email}
                  {t.phone ? ` · ${t.phone}` : ""}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: "var(--cp-accent-soft)",
                    color: t.active ? "var(--pass, #2f6f4f)" : "var(--cp-ink-faint)",
                  }}
                >
                  {t.active ? "Active" : "Inactive"}
                </span>
                <form action={setTechnicianActiveAction}>
                  <input type="hidden" name="userId" value={t.user_id} />
                  <input type="hidden" name="active" value={t.active ? "false" : "true"} />
                  <button type="submit" className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>
                    {t.active ? "Deactivate" : "Reactivate"}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
