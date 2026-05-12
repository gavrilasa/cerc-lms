import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function UserTableSkeleton() {
	return (
		<div className="space-y-4">
			{/* Filter and search skeletons */}
			<div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
				<div className="flex gap-2 w-full sm:w-auto">
					<Skeleton className="h-10 w-[150px]" />
					<Skeleton className="h-10 w-[150px]" />
				</div>
				<div className="w-full sm:w-72">
					<Skeleton className="h-10 w-full" />
				</div>
			</div>

			{/* Table skeleton */}
			<div className="border rounded-md overflow-hidden bg-white">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="pl-4">User Information</TableHead>
							<TableHead className="text-center">Division</TableHead>
							<TableHead className="text-center">Role</TableHead>
							<TableHead className="text-center">Status</TableHead>
							<TableHead className="text-center pr-4">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: 5 }).map((_, i) => (
							<TableRow key={i}>
								<TableCell className="pl-4">
									<div className="flex items-center gap-3 py-1">
										<Skeleton className="h-9 w-9 rounded-full" />
										<div className="flex flex-col gap-1">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-3 w-48" />
										</div>
									</div>
								</TableCell>
								<TableCell className="text-center">
									<Skeleton className="h-6 w-24 mx-auto" />
								</TableCell>
								<TableCell className="text-center">
									<Skeleton className="h-6 w-16 mx-auto" />
								</TableCell>
								<TableCell className="text-center">
									<Skeleton className="h-6 w-20 mx-auto" />
								</TableCell>
								<TableCell className="text-center pr-4">
									<Skeleton className="h-9 w-24 mx-auto" />
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
