import { NextRequest, NextResponse } from "next/server";
import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
import { env } from "./lib/env";

const aj = arcjet({
	key: env.ARCJET_KEY!,
	rules: [
		detectBot({
			mode: "LIVE",
			allow: [
				"CATEGORY:SEARCH_ENGINE",
				"CATEGORY:MONITOR",
				"CATEGORY:PREVIEW",
				"STRIPE_WEBHOOK",
			],
		}),
	],
});

async function authMiddleware(request: NextRequest) {
	const { nextUrl } = request;

	const sessionRes = await fetch(`${nextUrl.origin}/api/auth/get-session`, {
		headers: {
			cookie: request.headers.get("cookie") || "",
		},
		cache: "no-store",
	});

	const session = await sessionRes.json();
	const user = session?.user;

	const isAuthRoute =
		nextUrl.pathname.startsWith("/login") ||
		nextUrl.pathname.startsWith("/register");
	const isPublicRoute =
		nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/api/s3");
	const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");

	const isWaitingApproval = nextUrl.pathname === "/waiting-approval";
	const isRejectedPage = nextUrl.pathname === "/rejected";
	const isAdminRoute = nextUrl.pathname.startsWith("/admin");

	if (user) {
		if (user.status === "PENDING" || user.role === "GUEST") {
			if (!isWaitingApproval && !isApiAuthRoute) {
				return NextResponse.redirect(new URL("/waiting-approval", request.url));
			}
			return NextResponse.next();
		}

		if (user.status === "REJECTED") {
			if (!isRejectedPage && !isApiAuthRoute) {
				return NextResponse.redirect(new URL("/rejected", request.url));
			}
			return NextResponse.next();
		}

		if ((isWaitingApproval || isRejectedPage) && user.status === "VERIFIED") {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}

		if (isAdminRoute) {
			if (user.role !== "ADMIN" && user.role !== "MENTOR") {
				return NextResponse.redirect(new URL("/dashboard", request.url));
			}

			if (
				nextUrl.pathname.startsWith("/admin/users") &&
				user.role !== "ADMIN"
			) {
				return NextResponse.redirect(new URL("/admin/courses", request.url));
			}
		}
	}

	if (!user) {
		if (!isAuthRoute && !isPublicRoute && !isApiAuthRoute) {
			const callbackUrl = nextUrl.pathname;
			return NextResponse.redirect(
				new URL(`/login?callbackURL=${callbackUrl}`, request.url)
			);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};

const proxy = createMiddleware(aj, async (request: NextRequest) => {
	return authMiddleware(request);
});

export default proxy;
