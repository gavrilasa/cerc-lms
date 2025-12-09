import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface featureProps {
	title: string;
	description: string;
	icon: string;
}

const features: featureProps[] = [
	{
		title: "Comprehensive Courses",
		description:
			"Access a wide range of carefully curated courses designed by industry experts.",
		icon: "📚",
	},
	{
		title: "Interactive Learning",
		description:
			"Engage with interactive conetent, quzzes, and assignments to enchance your learning experience.",
		icon: "🎮",
	},
	{
		title: "Progress Tracking",
		description:
			"Monitor your progress and achievments with detailed analytics and personalized dashboards.",
		icon: "📊",
	},
	{
		title: "Community Support",
		description:
			"Join a vibrant community of learners and instructors to collaborate and share knowledge.",
		icon: "👥",
	},
];

export default function Home() {
	return (
		<>
			<section className="relative py-20">
				<div className="flex flex-col items-center space-y-8 text-center">
					<Badge variant="outline">The Future of Online Education</Badge>
					<h1 className="text-4xl font-bold tracking-tight md:text-6xl">
						Elevate your Learning Experience
					</h1>
					<p className="max-w-[700px] text-muted-foreground text-xl">
						Discover a new way to learn with our modern, interactive learning
						management system. Access high-quality courses anytime, anywhere.
					</p>

					<div className="flex flex-col gap-4 mt-8 sm:flex-row">
						<Link
							className={buttonVariants({
								size: "lg",
							})}
							href="/"
						>
							Explore Courses
						</Link>
						<Link
							className={buttonVariants({
								size: "lg",
								variant: "outline",
							})}
							href="/"
						>
							Sign In
						</Link>
					</div>
				</div>
			</section>

			<section className="grid grid-cols-1 gap-6 mb-32 md:grid-cols-2 lg:grid-cols-4">
				{features.map((feature, index) => (
					<Card key={index} className="transition-shadow shadow-lg hover:">
						<CardHeader>
							<div className="mb-4 text-4xl">{feature.icon}</div>
							<CardTitle>{feature.title}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">{feature.description}</p>
						</CardContent>
					</Card>
				))}
			</section>
		</>
	);
}
