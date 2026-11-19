import { ExternalLink, MapPin } from "lucide-react";
import Badge from "../../../components/arc/badge/badge";
import { MetricCard } from "../../../components/arc/metric-card/metric-card";
import type { Opportunity } from "../model";
import { deadlineLabel, formatDate, opportunityKindLabels } from "../model";
import styles from "./OpportunityDetails.module.css";

interface OpportunityDetailsProps {
	opportunity: Opportunity;
	now: number;
}

export default function OpportunityDetails({ opportunity, now }: OpportunityDetailsProps) {
	return (
		<div className={styles.details}>
			<div className={styles.summaryLine}>
				<Badge size="sm" tone="neutral">{opportunityKindLabels[opportunity.kind]}</Badge>
				<span className={styles.location}>
						<MapPin size={16} aria-hidden="true" />
					{opportunity.locationLabel}
				</span>
			</div>

			<div className={styles.metrics}>
				<div className={styles.qualityMetric}>
					<span className={styles.metricLabel}>Kualitas scrape</span>
					<div>
						<Badge size="md" tone="neutral">
							{opportunity.qualityGrade ? `Grade ${opportunity.qualityGrade}` : "Belum dinilai"}
						</Badge>
					</div>
				</div>
				{opportunity.fitScore === null ? (
					<div className={styles.qualityMetric}>
						<span className={styles.metricLabel}>Fit pribadi</span>
						<strong>Belum dinilai</strong>
					</div>
				) : (
					<MetricCard
						label="Fit pribadi"
						value={opportunity.fitScore}
						context="Nilai terpisah dari grade scrape."
					/>
				)}
				<div className={styles.deadlineMetric}>
					<span className={styles.metricLabel}>Tenggat</span>
					<strong>{deadlineLabel(opportunity.deadline, now)}</strong>
					<span>{formatDate(opportunity.deadline)}</span>
				</div>
			</div>

			<section className={styles.section} aria-labelledby={"eligibility-" + opportunity.id}>
				<h3 id={"eligibility-" + opportunity.id}>Kelayakan lulusan</h3>
				<Badge size="sm" tone={opportunity.eligibility === "eligible" ? "success" : "warning"} dot>
					{opportunity.eligibilityLabel}
				</Badge>
				<ul className={styles.evidenceList}>
					{opportunity.eligibilityEvidence.map((evidence) => (
						<li key={evidence.label}>
							<strong>{evidence.label}</strong>
							<p>{evidence.text}</p>
						</li>
					))}
				</ul>
			</section>

			<section className={styles.section} aria-labelledby={"source-" + opportunity.id}>
				<h3 id={"source-" + opportunity.id}>Bukti sumber</h3>
				<div className={styles.sourceCard}>
					<div>
						<span className={styles.metricLabel}>Sumber contoh</span>
						<strong>{opportunity.sourceName}</strong>
					</div>
					<a href={opportunity.sourceUrl} target="_blank" rel="noreferrer">
						Buka sumber <ExternalLink size={16} aria-hidden="true" />
					</a>
				</div>
				<p className={styles.evidenceNote}>Tenggat: {opportunity.deadlineEvidence}</p>
				<p className={styles.checkedNote}>Terakhir dicek {opportunity.checkedAt}</p>
			</section>

			<section className={styles.section} aria-labelledby={"notes-" + opportunity.id}>
				<h3 id={"notes-" + opportunity.id}>Catatan</h3>
				<p className={styles.fitNote}>{opportunity.fitNote}</p>
				<ul className={styles.notesList}>
					{opportunity.notes.map((note) => <li key={note}>{note}</li>)}
				</ul>
				<div className={styles.tags} aria-label="Topik">
					{opportunity.tags.map((tag) => (
						<Badge key={tag} size="sm" tone="neutral" pill>{tag}</Badge>
					))}
				</div>
			</section>
		</div>
	);
}
