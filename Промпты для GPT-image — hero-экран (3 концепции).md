# Промпты для генерации hero-экрана (GPT-image)

Для каждой из трёх визуальных концепций (см. «Три визуальные концепции дизайна.md») — отдельный самодостаточный промпт на английском. Используют одинаковый блок точных текстов (из документа «Контент лендинга Little Yard», раздел «01 Шапка и навигация» + «02 Первый экран») и одинаковые ограничения; отличаются визуальное направление, типографика, цвет, геометрия и работа с изображениями.

## Концепция 1 — «Тихий дом»

```
RESULT
A single finished screenshot of a real, live website hero section together with its site header, for a countryside house-rental brand. Present it as a direct screenshot of a working site — no device frame, no browser chrome, no mockup, no perspective, no presentation environment, no annotations, no watermarks. Everything described below must fit inside one frame. Do not show any other page section below the hero.

VISUAL DIRECTION
Calm, honest, editorial mood — like a page from a quiet travel/interiors magazine about countryside life, not a glossy luxury resort site and not a tech/SaaS product site. Warmth should come from natural daylight photography and muted earthy color, not from decoration or ornament. Generous open spacing, slow visual rhythm. Flat, restrained surfaces — no heavy drop shadows, no glossy gradients, no glassmorphism. Small, subtle corner rounding on buttons and input-like shapes (roughly 4–8px), thin hairline borders instead of shadows where separation is needed. Low-to-medium density; visual hierarchy is built through scale contrast and whitespace, not through busy color or clutter.

TYPOGRAPHY & COLOR
Clean, neutral, humanist sans-serif lettering only — no serif, no slab, no script, no decorative or hand-lettered type anywhere. Large light/regular-weight headline, plain regular-weight smaller body and label text, no uppercase styling, no exaggerated letter-spacing. Background: warm off-white paper tone (~#FAF6F0). Secondary surface: slightly deeper warm cream (~#F3ECE2). Primary text: warm near-black (~#2B2620). Secondary text: warm grey-brown (~#6B6153). One primary accent, muted terracotta/clay (~#B5633B), used sparingly and only for the main call-to-action button. An optional secondary muted sage-green accent (~#7C8A6B) may appear once on a small feature tag, not required.

COMPOSITION FREEDOM
Choose your own layout freely: placement, size and number of photographs, column structure, header alignment, whether the headline wraps across one or two lines, exact spacing and proportions are all open. Substantially different compositions are acceptable across different generations, as long as this visual direction, color system and hierarchy are respected.

IMAGERY
Use real-feeling documentary photography (not illustration, not 3D render, not abstract graphic) of a modest, authentic wooden countryside house exterior in natural daylight, with warm, slightly muted natural color grading — honest and unstaged, not a luxury villa, not a staged resort. The photograph should read as the dominant visual element of the hero.

EXACT COPY (render legibly in Russian, in Cyrillic, exactly as quoted below; quotation marks are only to mark the text and must not appear in the rendered image; do not add, translate, or invent any other text)
Header navigation items: "Дома", "Будни", "Территория", "Условия", "Как добраться"
Header action button: "Узнать свободные даты"
Brand name (keep in Latin letters as given, do not translate or cyrillize): "Little Yard"
Hero headline: "Ваши дни за городом"
Hero description: "Отдельный дом для жизни в своём ритме. Приезжайте на выходные или останьтесь среди недели — с семьёй, работой и привычными удобствами"
Hero quick facts: "Дом целиком", "Две спальни", "Оптоволоконный интернет"
Hero primary button: "Выбрать дом"

ESSENTIAL CONSTRAINTS
Keep every Cyrillic word correctly spelled and as legible as possible, but do not guarantee pixel-perfect font rendering. Do not add any text, labels, prices, ratings, badges, or claims beyond what is listed above. Render the brand name as plain clean wordmark text only — no logo icon, no symbol, no emblem. Do not depict any booking widget, calendar, or form UI. Output exactly one complete desktop website screenshot — not a mobile view, not multiple screens, not a UI kit or style board.
```

## Концепция 2 — «Рабочий модуль»

```
RESULT
A single finished screenshot of a real, live website hero section together with its site header, for a countryside house-rental brand. Present it as a direct screenshot of a working site — no device frame, no browser chrome, no mockup, no perspective, no presentation environment, no annotations, no watermarks. Everything described below must fit inside one frame. Do not show any other page section below the hero.

VISUAL DIRECTION
Clear, confident, information-forward mood — closer to a well-built product website than a lifestyle magazine. Convey trust through clarity and precision rather than decoration: clean neutral surfaces, one confident accent color, facts grouped into compact, scannable chips. Medium density: enough breathing room to feel calm, but tighter and more structured than a loose editorial layout — a visitor should grasp the key facts almost instantly. Visible but soft elevation (light shadows separating cards from background), thin dividers marking section edges, medium corner rounding (roughly 8–12px) consistently applied to buttons, cards and chips. Hierarchy is built through color weight and type weight, not through large empty space.

TYPOGRAPHY & COLOR
A single clean geometric-humanist sans-serif typeface throughout (no serif, no slab, no script, no decorative lettering), with a confident Semibold headline and Regular/Medium body and label text, moderately tight line-height. Background: white (~#FFFFFF). Secondary surface for cards: light warm-grey (~#F1F2EF). Primary text: near-black charcoal (~#1C1F1D). Secondary text: medium grey (~#5B615C). Primary accent, used for the main call-to-action button: deep forest green (~#2F5B45). Secondary accent, used sparingly on one small highlighted fact/badge only: warm amber (~#D98A3D).

COMPOSITION FREEDOM
Choose your own layout freely: placement, size and number of photographs, column structure, header alignment, whether the headline wraps across one or two lines, exact spacing and proportions are all open. Substantially different compositions are acceptable across different generations, as long as this visual direction, color system and hierarchy are respected.

IMAGERY
Use real-feeling, evenly and cleanly lit photography (not illustration, not 3D render, not abstract graphic) of a modest, authentic countryside house — a straightforward, well-composed documentary shot rather than an atmospheric or moody one. If small supporting icons are used for the quick facts, they should be simple, geometric, single-color or two-tone line/fill icons (no cartoon style, no gradients, no 3D icons).

EXACT COPY (render legibly in Russian, in Cyrillic, exactly as quoted below; quotation marks are only to mark the text and must not appear in the rendered image; do not add, translate, or invent any other text)
Header navigation items: "Дома", "Будни", "Территория", "Условия", "Как добраться"
Header action button: "Узнать свободные даты"
Brand name (keep in Latin letters as given, do not translate or cyrillize): "Little Yard"
Hero headline: "Ваши дни за городом"
Hero description: "Отдельный дом для жизни в своём ритме. Приезжайте на выходные или останьтесь среди недели — с семьёй, работой и привычными удобствами"
Hero quick facts: "Дом целиком", "Две спальни", "Оптоволоконный интернет"
Hero primary button: "Выбрать дом"

ESSENTIAL CONSTRAINTS
Keep every Cyrillic word correctly spelled and as legible as possible, but do not guarantee pixel-perfect font rendering. Do not add any text, labels, prices, ratings, badges, or claims beyond what is listed above. Render the brand name as plain clean wordmark text only — no logo icon, no symbol, no emblem. Do not depict any booking widget, calendar, or form UI. Output exactly one complete desktop website screenshot — not a mobile view, not multiple screens, not a UI kit or style board.
```

## Концепция 3 — «Домашний дневник»

```
RESULT
A single finished screenshot of a real, live website hero section together with its site header, for a countryside house-rental brand. Present it as a direct screenshot of a working site — no device frame, no browser chrome, no mockup, no perspective, no presentation environment, no annotations, no watermarks. Everything described below must fit inside one frame. Do not show any other page section below the hero.

VISUAL DIRECTION
Warm, intimate, personal mood — as if the owner is showing you their own place, not a strict corporate grid. Warmth is carried through a soft rosy-sand palette, soft diffused warm-toned shadows, generous large rounding, and a slightly asymmetric, non-grid composition rather than through ornament or clutter. Low density; hierarchy comes from warm color grouping and proximity of elements rather than a rigid column structure. Corner rounding is large and soft (roughly 16–32px) on photo frames, cards and buttons. Avoid any cold, clinical, or corporate feeling.

TYPOGRAPHY & COLOR
Headline in a soft, rounded, geometric display sans-serif with a warm character (not a classic grotesque, not a serif, not a script) — plain, legible body text in a simple neutral sans-serif for everything else; no serif anywhere, no uppercase styling. Background: warm sand (~#F5EADD). Secondary surface for cards: dusty warm blush (~#EAD9CE). Primary text: deep warm brown-black (~#332A22). Secondary text: warm taupe (~#8B7A68). Primary accent, used for the main call-to-action button: muted brick/rust (~#A15C3E). Secondary accent, usable once on a small detail only: dusty blue-green (~#5E7A75).

COMPOSITION FREEDOM
Choose your own layout freely: placement, size and number of photographs, column structure, header alignment, whether the headline wraps across one or two lines, exact spacing and proportions, and the degree of asymmetry are all open. Substantially different compositions are acceptable across different generations, as long as this visual direction, color system and hierarchy are respected.

IMAGERY
Use real-feeling, candid documentary photography (not illustration, not 3D render, not abstract graphic) of a modest, authentic countryside house in warm late-afternoon/golden-hour natural light — a close, lived-in, unstaged feel rather than a wide formal architectural shot. Photographs may appear to naturally overlap at their edges, like pages in a photo album, rather than sitting in a strict grid.

EXACT COPY (render legibly in Russian, in Cyrillic, exactly as quoted below; quotation marks are only to mark the text and must not appear in the rendered image; do not add, translate, or invent any other text)
Header navigation items: "Дома", "Будни", "Территория", "Условия", "Как добраться"
Header action button: "Узнать свободные даты"
Brand name (keep in Latin letters as given, do not translate or cyrillize): "Little Yard"
Hero headline: "Ваши дни за городом"
Hero description: "Отдельный дом для жизни в своём ритме. Приезжайте на выходные или останьтесь среди недели — с семьёй, работой и привычными удобствами"
Hero quick facts: "Дом целиком", "Две спальни", "Оптоволоконный интернет"
Hero primary button: "Выбрать дом"

ESSENTIAL CONSTRAINTS
Keep every Cyrillic word correctly spelled and as legible as possible, but do not guarantee pixel-perfect font rendering. Do not add any text, labels, prices, ratings, badges, or claims beyond what is listed above. Render the brand name as plain clean wordmark text only — no logo icon, no symbol, no emblem. Do not depict any booking widget, calendar, or form UI. Output exactly one complete desktop website screenshot — not a mobile view, not multiple screens, not a UI kit or style board.
```
