export const topicBySlug = {
  fsae: {
    title: 'Formula Student Thermal Systems',
    description: 'Cooling-system architecture, thermal-fluid modelling, and evidence-based design decisions for Formula Student vehicles.',
  },
  'full-car': {
    title: 'Full-Car Aerodynamics',
    description: 'Whole-vehicle aerodynamic studies covering ride height, yaw, rake, aero balance, and numerical uncertainty.',
  },
  'component-cfd': {
    title: 'Component CFD',
    description: 'Focused flow studies that isolate component physics, boundary conditions, wake behaviour, and solver limits.',
  },
  tooling: {
    title: 'Simulation Tooling & Numerical Methods',
    description: 'Small solvers and engineering tools built to make assumptions, numerical methods, and validation checks explicit.',
  },
  validation: {
    title: 'Verification & Validation',
    description: 'Projects that compare numerical results with analytical solutions, experiments, mesh studies, and independent checks.',
  },
  design: {
    title: 'Engineering Design & CAD',
    description: 'CAD, surface modelling, structural analysis, and design iterations tied to measurable engineering constraints.',
  },
} as const;

export type TopicSlug = keyof typeof topicBySlug;
export type Topic = (typeof topicBySlug)[TopicSlug] & { slug: TopicSlug };

export const topics: Topic[] = Object.entries(topicBySlug).map(([slug, topic]) => ({
  slug: slug as TopicSlug,
  ...topic,
}));
