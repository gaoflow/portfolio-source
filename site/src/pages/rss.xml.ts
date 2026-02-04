import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (char) => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
}[char]!));

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('astro.config.mjs must define site');
  const notes = (await getCollection('notes')).sort(
    (a, b) => b.data.published.getTime() - a.data.published.getTime() || a.data.order - b.data.order,
  );
  const items = notes.map((note) => {
    const url = new URL(`/notes/${note.id}/`, site).toString();
    return [
      '    <item>',
      `      <title>${escapeXml(note.data.title)}</title>`,
      `      <description>${escapeXml(note.data.summary)}</description>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <guid>${escapeXml(url)}</guid>`,
      `      <pubDate>${note.data.published.toUTCString()}</pubDate>`,
      '    </item>',
    ].join('\n');
  }).join('\n');

  const home = site.toString();
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>Bing Gao — Engineering Notes</title>\n    <description>CFD verification, aerodynamic modelling and simulation decisions.</description>\n    <link>${escapeXml(home)}</link>\n${items}\n  </channel>\n</rss>\n`, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
