const dateFormat = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'America/New_York',
});

export const formatDate = (iso: string) => dateFormat.format(new Date(iso)).replace('.', '');

export function formatViews(views: number | null): string | null {
  if (views === null) return null;
  return views === 1 ? '1 vista' : `${new Intl.NumberFormat('es').format(views)} vistas`;
}

export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

export const ytThumb = (
  id: string,
  size: 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault',
  format: 'jpg' | 'webp' = 'jpg',
) => (format === 'webp' ? `https://i.ytimg.com/vi_webp/${id}/${size}.webp` : `https://i.ytimg.com/vi/${id}/${size}.jpg`);

const probes = new Map<string, Promise<boolean>>();

/** Larger YouTube stills are missing for some uploads; only advertise the ones that exist. */
export function thumbExists(url: string): Promise<boolean> {
  if (process.env.YOUTUBE_FEED === 'off') return Promise.resolve(false);
  let probe = probes.get(url);
  if (!probe) {
    probe = fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
      .then((res) => res.ok)
      .catch(() => false);
    probes.set(url, probe);
  }
  return probe;
}
