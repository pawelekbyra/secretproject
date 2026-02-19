import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limiter";

const { auth } = NextAuth(authConfig);

const onBoardingPath = '/setup';

export default auth(async (req) => {
  const { nextUrl, ip = "127.0.0.1" } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;

  // Edge Rate Limiting
  const limit = nextUrl.pathname.startsWith('/api') ? 50 : 100;

  // We handle rateLimit failure gracefully if Redis is not available or errors out
  let rateLimitSuccess = true;
  try {
    const res = await rateLimit(`mw:${ip}`, limit, 60);
    rateLimitSuccess = res.success;
  } catch (e) {
    console.error("Rate limit error:", e);
  }

  if (!rateLimitSuccess) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  const isOnAdmin = nextUrl.pathname.startsWith('/admin');

  // If user is logged in and is marked as first login
  if (session?.user?.isFirstLogin) {
    if (nextUrl.pathname !== onBoardingPath && !nextUrl.pathname.startsWith('/api')) {
       return NextResponse.redirect(new URL(onBoardingPath, nextUrl));
    }
    return NextResponse.next();
  }

  // If user is NOT first login but tries to access /setup, redirect to home
  if (session && !session.user?.isFirstLogin && nextUrl.pathname === onBoardingPath) {
      return NextResponse.redirect(new URL('/', nextUrl));
  }

  if (isOnAdmin) {
    if (isLoggedIn) return NextResponse.next();
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|images|videos|favicon.ico).*)'],
};
