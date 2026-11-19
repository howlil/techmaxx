import { env } from "cloudflare:workers";
import type { D1DatabaseLike } from "../features/muse-ingest/database";

export function getD1Database(): D1DatabaseLike | undefined {
	return env.DB;
}

export function getMuseIngestToken(): string | undefined {
	return env.MUSE_INGEST_TOKEN;
}
