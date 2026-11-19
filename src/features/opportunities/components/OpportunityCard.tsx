import { Bookmark, Check, Clock3, MapPin } from "lucide-react";
import Badge from "../../../components/arc/badge/badge";
import Button from "../../../components/arc/button/button";
import { Card } from "../../../components/arc/card/card";
import { deadlineLabel, opportunityKindLabels, type Opportunity } from "../model";
import OpportunityDetails from "./OpportunityDetails";
import styles from "./OpportunityCard.module.css";

interface OpportunityCardProps {
	opportunity: Opportunity;
	now: number;
	isSaved: boolean;
	isReviewed: boolean;
	onToggleSaved: () => void;
	onToggleReviewed: () => void;
}

export default function OpportunityCard({
	opportunity,
	now,
	isSaved,
	isReviewed,
	onToggleSaved,
	onToggleReviewed,
}: OpportunityCardProps) {
	const actions = (
		<div className={styles.actions} onClick={(event) => event.stopPropagation()}>
			<Button
				size="sm"
				variant={isSaved ? "secondary" : "ghost"}
				aria-pressed={isSaved}
				aria-label={
					isSaved
						? "Hapus " + opportunity.title + " dari tersimpan"
						: "Simpan " + opportunity.title
				}
				onClick={onToggleSaved}
			>
				<Bookmark size={16} aria-hidden="true" />
				<span>{isSaved ? "Tersimpan" : "Simpan"}</span>
			</Button>
			<Button
				size="sm"
				variant={isReviewed ? "secondary" : "ghost"}
				aria-pressed={isReviewed}
				aria-label={
					isReviewed
						? "Batalkan review " + opportunity.title
						: "Tandai " + opportunity.title + " sudah direview"
				}
				onClick={onToggleReviewed}
			>
				<Check size={16} aria-hidden="true" />
				<span>{isReviewed ? "Direview" : "Review"}</span>
			</Button>
		</div>
	);

	return (
		<Card
			title={opportunity.title}
			description={opportunity.summary}
			meta={opportunity.organization}
			action={actions}
			details={<OpportunityDetails opportunity={opportunity} now={now} />}
			detailsPlacement="right"
			className={styles.card}
		>
			<div className={styles.content}>
				<div className={styles.topline}>
					<Badge size="sm" tone="neutral">
						{opportunityKindLabels[opportunity.kind]}
					</Badge>
					<div className={styles.location}>
						<MapPin size={16} aria-hidden="true" />
						<span>{opportunity.locationLabel}</span>
					</div>
				</div>

				<div className={styles.eligibility}>
					<Badge size="sm" tone={opportunity.eligibility === "eligible" ? "success" : "warning"} dot>
						{opportunity.eligibilityLabel}
					</Badge>
					<span className={styles.deadline}>
						<Clock3 size={16} aria-hidden="true" />
						{deadlineLabel(opportunity.deadline, now)}
					</span>
				</div>

				<div className={styles.scores}>
					<div>
						<span>Kualitas scrape</span>
						<strong>{opportunity.qualityGrade ? `Grade ${opportunity.qualityGrade}` : "Belum dinilai"}</strong>
					</div>
					<div>
						<span>Fit pribadi</span>
						<strong>{opportunity.fitScore ?? "—"}</strong>
					</div>
				</div>
			</div>
		</Card>
	);
}
