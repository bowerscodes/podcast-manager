import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // skip middleware for auth callback routes
  if (req.nextUrl.pathname.startsWith("/auth/callback")) {
    return res;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
  
    // If logged in user tries to access home, redirect to podcasts
    if (req.nextUrl.pathname === "/" && session) {
      return NextResponse.redirect(new URL("/podcasts", req.url));
    }

    return res;
  } catch (error) {
    console.error("❌ Middleware error:", error);
    return res;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
