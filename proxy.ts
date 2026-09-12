import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Gates every /admin/* route (except the login page itself). This is the
// only authenticated surface in CPRNME — it exists solely to protect the
// real-data demand dashboard from public access. No public signup exists;
// see lib/supabase-session.ts for why "logged in" == "admin" here.
//
// Named `proxy` (not `middleware`) per Next.js 16 — see
// node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md.
// Per that same doc, Proxy is an optimistic check, not the sole
// authorization boundary: app/admin/demand/page.tsx independently re-checks
// the session server-side before reading any data.
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
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
