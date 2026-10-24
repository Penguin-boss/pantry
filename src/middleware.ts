import { NextRequest, NextResponse } from "next/server";
export function middleware(req: NextRequest) {
  const token = req.cookies.get("pantry_token")?.value;
  const isAuth = !!token;
  const path = req.nextUrl.pathname;
  const isApp = path.startsWith("/dashboard") || path.startsWith("/recipes") || path.startsWith("/stats") || path.startsWith("/profile");
  const isAuthPage = path.startsWith("/login") || path.startsWith("/signup");
  if (isApp && !isAuth) return NextResponse.redirect(new URL("/login", req.url));
  if (isAuthPage && isAuth) return NextResponse.redirect(new URL("/dashboard", req.url));
  return NextResponse.next();
}
export const config = { matcher: ["/dashboard/:path*", "/recipes/:path*", "/stats/:path*", "/profile/:path*", "/login", "/signup"] };
