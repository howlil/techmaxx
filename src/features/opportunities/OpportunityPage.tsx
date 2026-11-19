import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../../components/arc/button/button";
import { Checkbox } from "../../components/arc/checkbox/checkbox";
import ChipGroup from "../../components/arc/chip-group/chip-group";
import { EmptyState } from "../../components/arc/empty-state/empty-state";
import { MetricCard } from "../../components/arc/metric-card/metric-card";
import { SearchField } from "../../components/arc/search-field/search-field";
import { Select } from "../../components/arc/select/select";
import type { EligibilityState, Opportunity, OpportunityKind, OpportunityRegion } from "./model";
import { isDeadlineSoon } from "./model";
import OpportunityCard from "./components/OpportunityCard";
import styles from "./OpportunityPage.module.css";

const savedStorageKey = "scoutroom.saved-opportunities.v1";
const reviewedStorageKey = "scoutroom.reviewed-opportunities.v1";

type RegionFilter = "all" | OpportunityRegion;
type KindFilter = "all" | OpportunityKind;
type EligibilityFilter = "all" | EligibilityState;
type SortOrder = "fit" | "deadline";

const regionOptions = [
	{ value: "all", label: "Semua lokasi" },
	{ value: "global", label: "Global / online" },
	{ value: "jakarta", label: "Jakarta" },
];

const kindOptions = [
	{ value: "all", label: "Semua jenis" },
	{ value: "hackathon", label: "Hackathon" },
	{ value: "program", label: "Program" },
	{ value: "grant", label: "Grant" },
	{ value: "fellowship", label: "Fellowship" },
	{ value: "learning", label: "Learning" },
];

const eligibilityOptions = [
	{ value: "all", label: "Semua syarat" },
	{ value: "eligible", label: "Lulusan diterima" },
	{ value: "review", label: "Perlu diverifikasi" },
];

const sortOptions = [
	{ value: "fit", label: "Fit tertinggi" },
	{ value: "deadline", label: "Tenggat terdekat" },
];

function readIds(key: string): string[] {
	try {
		const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
		return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
	} catch {
		return [];
	}
}

function persistIds(key: string, values: string[]): boolean {
	try {
		window.localStorage.setItem(key, JSON.stringify(values));
		return true;
	} catch {
		return false;
	}
}

interface OpportunityPageProps {
	opportunities: Opportunity[];
	now: number;
}

export default function OpportunityPage({ opportunities, now }: OpportunityPageProps) {
	const [search, setSearch] = useState("");
	const [region, setRegion] = useState<RegionFilter>("all");
	const [kind, setKind] = useState<KindFilter>("all");
	const [eligibility, setEligibility] = useState<EligibilityFilter>("all");
	const [sortOrder, setSortOrder] = useState<SortOrder>("fit");
	const [savedOnly, setSavedOnly] = useState(false);
	const [reviewedOnly, setReviewedOnly] = useState(false);
	const [filtersOpen, setFiltersOpen] = useState(true);
	const [savedIds, setSavedIds] = useState<string[]>([]);
	const [reviewedIds, setReviewedIds] = useState<string[]>([]);
	const [storageNotice, setStorageNotice] = useState("");
	const searchRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setSavedIds(readIds(savedStorageKey));
		setReviewedIds(readIds(reviewedStorageKey));
	}, []);

	useEffect(() => {
		const media = window.matchMedia("(max-width: 900px)");
		const updateFilters = () => setFiltersOpen(!media.matches);
		updateFilters();
		media.addEventListener("change", updateFilters);
		return () => media.removeEventListener("change", updateFilters);
	}, []);

	useEffect(() => {
		const handleShortcut = (event: KeyboardEvent) => {
			if (event.key !== "/" || event.altKey || event.ctrlKey || event.metaKey) return;
			const target = event.target;
			if (
				target instanceof HTMLElement &&
				(target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
			) {
				return;
			}
			event.preventDefault();
			searchRef.current?.focus();
		};

		document.addEventListener("keydown", handleShortcut);
		return () => document.removeEventListener("keydown", handleShortcut);
	}, []);

	const filteredOpportunities = useMemo(() => {
		const query = search.trim().toLocaleLowerCase("id-ID");

		return opportunities
			.filter((opportunity) => {
				const haystack = [
					opportunity.title,
					opportunity.organization,
					opportunity.locationLabel,
					opportunity.summary,
					...opportunity.tags,
				]
					.join(" ")
					.toLocaleLowerCase("id-ID");

				return (
					(!query || haystack.includes(query)) &&
					(region === "all" || opportunity.region === region) &&
					(kind === "all" || opportunity.kind === kind) &&
					(eligibility === "all" || opportunity.eligibility === eligibility) &&
					(!savedOnly || savedIds.includes(opportunity.id)) &&
					(!reviewedOnly || reviewedIds.includes(opportunity.id))
				);
			})
			.sort((left, right) =>
				sortOrder === "deadline"
					? left.deadline.localeCompare(right.deadline)
					: right.fitScore - left.fitScore,
			);
	}, [
		opportunities,
		search,
		region,
		kind,
		eligibility,
		sortOrder,
		savedOnly,
		reviewedOnly,
		savedIds,
		reviewedIds,
	]);

	const soonCount = opportunities.filter((opportunity) => isDeadlineSoon(opportunity.deadline, now)).length;
	const reviewCount = opportunities.filter((opportunity) => opportunity.eligibility === "review").length;
	const hasFilters =
		Boolean(search.trim()) ||
		region !== "all" ||
		kind !== "all" ||
		eligibility !== "all" ||
		sortOrder !== "fit" ||
		savedOnly ||
		reviewedOnly;
	const activeSettingCount = [
		Boolean(search.trim()),
		region !== "all",
		kind !== "all",
		eligibility !== "all",
		sortOrder !== "fit",
		savedOnly,
		reviewedOnly,
	].filter(Boolean).length;

	function resetFilters() {
		setSearch("");
		setRegion("all");
		setKind("all");
		setEligibility("all");
		setSortOrder("fit");
		setSavedOnly(false);
		setReviewedOnly(false);
	}

	function toggleSaved(id: string) {
		const next = savedIds.includes(id) ? savedIds.filter((value) => value !== id) : [...savedIds, id];
		setSavedIds(next);
		const stored = persistIds(savedStorageKey, next);
		setStorageNotice(
			stored
				? "Status simpan tersimpan di browser ini."
				: "Browser tidak mengizinkan penyimpanan; perubahan hanya berlaku selama sesi ini.",
		);
	}

	function toggleReviewed(id: string) {
		const next = reviewedIds.includes(id)
			? reviewedIds.filter((value) => value !== id)
			: [...reviewedIds, id];
		setReviewedIds(next);
		const stored = persistIds(reviewedStorageKey, next);
		setStorageNotice(
			stored
				? "Status review tersimpan di browser ini."
				: "Browser tidak mengizinkan penyimpanan; perubahan hanya berlaku selama sesi ini.",
		);
	}

	return (
		<div className={styles.page}>
			<header>
				<h1 className={styles.pageTitle} id="opportunity-inbox-title">Semua peluang</h1>
			</header>

			<div className={styles.metrics} aria-label="Ringkasan peluang contoh">
				<MetricCard label="Peluang contoh" value={opportunities.length} />
				<MetricCard label="Tenggat dekat" value={soonCount} context="Dalam tujuh hari" />
				<MetricCard label="Perlu diverifikasi" value={reviewCount} context="Syarat lulusan" />
			</div>

			<section className={styles.workspace} aria-labelledby="opportunity-inbox-title">
				<aside className={styles.filterPanel} aria-labelledby="opportunity-filter-title">
					<header className={styles.filterHeading}>
						<h2 id="opportunity-filter-title">Filter</h2>
						<Button
							size="sm"
							variant="ghost"
							aria-controls="opportunity-filter-controls"
							aria-expanded={filtersOpen}
							onClick={() => setFiltersOpen((open) => !open)}
						>
							{filtersOpen ? "Sembunyikan" : "Tampilkan"} filter
							{activeSettingCount > 0 ? <span className={styles.activeCount}>{activeSettingCount} aktif</span> : null}
						</Button>
					</header>

					<div className={styles.filterContent} id="opportunity-filter-controls" hidden={!filtersOpen}>
						<div className={styles.queryRow}>
							<div className={styles.search}>
								<SearchField
									ref={searchRef}
									label="Cari peluang"
									placeholder="Nama, topik, lokasi..."
									autoComplete="off"
									value={search}
									onValueChange={setSearch}
								/>
								<kbd aria-hidden="true">/</kbd>
							</div>

							<div className={styles.locationFilter}>
								<span className={styles.filterLabel} aria-hidden="true">Lokasi</span>
								<ChipGroup
									label="Lokasi"
									options={regionOptions}
									value={[region]}
									onValueChange={(values) => setRegion((values[0] ?? "all") as RegionFilter)}
									multiple={false}
								/>
							</div>
						</div>

						<div className={styles.filterGrid}>
							<Select
								label="Jenis peluang"
								placeholder="Pilih jenis"
								options={kindOptions}
								value={kind}
								onValueChange={(value) => setKind(value as KindFilter)}
							/>
							<Select
								label="Kelayakan lulusan"
								placeholder="Pilih kelayakan"
								options={eligibilityOptions}
								value={eligibility}
								onValueChange={(value) => setEligibility(value as EligibilityFilter)}
							/>
							<Select
								label="Urutkan"
								placeholder="Urutkan"
								options={sortOptions}
								value={sortOrder}
								onValueChange={(value) => setSortOrder(value as SortOrder)}
							/>
						</div>

						<div className={styles.filterOptions}>
							<Checkbox
								checked={savedOnly}
								onCheckedChange={(checked) => setSavedOnly(checked === true)}
								label="Tersimpan"
							/>
							<Checkbox
								checked={reviewedOnly}
								onCheckedChange={(checked) => setReviewedOnly(checked === true)}
								label="Sudah direview"
							/>
						</div>
					</div>
				</aside>

				<section className={styles.results} aria-labelledby="opportunity-results-title">
					<header className={styles.resultsHeading}>
						<h2 id="opportunity-results-title">Peluang ditemukan</h2>
						<div className={styles.resultsActions}>
							<p className={styles.resultCount} role="status" aria-live="polite" aria-atomic="true">
								{filteredOpportunities.length} dari {opportunities.length} peluang ditampilkan
							</p>
							{hasFilters ? (
								<Button size="sm" variant="secondary" onClick={resetFilters}>
									Reset filter
								</Button>
							) : null}
						</div>
					</header>

					{filteredOpportunities.length > 0 ? (
						<div className={styles.grid}>
							{filteredOpportunities.map((opportunity) => (
								<OpportunityCard
									key={opportunity.id}
									opportunity={opportunity}
									now={now}
									isSaved={savedIds.includes(opportunity.id)}
									isReviewed={reviewedIds.includes(opportunity.id)}
									onToggleSaved={() => toggleSaved(opportunity.id)}
									onToggleReviewed={() => toggleReviewed(opportunity.id)}
								/>
							))}
						</div>
					) : (
						<EmptyState
							label="Hasil pencarian kosong"
							title="Belum ada peluang yang cocok."
							description="Coba ganti kata kunci atau longgarkan filter yang aktif."
							action={
								<Button variant="secondary" onClick={resetFilters}>
									Hapus semua filter
								</Button>
							}
						/>
					)}
				</section>
			</section>

			{storageNotice ? (
				<p className={styles.storageNotice} role="status" aria-live="polite">
					{storageNotice}
				</p>
			) : null}
		</div>
	);
}
