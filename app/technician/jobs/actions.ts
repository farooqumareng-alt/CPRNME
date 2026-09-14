"use server";

// Server Action for the technician job-status update. Uses
// requireTechnicianSession() (not requireAdminSession()) — a technician
// is a real, distinct role, not a lesser admin. setTechnicianJobStatus()
// itself is the actual authorization boundary (scoped to jobs assigned to
// this technician), not just this page's own filtering — see
// lib/technicians-data.ts.
import { revalidatePath } from "next/cache";
import { requireTechnicianSession } from "@/lib/supabase-session";
import { setTechnicianJobStatus, type TechnicianStatus } from "@/lib/technicians-data";
import { logJobEvent } from "@/lib/job-events";

const VALID_STATUSES = new Set(["en_route", "in_progress", "done"]);

export async function updateJobStatusAction(formData: FormData) {
  const technician = await requireTechnicianSession();
  if (!technician) throw new Error("Not authenticated");

  const bookingId = String(formData.get("bookingId"));
  const status = String(formData.get("status"));
  if (!VALID_STATUSES.has(status)) throw new Error("Invalid status");

  const { error } = await setTechnicianJobStatus(bookingId, technician.user_id, status as TechnicianStatus);
  if (error) throw new Error(error.message);
  await logJobEvent({
    eventType: "technician_status_changed",
    actorType: "technician",
    actorId: technician.user_id,
    bookingId,
    eventData: { status },
  });
  revalidatePath("/technician/jobs");
}
