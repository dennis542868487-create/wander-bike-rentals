import { NextResponse, type NextRequest } from "next/server";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";
import { WEBSITE_CMS_DEMO_COOKIE } from "@/lib/website-cms/demo";

export async function proxy(request: NextRequest) {
  if (
    process.env.NODE_ENV === "development" &&
    request.nextUrl.pathname === "/admin/website/preview" &&
    ["localhost", "127.0.0.1"].includes(
      (request.headers.get("host") ?? request.nextUrl.host)
        .split(":")[0]
        .toLowerCase(),
    )
  ) {
    const response = NextResponse.redirect(
      new URL("/admin/website", request.url),
    );
    response.cookies.set(WEBSITE_CMS_DEMO_COOKIE, "enabled", {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    return response;
  }
  return refreshSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
