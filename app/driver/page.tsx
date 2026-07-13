import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  needs_info: "Needs info",
  approved: "Approved",
  rejected: "Rejected",
  procurement_in_progress: "Procurement in progress",
  completed: "Completed",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "text-slate-400 border-slate-600",
  needs_info: "text-amber-400 border-amber-600",
  approved: "text-ok border-[#2E7D5B]",
  rejected: "text-danger border-[#B3432E]",
  procurement_in_progress: "text-amber-400 border-amber-600",
  completed: "text-ok border-[#2E7D5B]",
};

export default async function DriverHome() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, plate_number, make, model, current_odometer")
