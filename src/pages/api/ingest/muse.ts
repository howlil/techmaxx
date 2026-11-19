import type { APIRoute } from "astro";
import { isAuthorizedMuseRequest, sha256Hex } from "../../../features/muse-ingest/auth";
import {
	IdempotencyConflictError,
	ingestMusePayload,
	type D1DatabaseLike,
} from "../../../features/muse-ingest/database";
import { MusePayloadError, parseMusePayload } from "../../../features/muse-ingest/contract";
import { getD1Database, getMuseIngestToken } from "../../../server/cloudflare";

export const prerender = false;

const MAX_BODY_BYTES = 1_000_000;

function jsonResponse(body: Record<string, unknown>, status: number, headers: HeadersInit = {}): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
	});
}

function requestKey(request: Request): string | null {
	const value = request.headers.get("x-idempotency-key")?.trim();
	return value && value.length <= 128 ? value : null;
}

async function readBody(request: Request): Promise<{ raw: string; value: unknown }> {
	const declaredLength = Number(request.headers.get("content-length") ?? 0);
	if (declaredLength > MAX_BODY_BYTES) throw new MusePayloadError("payload too large");
	const raw = await request.text();
	if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) throw new MusePayloadError("payload too large");
	try {
		return { raw, value: JSON.parse(raw) };
	} catch {
		throw new MusePayloadError("payload must be valid JSON");
	}
}

async function ingest(request: Request, db: D1DatabaseLike, idempotencyKey: string): Promise<Response> {
	const { raw, value } = await readBody(request);
	const payload = parseMusePayload(value);
	const result = await ingestMusePayload(db, idempotencyKey, await sha256Hex(raw), payload, new Date().toISOString());
	return jsonResponse(
		{
			accepted: true,
			duplicate: result.duplicate,
			runId: result.runId,
			opportunityCount: result.opportunityCount,
		},
		result.duplicate ? 200 : 202,
	);
}

export const POST: APIRoute = async ({ request }) => {
	const db = getD1Database();
	const token = getMuseIngestToken();
	if (!db || !token) return jsonResponse({ error: "Ingestion is not configured" }, 503);
	if (!(await isAuthorizedMuseRequest(request, token))) {
		return jsonResponse({ error: "Unauthorized" }, 401, { "www-authenticate": "Bearer" });
	}
	const key = requestKey(request);
	if (!key) return jsonResponse({ error: "X-Idempotency-Key is required" }, 400);
	if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
		return jsonResponse({ error: "Content-Type must be application/json" }, 415);
	}

	try {
		return await ingest(request, db, key);
	} catch (error) {
		if (error instanceof MusePayloadError) return jsonResponse({ error: "Invalid payload" }, 400);
		if (error instanceof IdempotencyConflictError) return jsonResponse({ error: "Idempotency key conflict" }, 409);
		console.error("Muse ingestion failed", error instanceof Error ? error.message : "unknown error");
		return jsonResponse({ error: "Ingestion failed" }, 500);
	}
};
