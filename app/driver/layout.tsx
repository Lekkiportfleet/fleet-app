import Link from "next/link";
import SignOutButton from "@/app/sign-out-button";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/driver" className="text-slate-300 hover:text-amber-500 text-sm">
            My requests
          </Link>
          <SignOutButton />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
