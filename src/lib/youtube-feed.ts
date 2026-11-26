import sharp from 'sharp';

export interface ChannelVideo {
  id: string;
  title: string;
  /** ISO 8601 publish timestamp from the feed. */
  published: string;
  views: number | null;
  isShort: boolean;
  /** Width / height of the picture inside YouTube's 16:9 thumbnail (vertical clips are pillarboxed). */
  aspect: number;
}

export const WIDE_ASPECT = 16 / 9;
const VERTICAL_ASPECT = 9 / 16;

export const feedUrl = (channelId: string) =>
  `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decodeXml(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** Strips object-replacement characters and stray whitespace that YouTube titles often carry. */
export function cleanTitle(raw: string): string {
  return decodeXml(raw).replace(/[\uFFFC\uFFFD\u200B]/g, '').replace(/\s+/g, ' ').trim();
}

const pick = (xml: string, re: RegExp) => re.exec(xml)?.[1];

export function parseFeed(xml: string): Omit<ChannelVideo, 'aspect'>[] {
  return xml
    .split('<entry>')
    .slice(1)
    .map((entry) => {
      const id = pick(entry, /<yt:videoId>([^<]+)<\/yt:videoId>/);
      const title = pick(entry, /<title>([\s\S]*?)<\/title>/);
      const published = pick(entry, /<published>([^<]+)<\/published>/);
      const link = pick(entry, /<link rel="alternate" href="([^"]+)"/) ?? '';
      const views = pick(entry, /<media:statistics views="(\d+)"/);
      if (!id || !published) return null;
      return {
        id,
        title: cleanTitle(title ?? '') || 'Tony Sin Pauta',
        published,
        views: views ? Number(views) : null,
        isShort: link.includes('/shorts/'),
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);
}

/**
 * Measures the picture inside the 320x180 thumbnail. Vertical clips uploaded as
 * regular videos come back centred between black bars, which we frame instead of showing.
 */
export async function detectAspect(id: string, timeoutMs = 6000): Promise<number> {
  const res = await fetch(`https://i.ytimg.com/vi/${id}/mqdefault.jpg`, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`thumbnail ${id}: HTTP ${res.status}`);
  const { data, info } = await sharp(Buffer.from(await res.arrayBuffer()))
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const isContent = (x: number) => {
    let lit = 0;
    for (let y = 0; y < height; y++) {
      const i = (y * width + x) * channels;
      if (Math.max(data[i], data[i + 1], data[i + 2]) > 24) lit++;
    }
    return lit / height > 0.04;
  };
  let left = 0;
  while (left < width / 2 && !isContent(left)) left++;
  let right = width - 1;
  while (right > width / 2 && !isContent(right)) right--;
  const barsAreCentred = Math.abs(left - (width - 1 - right)) <= 6;
  const aspect = (right - left + 1) / height;
  if (!barsAreCentred || aspect > 1.6) return WIDE_ASPECT;
  return Math.max(0.5, Math.round(aspect * 1000) / 1000);
}

export async function fetchChannelVideos(
  channelId: string,
  { timeoutMs = 10000, knownAspects = new Map<string, number>() } = {},
): Promise<ChannelVideo[]> {
  const res = await fetch(feedUrl(channelId), {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'user-agent': 'tonysinpauta.com static build' },
  });
  if (!res.ok) throw new Error(`YouTube feed: HTTP ${res.status}`);
  const entries = parseFeed(await res.text());
  if (entries.length === 0) throw new Error('YouTube feed: no entries');

  return Promise.all(
    entries.map(async (entry) => {
      let aspect: number;
      try {
        aspect = await detectAspect(entry.id);
      } catch {
        aspect = knownAspects.get(entry.id) ?? (entry.isShort ? VERTICAL_ASPECT : WIDE_ASPECT);
      }
      return { ...entry, aspect };
    }),
  );
}
