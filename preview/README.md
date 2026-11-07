# Local preview of the prototype

`prototype/index.html` is a single-file HTML export of the Phase 1 clickable
prototype. It was produced in a Claude Artifact, so its markup arrived with
blob URLs (`/_blob/<hash>`) instead of image files, and without a document
preamble. The photographs now live in `prototype/assets/`; this folder stays as
the way to serve the page correctly for review.

It leaves `prototype/index.html` untouched on disk and is not part of the future
Astro product.

## Run

Double-click `start-preview.cmd` in the project folder — it starts the server and
opens the default browser. It needs Node.js (LTS); if Node is missing the
launcher says so instead of failing silently.

Or from a terminal, in the project folder:

    node preview/serve.mjs

Then open <http://127.0.0.1:4173/prototype/index.html>. If 4173 is busy the
server moves up one port at a time and prints the address it actually took;
`--open` launches the browser at that same, real address.

Options: `--port 5000`, `--root <project dir>`, `--open`. No dependencies are
installed — only the Node standard library is used.

## What the server does

- Serves the project folder as-is; `/` redirects to the prototype page.
- Answers any remaining `/_blob/<hash>` with a generated placeholder scene: a
  warm dusk landscape, a house, a plot scheme. This is only a fallback now — the
  page points at the files in `prototype/assets/` — and each placeholder carries
  a "ФОТО УТОЧНЯЕТСЯ" caption so a screenshot cannot be mistaken for real
  photography.
- Injects `<!DOCTYPE html>` and a viewport meta tag into the served HTML. The
  artifact export starts at `<meta>` with neither, which puts browsers in quirks
  mode and makes phones lay the page out 980 px wide. The file on disk is left
  untouched on purpose: it is re-synced from the artifact, so an edit there
  would be lost on the next sync. Fix belongs in the artifact source.

## Replacing the photographs

The current photographs are AI-generated mock-ups. To swap in real ones, overwrite
the files in `prototype/assets/` keeping the names and the slots they fill:

| File | Size | Where it shows |
| --- | --- | --- |
| `hero.webp` | 1600×900 | full-screen hero |
| `house-1.webp` … `house-4.webp` | 900×900 | intro mosaic, house cards, house popup |
| `territory.webp` | 900×900 | "Общая территория" block |
| `family.webp` | 1000×1000 | "Дети и питомцы" block |
| `map.webp` | 1672×940 | aerial view with the house pins |

The map pins are positioned in percentages of the image, so a different aerial
shot needs its pin coordinates adjusted in `prototype/index.html`.

## External resources the page loads

Google Fonts (Golos Text) and GSAP from cdnjs — both optional. Without them the
page falls back to system fonts and to the CSS-only scroll reveal; nothing
breaks, because every GSAP call is guarded by `window.gsap`.
