const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Prefixes a site-relative path with the deploy base (e.g. `/tonysinpauta-`). */
export function withBase(path = ''): string {
  return `${BASE}/${path.replace(/^\/+/, '')}`;
}

export function absoluteUrl(path = ''): string {
  return new URL(withBase(path), import.meta.env.SITE).href;
}

/** The GitHub Pages preview must stay out of search results until the custom domain is live. */
export const isPreviewHost = new URL(import.meta.env.SITE ?? 'https://tonysinpauta.com').hostname.endsWith('.github.io');
