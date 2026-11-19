declare global {
	interface Env {
		DB?: import("./features/muse-ingest/database").D1DatabaseLike;
		MUSE_INGEST_TOKEN?: string;
	}
}
export {};
