import { CHANNEL, PROXIMO_EN_VIVO, type ManualLive } from '../data/site';
import { cleanTitle, feedUrl, parseFeed } from './youtube-feed';

export const SHOW_TIME_ZONE = 'America/New_York';
const DEFAULT_MINUTES = 180;
const MAX_EVENTS = 3;
const MAX_CANDIDATES = 8;
const BROWSER_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export interface LiveEvent {
  slug: string;
  title: string;
  /** ISO 8601, UTC. */
  start: string;
  end: string;
  url: string;
  source: 'youtube' | 'manual';
}

export interface LiveSchedule {
  events: LiveEvent[];
  source: 'youtube' | 'manual' | 'none';
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(12000),
    headers: { 'user-agent': BROWSER_UA, 'accept-language': 'en-US,en;q=0.9' },
  });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.text();
}

function* lockups(node: unknown): Generator<Record<string, unknown>> {
  if (Array.isArray(node)) for (const item of node) yield* lockups(item);
  else if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    for (const key of ['lockupViewModel', 'videoRenderer', 'gridVideoRenderer']) {
      if (obj[key]) yield obj[key] as Record<string, unknown>;
    }
    for (const value of Object.values(obj)) yield* lockups(value);
  }
}

const UPCOMING_MARKER = /upcomingEventData|"UPCOMING"|Scheduled for|_UPCOMING"/;

/** The page-data object YouTube assigns to `ytInitialData`, read by brace matching (strings may contain `};`). */
function initialData(html: string): unknown {
  const marker = /(?:var ytInitialData|window\[["']ytInitialData["']\])\s*=\s*\{/.exec(html);
  if (!marker) return null;
  const start = marker.index + marker[0].length - 1;
  let depth = 0;
  let inString = false;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (inString) {
      if (c === '\\') i++;
      else if (c === '"') inString = false;
    } else if (c === '"') inString = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return JSON.parse(html.slice(start, i + 1));
  }
  return null;
}

/** Upcoming streams listed on the channel's Live tab (YouTube page data, no API key). */
async function upcomingFromStreamsPage(channelId: string): Promise<string[]> {
  const url = `https://www.youtube.com/channel/${channelId}/streams?hl=en&gl=US`;
  let data: unknown = null;
  let html = '';
  for (let attempt = 0; attempt < 2 && !data; attempt++) {
    html = await fetchText(url);
    data = initialData(html);
  }
  if (!data) {
    const title = html.match(/<title>([^<]*)/)?.[1] ?? 'no title';
    throw new Error(`streams page: no ytInitialData (${html.length} bytes, "${title}")`);
  }
  const ids = new Set<string>();
  for (const item of lockups(data)) {
    const id = (item.contentId ?? item.videoId) as string | undefined;
    if (id && UPCOMING_MARKER.test(JSON.stringify(item))) ids.add(id);
  }
  return [...ids];
}

/** Scheduled streams also appear in the channel feed, with no views yet. */
async function zeroViewFeedEntries(channelId: string): Promise<string[]> {
  const res = await fetch(feedUrl(channelId), { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`feed: HTTP ${res.status}`);
  return parseFeed(await res.text())
    .filter((entry) => entry.views === 0)
    .map((entry) => entry.id);
}

/** Reads a video's live-broadcast details from its public watch page. Null when it isn't upcoming or live. */
async function confirmScheduled(id: string): Promise<LiveEvent | null> {
  const html = await fetchText(`https://www.youtube.com/watch?v=${id}&hl=en&gl=US`);
  const details = html.match(/"liveBroadcastDetails":(\{[^}]*\})/)?.[1];
  if (!details) return null;
  const live = JSON.parse(details) as { isLiveNow?: boolean; startTimestamp?: string; endTimestamp?: string };
  if (!live.startTimestamp || live.endTimestamp) return null;
  if (!live.isLiveNow && !/"isUpcoming":true/.test(html)) return null;
  const owner = html.match(/"videoDetails":\{"videoId":"[^"]+".*?"channelId":"([^"]+)"/s)?.[1];
  if (owner && owner !== CHANNEL.id) return null;
  const rawTitle = html.match(/"videoDetails":\{"videoId":"[^"]+","title":"((?:[^"\\]|\\.)*)"/)?.[1];
  const title = rawTitle ? cleanTitle(JSON.parse(`"${rawTitle}"`)) : `${CHANNEL.name} en vivo`;
  const start = new Date(live.startTimestamp);
  if (Number.isNaN(start.getTime())) return null;
  return {
    slug: `yt-${id}`,
    title,
    start: start.toISOString(),
    end: new Date(start.getTime() + DEFAULT_MINUTES * 60_000).toISOString(),
    url: `https://www.youtube.com/watch?v=${id}`,
    source: 'youtube',
  };
}

async function scheduledOnYouTube(channelId: string): Promise<LiveEvent[]> {
  const sources = await Promise.allSettled([upcomingFromStreamsPage(channelId), zeroViewFeedEntries(channelId)]);
  const [page, feed] = sources.map((s) => (s.status === 'fulfilled' ? s.value : null));
  for (const s of sources) if (s.status === 'rejected') console.warn(`[live] ${(s.reason as Error).message}`);
  if (!page && !feed) throw new Error('no YouTube source reachable');

  const candidates = [...new Set([...(page ?? []), ...(feed ?? [])])].slice(0, MAX_CANDIDATES);
  const checked = await Promise.allSettled(candidates.map(confirmScheduled));
  const events = checked.flatMap((r) => (r.status === 'fulfilled' && r.value ? [r.value] : []));
  const failed = checked.filter((r) => r.status === 'rejected').length;
  console.log(
    `[live] streams page: ${page?.length ?? 'n/a'} upcoming, feed: ${feed?.length ?? 'n/a'} without views, ` +
      `confirmed: ${events.length}${failed ? `, watch pages failed: ${failed}` : ''}`,
  );
  return events;
}

/** UTC instant for a wall-clock date and time in `timeZone` (handles daylight saving). */
export function zonedTimeToUtc(date: string, time: string, timeZone = SHOW_TIME_ZONE): Date {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
  let guess = wall;
  for (let i = 0; i < 2; i++) {
    const p = Object.fromEntries(parts.formatToParts(new Date(guess)).map((x) => [x.type, x.value]));
    const seen = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
    guess += wall - seen;
  }
  return new Date(guess);
}

function manualEvent(entry: ManualLive): LiveEvent {
  const start = zonedTimeToUtc(entry.date, entry.time);
  return {
    slug: `manual-${entry.date}-${entry.time.replace(':', '')}`,
    title: entry.title,
    start: start.toISOString(),
    end: new Date(start.getTime() + (entry.durationMinutes ?? DEFAULT_MINUTES) * 60_000).toISOString(),
    url: entry.url ?? CHANNEL.streamsUrl,
    source: 'manual',
  };
}

let cached: Promise<LiveSchedule> | undefined;

/**
 * Upcoming lives at build time: Tony's scheduled YouTube streams, else the manual PROXIMO_EN_VIVO entry.
 * Anything already over is dropped here, and the page hides events that end between rebuilds.
 */
export function getLiveSchedule(now = new Date()): Promise<LiveSchedule> {
  cached ??= (async () => {
    const future = (events: LiveEvent[]) =>
      events
        .filter((e) => new Date(e.end) > now)
        .sort((a, b) => a.start.localeCompare(b.start))
        .slice(0, MAX_EVENTS);

    let youtube: LiveEvent[] = [];
    if (process.env.YOUTUBE_FEED !== 'off') {
      try {
        youtube = future(await scheduledOnYouTube(CHANNEL.id));
      } catch (error) {
        console.warn(`[live] Could not check YouTube for scheduled lives: ${(error as Error).message}`);
      }
    }
    if (youtube.length > 0) return { events: youtube, source: 'youtube' };
    const manual = PROXIMO_EN_VIVO ? future([manualEvent(PROXIMO_EN_VIVO)]) : [];
    return manual.length > 0 ? { events: manual, source: 'manual' } : { events: [], source: 'none' };
  })();
  return cached;
}

const dayFormat = new Intl.DateTimeFormat('es-US', {
  timeZone: SHOW_TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const timeFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: SHOW_TIME_ZONE,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

/** e.g. { day: 'sábado, 6 de diciembre', time: '9:00 PM' } in New York time. */
export function formatShowTime(iso: string) {
  const date = new Date(iso);
  return { day: dayFormat.format(date), time: timeFormat.format(date) };
}
