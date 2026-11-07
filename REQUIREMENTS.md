# REQUIREMENTS — Little Yard landing site

English working specification derived from the owner's original Russian materials. The Russian brief, the voice-message addendum, and the content/structure document remain the source of truth for wording, tone, and exact Russian copy — this file restates scope and constraints for implementation purposes and does not replace them. See the documentation map in `AGENTS.md` for where each source lives.

Status: Phase 1 review build exists (`prototype/index.html`, one static HTML file). No application code, CMS, or backend yet.

## 1. Product

Little Yard — a landing page for a small countryside house-rental business: four self-contained houses (a fifth is planned) on one shared, maintained plot, rented directly by the owner (no management company). Primary audience: remote workers/freelancers who need to confirm they can actually work there; secondary: families with children; pet owners, subject to per-house approval.

## 2. Confirmed scope — v1 (full product, phase 2)

- Single-page site (no separate pages per house); houses open in a modal/popup on one shared template; menu scrolls to on-page sections.
- Responsive: phone and desktop. Russian language only (no other language planned for v1 — confirmed by the owner).
- Main user action: choose a house → pick dates → book through a third-party hotel booking service (PMS widget). The site does not implement its own booking logic, payments, or availability calendar.
- A simple fallback contact form (name, phone, comment) for cases the booking widget can't handle (e.g., a pet needing approval, or the widget being unavailable). Submissions are delivered to a Telegram bot for the manager to pick up — **confirmed**, no email/CRM integration needed for v1.
- Basic SEO (indexable by search engines) is required from v1 — the owner's stated business problem is that people search for the place and find nothing.
- Content (prices, house specs, photos, rules, the planned fifth house, etc.) must be editable after launch by a **non-technical person** through a simple admin interface — **confirmed, mandatory**. This drives the architecture choice in `ARCHITECTURE.md`.

## 3. Confirmed out of scope

- No own booking engine, availability calendar, or price calculation — all via the external PMS widget (provider not yet chosen).
- No user accounts / personal cabinet, no mobile app, no blog, no shop.
- No analytics/tracking (Яндекс.Метрика, Google Analytics, ad pixels) at launch — **confirmed as wanted later**, not now. Must not require an architecture change to add later.
- No domain purchased yet; no separate development budget set yet. Both are open and should not block building a working version.

## 4. Phasing (owner's confirmed decision)

1. **Phase 1 — clickable visual prototype.** Static, hard-coded content, no CMS, no contact form wired to Telegram, no real booking widget. Purpose: let the owner review and approve a direction with the client before building the real product.
2. **Phase 2 — working product.** Wire up the CMS (non-technical content editing), the Telegram-connected contact form, SEO basics, and the real booking-service widget once chosen. Add analytics later, as a small addition, not a redesign.

## 5. Page structure and content

The approved structure and exact Russian copy live in the content/structure Google Doc referenced in `AGENTS.md`. Section summary for implementation purposes:

1. Header/nav — brand (temporary text wordmark "Little Yard", no logo yet), menu (Дома · Будни · Территория · Условия · Как добраться), header CTA.
2. Hero — headline, short description, quick facts (whole house / two bedrooms / fiber internet), primary CTA.
3. Place introduction — short text + layout/neighborhood diagram; fifth house mentioned as planned but not shown as bookable yet.
4. Houses — four cards on launch (fifth added later, same template), each opens a popup: gallery, floor plan, capacity, amenities, pet policy, price, booking CTA. **Per-house data (exact area, capacity, beds, projector/sauna assignment, pet policy, price, photos) is mostly placeholder (`[уточнить]`) in the source doc — not yet provided by the owner.**
5. Weekdays / remote work — fiber internet, 30% weekday discount, date-range booking entry point.
6. Territory & amenities — grill, parking (3 spaces per house), on-site café, fenced grounds with security/video surveillance, laundry, delivery, cleaning cadence.
7. Kids & pets — small playground, table tennis, crib on request; pet policy and pre-approval flow.
8. Nearby — river, walking routes, supermarkets, café/restaurant, with travel times.
9. Prices & rules — price, weekday discount, check-in/out times, cleaning, house rules (no smoking, quiet after 22:00).
10. FAQ.
11. Booking — entry point to the external PMS widget; pet flag field if the widget supports it, otherwise fallback to the contact form; error state if the widget fails to load.
12. Footer — contact details, route/map, legal/document links.

## 6. Open questions (not blocking Phase 1, must be resolved before Phase 2 launch)

- **Booking PMS provider** — not yet chosen. Blocks the real widget integration; Phase 1 prototype does not need it.
- **House area discrepancy** — brief says ~100 m² per house, content doc says 110 m². Needs one confirmed number from the owner.
- **Per-house data** — exact area, capacity, beds, which houses have a projector / the sauna, which allow pets, pricing, photos and floor plans. Needed before Phase 2 content can be final; Phase 1 can use placeholders.
- **Domain** — not purchased yet. Needed before a public launch; does not block development (see `ARCHITECTURE.md` for the interim address).
- **Development budget** — not set. Noted as an open constraint, not assumed.
- **Visual direction** — not approved; see `AGENTS.md` §4 and the separate (Russian) concept documents.
