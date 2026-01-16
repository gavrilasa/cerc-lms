import { getLogs } from "@/app/data/admin/logs/get-logs";
import LogsTable from "./_components/LogsTable";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
	title: "Logs | Admin CERC",
};

interface AdminLogsPageProps {
	searchParams: Promise<{
		search?: string;
		page?: string;
	}>;
}

export default async function AdminLogsPage(props: AdminLogsPageProps) {
	const searchParams = await props.searchParams;

	const searchQuery = searchParams.search || "";
	const page = Number(searchParams.page) || 1;
	const limit = 20;

	const { logs, metadata } = await getLogs(page, limit, searchQuery);

	return (
		<div className="p-4 space-y-4">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold tracking-tight">System Logs</h1>
				<p className="text-muted-foreground">
					View admin and mentor actions performed within the system.
				</p>
			</div>

			<Card>
				<CardContent className="p-0 sm:px-4 sm:py-2">
					<LogsTable logs={logs} metadata={metadata} />
				</CardContent>
			</Card>
		</div>
	);
}
