# AGENTS.md — Little Yard landing site

Instructions for any agent (human or AI) working on this project.

## 1. Language rules

- Speak with the project owner (Viktor) in **Russian**: questions, explanations, progress updates, results.
- All maintained Markdown documentation in this repository — including headings, rules, explanations, and open-question notes — is written in **English**. File names are English too.
- Do not translate source material: the original brief, the owner's voice-message transcripts, the content/structure document, brand names, user-facing interface copy, and direct quotes keep their original language (Russian) where that language matters for meaning or for the live site's content.
- The language of this documentation does not determine the language of the future website. The website itself is Russian-only for v1 (see `REQUIREMENTS.md`).
- Convey the owner's answers precisely when summarizing them in English docs — do not add requirements that weren't stated.

## 2. Documentation map

Read in this order before starting any task:

1. **`AGENTS.md`** (this file) — always, first.
2. **`README.md`** — current project stage and how to get oriented. Always.
3. **`REQUIREMENTS.md`** — confirmed scope, user scenarios, exclusions, open questions. Always read before any implementation decision.
4. **`ARCHITECTURE.md`** — chosen stack, code organization, integrations. Read before writing or restructuring code.
5. **`DESIGN.md`** — does not exist yet. See §4 below before creating it.

Source material (Russian, not translated, kept as reference — not duplicated into the English docs):
- Brief: Google Sheets "Бриф — четыре загородных дома" (owner's Drive).
- `Дополнения к брифу из войсов заказчика.md` — what the owner's voice messages added to the brief, and a found discrepancy (house area: 100 m² in the brief vs 110 m² in the content doc — not yet resolved with the owner).
- Landing content/structure doc: Google Doc "Контент лендинга Little Yard" (https://docs.google.com/document/d/1ci5_gfPmdouFuS73irIqMGIBwEnySS2na6PwZl9q6LY/edit) — block-by-block copy, confirmed site structure, and placeholders (`[уточнить]`) still pending per-house data.
- `Три визуальные концепции дизайна.md` and `Промпты для GPT-image — hero-экран (3 концепции).md` — exploratory visual concepts. **Not approved.** See §4.

## 3. Design status — read before touching anything visual

The visual concept is **not approved**. Colors, typography, spacing values, component shapes and composition described in the concept documents are hypotheses for the owner to react to, not requirements.

- Do not hard-code any of those color/type/shape values into components or styles as if they were final.
- Do not ask the project owner to describe the future design in words just to fill out a document.
- The functional structure of the site (pages, sections, what each one needs to do) is separate from its visual form. A confirmed list of sections does not mean their composition is decided.
- Do not create a full `DESIGN.md` until there are approved visual materials (an agreed mockup, a reference with specific comments, or a working visual prototype).
- Once visual decisions are approved, create `DESIGN.md` if the project needs it. Link to the actual approved visual materials; record rules that help implementation. Do not try to replace the mockups with a detailed prose description of them.
- Prefer technical choices that stay open to future visual direction. If a technical decision would depend heavily on undecided visual behavior, flag the dependency and defer the decision where possible — do not lock in a specific component library whose constraints might fight the eventual concept, unless its use is already confirmed as necessary.

## 4. Development principles

- **Context first.** Read the applicable docs above before starting. For a content/scope question, `REQUIREMENTS.md` is authoritative. For a technical question, `ARCHITECTURE.md` is authoritative.
- **Reuse before creating.** Check for an existing component, function, or style before adding a new one. Implement shared elements (buttons, cards, the house-popup template) once, consistently — do not copy the same logic across sections or houses. This project explicitly wants one shared house template, not per-house custom treatment (owner's stated preference — see `REQUIREMENTS.md`).
- **Separation of concerns.** Keep interface rendering, data fetching (from the CMS), and business rules (e.g. which houses allow pets, weekday-discount display logic) in separate, clearly named places — don't mix them without reason.
- **Reasonable structure.** No arbitrary line-count limits and no mechanical file-splitting. Don't build an over-configurable universal component to merge things that are meaningfully different (e.g. don't force the four house cards into one mega-component with dozens of flags if their content genuinely differs — use a shared template with per-house data instead, which is what the content doc already calls for).
- **Visual consistency** — applies once a design is approved: store shared visual values (colors, spacing, type scale) centrally and use shared components; don't invent a separate visual system per page without a real reason.
- **Dependencies.** Before adding a library, check what the existing stack can already do. Record the reason for any significant new dependency in `ARCHITECTURE.md`.
- **Refactoring.** When changing internal structure, preserve existing behavior and appearance unless a behavior change is explicitly intended and called out separately. Don't bundle a large unrelated restructuring into an unrelated change.
- **Interface quality.** Account for responsiveness (phone + desktop, per requirements), keyboard accessibility, clear interactive states, long content (e.g. a long house description or many photos), and loading/error/empty states where applicable (e.g. the booking widget failing to load — the content doc already specifies a fallback message and manager contact).
- **Performance.** Avoid unnecessarily heavy assets or dependencies — mobile photo load speed is an explicit requirement. Define concrete checks for this project rather than promising generic "maximum speed."
- **Data and access.** Keep any secrets (Telegram bot token, GitHub OAuth credentials, future analytics keys) out of the repository and out of client-side code; validate the contact-form input server-side (in the Cloudflare Pages Function) before forwarding it. Clearly distinguish placeholder/demo data from real integrations (e.g., house prices marked `[TBD]` in the CMS are not real prices).
- **Checks.** For interface changes, check in a browser (and on a phone-sized viewport). See §7 for how automated testing is scoped and run.
- **Reporting.** State plainly what was done, how it was checked, what wasn't checked, and what the known limitations are. Don't call work finished if a required check wasn't run, without saying why.
- Decide per task which tooling should back these requirements (formatting, type-checking, linting, tests, build checks) and record that decision in `ARCHITECTURE.md` once code exists.

## 5. Keeping documentation current — mandatory

This is not optional and does not need a separate reminder for each task.

**Before a change:**
- Identify which document(s) describe the part of the project being touched.
- Check current requirements and constraints in those documents.
- Note any existing gap between documentation and the actual implementation.

**During a change:**
- Update the relevant document(s) if what they describe has changed.
- Add information about new features, architecture parts, or processes if needed to understand, build, or run the project.
- Remove or correct information about anything removed or replaced.
- Update links and paths if files were moved or renamed.
- Only mark a planned item as done once it is actually implemented and checked.

**Before finishing a task:**
- Check that the affected documents match the actual result.
- Check that the current instructions don't contradict each other.
- Report significant documentation updates together with the task result.

**What should trigger a documentation update** (non-exhaustive): a change in scope, v1 boundaries, or user scenarios; a significant page/feature added, changed, or removed; a change in project structure, module boundaries, or component responsibilities; a technology swap or a significant new dependency; a change in data models, data sources, APIs, or integrations; a change in auth, roles, or access rules; approval or revision of shared design decisions; a change in environment setup, run/build/check/deploy commands; a new significant constraint or technical decision; resolution of a previously recorded open question.

**Rules for the update itself:**
- Fix the outdated text in place — don't just append a note at the end of a document that's otherwise stale.
- Keep decision history only where it actually helps explain a current choice — don't narrate the whole development history.
- Don't rewrite confirmed requirements to match accidental code behavior. If the implementation violates a requirement, either fix the implementation or explicitly get the requirement changed with the project owner.
- Don't document every small edit, internal helper, or new file. Update when skipping it could cause the next person or agent to misunderstand the project, break an agreement, or fail to run/maintain it.
- Prefer updating an existing document. Create a new one only for a genuinely separate topic that doesn't fit existing files well — and add it to the documentation map in this file when you do.
- Don't duplicate the same rule in multiple files. Each kind of information has one home; link to it from elsewhere instead of repeating it.

## 6. Git workflow — mandatory

This repository is version-controlled with Git. No remote is configured yet — a remote is added only on the owner's separate instruction, never on its own.

**Commits are never created automatically.** Every commit requires the owner's explicit confirmation, given after seeing the proposed change.

**After each significant, logically complete change** (a finished feature addition or change, a meaningful bug fix, a refactor, an architecture/config/dependency change, or a substantive documentation update — not every small edit or intermediate step):

1. Run the applicable checks for that change.
2. Update the related Markdown documentation (per §5 above) so it matches the result.
3. Review the actual set and content of the changes.
4. Report briefly what changed and how it was checked.
5. Ask the owner whether to commit. Create the commit only after explicit agreement.

Don't ask about a commit after every file edit or intermediate step — group related edits into one logically complete change and ask once that whole change is finished and checked.

**Confirmation and commit composition:**
- No reply, a decline, or a switch to a different task all mean: do not commit. Keep the changes in the working tree. Silence is not consent.
- If changes from more than one task have accumulated by the time a commit is proposed, state the proposed composition explicitly — never fold in earlier deferred or unrelated changes silently. Offer separate commits when that fits better.
- Code changes and the documentation update for the same piece of work go into one commit.
- Confirmation covers only the composition that was actually proposed. If that composition changes materially afterward, ask again for the updated version.

**Git settings and limits:**
- Never invent or change global Git settings. Use only this repository's local settings.
- Never rewrite history, revert someone else's changes, or run a destructive operation without the owner's direct instruction.

**After creating a commit:** report its short hash, its message, and whether any uncommitted changes remain.

## 7. Testing — mandatory

No application code or tests exist yet. These rules govern testing from the point code is first written; they are recorded now so testing is never left as an afterthought.

**Tests are written alongside the code, not deferred.** Add the automated tests a new piece of functionality needs within the same task that adds it — not as a separately scheduled, open-ended step. Set up the actual testing tooling (test runner, etc.) when the first code that needs automated checks is written, matching the chosen stack (see `ARCHITECTURE.md` §7, not yet decided).

**Scope is driven by risk, not by a coverage target.** Do not require covering every scenario or hitting a percentage-coverage number. Prioritize:
- critical user scenarios (the paths a visitor actually relies on to get what they came for);
- significant business logic (e.g. weekday-discount display, pet-approval flow, which house data shows where);
- data validation, storage and retrieval (the contact-form submission, CMS-managed content);
- significant errors and failure handling (e.g. the booking widget failing to load);
- access rights, where the project has any.

Don't write tests for the sake of a count, for trivial markup, or to re-assert implementation details that aren't behavior.

**Changing code means re-examining the tests tied to that behavior.** Before a change, identify what behavior it touches and which existing tests cover it. If confirmed behavior changes, update the related tests and add coverage for the new conditions, in the same task. If behavior is preserved — including during a refactor — the existing tests for it must keep passing; don't rewrite them reflexively just because the code under them changed. If a significant change isn't covered by any existing test, add what's needed. Never change an expected result or delete a check purely to make a test pass — first establish whether the failure is an implementation bug, a deliberate requirements change, or a flaw in the test itself.

**Bug fixes get a regression test when one is reliable and useful.** Where feasible, confirm the test reproduces the bug before the fix, then confirm it passes after. If an automated test isn't practical for a given bug, verify another way and say so in the report.

**Checks run as the work happens, not only at the end.** After implementing a feature or fixing a bug, run the related tests and checks for the affected parts. When a change touches shared components, dependencies, configuration, or cross-module interaction, extend checks to the dependent parts too. Run the applicable checks before calling a task done. Before a release, run the full test suite that exists at that point and walk through critical scenarios directly. A successful build is not a substitute for behavior testing, and automated tests are not a substitute for checking the interface and responsiveness in a browser (see §4 "Checks").

**Test data stays isolated.** Use dedicated test data and environment. Tests must never modify real user/guest data. No secrets in the repository, including in test fixtures or config.

**Test-related documentation is kept current, in the same task as the change** (per §5): update the relevant doc when scenarios, verification rules, or testing tools change. Add run commands to `README.md` only once they are actually set up and have been verified to work — not in advance.

**Report results honestly.** State what tests were added or changed, which checks were run and their result, and what was not checked and why. Don't present the existence of test files as proof they pass. If a required check wasn't run, or fails, say so plainly as an incomplete part of the result — don't call the task finished regardless.

**Fixing problems a check turns up, within the current task:** diagnose the cause, fix it, and re-run the relevant checks yourself — don't just report the failure and stop, and don't ask permission for an ordinary fix that's part of the task at hand. After fixing, check the related scenarios that could have been affected. Keep going until the applicable checks pass or you hit a concrete obstacle that genuinely needs the owner's decision, or data/access you don't have. Never force a passing result by disabling a test, weakening a check, or tuning an expected value to match broken behavior. If the test itself is wrong, fix it against confirmed requirements; if the requirement is ambiguous, ask the owner what's expected rather than guessing. If you find a pre-existing bug unrelated to the current task, assess its impact, don't start a large unrelated fix on your own, and report it with a proposed separate fix — but say plainly if it's blocking the task in hand. If a fix can't be completed, report: what's broken, what cause was established, what was already tried, and what's needed to continue.

Fixing a problem found during checks and re-running the related checks doesn't need separate confirmation. Creating a commit still does (see §6).

### Scenarios expected to need tests (planned, not yet built)

Based on confirmed scope in `REQUIREMENTS.md` — listed so the shape of future test coverage is visible early, not as new requirements and not pinned to any specific tool yet:

- Contact-form submission: input validation (name, phone, comment), successful forwarding to the Telegram bot, and the error/failure path.
- Booking-widget integration: the fallback state when the widget fails to load (content doc specifies a fallback message and manager contact).
- House data rendering through the shared house-popup template: each house's data (capacity, amenities, pet policy, price) renders correctly for that house; the pet-approval display logic.
- Weekday-discount display logic (the 30% Mon–Fri discount).
- Content edited through Decap CMS rendering correctly on the live site.

No access-rights testing is currently anticipated — the site has no user accounts (see `REQUIREMENTS.md` §3); Decap's own GitHub-based login is third-party and out of this project's own test scope.
