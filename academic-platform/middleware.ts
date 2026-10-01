import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Session refresh + coarse route protection.
 * SECURITY: middleware is UX/routing only — every page and server action
 * re-checks role/active status server-side (see lib/security/guards.ts).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const studentPaths = ["/dashboard", "/courses", "/read"];
  const isStudentPath = studentPaths.some((p) => path.startsWith(p));
  const isAdminPath = path.startsWith("/admin") && !path.startsWith("/admin-login");

  if (!user && (isStudentPath || isAdminPath)) {
    const url = request.nextUrl.clone();
    url.pathname = isAdminPath ? "/admin-login" : "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export default function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};
