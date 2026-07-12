import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname.startsWith("/login");

  // Not logged in and trying to reach a protected page → send to login
  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logged in — figure out their role so we can route/guard correctly
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    // Already logged in and sitting on the login page → send to their home
    if (isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = role === "admin" ? "/admin" : "/driver";
      return NextResponse.redirect(url);
    }

    // A driver trying to reach admin pages → bounce back to their own area
    if (pathname.startsWith("/admin") && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/driver";
      return NextResponse.redirect(url);
    }

    // An admin trying to reach driver-only pages → bounce to admin area
    if (pathname.startsWith("/driver") && role === "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
