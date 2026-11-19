# Product

## Problem
Actor / Acceptor / Trigger / Problem: the owner reviews Muse Scout results after a scan; opportunities are buried in unstructured chats, making eligibility and deadlines hard to compare.
J1: When new opportunities are found, I want to review their fit, graduate eligibility, evidence, and deadline in one private workspace, so I can decide what deserves attention without searching chat history.

## Behavior
B1: The opportunity page shows normalized opportunities with type, location, deadline, graduate eligibility, source evidence, scrape-quality grade, and personal fit score.
B2: The owner searches, filters by type/location/eligibility/review status, and sorts by fit or deadline; an empty result explains how to clear filters.
B3: Selecting an opportunity opens its detail panel; the panel starts closed, shows evidence and separate quality/fit values, and can be closed. The owner can save an opportunity or mark its review complete.
B4: The scrape-history route shows recent run status, time, source count, and discovered-result count.
X1 (B2): filters return no results → show a recoverable empty state and reset action.
X2 (B1,B3): eligibility or scrape quality is uncertain → label it for review and show the evidence; never present uncertainty as eligible.
X3 (B1,B4): opportunity provenance is identified as an example in expanded source details; run history remains labeled as fixture data; never imply Muse supplied the records.

## Constraints
C1: The workspace is for one owner and must be placed behind Cloudflare Access before real data is deployed.
C2: The first workflow covers global/online opportunities and Indonesian opportunities in Jakarta only; only graduate-eligible or uncertain opportunities are shown.
C3: Scrape-quality grade (A–C) and personal-fit score are distinct values; no grading formula has been supplied.
C4: Muse outbound HTTP/API capability is unverified; current records are fixtures.
Q1: Internal-tool accessibility baseline: keyboard operation, visible focus, semantic status announcements, and WCAG 2.2 AA contrast/target guidance.

## Scope
In: Astro app shell; opportunity list/detail; search, filters, sorting, saved/reviewed state; scrape-run history; clearly marked sample data.
Out: live Muse ingestion, D1 schema/migrations, Cloudflare Access account configuration/deployment, job tracker, news workflow, and automatic grade/fit calculation.

## Proof
P1 (B1,B2): Given the fixture set, the page shows the correct location, eligibility, quality grade, and fit score for each record.
P2 (B2,X1): Given any combination of filters, only matching records remain; a no-match state offers a working reset.
P3 (B3): On initial load detail is hidden; selecting a card reveals its matching evidence and closing it hides the detail again.
P4 (B4): Opening /runs shows run records and selecting a run updates its summary.
P5 (X2,C3): Unknown eligibility and grade C remain visibly reviewable and are never conflated with fit.
P6 (Q1): Core controls work by keyboard, focus is visible, and result changes are announced.

## Assumptions
A1 [non-blocking]: Until Muse HTTP capability and an ingestion contract are verified, fixture data is the only data source.
A2 [non-blocking]: Grades and fit scores in fixtures are illustrative; the app does not compute them.
A3 [non-blocking]: Cloudflare Access will be configured outside this repository before any live personal data is exposed.
