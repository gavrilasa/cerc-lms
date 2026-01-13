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
	const pathname = nextUrl.pathname;

	// ---------------------------------------------------------------------------
	// 1. Root Redirect (Global Entry Point)
	// ---------------------------------------------------------------------------
	if (pathname === "/") {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// ---------------------------------------------------------------------------
	// 2. Route Categorization
	// ---------------------------------------------------------------------------
	const isAuthRoute =
		pathname.startsWith("/login") || pathname.startsWith("/register");

	const isApiRoute =
		pathname.startsWith("/api/auth") ||
		pathname.startsWith("/api/uploadthing") ||
		pathname.startsWith("/api/s3");

	const isWaitingApprovalPage = pathname === "/waiting-approval";
	const isRejectedPage = pathname === "/rejected";
	const isSelectCurriculumPage = pathname === "/select-curriculum";
	const isAdminRoute = pathname.startsWith("/admin");

	// ---------------------------------------------------------------------------
	// 3. Fetch Session
	// ---------------------------------------------------------------------------
	const sessionRes = await fetch(`${nextUrl.origin}/api/auth/get-session`, {
		headers: {
			cookie: request.headers.get("cookie") || "",
		},
		cache: "no-store",
	});

	const session = await sessionRes.json();
	const user = session?.user;

	// ---------------------------------------------------------------------------
	// 4. Unauthenticated Handling
	// ---------------------------------------------------------------------------
	if (!user) {
		// Izinkan akses ke Login, Register, dan API publik
		if (isAuthRoute || isApiRoute) {
			return NextResponse.next();
		}

		// Redirect semua trafik lain ke halaman Login
		const callbackUrl = pathname;
		return NextResponse.redirect(
			new URL(
				`/login?callbackURL=${encodeURIComponent(callbackUrl)}`,
				request.url
			)
		);
	}

	// ---------------------------------------------------------------------------
	// 5. Authenticated Handling (Status Checks)
	// ---------------------------------------------------------------------------
	if (user) {
		if (isAuthRoute) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}

		if (user.status === "PENDING" || user.role === "GUEST") {
			if (!isWaitingApprovalPage && !isApiRoute) {
				return NextResponse.redirect(new URL("/waiting-approval", request.url));
			}
			return NextResponse.next();
		}

		if (user.status === "REJECTED") {
			if (!isRejectedPage && !isApiRoute) {
				return NextResponse.redirect(new URL("/rejected", request.url));
			}
			return NextResponse.next();
		}

		const hasCurriculum = !!user.selectedCurriculumId;
		const isRegularUser = user.role !== "ADMIN" && user.role !== "MENTOR";

		if (user.status === "VERIFIED" && !hasCurriculum && isRegularUser) {
			if (!isSelectCurriculumPage && !isApiRoute) {
				return NextResponse.redirect(
					new URL("/select-curriculum", request.url)
				);
			}
			return NextResponse.next();
		}

		if (user.status === "VERIFIED") {
			const isStuckPage = isWaitingApprovalPage || isRejectedPage;
			const isRedundantSelect = isSelectCurriculumPage && hasCurriculum;

			if (isStuckPage || isRedundantSelect) {
				return NextResponse.redirect(new URL("/dashboard", request.url));
			}
		}

		if (isAdminRoute) {
			if (user.role !== "ADMIN" && user.role !== "MENTOR") {
				return NextResponse.redirect(new URL("/dashboard", request.url));
			}
			// Note: /admin/users is accessible to both ADMIN and MENTOR
			// Action restrictions (delete, archive) are handled server-side
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
