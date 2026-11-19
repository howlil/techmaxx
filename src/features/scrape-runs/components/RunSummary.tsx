import Badge from "../../../components/arc/badge/badge";
import { Card } from "../../../components/arc/card/card";
import { Progress } from "../../../components/arc/progress/progress";
import type { BadgeTone } from "../../../components/arc/badge/badge";
import type { ScrapeRun, ScrapeRunStatus } from "../model";
import styles from "./RunSummary.module.css";

const statusTone: Record<ScrapeRunStatus, BadgeTone> = {
	complete: "success",
	partial: "warning",
	review: "neutral",
};

interface RunSummaryProps {
	run: ScrapeRun;
}

export default function RunSummary({ run }: RunSummaryProps) {
	const totalGraded = run.gradeCounts.A + run.gradeCounts.B + run.gradeCounts.C;
	const grades = (["A", "B", "C"] as const).map((grade) => ({
		grade,
		count: run.gradeCounts[grade],
	}));

	return (
		<Card
			title={run.label}
			className={styles.card}
		>
			<div className={styles.content}>
				<div className={styles.summaryMeta}>
					<Badge size="sm" tone={statusTone[run.status]} dot>{run.statusLabel}</Badge>
					<div className={styles.metaDetails}>
						<span className={styles.eligibility}>
							<strong>{run.eligibleCount}</strong>
							<span>peluang memenuhi syarat untuk lulusan</span>
						</span>
						<span className={styles.duration}>Durasi <strong>{run.duration}</strong></span>
					</div>
				</div>

				<section className={styles.section} aria-labelledby="run-grade-heading">
					<header className={styles.sectionHeading}>
						<h3 id="run-grade-heading">Distribusi grade</h3>
					</header>
					<div className={styles.grades}>
						{grades.map(({ grade, count }) => (
							<div className={styles.gradeRow} key={grade}>
								<Progress
									label={"Grade " + grade}
									value={count}
									max={totalGraded || 1}
								/>
								<strong>{count}</strong>
							</div>
						))}
					</div>
				</section>

				<section className={styles.section} aria-labelledby="run-sources-heading">
					<header className={styles.sectionHeading}>
						<h3 id="run-sources-heading">Sumber yang dipantau</h3>
					</header>
					<p className={styles.sources}>{run.sources.join(" · ")}</p>
				</section>

				{run.notes.length > 0 ? (
					<section className={styles.section} aria-labelledby="run-notes-heading">
						<header className={styles.sectionHeading}>
							<h3 id="run-notes-heading">Perlu dicek</h3>
						</header>
						<ul className={styles.notes}>
							{run.notes.map((note) => <li key={note}>{note}</li>)}
						</ul>
					</section>
				) : null}
			</div>
		</Card>
	);
}
