import type { ImageMetadata } from 'astro';
import alfredoLopez from '../assets/interviews/EgkuvLNsaxM.jpg';
import lManuel from '../assets/interviews/Q31mv5iZtQQ.jpg';
import danielMoncion from '../assets/interviews/6dUjwZ8fNdU.jpg';

export interface Interview {
  id: string;
  guest: string;
  headline: string;
  /** Title as published on YouTube (used for the player's accessible name). */
  youtubeTitle: string;
  /** Public view count floor as of 2026-11-25; only set where the number helps (see STATS in site.ts). */
  views?: string;
  image: ImageMetadata;
}

export const INTERVIEWS: Interview[] = [
  {
    id: 'EgkuvLNsaxM',
    guest: 'Alfredo López',
    headline: 'Fuertes declaraciones del hermano de Frank Reyes',
    youtubeTitle: 'Fuertes Declaraciones de Alfredo López el Hermano de Frank Reyes',
    views: '+38 mil vistas',
    image: alfredoLopez,
  },
  {
    id: 'Q31mv5iZtQQ',
    guest: 'L Manuel',
    headline: '“Me robaron mi canción”',
    youtubeTitle: 'L Manuel - Tony Sin Pauta: Me robaron mi canción',
    image: lManuel,
  },
  {
    id: '6dUjwZ8fNdU',
    guest: 'Daniel Monción',
    headline: '“Los bachateros le deben su fortuna”',
    youtubeTitle: 'Tony Sin Pauta - Daniel Monción dice los bachateros le deben su fortuna',
    image: danielMoncion,
  },
];

export interface ShowClip {
  id: string;
  title: string;
  badge: string;
  aspect: number;
}

export const SHOW_CLIPS: ShowClip[] = [
  { id: '9YTP6xr4Pbw', title: 'Tony Sin Pauta Live Stream', badge: 'En vivo', aspect: 16 / 9 },
  { id: 'Rv3KC1cOYxg', title: 'La Mega Mezcla de Tony Sin Pauta, Vol. 1', badge: 'Mega mezcla', aspect: 16 / 9 },
  { id: 'oThkb66tsFI', title: 'Mega Mezcla de Tony Sin Pauta, Vol. 2', badge: 'Mega mezcla', aspect: 1.267 },
  { id: 'FmWB2z1fcxc', title: 'El Tripletaso de la Bachata', badge: 'Mezcla', aspect: 0.883 },
];
