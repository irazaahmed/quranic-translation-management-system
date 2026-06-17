import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * "Continue without login" entry point. Sets a lightweight cookie marking that
 * this visitor opted into the public, view-only mode, then sends them to the
 * dashboard. The cookie lets the route guard skip the landing page on later
 * visits so they go straight to the dashboard.
 */
export function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/", request.url));
  res.cookies.set("qtms_view", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 180, // 180 days
    sameSite: "lax",
  });
  return res;
}
