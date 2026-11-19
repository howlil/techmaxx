import { useState } from "react";
import { FixtureNotice } from "../../components/app-shell/FixtureNotice";
import type { BadgeTone } from "../../components/arc/badge/badge";
import Badge from "../../components/arc/badge/badge";
import { EmptyState } from "../../components/arc/empty-state/empty-state";
import Button from "../../components/arc/button/button";
import type { ScrapeRun, ScrapeRunStatus } from "./model";
import RunSummary from "./components/RunSummary";
import styles from "./RunHistoryPage.module.css";

const statusTone: Record<ScrapeRunStatus, BadgeTone> = {
	complete: "success",
	partial: "warning",
	review: "neutral",
};

interface RunHistoryPageProps {
	runs: ScrapeRun[];
	dataSource: "fixture" | "live";
}

export default function RunHistoryPage({ runs, dataSource }: RunHistoryPageProps) {
	const [selectedRunId, setSelectedRunId] = useState(runs[0]?.id ?? "");
	const selectedRun = runs.find((run) => run.id === selectedRunId) ?? runs[0];

	if (runs.length === 0) {
		return (
			<div className={styles.page}>
				<h1 className="sr-only">Riwayat scrape</h1>
				<EmptyState
					label="Riwayat scrape kosong"
					title="Belum ada run."
					description="Ringkasan akan muncul setelah data run tersedia."
				/>
			</div>
		);
	}

	return (
		<div className={styles.page}>
			<FixtureNotice label={dataSource === "fixture" ? "Data contoh" : "Data live"}>
				{dataSource === "fixture"
					? "Belum ada D1 binding; riwayat memakai fixture lokal."
					: "Riwayat dimuat dari D1 setelah ingest Muse."}
			</FixtureNotice>
			<h1 className="sr-only">Riwayat scrape</h1>

			<section className={styles.layout} aria-label="Riwayat dan ringkasan run">
				<aside className={styles.listPanel} aria-labelledby="run-list-title">
					<header className={styles.listHeading}>
						<h2 id="run-list-title">Eksekusi terbaru</h2>
					</header>

					<ol className={styles.runList}>
						{runs.map((run) => {
							const selected = run.id === selectedRun?.id;
							return (
								<li key={run.id}>
									<Button
										className={selected ? styles.runButtonSelected : styles.runButton}
										variant={selected ? "secondary" : "ghost"}
										size="md"
										aria-pressed={selected}
										onClick={() => setSelectedRunId(run.id)}
									>
										<span className={styles.runButtonContent}>
											<span className={styles.runTop}>
												<time dateTime={run.date}>{run.dateLabel}</time>
												<Badge size="sm" tone={statusTone[run.status]}>{run.statusLabel}</Badge>
											</span>
											<strong>{run.label}</strong>
											<span className={styles.runCounts}>
												{run.sourceCount} sumber <span aria-hidden="true">·</span> {run.foundCount} peluang
											</span>
										</span>
									</Button>
								</li>
							);
						})}
					</ol>

					<div className={styles.listFootnote}>
						<Badge size="sm" tone="neutral" dot>Fixture lokal</Badge>
					</div>
				</aside>

				<div className={styles.detail} aria-live="polite" aria-atomic="true">
					{selectedRun ? <RunSummary run={selectedRun} /> : null}
				</div>
			</section>
		</div>
	);
}
