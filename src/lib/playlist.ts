import fallback from '../data/playlist-fallback.json';
import { SIN_PAUTA_TV_PLAYLIST_ID } from '../data/site';
import { fetchPlaylistTracks, type PlaylistTrack } from './youtube-feed';

export interface SinPautaTvPlaylist {
  playlistId: string;
  tracks: PlaylistTrack[];
  source: 'live' | 'fallback' | 'none';
}

let cached: Promise<SinPautaTvPlaylist> | undefined;

/**
 * Tracklist for the Sin Pauta TV player, read from the playlist feed at build time. The committed
 * snapshot only counts when it belongs to the configured playlist; otherwise the player still plays
 * the playlist, just without a tracklist.
 */
export function getSinPautaTvPlaylist(): Promise<SinPautaTvPlaylist> {
  cached ??= (async () => {
    const playlistId = SIN_PAUTA_TV_PLAYLIST_ID;
    const snapshot: SinPautaTvPlaylist =
      fallback.playlistId === playlistId
        ? { playlistId, tracks: fallback.tracks, source: 'fallback' }
        : { playlistId, tracks: [], source: 'none' };
    if (process.env.YOUTUBE_FEED === 'off') return snapshot;
    try {
      return { playlistId, tracks: await fetchPlaylistTracks(playlistId), source: 'live' };
    } catch (error) {
      console.warn(`[playlist] Using committed snapshot (${fallback.fetchedAt}): ${(error as Error).message}`);
      return snapshot;
    }
  })();
  return cached;
}
