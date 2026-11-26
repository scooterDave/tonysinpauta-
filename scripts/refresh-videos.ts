// Refreshes the committed fallback snapshot from the live channel feed.
// Run with: npm run videos:refresh  (Node >= 22.18 runs TypeScript directly)
import { readFile, writeFile } from 'node:fs/promises';
import { CHANNEL } from '../src/data/site.ts';
import { fetchChannelVideos, type ChannelVideo } from '../src/lib/youtube-feed.ts';

const target = new URL('../src/data/videos-fallback.json', import.meta.url);

const previous = JSON.parse(await readFile(target, 'utf8').catch(() => '{"videos":[]}')) as { videos: ChannelVideo[] };
const knownAspects = new Map(previous.videos.map((v) => [v.id, v.aspect]));
const videos = await fetchChannelVideos(CHANNEL.id, { knownAspects });

await writeFile(target, `${JSON.stringify({ fetchedAt: new Date().toISOString(), videos }, null, 2)}\n`);
console.log(`Saved ${videos.length} videos to src/data/videos-fallback.json`);
