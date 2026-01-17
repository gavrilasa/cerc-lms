import type { Metadata } from "next";
import { DM_Sans, Lora, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/themes-provider";
import { Toaster } from "@/components/ui/sonner";

export const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
export const lora = Lora({
	subsets: ["latin"],
	variable: "--font-serif",
});
export const ibmPlexMono = IBM_Plex_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
	title: "CERC LMS",
	description: "Learning Management System",
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_APP_URL || "https://cerc-lms.vercel.app"
	),
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta name="apple-mobile-web-app-title" content="CERC LMS" />
			</head>
			<body
				className={`${dmSans.variable} ${lora.variable} ${ibmPlexMono.variable}`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
					<Toaster closeButton />
				</ThemeProvider>
			</body>
		</html>
	);
}
