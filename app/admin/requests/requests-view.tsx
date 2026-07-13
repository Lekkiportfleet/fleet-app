"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const TYPE_LABEL: Record<string, string> = {
  fuel: "Fuel",
  tyre: "Tyre",
  maintenance: "Maintenance / Repair",
  service: "Service",
  spare_part: "Spare part",
  other: "Other",
};

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

type Row = {
  id: string;
  type: string;
  status: string;
  odometer: number;
  estimatedAmount: number | null;
  createdAt: string;
  plate: string;
  driver: string;
};

export default function RequestsView({ requests }: { requests: Row[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("open"); // "open" = pending + needs_info, or "all", or a specific status

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (status === "open" && !(r.status === "pending" || r.status === "needs_info")) return false;
      if (status !== "open" && status !== "all" && r.status !== status) return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${r.plate} ${r.driver} ${TYPE_LABEL[r.type] ?? r.type}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [requests, search, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-slate-100 mb-1">Requests</h1>
        <p className="text-slate-500 text-sm">{filtered.length} shown of {requests.length} total</p>
      </div>

      <div className="flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by plate, driver, or type"
          className="flex-1 rounded-md bg-slate-800 border border-slate-700 px-3 py-2.5 text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-500"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2.5 text-slate-100 outline-none focus:border-amber-500"
        >
          <option value="open">Open (pending + needs info)</option>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="needs_info">Needs info</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-10">
            No requests match your search.
          </p>
        )}
        {filtered.map((r) => (
          <Link
            key={r.id}
            href={`/admin/requests/${r.id}`}
            className="block bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-amber-500 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-100 font-medium">
                  {TYPE_LABEL[r.type] ?? r.type} · {r.plate}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {r.driver} · {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`text-xs border rounded-full px-2.5 py-1 ${STATUS_COLOR[r.status]}`}>
                {STATUS_LABEL[r.status]}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
