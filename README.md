# Tony Sin Pauta — website

Static Astro site for **Tony Sin Pauta, Tu Show Nocturno** (Spanish-only), hosted free on GitHub Pages.

- Live: https://tonysinpauta.com/ (`www` redirects here)

## Development

Requires Node 22.23.4 or newer (`.nvmrc`).

```bash
npm ci
npm run dev           # http://localhost:4321/
npm run verify:fast   # typecheck + token lint + build
```

The latest videos come from the channel's public YouTube feed at build time. If the feed is down, the build uses `src/data/videos-fallback.json`; refresh it with `npm run videos:refresh`.

The Sin Pauta TV player below the hero plays one YouTube playlist, set by `SIN_PAUTA_TV_PLAYLIST_ID` in `src/data/site.ts` (currently Tony's "tonysinpauta.com website" playlist, `PLDrx9JTRMM-A`). Its tracklist is read from the playlist feed at build time with `src/data/playlist-fallback.json` as the fallback; after changing the ID, run `npm run playlist:refresh` and commit the result.

## Deploy

`.github/workflows/deploy.yml` builds and deploys on every push to `main`, once a day (to pick up new videos), and on demand. In the repo settings, **Settings → Pages → Build and deployment → Source** must be **GitHub Actions**.

## Custom domain

`tonysinpauta.com` is set under **Settings → Pages → Custom domain** (DNS at Porkbun: apex A records to GitHub Pages, `www` CNAME to `scooterdave.github.io`). The default `SITE_URL` in `astro.config.mjs` is `'https://tonysinpauta.com/'`; CI follows the Pages URL.

Builds for a `*.github.io` URL are marked `noindex`; the custom-domain build is indexable.

See `AGENTS.md` for the contributor/agent guide.
