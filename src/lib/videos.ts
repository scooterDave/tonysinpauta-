import fallback from '../data/videos-fallback.json';
import { CHANNEL } from '../data/site';
import { fetchChannelVideos, type ChannelVideo } from './youtube-feed';

export interface LatestVideos {
  videos: ChannelVideo[];
  source: 'live' | 'fallback';
}

let cached: Promise<LatestVideos> | undefined;

/** Live channel feed at build time; the committed snapshot keeps the build green when YouTube is down. */
export function getLatestVideos(): Promise<LatestVideos> {
  cached ??= (async () => {
    const snapshot = fallback.videos as ChannelVideo[];
    if (process.env.YOUTUBE_FEED === 'off') return { videos: snapshot, source: 'fallback' };
    try {
      const knownAspects = new Map(snapshot.map((v) => [v.id, v.aspect]));
      const videos = await fetchChannelVideos(CHANNEL.id, { knownAspects });
      return { videos, source: 'live' };
    } catch (error) {
      console.warn(`[videos] Using committed snapshot (${fallback.fetchedAt}): ${(error as Error).message}`);
      return { videos: snapshot, source: 'fallback' };
    }
  })();
  return cached;
}
