import Link from "next/link";
import SignOutButton from "@/app/sign-out-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <nav className="flex gap-5 text-sm">
            <Link href="/admin" className="text-slate-300 hover:text-amber-500">
              Dashboard
            </Link>
            <Link href="/admin/requests" className="text-slate-300 hover:text-amber-500">
              Requests
            </Link>
            <Link href="/admin/vehicles" className="text-slate-300 hover:text-amber-500">
              Vehicles
            </Link>
            <Link href="/admin/drivers" className="text-slate-300 hover:text-amber-500">
              Drivers
            </Link>
          </nav>
          <SignOutButton />
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
