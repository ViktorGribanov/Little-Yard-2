# Little Yard — landing site

A landing page for a small countryside house-rental business (four houses, a fifth planned), built so the owner can edit content himself without touching code, and so the site shows up when people search for the place.

## Current stage: Phase 1 review build

The documentation is settled and a clickable Phase 1 prototype exists — `prototype/index.html`, one self-contained HTML file with hard-coded placeholder content: no CMS, no booking widget, no contact-form backend. It exists to get the structural and visual direction approved, and is not the start of the Astro product described in `ARCHITECTURE.md`.

The Phase 2 Astro project now lives in `site\` — the landing page has been ported there from the prototype and builds cleanly. No CMS config, Cloudflare Function, or deployment exists yet.

The photographs in `prototype/assets/` are AI-generated mock-ups produced to review layout and tone. They are not real photography of the place and must not be published as if they were; real shots replace them before launch.

Per the current working agreement, no dependencies are installed, no external services are signed up for, and nothing is published until this is explicitly approved.

## Start here

Read in this order:

1. **`AGENTS.md`** — how to work on this project: language rules, where every source document lives, the rule that visual design is not yet approved, development principles, and the mandatory documentation-maintenance process.
2. **`REQUIREMENTS.md`** — what the site is, who it's for, confirmed scope, what's explicitly out of scope, the two build phases, the page structure, and the open questions still waiting on the owner.
3. **`ARCHITECTURE.md`** — the chosen technical stack (Astro + Decap CMS + Cloudflare Pages + a small Telegram-forwarding function), why it was chosen, planned code organization, and integration points.

The original Russian source material (brief, voice-message notes, full content/structure document, visual concept explorations) is indexed in `AGENTS.md` §2 and is not duplicated here.

## Running the prototype

The prototype is a static file, but it has to be served over HTTP. Its photographs point at blob URLs (`/_blob/<hash>`) that only ever existed inside the artifact it was exported from, and the exported markup has no `<!DOCTYPE html>` or viewport meta — opened from disk it renders in quirks mode, with broken images and a 980 px layout on phones.

`preview/serve.mjs` (Node, standard library only) serves the project folder, answers those blob URLs with labelled placeholder scenes, and injects the missing document preamble.

- Double-click `start-preview.cmd` in this folder, or run `node preview/serve.mjs`.
- It prints the address it took (default `http://127.0.0.1:4173/prototype/index.html`); `--open` also launches the default browser.
- `preview/README.md` covers the options and what the placeholders mean.

There is still no Astro install, build, or deploy command — this section grows into one when Phase 2 starts (see `ARCHITECTURE.md` §7 for where tooling decisions will be recorded).

## Running the site (Astro)

The real landing page is the Astro project in `site/`.

    cd site
    npm install
    npm run dev      # http://localhost:4321

`npm run build` produces static output in `site/dist/`. Content lives in
`site/src/data/` (houses, site settings, section copy, FAQ) — see
`site/docs/CONTENT-MODEL.md` for what each field means.

Node.js 22.23.4 or newer is required.
