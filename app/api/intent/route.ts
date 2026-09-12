import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { findByZip } from "@/content/dfw-territory";
import { getDeviceModel, getModelsForFamily, type DeviceFamily } from "@/content/device-catalog";
import { problems } from "@/content/repair-taxonomy";

// This route is the ONLY writer to repair_intent_events. A row here means a
// real visitor supplied device + problem + a validly formatted ZIP and hit
// Continue — see components/ProblemSelector.tsx for the one call site.
// Do not call this from anywhere that fires on a page view, a device tap
// alone, or a problem tap alone: those are not demand events (see the
// CPRNME Demand Intelligence Audit, "what constitutes a demand event").

const ZIP_RE = /^\d{5}$/;

// Device families mirror the option ids in ProblemSelector.tsx, so a
// scripted POST can't stuff an arbitrary string into device. Problems come
// from content/repair-taxonomy.ts, the same single source of truth the
// selector and the resolution engine both read.
const VALID_DEVICES = new Set(["iphone", "android", "tablet", "other"]);
const VALID_PROBLEMS = new Set(problems.map((p) => p.id));

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { device, deviceModel, problem, zip, sourcePage, sessionId } = body as Record<string, unknown>;

  if (typeof device !== "string" || !VALID_DEVICES.has(device)) {
    return NextResponse.json({ error: "Invalid or missing device" }, { status: 400 });
  }
  if (typeof problem !== "string" || !VALID_PROBLEMS.has(problem)) {
    return NextResponse.json({ error: "Invalid or missing problem" }, { status: 400 });
  }
  // Optional — "I don't know my model" and device family "other" both
  // legitimately submit no model. When present, it must be a real catalog
  // entry that actually belongs to the chosen device family; anything else
  // is dropped to null rather than trusted, same principle as ?from=.
  let validatedDeviceModel: string | null = null;
  if (deviceModel !== undefined && deviceModel !== null) {
    if (typeof deviceModel !== "string") {
      return NextResponse.json({ error: "Invalid deviceModel" }, { status: 400 });
    }
    const modelRecord = getDeviceModel(deviceModel);
    const family = device as DeviceFamily;
    const belongsToFamily = modelRecord && getModelsForFamily(family).some((m) => m.id === modelRecord.id);
    if (modelRecord && belongsToFamily) {
      validatedDeviceModel = modelRecord.id;
    }
  }
  if (typeof zip !== "string" || !ZIP_RE.test(zip)) {
    return NextResponse.json({ error: "ZIP code must be exactly 5 digits" }, { status: 400 });
  }
  if (typeof sourcePage !== "string" || sourcePage.length === 0 || sourcePage.length > 300) {
    return NextResponse.json({ error: "Invalid or missing sourcePage" }, { status: 400 });
  }
  if (typeof sessionId !== "string" || sessionId.length === 0 || sessionId.length > 200) {
    return NextResponse.json({ error: "Invalid or missing sessionId" }, { status: 400 });
  }

  // Best-effort, honest city resolution: only filled in when the ZIP is a
  // real match in our sourced DFW dataset. A ZIP outside that dataset is
  // still recorded (that's real signal — maybe demand outside current
  // territory) but city is left null rather than guessed.
  const match = findByZip(zip);
  const city = match?.city ?? null;

  const supabase = getSupabaseAdmin();

  // Best-effort duplicate guard: a double-click or a page double-submit
  // shouldn't count as two separate repair requests. This does not merge or
  // discard genuinely separate requests — only an identical
  // (session, zip, device, problem) submission within the last 10 seconds.
  const tenSecondsAgo = new Date(Date.now() - 10_000).toISOString();
  // device_model is part of what makes a request "the same" too — a
  // resubmission that only differs by exact model is a genuinely different
  // request, not a double-click, so it must not be silently deduped away.
  let dedupQuery = supabase
    .from("repair_intent_events")
    .select("id")
    .eq("session_id", sessionId)
    .eq("zip_code", zip)
    .eq("device", device)
    .eq("problem", problem)
    .gte("created_at", tenSecondsAgo);
  dedupQuery = validatedDeviceModel
    ? dedupQuery.eq("device_model", validatedDeviceModel)
    : dedupQuery.is("device_model", null);
  const { data: recent } = await dedupQuery.limit(1);

  if (recent && recent.length > 0) {
    // Still return the existing row's id — a visitor who double-submits and
    // then asks for a quote right after needs a real intent_event_id to
    // attach it to, same as a fresh insert would give them.
    return NextResponse.json({ ok: true, deduped: true, id: recent[0].id }, { status: 200 });
  }

  const { data: inserted, error } = await supabase
    .from("repair_intent_events")
    .insert({
      session_id: sessionId,
      zip_code: zip,
      city,
      device,
      device_model: validatedDeviceModel,
      problem,
      source_page: sourcePage,
      event_type: "repair_intent",
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("Failed to record repair-intent event:", error?.message);
    return NextResponse.json({ error: "Could not record request" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: inserted.id }, { status: 201 });
}
