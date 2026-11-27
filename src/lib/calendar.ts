import { CHANNEL } from '../data/site';
import type { LiveEvent } from './live-schedule';

const stamp = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const details = (event: LiveEvent) => `${CHANNEL.name}: ${CHANNEL.tagline}, con ${CHANNEL.host}.\n${event.url}`;

export function googleCalendarUrl(event: LiveEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${stamp(event.start)}/${stamp(event.end)}`,
    details: details(event),
    location: event.url,
    ctz: 'America/New_York',
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

const escapeText = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

/** RFC 5545 folds content lines longer than 75 octets. */
function fold(line: string): string {
  const bytes = new TextEncoder();
  const out: string[] = [];
  let current = '';
  for (const char of line) {
    if (bytes.encode(current + char).length > (out.length ? 74 : 75)) {
      out.push(current);
      current = char;
    } else current += char;
  }
  out.push(current);
  return out.join('\r\n ');
}

export function icsCalendar(event: LiveEvent, host: string): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${CHANNEL.name}//${host}//ES`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.slug}@${host}`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(event.start)}`,
    `DTEND:${stamp(event.end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(details(event))}`,
    `LOCATION:${escapeText(event.url)}`,
    `URL:${event.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .map(fold)
    .join('\r\n')
    .concat('\r\n');
}
