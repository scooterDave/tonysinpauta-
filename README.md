# Tony Sin Pauta — website

Static Astro site for **Tony Sin Pauta, Tu Show Nocturno** (Spanish-only), hosted free on GitHub Pages.

- Preview: https://scooterdave.github.io/tonysinpauta-/
- Custom domain (later): https://tonysinpauta.com/

## Development

Requires Node 22.23.4 or newer (`.nvmrc`).

```bash
npm ci
npm run dev           # http://localhost:4321/tonysinpauta-/
npm run verify:fast   # typecheck + token lint + build
```

The latest videos come from the channel's public YouTube feed at build time. If the feed is down, the build uses `src/data/videos-fallback.json`; refresh it with `npm run videos:refresh`.

## Deploy

`.github/workflows/deploy.yml` builds and deploys on every push to `main`, once a day (to pick up new videos), and on demand. In the repo settings, **Settings → Pages → Build and deployment → Source** must be **GitHub Actions**.

## Custom domain

1. Add `tonysinpauta.com` under **Settings → Pages → Custom domain** and set the DNS records GitHub shows.
2. Change the default `SITE_URL` in `astro.config.mjs` to `'https://tonysinpauta.com/'` (CI already follows the Pages URL; this keeps local builds in sync).

Preview builds on `*.github.io` are marked `noindex`; the custom-domain build is indexable.

See `AGENTS.md` for the contributor/agent guide.
