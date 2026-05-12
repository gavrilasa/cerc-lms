import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function LogsTableSkeleton() {
	return (
		<div className="space-y-4 px-4 py-4">
			{/* Search input skeleton */}
			<div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
				<div className="w-full sm:w-2xl">
					<Skeleton className="h-10 w-full" />
				</div>
			</div>

			{/* Table skeleton */}
			<div className="border rounded-md overflow-hidden bg-white">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="pl-4 w-[250px]">User (Actor)</TableHead>
							<TableHead className="text-center w-[150px]">Action</TableHead>
							<TableHead className="text-center w-[120px]">Entity</TableHead>
							<TableHead>Details</TableHead>
							<TableHead className="pr-4 w-[200px] text-center">Date</TableHead>
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
											<div className="flex items-center gap-2">
												<Skeleton className="h-3 w-40" />
												<Skeleton className="h-4 w-12" />
											</div>
										</div>
									</div>
								</TableCell>
								<TableCell className="text-center">
									<Skeleton className="h-6 w-20 mx-auto" />
								</TableCell>
								<TableCell className="text-center">
									<Skeleton className="h-4 w-16 mx-auto" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-64" />
								</TableCell>
								<TableCell className="pr-4 text-center">
									<Skeleton className="h-4 w-32 mx-auto" />
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
