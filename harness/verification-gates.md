# Deterministic Verification Gates — `tonysinpauta.com`

Prompts suggest; deterministic gates enforce. Every change to `tonysinpauta.com` passes through tiered checks that protect **design craft**, **accessibility**, **performance**, **SEO**, and the **$0/month static budget**.

---

## 1. Tiered Gate Matrix

| Tier | Name | When It Runs | Target Runtime | Pass Condition |
| --- | --- | --- | --- | --- |
| **Tier 0** | **Design-First Human Gate** | End of Phase 1 (before feature build) | Human review | Contrast math passes + Evaluator rubric passes + user approves mockups in `docs/design/approval.md`. |
| **Tier 1** | **Fast Inner Loop (`verify:fast`)** | Before every subagent commit & every merge | < 30 seconds | Typecheck (0 errors) + Stylelint token lint (0 errors) + Static production build (`dist/` succeeds). |
| **Tier 2** | **Browser, A11y, Visual & Perf (`verify:all`)** | Phase 2 scaffold, Phase 4 whole-branch QA, every PR in CI | 1–3 minutes | Playwright layout/overflow/CLS + `@axe-core/playwright` WCAG 2.2 AA + Playwright screenshot baselines + Lighthouse CI + SEO & bundle weight checks. |
| **Tier 3** | **Independent Taste & Anti-Slop Audit** | Phase 1 mockups & Phase 4 whole-branch QA | Evaluator pass | Independent read-only QA Verifier grades live rendered pages >= minimum rubric thresholds. |
| **Tier 4** | **Live Launch Smoke (`tonysinpauta.com`)** | Phase 5 post-DNS cutover | < 2 minutes | HTTPS 200 on apex + `www` redirect, valid TLS, 0 console errors, working YouTube facades, live Lighthouse pass. |

---

## 2. Design Token Gate (Stylelint — `.stylelintrc.json`)

Prevents agents from inventing off-scale font sizes (`19px`), random spacing (`13px`), or hardcoded colors (`#cccccc`) outside `src/styles/tokens.css`.

Drop-in starter config (adapt token scale names to match Phase 1's frozen `src/styles/tokens.css`):

```json
{
  "ignoreFiles": ["src/styles/tokens.css", "dist/**"],
  "rules": {
    "declaration-property-value-allowed-list": {
      "/^font-size$/i": [
        "/^var\\(--font-size-(xs|sm|base|lg|xl|2xl|3xl|4xl|display)\\)$/",
        "inherit"
      ],
      "/^font-weight$/i": [
        "/^var\\(--font-weight-(regular|medium|semibold|bold|black)\\)$/",
        "inherit"
      ],
      "/^(margin|padding|gap|row-gap|column-gap)/i": [
        "/^((var\\(--space-(2xs|xs|sm|md|lg|xl|2xl|3xl)\\)|0|auto)(\\s+|$))+$/"
      ]
    },
    "declaration-property-value-disallowed-list": {
      "/^(?!--)/": [
        "/#[0-9a-f]{3,8}\\b/i",
        "/\\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\\(/i"
      ]
    },
    "color-named": ["never", { "ignoreProperties": ["/^--/"] }],
    "property-disallowed-list": ["/^font$/i"]
  }
}
```

- **Rule:** Raw color literals are permitted **only** inside `src/styles/tokens.css`.
- **Live config:** `.stylelintrc.json` at the repo root is the enforced version: it adds the `4xl`, `gutter` and `section` spacing tokens and lints `<style>` blocks in `.astro` files via `postcss-html` (`npm run lint:css`).
- **Exceptions:** Any unavoidable `calc()` or negative offset must use a single-line `/* stylelint-disable-next-line ... -- <reason> */` comment reviewed by the Manager.

---

## 3. Browser Layout, Accessibility & Visual Regression Gates (Playwright)

All browser tests run against the **production static build (`dist/`)** served locally with `npm run preview -- --port 4173` (overridable via `PORT` for parallel worktrees). The site lives under the Pages base path, so test URLs are `http://localhost:4173/tonysinpauta-/` until the custom domain moves the base to `/`.

### 3.1 Multi-Viewport Layout & Integrity (`tests/layout.spec.ts`)
Test every route at **`375×812` (mobile)**, **`768×1024` (tablet)**, and **`1440×900` (desktop)**:
- **Zero horizontal overflow:** `document.documentElement.scrollWidth <= window.innerWidth`.
- **Zero broken images:** Every visible `<img>` has `complete === true && naturalWidth > 0`.
- **Zero console/page errors:** Fail on any `pageerror` or `console.error`.
- **YouTube facade discipline:** Initial DOM contains **zero** auto-loaded `iframe[src*="youtube.com"]` elements; clicking a video facade mounts the embed cleanly.
- **Stable layout (CLS):** Measured layout shift during load and scroll <= `0.10`.

### 3.2 Accessibility Gate (`tests/a11y.spec.ts`)
Run `@axe-core/playwright` against every rendered route at desktop and mobile widths:

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = ['/', '/about/', '/contact/'];

for (const route of ROUTES) {
  test(`WCAG 2.2 AA clean on ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const blocking = results.violations.filter((v) =>
      ['critical', 'serious'].includes(v.impact ?? '')
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}
```

Additional mandatory manual/Playwright checks:
- Single `<h1>` per page; no skipped heading levels (`h1` → `h2` → `h3`).
- Visible `:focus-visible` outlines on every interactive link/button.
- Skip-to-content link works via keyboard `Tab`.

### 3.3 Visual Regression Gate (`tests/visual.spec.ts`)
- Capture full-page `await expect(page).toHaveScreenshot({ fullPage: true, maxDiffPixelRatio: 0.01 })` at `375px` and `1440px` for each primary route.
- **OS Determinism Rule:** Always generate and update committed baseline PNGs on the **same Linux environment** used by GitHub Actions CI (`ubuntu-latest`) to avoid macOS/Linux font-rasterization false diffs.
- Mask dynamic timestamps or live YouTube feed titles if needed so snapshots test layout & styling deterministically.

---

## 4. Performance & Core Web Vitals Gate (Lighthouse CI — `.lighthouserc.json`)

Runs 3 times per route against the built `dist/` folder with `median` aggregation for noisy performance timing and `pessimistic` aggregation for deterministic categories:

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "url": [
        "http://localhost/index.html",
        "http://localhost/about/index.html",
        "http://localhost/contact/index.html"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9, "aggregationMethod": "median" }],
        "categories:accessibility": ["error", { "minScore": 0.95, "aggregationMethod": "pessimistic" }],
        "categories:best-practices": ["error", { "minScore": 0.95, "aggregationMethod": "pessimistic" }],
        "categories:seo": ["error", { "minScore": 0.95, "aggregationMethod": "pessimistic" }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1, "aggregationMethod": "pessimistic" }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500, "aggregationMethod": "median" }]
      }
    }
  }
}
```

*(Target 1.00 on Accessibility, Best Practices, and SEO; 0.95 is the hard CI floor so regressions block merges immediately.)*

---

## 5. SEO, Metadata & Zero-Cost Budget Gate (`tests/seo-budget.spec.ts`)

Every built HTML page in `dist/` must pass:
1. **Unique Metadata:** Non-empty `<title>` (30–65 chars) and `<meta name="description">` (70–160 chars) per route.
2. **Canonical & Domain Hygiene:** `<link rel="canonical">` matches `SITE_URL` (`https://scooterdave.github.io/tonysinpauta-/` on the preview, `https://tonysinpauta.com/` after cutover); zero `localhost` URLs leaked into `dist/`; every internal `href`/`src` starts with the base path. Preview builds on `*.github.io` must carry `<meta name="robots" content="noindex">`; production builds must not.
3. **Social Sharing Cards:** `og:title`, `og:description`, `og:image` (absolute URL, >= 1200×630), `og:url`, and `twitter:card="summary_large_image"`.
4. **Structured Data & Crawlability:** Valid JSON-LD (`Person` / `WebSite` / `VideoObject`), `dist/sitemap-index.xml` (or `sitemap.xml`), and `dist/robots.txt`.
5. **Static & $0 Cost Audit:**
   - `dist/` contains static assets only (no server bundles, `.env` secrets, or paid third-party tracker scripts).
   - **Initial Transfer Budget:** Total initial transfer size for `/` <= **500 KB** (HTML + CSS + JS + above-the-fold fonts/images, excluding user-initiated YouTube playback).
   - **Individual Media Caps:** Hero image <= **150 KB**; thumbnail/card images <= **60 KB** each; no unoptimized multi-megabyte raw PNG/JPG assets in `public/media/`.

---

## 6. Independent Aesthetic Rubric (Tier 3 Anti-Slop Gate)

Deterministic tools verify correctness, not taste. Adapted from Anthropic's 2026 Generator–Evaluator framework, the independent **QA Verifier** grades rendered Phase 1 mockups and Phase 4 pages on a **1–5 scale** with written critique:

| Criterion | Weight | Pass Floor | What Fails Immediately ("AI Slop" Red Flags) |
| --- | --- | --- | --- |
| **Design Quality (Coherence & Brand Fit)** | **35%** | **>= 4/5** | Looks disconnected from Tony Sin Pauta's channel mood/colors; mismatched visual styles across sections. |
| **Originality (Deliberate Craft)** | **30%** | **>= 4/5** | Generic SaaS landing-page clone, purple/blue gradient hero over identical white 3-column cards, unmodified library defaults. |
| **Craft (Typography, Spacing & Contrast)** | **20%** | **>= 4/5** | Cramped mobile margins, awkward line lengths (>75ch body), broken hierarchy, or low-contrast overlays on thumbnails. |
| **Functionality (Creator UX)** | **15%** | **>= 4/5** | Hard to play latest videos, find YouTube subscribe CTA, or reach booking/social links within 1 click/scroll. |

- Any criterion below **4/5** returns `FAIL` with specific visual/structural defects routed back to the Design Architect (Phase 1) or Frontend Builder (Phase 4).

---

## 7. Free-Tier GitHub Actions CI Blueprint (`.github/workflows/verify.yml`)

> Already live: `.github/workflows/deploy.yml` runs `npm run verify:fast` before every GitHub Pages deploy (push to `main`, daily schedule, manual run). The PR workflow below is still to be added once `verify:all` exists.

```yaml
name: Verify tonysinpauta.com
on:
  pull_request:
  push:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - name: Tier 1 — Typecheck, Token Lint & Static Build
        run: npm run verify:fast
      - name: Install Playwright Chromium
        run: npx playwright install --with-deps chromium
      - name: Tier 2 — Layout, A11y, Visual, SEO & Lighthouse CI
        run: npm run verify:all
      - name: Upload QA artifacts on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: qa-evidence
          path: |
            playwright-report/
            test-results/
            .lighthouseci/
```
