"use server";

// Customer self-service cancel — authorized purely by possessing the
// unguessable token in the URL, same as the reschedule API route. No
// admin session check here on purpose: this page has no login system,
// the token itself is the credential.
import { revalidatePath } from "next/cache";
import { cancelBookingByToken } from "@/lib/bookings-data";
import { logJobEvent } from "@/lib/job-events";

export async function cancelBookingAction(formData: FormData) {
  const token = String(formData.get("token"));
  const { data, error } = await cancelBookingByToken(token);
  if (!error && data) {
    await logJobEvent({
      eventType: "booking_cancelled_by_customer",
      actorType: "customer",
      intentEventId: data.intent_event_id,
      bookingId: data.id,
    });
  }
  if (error) {
    // Surfaced as a thrown error — Next renders this via the nearest
    // error boundary; acceptable for a rare edge case (already cancelled,
    // already completed) on a low-traffic self-service page.
    throw new Error(
      error.message?.includes("ALREADY_COMPLETED")
        ? "This repair is already marked completed and can't be cancelled here — call us instead."
        : "This booking can't be cancelled — it may already be cancelled."
    );
  }
  revalidatePath(`/manage-booking/${token}`);
}
