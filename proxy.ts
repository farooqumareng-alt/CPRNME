import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Gates every /admin/* and /technician/* route (except the shared login
// page). This edge check only confirms someone is logged in at all — it
// deliberately does NOT distinguish admin from technician (that would mean
// a second round-trip to the DB on every request just to redirect, and
// this check is optimistic anyway, never the real authorization boundary).
// The real role split (an explicit admins/technicians allow-list, not
// "isn't the other role") lives in lib/supabase-session.ts's
// requireAdminSession()/requireTechnicianSession(), which every page under
// both trees re-checks server-side before reading or rendering anything —
// see that file for why "logged in" stopped being the same fact as
// "is an admin" the moment technician accounts existed.
//
// Named `proxy` (not `middleware`) per Next.js 16 — see
// node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    // Preserves where they were actually headed — matters more now that
    // two roles share this one login page: without it, a technician
    // hitting this edge redirect (no session cookie yet) would land back
    // on /admin/login with no target, then fall through to the login
    // page's own "/admin/demand" default after signing in — which
    // requireAdminSession() correctly rejects for a technician, bouncing
    // them right back to login in a confusing loop.
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/technician/:path*"],
};
