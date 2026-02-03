// Single source of truth for identity & profile content.
// Sourced from CV (career-ops, 2026-02-05 export).
export const profile = {
  name: 'Bing Gao',
  role: 'CFD Engineer & Developer',
  tagline: 'External aerodynamics, CFD methodology & simulation tooling',
  statusLine: 'Open to CFD / Aerodynamics internships — 2026',
  location: 'Paris La Défense, France',
  email: 'gaobing1230@gmail.com',
  linkedin: 'https://www.linkedin.com/in/bing-gao/',
  github: 'https://github.com/gaoflow',
  cvUrl: '/cv.pdf', // drop your PDF into site/public/cv.pdf

  // Headline capability rows, Balasko-style (mono, scan in 5 s)
  capabilities: [
    { label: 'Simulation', value: 'Ansys Fluent · OpenFOAM' },
    { label: 'CAD', value: 'Blender · SolidWorks' },
    { label: 'Automation', value: 'Python · JavaScript · Bash' },
    { label: 'Software', value: '9 yrs engineering leadership · C++ · Rust · TypeScript' },
  ],

  timeline: [
    { kind: 'education', org: 'ESILV', title: 'MSc Modelling & Computational Mechanics', period: '2025 — 2027 (expected)' },
    { kind: 'work', org: 'Vinci Eco Drive — ESILV Formula Student', title: 'Aerodynamics Engineer', period: '09/2025 — present' },
    { kind: 'work', org: 'Inkeverse Group', title: 'Mobile Application Development Manager', period: '2016 — 2025' },
    { kind: 'work', org: 'Google Developer Group Beijing', title: 'Core Organizer (part-time)', period: '2015 — 2025' },
    { kind: 'education', org: 'CUST — Changchun Univ. of Science & Technology', title: 'BSc Computer Science', period: '2012 — 2016' },
  ],

  // Languages: French DELF B2 · English full professional · Chinese native
  references: [
    // { quote: '', name: '', title: '', href: '' },
  ] as { quote: string; name: string; title: string; href?: string }[],
};
