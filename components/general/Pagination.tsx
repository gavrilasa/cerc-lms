"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [page, setPage] = useState(currentPage);

	useEffect(() => {
		setPage(currentPage);
	}, [currentPage]);

	const handlePageChange = (newPage: number) => {
		if (newPage < 1 || newPage > totalPages) return;

		setPage(newPage);
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", newPage.toString());

		router.push(`?${params.toString()}`);
	};

	if (totalPages <= 1) return null;

	return (
		<div className="flex items-center justify-center space-x-2 mt-4">
			<Button
				variant="outline"
				size="icon"
				onClick={() => handlePageChange(page - 1)}
				disabled={page <= 1}
				aria-label="Previous page"
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>

			<div className="flex items-center gap-1">
				<span className="text-sm font-medium">
					Page {page} of {totalPages}
				</span>
			</div>

			<Button
				variant="outline"
				size="icon"
				onClick={() => handlePageChange(page + 1)}
				disabled={page >= totalPages}
				aria-label="Next page"
			>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
}
