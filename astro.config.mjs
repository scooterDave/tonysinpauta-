// @ts-check
import { defineConfig } from 'astro/config';

// Public URL of the site; `site` and `base` are derived from it.
// For the custom domain, change the default below to 'https://tonysinpauta.com/'.
const SITE_URL = process.env.SITE_URL || 'https://scooterdave.github.io/tonysinpauta-/';

const { origin, pathname } = new URL(SITE_URL);

export default defineConfig({
  site: origin,
  base: pathname,
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'always',
  },
  devToolbar: { enabled: false },
});
