CREATE TABLE IF NOT EXISTS scrape_runs (
	id TEXT PRIMARY KEY,
	external_id TEXT NOT NULL UNIQUE,
	label TEXT NOT NULL,
	date TEXT NOT NULL,
	date_label TEXT NOT NULL,
	source_group TEXT NOT NULL,
	status TEXT NOT NULL CHECK (status IN ('complete', 'partial', 'review')),
	status_label TEXT NOT NULL,
	source_count INTEGER NOT NULL CHECK (source_count >= 0),
	found_count INTEGER NOT NULL CHECK (found_count >= 0),
	eligible_count INTEGER NOT NULL CHECK (eligible_count >= 0),
	duration TEXT NOT NULL,
	grade_a_count INTEGER NOT NULL CHECK (grade_a_count >= 0),
	grade_b_count INTEGER NOT NULL CHECK (grade_b_count >= 0),
	grade_c_count INTEGER NOT NULL CHECK (grade_c_count >= 0),
	sources_json TEXT NOT NULL,
	notes_json TEXT NOT NULL,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS opportunities (
	id TEXT PRIMARY KEY,
	external_id TEXT NOT NULL UNIQUE,
	run_id TEXT NOT NULL REFERENCES scrape_runs(id),
	title TEXT NOT NULL,
	organization TEXT NOT NULL,
	kind TEXT NOT NULL CHECK (kind IN ('hackathon', 'program', 'grant', 'fellowship', 'learning')),
	region TEXT NOT NULL CHECK (region IN ('global', 'jakarta')),
	location_label TEXT NOT NULL,
	eligibility TEXT NOT NULL CHECK (eligibility IN ('eligible', 'review')),
	eligibility_label TEXT NOT NULL,
	eligibility_evidence_json TEXT NOT NULL,
	quality_grade TEXT CHECK (quality_grade IS NULL OR quality_grade IN ('A', 'B', 'C')),
	fit_score INTEGER CHECK (fit_score IS NULL OR (fit_score >= 0 AND fit_score <= 100)),
	fit_note TEXT NOT NULL,
	deadline TEXT NOT NULL,
	deadline_evidence TEXT NOT NULL,
	summary TEXT NOT NULL,
	tags_json TEXT NOT NULL,
	source_name TEXT NOT NULL,
	source_url TEXT NOT NULL,
	checked_at TEXT NOT NULL,
	notes_json TEXT NOT NULL,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ingest_receipts (
	idempotency_key TEXT PRIMARY KEY,
	payload_hash TEXT NOT NULL,
	status TEXT NOT NULL CHECK (status IN ('complete')),
	received_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS opportunities_deadline_idx ON opportunities (deadline);
CREATE INDEX IF NOT EXISTS opportunities_region_idx ON opportunities (region);
CREATE INDEX IF NOT EXISTS opportunities_kind_idx ON opportunities (kind);
CREATE INDEX IF NOT EXISTS opportunities_updated_at_idx ON opportunities (updated_at);
CREATE INDEX IF NOT EXISTS scrape_runs_date_idx ON scrape_runs (date DESC);
