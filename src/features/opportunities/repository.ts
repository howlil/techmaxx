import type { D1DatabaseLike } from "../muse-ingest/database";
import { listLiveOpportunities } from "../muse-ingest/database";
import { opportunities as fixtureOpportunities } from "./demo-data";
import type { Opportunity } from "./model";

export type OpportunityDataSource = "fixture" | "live";

export async function loadOpportunities(db?: D1DatabaseLike): Promise<{ records: Opportunity[]; source: OpportunityDataSource }> {
	if (!db) return { records: fixtureOpportunities, source: "fixture" };
	return { records: await listLiveOpportunities(db), source: "live" };
}
