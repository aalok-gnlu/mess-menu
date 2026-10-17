# The Daily Dish · GNLU Mess Menu

A complete rebuild of the original wheel interface as a warm campus food journal. Plain HTML, CSS, JavaScript and SVG, hosted on GitHub Pages. No build step or dependency installation.

## What the site does

- A seven-day selector with previous/next week and return-to-today controls.
- A featured meal based on India time and serving status.
- Four expandable meal menus and a whole-week view.
- Date-scoped committee notices for food suspensions and temporary timings.
- Real dish photography with source and licence attribution, plus original SVG art if a photo is missing or fails.
- Explicit expiry warnings for an out-of-date menu.

All views share `menu-data.js`. `menu-core.js` handles dates, timings, notices and status; `app.js` renders the interface; `app.css` provides responsive styling. `image-credits.html` lists photographic attribution. The original emailed PDF is not published.

## Verified menu source

The latest full menu located in Gmail was sent on **28 September 2026**, titled **Revised mess menu w.e.f. 29/9/26**, with attachment **SEPT MESS MENU 2026.pdf**. The four-week period is interpreted as **29 September through 26 October inclusive**. All 28 meal slots were transcribed from the PDF and visually checked against its table. Slash-separated alternatives remain alternatives. Rotation dates were not given, so the site does not invent them.

Later committee notices:

- **11 October:** no eggs or non-vegetarian food during **11–19 October**, inclusive. The original menu stays intact in data. The display suppresses egg/chicken entries only during those dates and does not invent replacement dishes.
- **17 October:** revised timings for **17–20 October**, inclusive: breakfast 09:00–11:00, lunch 13:00–14:30, snacks 17:00–18:15, dinner 20:00–21:30.

Every calculation uses **Asia/Kolkata**, regardless of the viewer’s timezone. Outside the dated notice, the prior site’s weekday/weekend timing convention is retained. It was not newly verified by the September PDF. The arbitrary holiday list from the old site was removed rather than presenting it as official timing information.

The old invented nutrition figures were removed. Recipes and portions were not supplied by the committee.

## Future menu updates

1. Find the newest full committee menu and read later exceptions. Check received and effective dates, not just filenames.
2. Edit `menu-data.js`: `source`, the 28 `meals`, and dated `notices`. `d` is Sunday=0 through Saturday=6; `m` is Breakfast=0, Lunch=1, Snacks=2, Dinner=3. Preserve all dishes and alternatives. Sunday snacks do **not** include Egg Live in this PDF.
3. Reuse a suitable dish photo from `images` in the data registry. Set a meal’s `imageKey`; use `null` when a neutral illustration is more accurate. Never reuse an obsolete photo just because its weekday filename matches.
4. Count missing images before generating. **If more than 10 new images are needed, source reusable web photos instead of generating a batch above 10.** At ten or fewer, generation is optional. A menu update must never wait for image production.
5. For each web photo, record `url`, `source`, `author`, `license`, `licenseUrl`, and `dish`. Update `image-credits.html` alongside the registry. Public visibility alone does not establish reuse permission. Prefer a stable URL from a source with an explicit reuse licence. This update uses 25 Wikimedia photos; they are illustrative dish photos, not photographs of the GNLU serving.
6. Keep source dates and validity current. The original email attachment stays private.
7. Run `node scripts/check-menu.cjs` and `node --check app.js`. Check mobile and desktop rendering, a failed image, date boundaries, weekly navigation and the expired-menu state in a browser when available.
8. Commit and push to the GitHub Pages source branch. Verify the deployment before describing the live site as updated.

After the stated validity period, the site continues to show the last schedule with an explicit warning. No automatic inbox scanning or future GitHub updates are configured by this repository.

## Obsolete assets

The redesigned site does **not** reference any of the original 28 PNG meal covers. You may delete these groups under `images/`:

- `breakfast_*.png` (7)
- `lunch_*.png` (7)
- `snacks_*.png` (7)
- `dinner_*.png` (7)
- `simple.txt` (empty placeholder)

They have been left untouched so cleanup is optional. Keep `images/bowl.svg` and `images/meal-placeholder.svg`. Web photos are embedded by URL, so there are no new dish-image files to manage in the repository.

## Design references

Reviewed [Swiper’s editorial menu](https://studio.swiperjs.com/templates/restaurant-menu-editorial), [Sleek’s meal planner](https://sleek.design/templates/meal-planner-app), and [Bootdey’s weekly calendar](https://www.bootdey.com/snippets/view/Weekly-calendar). The resulting site is an original implementation, with editorial typography, a paper-and-forest palette, a date ribbon, original bowl and place-setting SVGs, and attributed dish photography.

## Checks

`node scripts/check-menu.cjs` verifies all 28 unique slots, official Saturday dishes, India-time conversion, temporary timing and dietary boundaries, date arithmetic, expiry, and photo metadata. The redesign also passed a DOM smoke check for menu rendering, day/week controls, the weekly panel, temporary item filtering, expiry notices, returning to today, image failure fallback and internal anchors. A browser-based visual check should be run when browser preview infrastructure is available.
