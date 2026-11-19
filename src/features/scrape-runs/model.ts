export type ScrapeRunStatus = "complete" | "partial" | "review";

export interface ScrapeRun {
	id: string;
	label: string;
	date: string;
	dateLabel: string;
	sourceGroup: string;
	status: ScrapeRunStatus;
	statusLabel: string;
	sourceCount: number;
	foundCount: number;
	eligibleCount: number;
	duration: string;
	gradeCounts: { A: number; B: number; C: number };
	sources: string[];
	notes: string[];
}

export function formatRunDate(date: string): string {
	return new Intl.DateTimeFormat("id-ID", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "Asia/Jakarta",
	}).format(new Date(date));
}
