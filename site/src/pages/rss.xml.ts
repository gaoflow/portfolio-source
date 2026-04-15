import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (char) => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
}[char]!));

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('astro.config.mjs must define site');
  const projects = (await getCollection('projects')).sort(
    (a, b) => b.data.date.localeCompare(a.data.date) || a.data.order - b.data.order,
  );
  const items = projects.map((project) => {
    const url = new URL(`/projects/${project.id}/`, site).toString();
    return [
      '    <item>',
      `      <title>${escapeXml(project.data.title)}</title>`,
      `      <description>${escapeXml(project.data.summary)}</description>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <guid>${escapeXml(url)}</guid>`,
      `      <pubDate>${new Date(`${project.data.date}T12:00:00Z`).toUTCString()}</pubDate>`,
      '    </item>',
    ].join('\n');
  }).join('\n');

  const home = site.toString();
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>Bing Gao — Engineering Portfolio</title>\n    <description>CFD verification, aerodynamic modelling and simulation decisions.</description>\n    <link>${escapeXml(home)}</link>\n${items}\n  </channel>\n</rss>\n`, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
