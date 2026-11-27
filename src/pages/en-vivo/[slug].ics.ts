import type { APIRoute, GetStaticPaths } from 'astro';
import { icsCalendar } from '../../lib/calendar';
import { getLiveSchedule, type LiveEvent } from '../../lib/live-schedule';

export const getStaticPaths: GetStaticPaths = async () => {
  const { events } = await getLiveSchedule();
  return events.map((event) => ({ params: { slug: event.slug }, props: { event } }));
};

export const GET: APIRoute = ({ props, site }) =>
  new Response(icsCalendar(props.event as LiveEvent, new URL(site ?? 'https://tonysinpauta.com').hostname), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
