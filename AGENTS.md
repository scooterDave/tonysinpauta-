# AGENTS.md — Tony Sin Pauta website

Official static website for **Tony Sin Pauta** ("Tu Show Nocturno", host Tony González, YouTube `@tonysinpauta2888`).
Spanish-only, dark **Nocturno Broadcast** theme, **$0/month** on GitHub Pages.

- Preview: `https://scooterdave.github.io/tonysinpauta-/` (repo `scooterDave/tonysinpauta-`, default branch `main`)
- Production (later): `https://tonysinpauta.com/`

This file is a table of contents, not an encyclopedia. Follow the links for detail.

## 1. Repository map
- `harness/feature-ledger.json` — phase/task state, dependencies, acceptance criteria (read `previewBuild` first).
- `harness/progress.log` — append-only handoff log across sessions.
- `harness/delegation-protocol.md` — manager-to-subagent brief template, worktree rules, evidence format.
- `harness/verification-gates.md` — lint, browser, a11y, performance, SEO and $0-budget gates.
- `src/styles/tokens.css` — single source of truth for colour, type, spacing, radii, shadows.
- `src/data/site.ts` — channel facts, stats, phone/WhatsApp, nav, artist names. `src/data/featured.ts` — curated interviews and show clips.
- `src/lib/youtube-feed.ts` + `src/lib/videos.ts` — build-time channel feed with fallback to `src/data/videos-fallback.json`.
- `src/components/` — shared UI (`LiteYouTube`, `VideoCard`, `Header`, `Footer`, …); `src/components/home/` — page sections.
- `scripts/` — `refresh-videos.ts` (update the fallback snapshot), `prepare-media.mjs` (rebuild brand media from `assets-src/`).
- `.github/workflows/deploy.yml` — verify, build and deploy to GitHub Pages on push to `main`, daily, or manually.

## 2. Session startup
1. `pwd`, `git branch --show-current`, `git log -n 5 --oneline`.
2. Read the last 30 lines of `harness/progress.log` and your task in `harness/feature-ledger.json`.
3. Read only the docs your brief lists; never guess undocumented design or content choices.
4. `npm ci && npm run verify:fast` for a clean baseline before editing.

## 3. Non-negotiable invariants
1. **Base path:** every internal URL goes through `withBase()` / `absoluteUrl()` (`src/lib/paths.ts`) or Astro assets. Never hardcode `/…` links. `site` and `base` come from `SITE_URL` in `astro.config.mjs`; switching to the custom domain is the one-line default change there (CI follows the Pages URL automatically).
2. **Tokens only:** colour, font-size, font-weight and spacing in CSS must use custom properties from `tokens.css`. Stylelint blocks raw values elsewhere.
3. **$0 and static only:** no paid APIs, keys, databases or server runtime. YouTube embeds stay click-to-load facades (`LiteYouTube`), using `youtube-nocookie.com`.
4. **Facts only:** copy is natural Dominican/Latino Spanish and uses only facts from the brand brief. Schedule wording stays non-committal until Tony confirms it. Stats are written as floors (`246+`).
5. **Design lock:** visual direction awaits Tony's approval of the preview (ledger `T1-04`). Do not restyle without a recorded decision.
6. **Ledger integrity:** never delete tasks or weaken acceptance criteria; only the Development Manager sets `passes: true`.
7. **Ownership:** one writer per worktree/branch; edit only your task's `ownedPaths`. Independent QA never self-approves its own builds.

## 4. Commands
- `npm run dev` — dev server (`http://localhost:4321/tonysinpauta-/`; pass `-- --port <n>` in parallel worktrees).
- `npm run build` — static build to `dist/`. `npm run preview` — serve `dist/`.
- `npm run verify:fast` — `astro check` + Stylelint token lint + build (Tier 1).
- `npm run videos:refresh` — refresh `src/data/videos-fallback.json` from the live feed, then commit it.
- `npm run media:prepare` — regenerate `src/assets/**` and `public/og-image.jpg` from `assets-src/`.
- Env: `SITE_URL` (absolute URL with trailing slash), `YOUTUBE_FEED=off` (offline build from the snapshot).
- Planned: `verify:all` (Playwright + axe + Lighthouse, ledger `T2-03`).

## 5. Escalation & stop rules
- **Two-strike rule:** the same failure twice with the same root cause → stop, keep the diff and error output, log it, escalate.
- **Never bypass gates:** no `--no-verify`, blanket `stylelint-disable`, or lowered thresholds.
- **Handoff:** return the Evidence Bundle from `harness/delegation-protocol.md` (commit SHA, changed files, commands + exit codes, screenshots).
