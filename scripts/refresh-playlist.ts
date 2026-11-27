// Refreshes the committed Sin Pauta TV tracklist snapshot from the live playlist feed.
// Run with: npm run playlist:refresh  (Node >= 22.18 runs TypeScript directly)
import { writeFile } from 'node:fs/promises';
import { SIN_PAUTA_TV_PLAYLIST_ID } from '../src/data/site.ts';
import { fetchPlaylistTracks } from '../src/lib/youtube-feed.ts';

const target = new URL('../src/data/playlist-fallback.json', import.meta.url);
const tracks = await fetchPlaylistTracks(SIN_PAUTA_TV_PLAYLIST_ID);

await writeFile(
  target,
  `${JSON.stringify({ playlistId: SIN_PAUTA_TV_PLAYLIST_ID, fetchedAt: new Date().toISOString(), tracks }, null, 2)}\n`,
);
console.log(`Saved ${tracks.length} tracks of ${SIN_PAUTA_TV_PLAYLIST_ID} to src/data/playlist-fallback.json`);
