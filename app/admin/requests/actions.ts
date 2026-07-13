"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Only admins can do this");
  return { supabase, adminId: user.id };
}

export async function approveRequest(formData: FormData) {
  const { supabase, adminId } = await requireAdmin();
  const requestId = formData.get("request_id") as string;

  const { error } = await supabase
    .from("requests")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", requestId);
  if (error) throw new Error(error.message);

  await supabase.from("request_events").insert({
    request_id: requestId,
    actor_id: adminId,
    action: "approved",
  });

  revalidatePath("/admin/requests");
  revalidatePath(`/admin/requests/${requestId}`);
}

export async function rejectRequest(formData: FormData) {
  const { supabase, adminId } = await requireAdmin();
  const requestId = formData.get("request_id") as string;
  const reason = formData.get("reason") as string;

  if (!reason || !reason.trim()) {
    throw new Error("A reason is required to reject a request");
  }

  const { error } = await supabase
    .from("requests")
    .update({ status: "rejected", admin_note: reason, updated_at: new Date().toISOString() })
    .eq("id", requestId);
  if (error) throw new Error(error.message);

  await supabase.from("request_events").insert({
    request_id: requestId,
    actor_id: adminId,
    action: "rejected",
    note: reason,
  });

  revalidatePath("/admin/requests");
  revalidatePath(`/admin/requests/${requestId}`);
}

export async function requestMoreInfo(formData: FormData) {
  const { supabase, adminId } = await requireAdmin();
  const requestId = formData.get("request_id") as string;
  const note = formData.get("note") as string;

  if (!note || !note.trim()) {
    throw new Error("A note is required");
  }

  const { error } = await supabase
    .from("requests")
    .update({ status: "needs_info", admin_note: note, updated_at: new Date().toISOString() })
    .eq("id", requestId);
  if (error) throw new Error(error.message);

  await supabase.from("request_events").insert({
    request_id: requestId,
    actor_id: adminId,
    action: "requested_info",
    note,
  });

  revalidatePath("/admin/requests");
  revalidatePath(`/admin/requests/${requestId}`);
}
