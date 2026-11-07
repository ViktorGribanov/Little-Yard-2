# CONTENT-MODEL.md — Little Yard landing site

What the site is made of, in CMS-neutral terms. This is the contract between the
content, the page templates and whatever editing interface is plugged in later
(Decap, Directus or anything else): the fields below are what an editor fills in,
the templates read them and never hard-code copy.

Rule of thumb: if a value appears on the page more than once, or the owner might
want to change it without a developer, it belongs in the content model. Layout,
spacing and colour do not.

## 1. Global settings (one record for the whole site)

| Field | Type | Notes |
| --- | --- | --- |
| `brand` | text | "Little Yard" — a wordmark for now, no logo file yet |
| `hero.headline` | text | Short, three to six words |
| `hero.description` | text | One or two sentences |
| `hero.facts` | list of 3 short items | Whole house / two bedrooms / fiber internet |
| `hero.photo` | image | Landscape, 16:9, the shot the page opens with |
| `hero.cta.primary` / `.secondary` | text | Button labels |
| `contacts.phone` | text | Displayed and used for `tel:` |
| `contacts.email` | text, optional | — |
| `contacts.address` | text | "адрес уточняется" until the owner confirms |
| `contacts.map` | url, optional | Route link (Yandex Maps) |
| `socials` | list of {network, url} | Empty entries are not rendered |
| `legal.privacy` | rich text | Personal-data policy |
| `legal.offer` | rich text | Public offer / rental terms |
| `seo.title` | text | ≤ 60 characters |
| `seo.description` | text | ≤ 160 characters |
| `seo.ogImage` | image | 1200×630, social preview |

## 2. Houses (collection)

One shared template renders every house; per-house differences live in data, not
markup (see `AGENTS.md` §4, "Reuse before creating"). Four records at launch, the
fifth is added later without touching code.

| Field | Type | Rules |
| --- | --- | --- |
| `slug` | text, unique | `house-1` … `house-5` |
| `name` | text | "Дом 1" |
| `status` | select | `bookable` \| `coming-soon` \| `hidden` |
| `area` | number, m² | > 0 — the 100 vs 110 m² discrepancy is still open |
| `capacity` | number | guests, 1–8 |
| `bedrooms` | number | — |
| `beds` | text | "две спальни, диван в гостиной" |
| `amenities` | list of keys | from the fixed dictionary below |
| `petPolicy` | select | `allowed` \| `approval` \| `not-allowed` |
| `petNote` | text, optional | Shown when policy is `approval` |
| `priceWeekend` | number, ₽ | per night, Fri–Sun |
| `weekdayDiscount` | number, % | global value is 30; per-house override if ever needed |
| `minNights` | number | default 1 |
| `description` | rich text | Two to four paragraphs for the popup |
| `photoMain` | image | Card + popup header, 4:3 |
| `photos` | list of images | Popup gallery |
| `floorPlan` | image, optional | Popup, later step |

**Amenity dictionary** (fixed keys → Russian labels + icon): `kitchen`,
`oven`, `microwave`, `fridge-filtered`, `washing-machine`, `smart-speaker`,
`tv`, `projector`, `sauna-infrared`, `crib`. Keeping this as a dictionary, not
free text, is what makes the amenity chips consistent across houses.

## 3. Section copy (one record per section)

Sections follow the confirmed structure in `REQUIREMENTS.md` §5. Each has the
same shape — `eyebrow?`, `title`, `lede?`, `items[]`, `cta?` — so the templates
stay uniform:

- `intro` — four houses on one plot
- `weekdays` — remote work, fiber internet, weekday discount (with three stat figures)
- `territory` — grill, parking, café, security, laundry, cleaning
- `kidsPets` — playground, table tennis, crib, pet approval
- `nearby` — river, walking routes, shops, café (each with a travel time)
- `rules` — check-in/out, cleaning cadence, quiet hours, smoking, pets
- `booking` — intro text, fallback explanation, form labels

## 4. FAQ (collection)

| Field | Type | Rules |
| --- | --- | --- |
| `question` | text | — |
| `answer` | rich text | — |
| `order` | number | manual sort |

## 5. Media

Images live with the content, not in the repository history. Required sizes:
hero 1600×900, house cards 900×900, section photos ~1000×1000, map 1672×940,
social preview 1200×630. Every image needs an `alt` text written by the editor —
the template must not invent one.

## 6. Validation worth enforcing at input time

- Prices and areas are positive numbers; capacity 1–8.
- A house with `status: bookable` must have `priceWeekend`, `capacity` and
  `photoMain` — otherwise it renders an empty card.
- `seo.title` ≤ 60 and `seo.description` ≤ 160 characters, otherwise search
  engines truncate them.
- Legal documents cannot be empty if their links are shown in the footer.

## 7. Open content questions (blocking real content, not the build)

Carried from `REQUIREMENTS.md` §6 and the voice-message addendum:

1. **House area** — brief says ~100 m², the content document says 110 m².
2. **Per-house data** — capacity, beds, which houses have the projector (two of
   them) and the infrared sauna (one), pet policy, prices.
3. **Real prices** — the prototype shows demonstration figures.
4. **Fifth house** — show as "строится / скоро" or hide entirely?
5. **Contacts and address** — phone, email, map, socials.
6. **Legal texts** — privacy policy and offer wording.
