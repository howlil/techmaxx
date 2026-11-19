const runsWorkspace = document.querySelector<HTMLElement>(".runs-page");

if (runsWorkspace) {
	const detail = runsWorkspace.querySelector<HTMLElement>("[data-run-detail]");
	const buttons = [...runsWorkspace.querySelectorAll<HTMLButtonElement>("[data-run-id]")];

	for (const button of buttons) {
		button.addEventListener("click", () => {
			const id = button.dataset.runId;
			const template = id ? document.getElementById(`run-summary-${id}`) : null;
			if (!detail || !(template instanceof HTMLTemplateElement)) return;

			for (const candidate of buttons) {
				const active = candidate === button;
				candidate.classList.toggle("is-active", active);
				candidate.setAttribute("aria-pressed", String(active));
			}

			detail.replaceChildren(template.content.cloneNode(true));
		});
	}
}
