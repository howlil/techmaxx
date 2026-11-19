import { listLiveScrapeRuns, type D1DatabaseLike } from "../muse-ingest/database";
import { scrapeRuns as fixtureRuns } from "./demo-data";
import type { ScrapeRun } from "./model";

export type ScrapeRunDataSource = "fixture" | "live";

export async function loadScrapeRuns(db?: D1DatabaseLike): Promise<{ records: ScrapeRun[]; source: ScrapeRunDataSource }> {
	if (!db) return { records: fixtureRuns, source: "fixture" };
	return { records: await listLiveScrapeRuns(db), source: "live" };
}
