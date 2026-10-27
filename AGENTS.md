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
- **Checks.** Scale verification to risk. For interface changes, check in a browser (and on a phone-sized viewport). For anything touching the contact-form function or future booking integration, add an appropriate automated check once that logic exists. A successful build does not by itself confirm the interface is correct.
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
