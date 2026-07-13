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

    if (photos.length ===
