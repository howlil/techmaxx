---
colors: {page: "#FAFAFA", surface: "#FFFFFF", text: "#171717", muted: "#525252", accent: "#171717", border: "#DEDEDE"}
typography: {interface: "Inter / system-ui", display: "28px / 1.2 / 500", body: "14–15px", meta: "12px"}
spacing: {unit: "4px", page: "24px", group: "12–16px"}
radius: {control: "8px", card: "12px", panel: "16px"}
motion: {hover: "150ms color/border", reduced: "none"}
components: {button: "quiet outline or one black primary", card: "flat white surface and neutral hairline"}
---
## Direction
Product: A private console for reviewing opportunities found by Muse Scout.
Character: quiet, exact, orderly.
World: a personal research ledger in black ink on white paper, separated by fine graphite rules; no hue accents.
Moments: deadline urgency and eligibility evidence carry the strongest contrast.
Signature: show scrape-quality grade beside a separate personal-fit score.

## Guardrails
Use locally installed free UIArc components for controls, cards, dialogs, status labels, and data summaries. Astro owns the document and routes; React feature islands compose UIArc source. Keep every visible state in a black, white, or gray token. Status meaning must come from its text and shape, never color alone. Prefer flat surfaces, thin rules, and compact stat strips over repeated rounded tiles.

## State
Filters and detail visibility are page-local. Sidebar collapse preference persists only in this browser. Saved/reviewed IDs persist only in this browser for the fixture slice. Server data remains owned by the feature repository.

## Patterns
Use route navigation for Peluang and Riwayat scrape. The desktop sidebar collapses to an icon rail; on narrow screens keep the full-width horizontal navigation. On desktop, place opportunity filters in a slim, sticky left rail beside the result cards; collapse the filter controls on narrow screens and keep the live result count next to the list. Keep opportunity detail closed initially; selecting a card opens a right-side drawer, full-screen on narrow screens, and closing it returns to the list. On narrow screens, stack run detail after the run list and keep controls in reading order.

## Accessibility
Keyboard-operable buttons and filters, visible focus, live result count, reduced-motion support, and WCAG 2.2 AA contrast/target guidance.

## Content and scrolling
Show each fact once per surface. In master-detail views, the selected title may repeat for orientation, while dates and counts stay in one canonical location. Keep one concise fixture marker, and show action-oriented notes only when present. Hide scrollbar chrome globally while preserving native wheel, touch, and keyboard scrolling.
