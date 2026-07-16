"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

function downloadCsv(filename: string, rows: Record<string, any>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const STATUS_COLOR: Record<string, string> = {
  pending: "text-slate-400 border-slate-600",
  needs_info: "text-amber-400 border-amber-600",
  approved: "text-ok border-[#2E7D5B]",
  rejected: "text-danger border-[#B3432E]",
  procurement_in_progress: "text-amber-400 border-amber-600",
  completed: "text-ok border-[#2E7D5B]",
};

type HistoryRow = {
  id: string;
  date: string;
  vehicle: string;
  driver: string;
  type: string;
  status: string;
  odometer: number;
  amount: number;
};

export default function ReportView({
  vehicleWise,
  expenseWise,
  monthly,
  ytdTotal,
  driverWise,
  exportRows,
  typeLabels,
  allHistory,
}: {
  vehicleWise: { plate: string; total: number; byType: Record<string, number> }[];
  expenseWise: { type: string; label: string; total: number }[];
  monthly: { month: string; total: number }[];
  ytdTotal: number;
  driverWise: { name: string; spend: number; requestCount: number; approved: number; rejected: number }[];
  exportRows: { date: string; vehicle: string; driver: string; type: string; amount: number }[];
  typeLabels: Record<string, string>;
  allHistory: HistoryRow[];
}) {
  const maxMonthly = Math.max(1, ...monthly.map((m) => m.total));

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredHistory = useMemo(() => {
    return allHistory.filter((h) => {
      if (statusFilter !== "all" && h.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${h.vehicle} ${h.driver} ${h.type}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [allHistory, search, statusFilter]);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-slate-100 mb-1">Reports</h1>
          <p className="text-slate-500 text-sm">Summary figures below are based on completed transactions</p>
        </div>
        <button
          onClick={() => downloadCsv("fleet-transactions.csv", exportRows)}
          className="text-sm rounded-md border border-slate-700 text-slate-300 px-4 py-2 hover:border-amber-500 hover:text-amber-400 transition-colors"
        >
          Export completed to CSV
        </button>
      </div>

      {/* Monthly / YTD */}
      <section>
        <h2 className="text-slate-300 text-sm font-medium mb-1">Monthly spend (this year)</h2>
        <p className="text-slate-500 text-xs mb-3">
          Year-to-date total: {ytdTotal.toLocaleString()}
        </p>
        {monthly.length === 0 ? (
          <p className="text-slate-500 text-sm">No completed transactions yet this year.</p>
        ) : (
          <div className="space-y-1.5">
            {monthly.map((m) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-slate-500 text-xs w-8">{m.month}</span>
                <div className="flex-1 bg-slate-800 rounded h-5 relative overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded"
                    style={{ width: `${(m.total / maxMonthly) * 100}%` }}
                  />
                </div>
                <span className="text-slate-300 text-xs w-20 text-right">
                  {m.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Expense-wise */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-slate-300 text-sm font-medium">Spend by category</h2>
          <button
            onClick={() =>
              downloadCsv(
                "spend-by-category.csv",
                expenseWise.map((e) => ({ category: e.label, total: e.total }))
              )
            }
            className="text-xs text-amber-500 hover:text-amber-400"
          >
            Export CSV
          </button>
        </div>
        {expenseWise.length === 0 ? (
          <p className="text-slate-500 text-sm">No completed transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {expenseWise.map((e) => (
              <div
                key={e.type}
                className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 flex items-center justify-between text-sm"
              >
                <span className="text-slate-300">{e.label}</span>
                <span className="text-slate-100 font-medium">{e.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Vehicle-wise */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-slate-300 text-sm font-medium">Spend by vehicle</h2>
          <button
            onClick={() =>
              downloadCsv(
                "spend-by-vehicle.csv",
                vehicleWise.map((v) => ({
                  vehicle: v.plate,
                  total: v.total,
                  ...Object.fromEntries(
                    Object.entries(v.byType).map(([k, val]) => [typeLabels[k] ?? k, val])
                  ),
                }))
              )
            }
            className="text-xs text-amber-500 hover:text-amber-400"
          >
            Export CSV
          </button>
        </div>
        {vehicleWise.length === 0 ? (
          <p className="text-slate-500 text-sm">No completed transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {vehicleWise.map((v) => (
              <div key={v.plate} className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-slate-100 font-medium">{v.plate}</span>
                  <span className="text-slate-100 font-medium">{v.total.toLocaleString()}</span>
                </div>
                <p className="text-slate-500 text-xs">
                  {Object.entries(v.byType)
                    .map(([type, amt]) => `${typeLabels[type] ?? type}: ${amt.toLocaleString()}`)
                    .join(" · ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Driver-wise */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-slate-300 text-sm font-medium">Spend by driver</h2>
          <button
            onClick={() =>
              downloadCsv(
                "spend-by-driver.csv",
                driverWise.map((d) => ({
                  driver: d.name,
                  spend: d.spend,
                  request_count: d.requestCount,
                  approved: d.approved,
                  rejected: d.rejected,
                }))
              )
            }
            className="text-xs text-amber-500 hover:text-amber-400"
          >
            Export CSV
          </button>
        </div>
        {driverWise.length === 0 ? (
          <p className="text-slate-500 text-sm">No requests yet.</p>
        ) : (
          <div className="space-y-2">
            {driverWise.map((d) => (
              <div key={d.name} className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-100 font-medium">{d.name}</span>
                  <span className="text-slate-100 font-medium">{d.spend.toLocaleString()}</span>
                </div>
                <p className="text-slate-500 text-xs">
                  {d.requestCount} requests · {d.approved} approved · {d.rejected} rejected
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Full browsable history — every request, any status */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-slate-300 text-sm font-medium">Full history</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {filteredHistory.length} of {allHistory.length} requests
            </p>
          </div>
          <button
            onClick={() =>
              downloadCsv(
                "full-history.csv",
                filteredHistory.map((h) => ({
                  date: h.date,
                  vehicle: h.vehicle,
                  driver: h.driver,
                  type: h.type,
                  status: h.status,
                  odometer: h.odometer,
                  amount: h.amount,
                }))
              )
            }
            className="text-xs text-amber-500 hover:text-amber-400"
          >
            Export shown to CSV
          </button>
        </div>

        <div className="flex gap-3 mb-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vehicle, driver, or type"
            className="flex-1 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="needs_info">Needs info</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="space-y-2">
          {filteredHistory.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-8">No matching requests.</p>
          )}
          {filteredHistory.map((h) => (
            <Link
              key={h.id}
              href={`/admin/requests/${h.id}`}
              className="block bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 hover:border-amber-500 transition-colors"
            >
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-slate-100 font-medium">{h.type}</span>
                  <span className="text-slate-500"> · {h.vehicle}</span>
                </div>
                <span className={`text-xs border rounded-full px-2.5 py-1 ${STATUS_COLOR[h.status]}`}>
                  {h.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span>{h.driver} · {h.date}</span>
                <span>{h.odometer?.toLocaleString()} km · {h.amount ? h.amount.toLocaleString() : "—"}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
