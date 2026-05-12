import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function ReviewTableSkeleton() {
	return (
		<div className="space-y-4">
			{/* Filter skeletons */}
			<div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
				<div className="flex gap-2 w-full sm:w-auto">
					<Skeleton className="h-10 w-[150px]" />
					<Skeleton className="h-10 w-[150px]" />
				</div>
			</div>

			{/* Table skeleton */}
			<div className="border rounded-md overflow-hidden bg-white">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="pl-4">Date</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Title</TableHead>
							<TableHead>Course</TableHead>
							<TableHead className="text-center">Type</TableHead>
							<TableHead className="text-center">Status</TableHead>
							<TableHead className="text-center">Score</TableHead>
							<TableHead className="text-center">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: 5 }).map((_, i) => (
							<TableRow key={i}>
								<TableCell className="pl-4">
									<Skeleton className="h-4 w-24" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-32" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-40" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-32" />
								</TableCell>
								<TableCell className="text-center">
									<Skeleton className="h-6 w-16 mx-auto" />
								</TableCell>
								<TableCell className="text-center">
									<Skeleton className="h-6 w-20 mx-auto" />
								</TableCell>
								<TableCell className="text-center">
									<Skeleton className="h-4 w-12 mx-auto" />
								</TableCell>
								<TableCell className="text-center">
									<Skeleton className="h-9 w-20 mx-auto" />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Pagination skeleton */}
			<div className="flex items-center justify-center space-x-2 mt-4">
				<Skeleton className="h-9 w-9" />
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-9 w-9" />
			</div>
		</div>
	);
}
