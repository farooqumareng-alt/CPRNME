"use server";

// Server Action for adding a device to the knowledge graph. Re-checks the
// admin session independently — proxy.ts already blocks /admin/*, but per
// the defense-in-depth pattern used everywhere else in this project, a
// mutation never trusts the edge check alone.
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/supabase-session";
import { addDevice } from "@/lib/knowledge-graph-data";
import { logJobEvent } from "@/lib/job-events";

async function requireAdmin() {
  const user = await requireAdminSession();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function addDeviceAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  const family = String(formData.get("family") || "");
  const manufacturer = String(formData.get("manufacturer") || "").trim();
  const series = String(formData.get("series") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const isFoldable = formData.get("isFoldable") === "on";

  if (!id || !manufacturer || !series || !name) {
    throw new Error("All fields except foldable are required");
  }
  if (family !== "iphone" && family !== "android" && family !== "tablet") {
    throw new Error("Invalid family");
  }

  const { data, error } = await addDevice({ id, family, manufacturer, series, name, isFoldable });
  if (error) throw new Error(error.message);

  await logJobEvent({
    eventType: "device_added",
    actorType: "admin",
    actorId: admin.id,
    eventData: { deviceId: id, name, family, manufacturer, series },
  });

  revalidatePath("/admin/taxonomy");
}
