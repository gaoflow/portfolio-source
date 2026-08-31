import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { topics } from '../data/topics';

const markdownText = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('astro.config.mjs must define site');

  const projects = (await getCollection('projects')).sort(
    (a, b) => b.data.updated.localeCompare(a.data.updated) || a.data.order - b.data.order,
  );
  const url = (path: string) => new URL(path, site).toString();
  const projectLines = projects.map((project) =>
    `- [${markdownText(project.data.title)}](${url(`/projects/${project.id}/`)}): ${markdownText(project.data.summary)}`,
  );
  const sourceLines = projects.map((project) =>
    `- [${markdownText(project.data.title)} source](https://raw.githubusercontent.com/binggao1230/portfolio-source/main/site/src/content/projects/${project.id}.md)`,
  );
  const topicLines = topics.map((topic) =>
    `- [${topic.title}](${url(`/topics/${topic.slug}/`)}): ${topic.description}`,
  );
  const body = [
    '# Bing Gao — Engineering Portfolio',
    '',
    '> First-hand engineering case studies in computational fluid dynamics, external aerodynamics, numerical validation, thermal-fluid modelling, and simulation tooling.',
    '',
    'The portfolio documents assumptions, methods, validation evidence, numerical limits, and measured results. English pages are the canonical public website content.',
    '',
    '## Profile',
    '',
    `- [About Bing Gao](${url('/')}): CFD engineer and developer studying Modelling & Computational Mechanics at ESILV.`,
    `- [Curriculum vitae](${url('/cv/')}): Education, engineering experience, projects, and technical skills.`,
    `- [Engineering projects](${url('/projects/')}): Browse all case studies by topic and engineering method.`,
    '',
    '## Topics',
    '',
    ...topicLines,
    '',
    '## Project case studies',
    '',
    ...projectLines,
    '',
    '## Interactive demonstrations',
    '',
    `- [FlowLab](${url('/labs/flowlab/')}): Interactive Lattice Boltzmann lid-driven cavity simulation.`,
    `- [Wingtip vortex formation](${url('/labs/ground-effect-vortex/')}): Interactive pressure-driven wingtip vortex animation.`,
    '',
    '## Optional',
    '',
    `- [RSS feed](${url('/rss.xml')})`,
    '- [Public source repository](https://github.com/binggao1230/portfolio-source)',
    ...sourceLines,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
