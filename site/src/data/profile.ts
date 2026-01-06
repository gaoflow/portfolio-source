// Single source of truth for identity & profile content.
// ⚠️ SAMPLE values — replace with your real details; every page reads from here.
export const profile = {
  name: 'Bing Gao',
  role: 'CFD Engineer',
  tagline: 'External aerodynamics & CFD methodology',
  statusLine: 'Open to CFD / Aerodynamics roles — 2026',
  location: 'City, Country',
  email: 'you@example.com',
  linkedin: 'https://www.linkedin.com/in/bing-gao/',
  github: 'https://github.com/your-handle',
  cvUrl: '/cv.pdf', // drop your PDF into site/public/cv.pdf

  // Headline capability rows, Balasko-style (mono, scan in 5 s)
  capabilities: [
    { label: 'Methods', value: 'RANS · URANS · LES' },
    { label: 'Software', value: 'OpenFOAM · STAR-CCM+ · Fluent · ParaView' },
    { label: 'Meshing', value: 'snappyHexMesh · Pointwise' },
    { label: 'Code', value: 'Python · automation · post-processing' },
  ],

  timeline: [
    // { kind: 'work' | 'education', org: '', title: '', period: '', href: '' },
  ] as { kind: 'work' | 'education'; org: string; title: string; period: string; href?: string }[],

  references: [
    // { quote: '', name: '', title: '', href: '' },
  ] as { quote: string; name: string; title: string; href?: string }[],
};
