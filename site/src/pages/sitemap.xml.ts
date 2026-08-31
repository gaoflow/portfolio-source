import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { topics } from '../data/topics';

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (char) => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
}[char]!));

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('astro.config.mjs must define site');
  const projects = await getCollection('projects');
  const entries = [
    ...['/', '/cv/', '/projects/', '/labs/flowlab/', '/labs/ground-effect-vortex/'].map((path) => ({ path })),
    ...topics.map((topic) => ({ path: `/topics/${topic.slug}/` })),
    ...projects.map((project) => ({ path: `/projects/${project.id}/`, modified: project.data.updated })),
  ];
  const body = entries.map(({ path, modified }) => [
    '  <url>',
    `    <loc>${escapeXml(new URL(path, site).toString())}</loc>`,
    modified ? `    <lastmod>${modified}</lastmod>` : '',
    '  </url>',
  ].filter(Boolean).join('\n')).join('\n');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
