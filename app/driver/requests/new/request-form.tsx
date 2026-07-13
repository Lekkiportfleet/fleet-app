"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRequest } from "../actions";

type RequestType = "fuel" | "tyre" | "maintenance" | "service" | "spare_part" | "other";

const TYPES: { value: RequestType; label: string }[] = [
  { value: "fuel", label: "Fuel" },
  { value: "tyre", label: "Tyre" },
  { value: "maintenance", label: "Maintenance / Repair" },
  { value: "service", label: "Service" },
  { value: "spare_part", label: "Spare part" },
  { value: "other", label: "Other" },
];

const inputClass =
  "w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2.5 text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-500";

// Shrinks a photo in the browser before upload — keeps requests fast to
// submit on a weak mobile connection.
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  const maxDim = 1600;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.75)
  );
  if (!blob) return file;

  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
    type: "image/jpeg",
  });
}

export default function RequestForm({
  vehicleId,
  lastOdometer,
}: {
  vehicleId: string;
  lastOdometer: number;
}) {
  const router = useRouter();
  const [type, setType] = useState<RequestType>("fuel");
  const [photos, setPhotos] = useState<File[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setCompressing(true);
    const compressed = await Promise.all(files.map(compressImage));
    setPhotos((prev) => [...prev, ...compressed]);
    setCompressing(false);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (photos.length === 0) {
      setError("At least one photo is required.");
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("vehicle_id", vehicleId);
    fd.set("type", type);

    // Collect the type-specific fields into one JSON blob
    const details: Record<string, string> = {};
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-detail]").forEach((el) => {
      if (el.name && el.value) details[el.name] = el.value;
    });
    fd.set("details", JSON.stringify(details));

    photos.forEach((p) => fd.append("photos", p));

    setSubmitting(true);
    try {
      await createRequest(fd);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type picker */}
      <div>
        <label className="block text-sm text-slate-300 mb-2">Request type</label>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`rounded-md border px-3 py-2.5 text-sm text-left transition-colors ${
                type === t.value
                  ? "border-amber-500 bg-amber-500/10 text-amber-400"
                  : "border-slate-700 bg-slate-800 text-slate-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Always-present field */}
      <div>
        <label className="block text-sm text-slate-300 mb-1.5">Odometer (km)</label>
        <input
          name="odometer"
          type="number"
          required
          min={lastOdometer}
          defaultValue={lastOdometer}
          className={inputClass}
        />
        <p className="text-xs text-slate-500 mt-1">
          Must be at least {lastOdometer.toLocaleString()} km (last recorded)
        </p>
      </div>

      {/* Type-specific fields */}
      {type === "fuel" && (
        <>
          <input data-detail name="litres" type="number" step="0.01" required placeholder="Litres" className={inputClass} />
          <input data-detail name="vendor" required placeholder="Vendor / station" className={inputClass} />
        </>
      )}

      {type === "tyre" && (
        <>
          <select data-detail name="position" required className={inputClass}>
            <option value="">Tyre position</option>
            <option value="FL">Front left</option>
            <option value="FR">Front right</option>
            <option value="RL">Rear left</option>
            <option value="RR">Rear right</option>
            <option value="spare">Spare</option>
          </select>
          <select data-detail name="reason" required className={inputClass}>
            <option value="">Reason</option>
            <option value="wear">Wear</option>
            <option value="puncture">Puncture</option>
            <option value="damage">Damage</option>
          </select>
          <input data-detail name="preferred_vendor" placeholder="Preferred vendor (optional)" className={inputClass} />
        </>
      )}

      {type === "maintenance" && (
        <>
          <textarea data-detail name="issue_description" required placeholder="Describe the issue" className={inputClass + " min-h-24"} />
          <select data-detail name="urgency" required className={inputClass}>
            <option value="">Urgency</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input data-detail name="vendor" placeholder="Vendor (if known)" className={inputClass} />
        </>
      )}

      {type === "service" && (
        <>
          <select data-detail name="service_type" required className={inputClass}>
            <option value="">Service type</option>
            <option value="oil_change">Oil change</option>
            <option value="general">General</option>
            <option value="major">Major</option>
          </select>
          <input data-detail name="vendor" placeholder="Vendor" className={inputClass} />
        </>
      )}

      {type === "spare_part" && (
        <>
          <input data-detail name="part_name" required placeholder="Part name" className={inputClass} />
          <input data-detail name="vendor" placeholder="Vendor" className={inputClass} />
        </>
      )}

      {type === "other" && (
        <textarea data-detail name="description" required placeholder="Description" className={inputClass + " min-h-24"} />
      )}

      <input name="estimated_amount" type="number" step="0.01" placeholder="Estimated amount" className={inputClass} />

      {/* Photo upload */}
      <div>
        <label className="block text-sm text-slate-300 mb-1.5">
          Photos <span className="text-slate-500">(at least 1 required)</span>
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={handlePhotoChange}
          className="block w-full text-sm text-slate-400 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-slate-300"
        />
        {compressing && <p className="text-xs text-amber-500 mt-1">Compressing photo…</p>}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {photos.map((p, i) => (
              <div key={i} className="relative">
                <img
                  src={URL.createObjectURL(p)}
                  alt=""
                  className="w-full aspect-square object-cover rounded-md border border-slate-700"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute -top-1.5 -right-1.5 bg-slate-900 border border-slate-700 rounded-full w-5 h-5 text-xs text-slate-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-[#E07856] bg-[#B3432E]/10 border border-[#B3432E]/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push("/driver")}
          className="flex-1 rounded-md border border-slate-700 text-slate-300 py-3 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || compressing}
          className="flex-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-medium py-3 transition-colors"
        >
          {submitting ? "Submitting…" : "Submit request"}
        </button>
      </div>
    </form>
  );
}
