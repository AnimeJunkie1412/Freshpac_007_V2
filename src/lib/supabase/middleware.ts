import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { PrismaClient } from "@prisma/client";
import { canAccessPortalPath, getDefaultPortalPathForRole } from "@/lib/auth/current-user";

const prisma = new PrismaClient();

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          request.cookies.set({ name, value, ...options });

          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });

          response.cookies.set({
            name,
            value,
            ...options
          });
        },
        remove(name: string, options) {
          request.cookies.set({ name, value: "", ...options });

          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });

          response.cookies.set({
            name,
            value: "",
            ...options
          });
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPortalRoute = pathname.startsWith("/portal");
  const isLoginRoute = pathname === "/login";

  if (isPortalRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoginRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/portal";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (isPortalRoute && user?.email) {
    const profile = await prisma.userProfile.findUnique({
      where: {
        email: user.email.toLowerCase()
      }
    });

    if (!profile) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("error", "profile");
      return NextResponse.redirect(redirectUrl);
    }

    if (!canAccessPortalPath(profile.role, pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = getDefaultPortalPathForRole(profile.role);
      redirectUrl.searchParams.set("error", "forbidden");
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}