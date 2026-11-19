import type {
	EligibilityState,
	OpportunityEvidence,
	OpportunityKind,
	OpportunityRegion,
	ScrapeGrade,
} from "../opportunities/model";
import type { ScrapeRunStatus } from "../scrape-runs/model";

const MAX_TEXT = 5000;
const MAX_ITEMS = 500;

export interface MuseRunInput {
	externalId: string;
	label: string;
	date: string;
	sourceGroup: string;
	status: ScrapeRunStatus;
	sourceCount: number;
	foundCount: number;
	eligibleCount: number;
	duration: string;
	gradeCounts: Record<ScrapeGrade, number>;
	sources: string[];
	notes: string[];
}

export interface MuseOpportunityInput {
	externalId: string;
	runId: string;
	title: string;
	organization: string;
	kind: OpportunityKind;
	region: OpportunityRegion;
	locationLabel: string;
	eligibility: EligibilityState;
	eligibilityLabel: string;
	eligibilityEvidence: OpportunityEvidence[];
	qualityGrade: ScrapeGrade | null;
	fitScore: number | null;
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

export interface MuseIngestPayload {
	schemaVersion: 1;
	run: MuseRunInput;
	opportunities: MuseOpportunityInput[];
}

export class MusePayloadError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "MusePayloadError";
	}
}

type RecordValue = Record<string, unknown>;

function recordValue(value: unknown, path: string): RecordValue {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new MusePayloadError(`${path} must be an object`);
	}
	return value as RecordValue;
}

function textValue(record: RecordValue, key: string, path: string, optional = false): string | null {
	const value = record[key];
	if (value === undefined && optional) return null;
	if (typeof value !== "string" || value.trim() === "" || value.length > MAX_TEXT) {
		throw new MusePayloadError(`${path}.${key} must be a non-empty string`);
	}
	return value.trim();
}

function numberValue(record: RecordValue, key: string, path: string, options: { min: number; max: number; optional?: boolean }): number | null {
	const value = record[key];
	if (value === undefined || value === null) {
		if (options.optional) return null;
		throw new MusePayloadError(`${path}.${key} must be a number`);
	}
	if (typeof value !== "number" || !Number.isInteger(value) || value < options.min || value > options.max) {
		throw new MusePayloadError(`${path}.${key} is outside the allowed range`);
	}
	return value;
}

function enumValue<T extends string>(record: RecordValue, key: string, path: string, values: readonly T[]): T {
	const value = record[key];
	if (typeof value !== "string" || !values.includes(value as T)) {
		throw new MusePayloadError(`${path}.${key} is not supported`);
	}
	return value as T;
}

function optionalEnumValue<T extends string>(record: RecordValue, key: string, path: string, values: readonly T[]): T | null {
	const value = record[key];
	if (value === undefined || value === null) return null;
	if (typeof value !== "string" || !values.includes(value as T)) {
		throw new MusePayloadError(`${path}.${key} is not supported`);
	}
	return value as T;
}

function stringArray(record: RecordValue, key: string, path: string): string[] {
	const value = record[key];
	if (!Array.isArray(value) || value.length > MAX_ITEMS) throw new MusePayloadError(`${path}.${key} must be an array`);
	return value.map((entry, index) => {
		if (typeof entry !== "string" || entry.trim() === "" || entry.length > MAX_TEXT) {
			throw new MusePayloadError(`${path}.${key}[${index}] must be a non-empty string`);
		}
		return entry.trim();
	});
}

function evidenceArray(record: RecordValue, key: string, path: string): OpportunityEvidence[] {
	const value = record[key];
	if (!Array.isArray(value) || value.length > MAX_ITEMS) throw new MusePayloadError(`${path}.${key} must be an array`);
	return value.map((entry, index) => {
		const item = recordValue(entry, `${path}.${key}[${index}]`);
		return {
			label: textValue(item, "label", `${path}.${key}[${index}]`) ?? "",
			text: textValue(item, "text", `${path}.${key}[${index}]`) ?? "",
		};
	});
}

function isoDate(record: RecordValue, key: string, path: string): string {
	const value = textValue(record, key, path) ?? "";
	if (Number.isNaN(Date.parse(value))) throw new MusePayloadError(`${path}.${key} must be a valid date`);
	return value;
}

function urlValue(record: RecordValue, key: string, path: string): string {
	const value = textValue(record, key, path) ?? "";
	try {
		const url = new URL(value);
		if (!['http:', 'https:'].includes(url.protocol)) throw new Error("unsupported protocol");
		return url.toString();
	} catch {
		throw new MusePayloadError(`${path}.${key} must be an http(s) URL`);
	}
}

function parseRun(value: unknown): MuseRunInput {
	const record = recordValue(value, "run");
	return {
		externalId: textValue(record, "externalId", "run") ?? "",
		label: textValue(record, "label", "run") ?? "",
		date: isoDate(record, "date", "run"),
		sourceGroup: textValue(record, "sourceGroup", "run") ?? "",
		status: enumValue(record, "status", "run", ["complete", "partial", "review"] as const),
		sourceCount: numberValue(record, "sourceCount", "run", { min: 0, max: MAX_ITEMS }) ?? 0,
		foundCount: numberValue(record, "foundCount", "run", { min: 0, max: MAX_ITEMS }) ?? 0,
		eligibleCount: numberValue(record, "eligibleCount", "run", { min: 0, max: MAX_ITEMS }) ?? 0,
		duration: textValue(record, "duration", "run") ?? "",
		gradeCounts: {
			A: numberValue(recordValue(record.gradeCounts, "run.gradeCounts"), "A", "run.gradeCounts", { min: 0, max: MAX_ITEMS }) ?? 0,
			B: numberValue(recordValue(record.gradeCounts, "run.gradeCounts"), "B", "run.gradeCounts", { min: 0, max: MAX_ITEMS }) ?? 0,
			C: numberValue(recordValue(record.gradeCounts, "run.gradeCounts"), "C", "run.gradeCounts", { min: 0, max: MAX_ITEMS }) ?? 0,
		},
		sources: stringArray(record, "sources", "run"),
		notes: stringArray(record, "notes", "run"),
	};
}

function parseOpportunity(value: unknown, index: number): MuseOpportunityInput {
	const path = `opportunities[${index}]`;
	const record = recordValue(value, path);
	return {
		externalId: textValue(record, "externalId", path) ?? "",
		runId: textValue(record, "runId", path) ?? "",
		title: textValue(record, "title", path) ?? "",
		organization: textValue(record, "organization", path) ?? "",
		kind: enumValue(record, "kind", path, ["hackathon", "program", "grant", "fellowship", "learning"] as const),
		region: enumValue(record, "region", path, ["global", "jakarta"] as const),
		locationLabel: textValue(record, "locationLabel", path) ?? "",
		eligibility: enumValue(record, "eligibility", path, ["eligible", "review"] as const),
		eligibilityLabel: textValue(record, "eligibilityLabel", path) ?? "",
		eligibilityEvidence: evidenceArray(record, "eligibilityEvidence", path),
		qualityGrade: optionalEnumValue(record, "qualityGrade", path, ["A", "B", "C"] as const),
		fitScore: numberValue(record, "fitScore", path, { min: 0, max: 100, optional: true }),
		fitNote: textValue(record, "fitNote", path, true) ?? "Belum ada penilaian personal.",
		deadline: isoDate(record, "deadline", path).slice(0, 10),
		deadlineEvidence: textValue(record, "deadlineEvidence", path) ?? "",
		summary: textValue(record, "summary", path) ?? "",
		tags: stringArray(record, "tags", path),
		sourceName: textValue(record, "sourceName", path) ?? "",
		sourceUrl: urlValue(record, "sourceUrl", path),
		checkedAt: isoDate(record, "checkedAt", path),
		notes: stringArray(record, "notes", path),
	};
}

export function parseMusePayload(value: unknown): MuseIngestPayload {
	const record = recordValue(value, "payload");
	if (record.schemaVersion !== 1) throw new MusePayloadError("schemaVersion must be 1");
	const opportunities = record.opportunities;
	if (!Array.isArray(opportunities) || opportunities.length > MAX_ITEMS) {
		throw new MusePayloadError("opportunities must be an array");
	}
	const payload: MuseIngestPayload = {
		schemaVersion: 1,
		run: parseRun(record.run),
		opportunities: opportunities.map(parseOpportunity),
	};
	if (new Set(payload.opportunities.map((opportunity) => opportunity.externalId)).size !== payload.opportunities.length) {
		throw new MusePayloadError("opportunities contains duplicate externalId values");
	}
	if (payload.opportunities.some((opportunity) => opportunity.runId !== payload.run.externalId)) {
		throw new MusePayloadError("every opportunity.runId must match run.externalId");
	}
	return payload;
}
