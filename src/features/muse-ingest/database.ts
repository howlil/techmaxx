import type { Opportunity, OpportunityEvidence, ScrapeGrade } from "../opportunities/model";
import { formatRunDate, type ScrapeRun } from "../scrape-runs/model";
import type { MuseIngestPayload, MuseOpportunityInput, MuseRunInput } from "./contract";

export interface D1PreparedStatementLike {
	bind(...values: unknown[]): D1PreparedStatementLike;
	first<T = unknown>(): Promise<T | null>;
	all<T = unknown>(): Promise<{ results: T[] }>;
	run(): Promise<unknown>;
}

export interface D1DatabaseLike {
	prepare(query: string): D1PreparedStatementLike;
	batch(statements: D1PreparedStatementLike[]): Promise<unknown[]>;
}

interface ReceiptRow {
	payload_hash: string;
}

interface OpportunityRow {
	id: string;
	title: string;
	organization: string;
	kind: Opportunity["kind"];
	region: Opportunity["region"];
	location_label: string;
	eligibility: Opportunity["eligibility"];
	eligibility_label: string;
	eligibility_evidence_json: string;
	quality_grade: ScrapeGrade | null;
	fit_score: number | null;
	fit_note: string;
	deadline: string;
	deadline_evidence: string;
	summary: string;
	tags_json: string;
	source_name: string;
	source_url: string;
	checked_at: string;
	notes_json: string;
}

interface ScrapeRunRow {
	id: string;
	label: string;
	date: string;
	date_label: string;
	source_group: string;
	status: ScrapeRun["status"];
	status_label: string;
	source_count: number;
	found_count: number;
	eligible_count: number;
	duration: string;
	grade_a_count: number;
	grade_b_count: number;
	grade_c_count: number;
	sources_json: string;
	notes_json: string;
}

export class IdempotencyConflictError extends Error {
	constructor() {
		super("The idempotency key was already used for another payload");
		this.name = "IdempotencyConflictError";
	}
}

function json(value: unknown): string {
	return JSON.stringify(value);
}

function parseJson<T>(value: string, fallback: T): T {
	try {
		return JSON.parse(value) as T;
	} catch {
		return fallback;
	}
}

function statusLabel(status: ScrapeRun["status"]): string {
	return { complete: "Selesai", partial: "Selesai sebagian", review: "Perlu ditinjau" }[status];
}

function toOpportunity(row: OpportunityRow): Opportunity {
	return {
		id: row.id,
		title: row.title,
		organization: row.organization,
		kind: row.kind,
		region: row.region,
		locationLabel: row.location_label,
		eligibility: row.eligibility,
		eligibilityLabel: row.eligibility_label,
		eligibilityEvidence: parseJson<OpportunityEvidence[]>(row.eligibility_evidence_json, []),
		qualityGrade: row.quality_grade,
		fitScore: row.fit_score,
		fitNote: row.fit_note,
		deadline: row.deadline,
		deadlineEvidence: row.deadline_evidence,
		summary: row.summary,
		tags: parseJson<string[]>(row.tags_json, []),
		sourceName: row.source_name,
		sourceUrl: row.source_url,
		checkedAt: row.checked_at,
		notes: parseJson<string[]>(row.notes_json, []),
	};
}

function toScrapeRun(row: ScrapeRunRow): ScrapeRun {
	return {
		id: row.id,
		label: row.label,
		date: row.date,
		dateLabel: row.date_label,
		sourceGroup: row.source_group,
		status: row.status,
		statusLabel: row.status_label,
		sourceCount: row.source_count,
		foundCount: row.found_count,
		eligibleCount: row.eligible_count,
		duration: row.duration,
		gradeCounts: { A: row.grade_a_count, B: row.grade_b_count, C: row.grade_c_count },
		sources: parseJson<string[]>(row.sources_json, []),
		notes: parseJson<string[]>(row.notes_json, []),
	};
}

function runStatement(db: D1DatabaseLike, run: MuseRunInput, timestamp: string): D1PreparedStatementLike {
	return db.prepare(
		`INSERT INTO scrape_runs (
			id, external_id, label, date, date_label, source_group, status, status_label,
			source_count, found_count, eligible_count, duration, grade_a_count, grade_b_count,
			grade_c_count, sources_json, notes_json, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(external_id) DO UPDATE SET
			label = excluded.label, date = excluded.date, date_label = excluded.date_label,
			source_group = excluded.source_group, status = excluded.status,
			status_label = excluded.status_label, source_count = excluded.source_count,
			found_count = excluded.found_count, eligible_count = excluded.eligible_count,
			duration = excluded.duration, grade_a_count = excluded.grade_a_count,
			grade_b_count = excluded.grade_b_count, grade_c_count = excluded.grade_c_count,
			sources_json = excluded.sources_json, notes_json = excluded.notes_json,
			updated_at = excluded.updated_at`,
	).bind(
		run.externalId, run.externalId, run.label, run.date, formatRunDate(run.date), run.sourceGroup,
		run.status, statusLabel(run.status), run.sourceCount, run.foundCount, run.eligibleCount,
		run.duration, run.gradeCounts.A, run.gradeCounts.B, run.gradeCounts.C, json(run.sources),
		json(run.notes), timestamp, timestamp,
	);
}

function opportunityStatement(db: D1DatabaseLike, opportunity: MuseOpportunityInput, timestamp: string): D1PreparedStatementLike {
	return db.prepare(
		`INSERT INTO opportunities (
			id, external_id, run_id, title, organization, kind, region, location_label,
			eligibility, eligibility_label, eligibility_evidence_json, quality_grade, fit_score,
			fit_note, deadline, deadline_evidence, summary, tags_json, source_name, source_url,
			checked_at, notes_json, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(external_id) DO UPDATE SET
			run_id = excluded.run_id, title = excluded.title, organization = excluded.organization,
			kind = excluded.kind, region = excluded.region, location_label = excluded.location_label,
			eligibility = excluded.eligibility, eligibility_label = excluded.eligibility_label,
			eligibility_evidence_json = excluded.eligibility_evidence_json,
			quality_grade = excluded.quality_grade, fit_score = excluded.fit_score,
			fit_note = excluded.fit_note, deadline = excluded.deadline,
			deadline_evidence = excluded.deadline_evidence, summary = excluded.summary,
			tags_json = excluded.tags_json, source_name = excluded.source_name,
			source_url = excluded.source_url, checked_at = excluded.checked_at,
			notes_json = excluded.notes_json, updated_at = excluded.updated_at`,
	).bind(
		opportunity.externalId, opportunity.externalId, opportunity.runId, opportunity.title,
		opportunity.organization, opportunity.kind, opportunity.region, opportunity.locationLabel,
		opportunity.eligibility, opportunity.eligibilityLabel, json(opportunity.eligibilityEvidence),
		opportunity.qualityGrade, opportunity.fitScore, opportunity.fitNote, opportunity.deadline,
		opportunity.deadlineEvidence, opportunity.summary, json(opportunity.tags), opportunity.sourceName,
		opportunity.sourceUrl, opportunity.checkedAt, json(opportunity.notes), timestamp, timestamp,
	);
}

async function findReceipt(db: D1DatabaseLike, idempotencyKey: string): Promise<ReceiptRow | null> {
	return db
		.prepare("SELECT payload_hash FROM ingest_receipts WHERE idempotency_key = ?")
		.bind(idempotencyKey)
		.first<ReceiptRow>();
}

export async function ingestMusePayload(
	db: D1DatabaseLike,
	idempotencyKey: string,
	payloadHash: string,
	payload: MuseIngestPayload,
	receivedAt: string,
): Promise<{ duplicate: boolean; opportunityCount: number; runId: string }> {
	const existing = await findReceipt(db, idempotencyKey);
	if (existing) {
		if (existing.payload_hash !== payloadHash) throw new IdempotencyConflictError();
		return { duplicate: true, opportunityCount: payload.opportunities.length, runId: payload.run.externalId };
	}

	const statements = [
		db.prepare("INSERT INTO ingest_receipts (idempotency_key, payload_hash, status, received_at) VALUES (?, ?, 'complete', ?)").bind(
			idempotencyKey,
			payloadHash,
			receivedAt,
		),
		runStatement(db, payload.run, receivedAt),
		...payload.opportunities.map((opportunity) => opportunityStatement(db, opportunity, receivedAt)),
	];
	try {
		await db.batch(statements);
	} catch (error) {
		// Two deliveries can pass the preflight read concurrently. If the receipt
		// was committed by the winner, turn the unique-key failure into the same
		// deterministic duplicate/conflict result as the preflight path.
		const committed = await findReceipt(db, idempotencyKey);
		if (committed) {
			if (committed.payload_hash !== payloadHash) throw new IdempotencyConflictError();
			return { duplicate: true, opportunityCount: payload.opportunities.length, runId: payload.run.externalId };
		}
		throw error;
	}
	return { duplicate: false, opportunityCount: payload.opportunities.length, runId: payload.run.externalId };
}

export async function listLiveOpportunities(db: D1DatabaseLike): Promise<Opportunity[]> {
	const result = await db
		.prepare(`SELECT id, title, organization, kind, region, location_label, eligibility,
			eligibility_label, eligibility_evidence_json, quality_grade, fit_score, fit_note,
			deadline, deadline_evidence, summary, tags_json, source_name, source_url,
			checked_at, notes_json FROM opportunities ORDER BY deadline ASC, updated_at DESC`)
		.all<OpportunityRow>();
	return result.results.map(toOpportunity);
}

export async function listLiveScrapeRuns(db: D1DatabaseLike): Promise<ScrapeRun[]> {
	const result = await db
		.prepare(`SELECT id, label, date, date_label, source_group, status, status_label,
			source_count, found_count, eligible_count, duration, grade_a_count, grade_b_count,
			grade_c_count, sources_json, notes_json FROM scrape_runs ORDER BY date DESC`)
		.all<ScrapeRunRow>();
	return result.results.map(toScrapeRun);
}
