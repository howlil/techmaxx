const savedStorageKey = "scoutroom.saved-opportunities.v1";
const reviewedStorageKey = "scoutroom.reviewed-opportunities.v1";

function readIds(key: string): Set<string> {
	try {
		const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
		return Array.isArray(value)
			? new Set(value.filter((entry): entry is string => typeof entry === "string"))
			: new Set();
	} catch {
		return new Set();
	}
}

function persistIds(key: string, values: Set<string>): boolean {
	try {
		window.localStorage.setItem(key, JSON.stringify([...values]));
		return true;
	} catch {
		return false;
	}
}

function initOpportunityWorkspace(): void {
	const workspaceNode = document.querySelector<HTMLElement>(".opportunity-page");
	if (!workspaceNode) return;
	const workspace: HTMLElement = workspaceNode;

	const gridNode = workspace.querySelector<HTMLElement>("[data-opportunity-grid]");
	const searchInputNode = workspace.querySelector<HTMLInputElement>("[data-search-input]");
	const kindSelectNode = workspace.querySelector<HTMLSelectElement>("[data-filter-kind]");
	const eligibilitySelectNode = workspace.querySelector<HTMLSelectElement>("[data-filter-eligibility]");
	const sortSelectNode = workspace.querySelector<HTMLSelectElement>("[data-sort-select]");
	const savedCheckboxNode = workspace.querySelector<HTMLInputElement>("[data-filter-saved]");
	const reviewedCheckboxNode = workspace.querySelector<HTMLInputElement>("[data-filter-reviewed]");
	const resultsLiveNode = workspace.querySelector<HTMLElement>("[data-results-live]");
	const emptyStateNode = workspace.querySelector<HTMLElement>("[data-empty-state]");
	const resetButton = workspace.querySelector<HTMLButtonElement>(".workspace-heading [data-reset-filters]");
	const dialogNode = workspace.querySelector<HTMLDialogElement>("#opportunity-dialog");
	const detailBodyNode = workspace.querySelector<HTMLElement>("#detail-body");
	const stateNote = workspace.querySelector<HTMLElement>("[data-browser-state-note]");

	if (!gridNode || !searchInputNode || !kindSelectNode || !eligibilitySelectNode || !sortSelectNode || !savedCheckboxNode || !reviewedCheckboxNode || !resultsLiveNode || !emptyStateNode || !dialogNode || !detailBodyNode) {
		return;
	}

	const grid: HTMLElement = gridNode;
	const searchInput: HTMLInputElement = searchInputNode;
	const kindSelect: HTMLSelectElement = kindSelectNode;
	const eligibilitySelect: HTMLSelectElement = eligibilitySelectNode;
	const sortSelect: HTMLSelectElement = sortSelectNode;
	const savedCheckbox: HTMLInputElement = savedCheckboxNode;
	const reviewedCheckbox: HTMLInputElement = reviewedCheckboxNode;
	const resultsLive: HTMLElement = resultsLiveNode;
	const emptyState: HTMLElement = emptyStateNode;
	const dialog: HTMLDialogElement = dialogNode;
	const detailBody: HTMLElement = detailBodyNode;

	const cards = [...grid.querySelectorAll<HTMLElement>("[data-opportunity-card]")];
	const regionButtons = [...workspace.querySelectorAll<HTMLButtonElement>("[data-filter-region]")];
	const savedIds = readIds(savedStorageKey);
	const reviewedIds = readIds(reviewedStorageKey);
	let region = "all";

	function syncActionButtons(): void {
		workspace.querySelectorAll<HTMLButtonElement>("[data-save]").forEach((button) => {
			const id = button.dataset.opportunityId ?? "";
			const saved = savedIds.has(id);
			const title = button.dataset.title ?? "peluang";
			button.setAttribute("aria-pressed", String(saved));
			button.setAttribute("aria-label", saved ? `Hapus ${title} dari tersimpan` : `Simpan ${title}`);
			const label = button.querySelector<HTMLElement>(".icon-action__label");
			if (label) label.textContent = saved ? "Tersimpan" : "Simpan";
		});

		workspace.querySelectorAll<HTMLButtonElement>("[data-review]").forEach((button) => {
			const id = button.dataset.opportunityId ?? "";
			const reviewed = reviewedIds.has(id);
			const title = button.dataset.title ?? "peluang";
			const inDetail = button.closest(".detail-actions") !== null;
			button.setAttribute("aria-pressed", String(reviewed));
			button.setAttribute("aria-label", reviewed ? `Batalkan status review ${title}` : `Tandai ${title} sudah direview`);
			const label = button.querySelector<HTMLElement>(".icon-action__label");
			if (label) label.textContent = reviewed ? (inDetail ? "Review selesai" : "Selesai") : (inDetail ? "Tandai sudah direview" : "Review");
		});
	}

	function applyFilters(): void {
		const query = searchInput.value.trim().toLocaleLowerCase("id-ID");
		const kind = kindSelect.value;
		const eligibility = eligibilitySelect.value;
		const savedOnly = savedCheckbox.checked;
		const reviewedOnly = reviewedCheckbox.checked;
		const sortBy = sortSelect.value;

		cards.sort((left, right) => {
			if (sortBy === "deadline") {
				const leftDate = left.dataset.deadline ? Date.parse(`${left.dataset.deadline}T00:00:00+07:00`) : Number.POSITIVE_INFINITY;
				const rightDate = right.dataset.deadline ? Date.parse(`${right.dataset.deadline}T00:00:00+07:00`) : Number.POSITIVE_INFINITY;
				return leftDate - rightDate;
			}
			return Number(right.dataset.fit ?? 0) - Number(left.dataset.fit ?? 0);
		});

		let visibleCount = 0;
		for (const card of cards) {
			const id = card.dataset.opportunityId ?? "";
			const searchableText = `${card.dataset.search ?? ""} ${card.textContent ?? ""}`.toLocaleLowerCase("id-ID");
			const matches =
				(!query || searchableText.includes(query)) &&
				(region === "all" || card.dataset.region === region) &&
				(kind === "all" || card.dataset.kind === kind) &&
				(eligibility === "all" || card.dataset.eligibility === eligibility) &&
				(!savedOnly || savedIds.has(id)) &&
				(!reviewedOnly || reviewedIds.has(id));

			card.hidden = !matches;
			if (matches) visibleCount += 1;
			grid.append(card);
		}

		const hasFilters = Boolean(query) || region !== "all" || kind !== "all" || eligibility !== "all" || savedOnly || reviewedOnly;
		if (resetButton) resetButton.hidden = !hasFilters;
		for (const button of regionButtons) {
			const active = button.dataset.filterRegion === region;
			button.classList.toggle("is-active", active);
			button.setAttribute("aria-pressed", String(active));
		}
		grid.hidden = visibleCount === 0;
		emptyState.hidden = visibleCount !== 0;
		resultsLive.textContent = `${visibleCount} dari ${cards.length} peluang ditampilkan`;
	}

	function resetFilters(): void {
		searchInput.value = "";
		kindSelect.value = "all";
		eligibilitySelect.value = "all";
		sortSelect.value = "fit";
		savedCheckbox.checked = false;
		reviewedCheckbox.checked = false;
		region = "all";
		applyFilters();
	}

	searchInput.addEventListener("input", applyFilters);
	kindSelect.addEventListener("change", applyFilters);
	eligibilitySelect.addEventListener("change", applyFilters);
	sortSelect.addEventListener("change", applyFilters);
	savedCheckbox.addEventListener("change", applyFilters);
	reviewedCheckbox.addEventListener("change", applyFilters);
	regionButtons.forEach((button) => {
		button.addEventListener("click", () => {
			region = button.dataset.filterRegion ?? "all";
			applyFilters();
		});
	});
	workspace.querySelectorAll<HTMLButtonElement>("[data-reset-filters]").forEach((button) => {
		button.addEventListener("click", resetFilters);
	});

	workspace.addEventListener("click", (event) => {
		if (!(event.target instanceof Element)) return;
		const target = event.target;

		const saveButton = target.closest<HTMLButtonElement>("[data-save]");
		if (saveButton) {
			const id = saveButton.dataset.opportunityId ?? "";
			if (savedIds.has(id)) savedIds.delete(id);
			else savedIds.add(id);
			const saved = persistIds(savedStorageKey, savedIds);
			syncActionButtons();
			applyFilters();
			if (stateNote) stateNote.textContent = saved ? "Status simpan tersimpan di browser ini." : "Browser tidak mengizinkan penyimpanan; perubahan hanya berlaku selama sesi ini.";
			return;
		}

		const reviewButton = target.closest<HTMLButtonElement>("[data-review]");
		if (reviewButton) {
			const id = reviewButton.dataset.opportunityId ?? "";
			if (reviewedIds.has(id)) reviewedIds.delete(id);
			else reviewedIds.add(id);
			const saved = persistIds(reviewedStorageKey, reviewedIds);
			syncActionButtons();
			applyFilters();
			if (stateNote) stateNote.textContent = saved ? "Status review tersimpan di browser ini." : "Browser tidak mengizinkan penyimpanan; perubahan hanya berlaku selama sesi ini.";
			return;
		}

		const closeButton = target.closest<HTMLButtonElement>("[data-close-detail]");
		if (closeButton) {
			dialog.close();
			return;
		}

		const openButton = target.closest<HTMLButtonElement>("[data-open-opportunity]");
		if (!openButton || dialog.open) return;
		const id = openButton.dataset.opportunityId;
		const template = id ? document.getElementById(`detail-${id}`) : null;
		if (!(template instanceof HTMLTemplateElement)) return;

		detailBody.replaceChildren(template.content.cloneNode(true));
		syncActionButtons();
		dialog.showModal();
		detailBody.querySelector<HTMLElement>("#detail-heading")?.focus({ preventScroll: true });
	});

	dialog.addEventListener("click", (event) => {
		if (event.target === dialog) dialog.close();
	});
	dialog.addEventListener("close", () => detailBody.replaceChildren());

	document.addEventListener("keydown", (event) => {
		if (event.key !== "/" || dialog.open || event.altKey || event.ctrlKey || event.metaKey) return;
		const target = event.target;
		if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || (target instanceof HTMLElement && target.isContentEditable)) return;
		event.preventDefault();
		searchInput.focus();
	});

	syncActionButtons();
	applyFilters();
}

initOpportunityWorkspace();
