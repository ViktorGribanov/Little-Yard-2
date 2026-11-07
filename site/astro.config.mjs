// @ts-check
import { defineConfig } from 'astro/config';

// The site is a single static page. `output: 'static'` is the default, and it
// stays that way: only the booking widget and the contact form talk to the
// network at runtime.
//
// `site` is used for canonical URLs and the sitemap. It is a placeholder until
// the owner buys a domain (open question in REQUIREMENTS.md §6); the interim
// *.pages.dev address is set at deploy time.
export default defineConfig({
  site: 'https://little-yard.pages.dev',
  build: {
    // Inline the small amount of critical CSS the page needs; keeps the first
    // paint fast on mobile without a render-blocking request.
    inlineStylesheets: 'auto',
  },
});
