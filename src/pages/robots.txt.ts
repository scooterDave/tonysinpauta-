import type { APIRoute } from 'astro';
import { absoluteUrl, isPreviewHost } from '../lib/paths';

export const GET: APIRoute = () =>
  new Response(
    [
      'User-agent: *',
      isPreviewHost ? 'Disallow: /' : 'Allow: /',
      '',
      `Sitemap: ${absoluteUrl('sitemap.xml')}`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
