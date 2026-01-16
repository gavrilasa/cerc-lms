"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRef, useCallback } from "react";
import { flushSync } from "react-dom";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const buttonRef = useRef<HTMLButtonElement>(null);

	const toggleTheme = useCallback(
		async (event: React.MouseEvent<HTMLButtonElement>) => {
			const newTheme = resolvedTheme === "dark" ? "light" : "dark";

			// Check if View Transitions API is supported and user doesn't prefer reduced motion
			const isViewTransitionSupported =
				typeof document !== "undefined" &&
				"startViewTransition" in document &&
				!window.matchMedia("(prefers-reduced-motion: reduce)").matches;

			if (!isViewTransitionSupported) {
				setTheme(newTheme);
				return;
			}

			// Get the click position (center of viewport for droplet effect)
			const x = window.innerWidth / 2;
			const y = window.innerHeight / 2;

			// Calculate the maximum radius needed to cover the entire screen
			const endRadius = Math.hypot(
				Math.max(x, window.innerWidth - x),
				Math.max(y, window.innerHeight - y)
			);

			// Start the view transition
			const transition = document.startViewTransition(() => {
				flushSync(() => {
					setTheme(newTheme);
				});
			});

			// Wait for the transition to be ready, then animate
			await transition.ready;

			// Determine animation direction based on theme
			const isDark = resolvedTheme === "dark";
			const clipPathStart = `circle(0px at ${x}px ${y}px)`;
			const clipPathEnd = `circle(${endRadius}px at ${x}px ${y}px)`;

			// Animate the new view (the incoming theme)
			document.documentElement.animate(
				{
					clipPath: isDark
						? [clipPathStart, clipPathEnd] // Light spreading (going to light)
						: [clipPathEnd, clipPathStart], // Dark contracting then new theme appears
				},
				{
					duration: 500,
					easing: "ease-in-out",
					pseudoElement: isDark
						? "::view-transition-new(root)"
						: "::view-transition-old(root)",
				}
			);
		},
		[resolvedTheme, setTheme]
	);

	return (
		<Button
			ref={buttonRef}
			variant="outline"
			size="icon"
			onClick={toggleTheme}
			className="cursor-pointer"
		>
			<Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
			<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
