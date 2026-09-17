import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() validates the session against Supabase directly, rather
  // than just trusting whatever is in the cookie, this is the check
  // that actually matters, not a formality.
  //
  // If the network call itself fails (not "no session", but genuinely
  // can't reach Supabase), fail fast and treat it as logged-out rather
  // than let the Supabase client's own retry logic silently burn many
  // seconds on every request. Logged with a clear label so a real
  // outage or network problem is easy to spot in the terminal instead
  // of showing up as a wall of generic retry errors.
  let user = null;
  try {
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();
    user = fetchedUser;
  } catch (err) {
    console.error(
      "[proxy] Could not reach Supabase to check the session, treating as logged out:",
      err instanceof Error ? err.message : err
    );
  }

  const path = request.nextUrl.pathname;
  const isAdminPage = path.startsWith("/admin") && path !== "/admin/login";
  const isAdminApi = path.startsWith("/api/admin");
  // The unfiltered order list (no ?phone=) is what the admin dashboard
  // uses to see every order. A phone-filtered request is the public
  // customer lookup and stays open. POST (placing an order) is also
  // untouched here, that has to stay open for checkout.
  const isOrdersListApi =
    path === "/api/orders" &&
    request.method === "GET" &&
    !request.nextUrl.searchParams.get("phone");

  if (!user && (isAdminPage || isAdminApi || isOrdersListApi)) {
    if (isAdminPage) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/orders"],
};
