export type OpportunityKind = "hackathon" | "program" | "grant" | "fellowship" | "learning";
export type OpportunityRegion = "global" | "jakarta";
export type EligibilityState = "eligible" | "review";
export type ScrapeGrade = "A" | "B" | "C";

export interface OpportunityEvidence {
	label: string;
	text: string;
}

export interface Opportunity {
	id: string;
	title: string;
	organization: string;
	kind: OpportunityKind;
	region: OpportunityRegion;
	locationLabel: string;
	eligibility: EligibilityState;
	eligibilityLabel: string;
	eligibilityEvidence: OpportunityEvidence[];
	qualityGrade: ScrapeGrade;
	fitScore: number;
	fitNote: string;
	deadline: string;
	deadlineEvidence: string;
	summary: string;
	tags: string[];
	sourceName: string;
	sourceUrl: string;
	checkedAt: string;
	notes: string[];
}

export const opportunityKindLabels: Record<OpportunityKind, string> = {
	hackathon: "Hackathon",
	program: "Program",
	grant: "Grant",
	fellowship: "Fellowship",
	learning: "Learning",
};

export function formatDate(date: string): string {
	return new Intl.DateTimeFormat("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "Asia/Jakarta",
	}).format(new Date(date + "T12:00:00+07:00"));
}

export function daysUntilDeadline(date: string, now = Date.now()): number {
	const deadline = Date.parse(date + "T23:59:59+07:00");
	return Math.ceil((deadline - now) / 86_400_000);
}

export function deadlineLabel(date: string, now = Date.now()): string {
	const days = daysUntilDeadline(date, now);
	if (days < 0) return "Tenggat lewat";
	if (days <= 1) return "Tutup hari ini";
	if (days <= 7) return "Sisa " + days + " hari";
	return formatDate(date);
}

export function isDeadlineSoon(date: string, now = Date.now()): boolean {
	const days = daysUntilDeadline(date, now);
	return days >= 0 && days <= 7;
}