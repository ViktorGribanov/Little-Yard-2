# ARCHITECTURE.md — Little Yard landing site

Status: decided, not yet implemented. No code exists yet (see `README.md`).

## 1. Chosen stack

- **Astro** (static site generator, islands architecture). Fits this project well because the site is content-heavy and mostly static (hero, house cards, territory, FAQ) with only a few interactive pieces (house popups, a date picker tied to the booking widget, the contact form) — Astro ships zero JS by default and only hydrates the interactive pieces, keeping mobile photo-heavy pages fast, which is an explicit requirement (see `REQUIREMENTS.md` §2 and `AGENTS.md` §4 "Performance").
- **Decap CMS**, configured with a **GitHub-backend** authentication flow (not the deprecated Netlify-Identity / Git Gateway path — that path is being phased out; see sources below). Chosen because the owner's confirmed, mandatory requirement is content editing by a non-technical person through a simple interface without code (`REQUIREMENTS.md` §2). Decap is git-based: edits a non-technical user makes through its UI become commits to the content files, with no separate database to run or pay for.
- **Cloudflare Pages** for hosting. Free static hosting with an official, documented Astro integration; also hosts the small serverless function needed for the contact form (see below) without a separate backend service.
- **A single Cloudflare Pages Function** to receive the contact-form submission (name, phone, comment — `REQUIREMENTS.md` §2) and forward it to a Telegram bot via the Telegram Bot API. This is the only server-side logic the project needs for v1; it avoids introducing a general-purpose backend for one small job.

Sources checked for this decision (see the WebSearch sources from this phase of the conversation):
- Decap CMS GitHub-backend as the supported alternative to the deprecated Netlify Identity/Git Gateway flow — https://github.com/decaporg/decap-cms/discussions/7419
- Astro's official Cloudflare integration — https://docs.astro.build/en/guides/integrations-guide/cloudflare/
- Cloudflare's own Astro framework guide (Pages + Pages Functions) — https://developers.cloudflare.com/workers/frameworks/framework-guides/astro/

## 2. Why not an alternative

A full CMS-backed dynamic stack (e.g., a Node/Next.js app with a hosted database) was considered and rejected for v1: it adds a database, a backend to operate, and hosting cost, none of which this project's confirmed scope needs (no accounts, no booking logic of its own, no complex queries — see `REQUIREMENTS.md` §3). The chosen stack keeps hosting free, keeps the content model simple (git-based files), and does not block adding real complexity later if the project grows (e.g., if a future requirement needs a database, that can be introduced then, without discarding Astro or the content structure already built).

**Noted risk, not independently verified:** accessibility of Cloudflare Pages and GitHub from Russia, where the project is based, could not be confirmed in this session. The owner should verify this directly (e.g., by loading a Cloudflare Pages demo site and github.com from their own network) before this stack is treated as final. If access turns out to be unreliable, the fallback is to swap only the hosting layer (e.g., to a Russia-reachable static host) — the Astro site and Decap content structure would not need to change.

## 3. Phasing and what each phase includes

See `REQUIREMENTS.md` §4 for the owner-confirmed phase split. Architecturally:

- **Phase 1 (clickable prototype).** Astro project only. All content (house data, prices, copy) hard-coded directly in Astro page/component files as placeholder data — no Decap CMS configured yet, no Pages Function, no real PMS widget (a disabled-looking or placeholder booking button is enough). Goal: something the owner can click through and approve the direction of, not a production build.
- **Phase 2 (working product).** Add: Decap CMS config (`/admin` route + `config.yml` + content collections for houses, prices, texts), the Telegram-forwarding Pages Function behind the contact form, the real PMS booking widget (once a provider is chosen — open question, see `REQUIREMENTS.md` §6), and basic SEO (meta tags, sitemap, semantic structure — Astro supports this natively).
- **Analytics** (Яндекс.Метрика / Google Analytics / ad pixels) is explicitly deferred past Phase 2 launch per the owner's answer. When added, it should be a small addition (a script snippet / a couple of Astro components), not a structural change — keep this constraint in mind when organizing the `<head>` and layout components so a later analytics snippet has one clear place to go.

## 4. Planned code organization

Not yet created. When Phase 1 begins, organize roughly as:

```
/src
  /layouts       — shared page shell (header, footer, meta)
  /components    — shared UI: house card, house popup/modal, quick-fact chip, nav, buttons
  /pages         — the single landing page (index.astro) assembling the sections from REQUIREMENTS.md §5
  /content       — (Phase 2) Decap-managed collections: houses, site texts, prices
/public          — static assets (images, favicon)
/functions       — (Phase 2) the Telegram-forwarding Pages Function
```

One shared house-popup template and one shared house-card component, driven by per-house data, not four separate hand-built components — this matches both the owner's stated preference and the content doc's existing template structure (see `AGENTS.md` §4 "Reuse before creating").

## 5. Data sources and integrations

- **Content source of truth (Phase 1):** hard-coded placeholder data in the repo, written from the "Контент лендинга Little Yard" document structure (see `AGENTS.md` §2) and the current (partly incomplete) per-house data in `Дополнения к брифу из войсов заказчика.md`.
- **Content source of truth (Phase 2):** Decap CMS-managed Markdown/YAML files in the same repo, edited by the owner through `/admin`, committed to GitHub.
- **Booking:** external PMS widget, provider not yet chosen (open question). Embedded as a third-party script/iframe; the site does not store or process booking data itself.
- **Contact form:** Astro form → Cloudflare Pages Function → Telegram Bot API → the owner's/manager's Telegram. No email, no CRM, per the owner's confirmed answer.
- **Analytics:** none at launch; deferred (see §3).

## 6. Constraints carried from requirements

- No application code, dependency installs, external service signups, or deployments are to happen until this documentation set and the owner's answers to the open questions in `REQUIREMENTS.md` §6 are reviewed and approved — the current stage is planning only (see `README.md`).
- Keep secrets (Telegram bot token, GitHub OAuth app credentials for Decap, any future analytics keys) out of the repository and out of client-side code (see `AGENTS.md` §4 "Data and access").
- Validate contact-form input server-side in the Pages Function before forwarding to Telegram.
- Visual/design decisions are explicitly out of this document's scope — see `AGENTS.md` §3.

## 7. Tooling (formatting, linting, type-checking, tests, build checks)

Not yet decided — no code exists. Record the decision here once Phase 1 development actually begins (see `AGENTS.md` §4, last bullet).

## 8. Open questions affecting this architecture

See `REQUIREMENTS.md` §6 for the full list. Directly relevant here: the PMS/booking provider (determines the widget-embedding approach), and confirmation that Cloudflare Pages/GitHub are reliably reachable from the owner's and guests' networks in Russia.
