// Single source of truth for identity & profile content.
// Sourced from CV (career-ops, 2026-02-05 export).
export const profile = {
  name: 'Bing Gao',
  role: 'CFD Engineer & Developer',
  tagline: 'External aerodynamics, CFD methodology & simulation tooling',
  statusLine: 'Open to CFD / Aerodynamics internships — 2026',

  // Homepage hero pitch
  pitch: 'I build external-aerodynamics CFD workflows where every quoted number is reproducible: geometry, mesh, solve, post-processing, and an evidence record. Failures are documented with the same rigor as results.',
  location: 'Paris La Défense, France',
  email: 'gaobing1230@gmail.com',
  linkedin: 'https://www.linkedin.com/in/bing-gao/',
  github: 'https://github.com/gaoflow',
  cvUrl: '/cv-en.pdf',

  // Headline capability rows, Balasko-style (mono, scan in 5 s)
  capabilities: [
    { label: 'Simulation', value: 'Ansys Fluent, OpenFOAM' },
    { label: 'CAD', value: 'Blender, SolidWorks' },
    { label: 'Automation', value: 'Python, JavaScript, Bash' },
    { label: 'Software', value: '9 yrs engineering leadership, C++, Rust, TypeScript' },
  ],

  // Representative case (homepage) — F1 full-car RANS campaign; every metric
  // below is backed by the committed evidence catalog.
  caseSteps: [
    {
      label: 'Variants',
      caption: 'A 23-variant full-car RANS pilot across ride-height and wing settings. Only runs that pass convergence and mesh checks count as evidence.',
      metrics: [
        { label: 'Variants meshed', value: '23' },
        { label: 'Valid solutions', value: '9' },
      ],
    },
    {
      label: 'Evidence discipline',
      caption: 'Every public number on this site is bound to a generated artifact, an explicit acceptance rule, and a reproduction command in the evidence manifest.',
      metrics: [
        { label: 'Verified claims', value: '76/76' },
        { label: 'Evidence artifacts', value: '54' },
      ],
    },
    {
      label: 'Failure as data',
      caption: 'Repeated snappyHexMesh failures on full-car geometry were kept in the log, diagnosed to topology causes, and used to reject unsafe solver launches.',
      metrics: [
        { label: 'Failed meshes', value: 'documented' },
        { label: 'Unsafe launches', value: 'rejected' },
      ],
    },
    {
      label: 'Tooling',
      caption: 'Python and Bash pipelines drive meshing, solving, post-processing, and evidence packaging, so a reviewer can rebuild any figure from source.',
      metrics: [
        { label: 'Pipeline', value: 'Python, Bash' },
        { label: 'Reproduction', value: 'single command' },
      ],
    },
  ],

  timeline: [
    { kind: 'education', org: 'ESILV', title: 'MSc Modelling & Computational Mechanics', period: '2025 — 2027 (expected)' },
    { kind: 'work', org: 'Vinci Eco Drive — ESILV Formula Student', title: 'Aerodynamics Engineer', period: '09/2025 — present' },
    { kind: 'work', org: 'Inkeverse Group', title: 'Mobile Application Development Manager', period: '2016 — 2025' },
    { kind: 'work', org: 'Google Developer Group Beijing', title: 'Core Organizer (part-time)', period: '2015 — 2025' },
    { kind: 'education', org: 'CUST — Changchun Univ. of Science & Technology', title: 'BSc Computer Science', period: '2012 — 2016' },
  ],

  // Languages: French DELF B2, English full professional, Chinese native
  references: [
    // { quote: '', name: '', title: '', href: '' },
  ] as { quote: string; name: string; title: string; href?: string }[],
};
