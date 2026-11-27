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

The live section ("Próximo en vivo") picks up Tony's scheduled YouTube lives automatically at build time, reading the channel's public Live tab, feed and watch pages (no API key). The site rebuilds every 4 hours. When nothing is scheduled on YouTube, it shows the manual `PROXIMO_EN_VIVO` entry in `src/data/site.ts` (date, 24-hour time in New York, title), or "Fecha por anunciar" when that is empty too. Events hide themselves in the browser once they end, even before the next rebuild.

## Advertisers: email, inquiry form and media kit

- Booking email: `EMAIL` in `src/data/site.ts` (`contacto@tonysinpauta.com`, forwarded by Porkbun). Set it to `''` to hide it everywhere.
- Media kit: `/kit-de-medios/` (`src/pages/kit-de-medios.astro`, copy and numbers in `src/data/media-kit.ts`). Public numbers only; prices read "Precios a consultar".
- Inquiry form (`src/components/InquiryForm.astro`, on the home page and the media kit): has a honeypot. While `FORM_ACTIVATED` in `src/data/site.ts` is `false` it opens WhatsApp to (914) 512-6681 with the filled-in fields. When `true` it sends through [FormSubmit](https://formsubmit.co) (free, no account) to the booking email.

### Formulario de contacto: activating email delivery (all from a phone)

1. Send a test email to `contacto@tonysinpauta.com` and check that it reaches Tony's inbox (Porkbun forwarding works).
2. On the phone, open **https://tonysinpauta.com/kit-de-medios/?activar-formulario#consulta-kit**. Only this address uses email mode while the form is off; the button reads **Enviar mensaje** instead of **Enviar por WhatsApp**.
3. Fill in the form (any name, your own email, type "Otro", message "Prueba de activación") and tap **Enviar mensaje**. The page says the form isn't activated yet; that's expected.
4. In Tony's inbox, open the email from FormSubmit ("Action Required: Activate FormSubmit…", check spam) and tap **Activate Form**.
5. Repeat step 3. The page should now say "¡Mensaje enviado!" and a "Consulta desde tonysinpauta.com" email should arrive.
6. Switch the site over: in the GitHub app or github.com on the phone, edit `src/data/site.ts`, change `const FORM_ACTIVATED = false;` to `true`, and commit to `main` (or ask the agent to do it). The Deploy workflow publishes it in about a minute.

FormSubmit's activation email also offers a random alias for the address; it is optional, since the address is already shown on the site.

## Deploy

`.github/workflows/deploy.yml` builds and deploys on every push to `main`, every 4 hours (to pick up new videos and scheduled lives), and on demand. In the repo settings, **Settings → Pages → Build and deployment → Source** must be **GitHub Actions**.

## Custom domain

`tonysinpauta.com` is set under **Settings → Pages → Custom domain** (DNS at Porkbun: apex A records to GitHub Pages, `www` CNAME to `scooterdave.github.io`). The default `SITE_URL` in `astro.config.mjs` is `'https://tonysinpauta.com/'`; CI follows the Pages URL.

Builds for a `*.github.io` URL are marked `noindex`; the custom-domain build is indexable.

See `AGENTS.md` for the contributor/agent guide.
