export type CvLocale = 'en';

export interface CvContent {
  locale: CvLocale;
  route: string;
  pageTitle: string;
  description: string;
  eyebrow: string;
  name: string;
  portraitAlt: string;
  role: string;
  summary: string;
  downloadLabel: string;
  downloadUrl: string;
  contactLabel: string;
  languageNavigationLabel: string;
  contactNavigationLabel: string;
  languageLinks: { label: string; href: string }[];
  contact: {
    email: string;
    location: string;
    linkedinLabel: string;
    githubLabel: string;
  };
  facts: { value: string; label: string }[];
  sections: {
    experience: { number: string; title: string; subtitle: string };
    education: { number: string; title: string; subtitle: string };
    skills: { number: string; title: string; subtitle: string };
    community: { number: string; title: string; subtitle: string };
  };
  experience: {
    role: string;
    organization: string;
    href?: string;
    place: string;
    period: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    place: string;
    period: string;
    details: string[];
  }[];
  skills: { label: string; value: string }[];
  community: {
    role: string;
    organization: string;
    href: string;
    place: string;
    period: string;
    bullets: string[];
  };
  closing: string;
  portfolioLabel: string;
  closingMark: string;
}

const english: CvContent = {
  locale: 'en',
  route: '/cv/',
  pageTitle: 'Professional CV',
  description: 'Bing Gao — computational mechanics engineering student working across fluid simulation, thermal systems, numerical verification, and engineering software.',
  eyebrow: 'Professional CV, 2026',
  name: 'Bing Gao',
  portraitAlt: 'Bing Gao in the Faroe Islands',
  role: 'Computational Mechanics Engineering Student / Fluid Simulation, Thermal Systems & Engineering Software',
  summary: 'Engineer with nearly 7 years in mobile software development and technical leadership, now applying experience from a product serving more than 2 million users to fluid simulation, finite-element analysis, thermal modelling, and numerical verification while completing a French engineering degree.',
  downloadLabel: 'PDF',
  downloadUrl: '/cv/CV_Bing_GAO.pdf',
  contactLabel: 'Contact me',
  languageNavigationLabel: 'CV language',
  contactNavigationLabel: 'Contact information',
  languageLinks: [
    { label: 'English', href: '/cv' },
  ],
  contact: {
    email: 'binggao1230@gmail.com',
    location: 'Paris, France',
    linkedinLabel: 'LinkedIn',
    githubLabel: 'Code portfolio',
  },
  facts: [
    { value: 'Nearly 7 years', label: 'Software delivery and technical leadership' },
    { value: '2M+', label: 'Users reached by a product built from scratch' },
    { value: '2027', label: 'Engineering degree expected' },
  ],
  sections: {
    experience: { number: '01', title: 'Experience', subtitle: 'Engineering and product delivery' },
    education: { number: '02', title: 'Education', subtitle: 'Mechanics, computation, and software' },
    skills: { number: '03', title: 'Core skills', subtitle: 'Tools and working languages' },
    community: { number: '04', title: 'Community', subtitle: 'Developer education at scale' },
  },
  experience: [
    {
      role: 'Aerodynamics Engineer',
      organization: 'Vinci Eco Drive, ESILV Formula Student',
      href: 'https://vinciecodrive.fr/',
      place: 'Paris, France',
      period: 'Sep 2025 — Present',
      bullets: [
        'Led thermal-system modelling for the battery, inverter, and motor, coupling hydraulic, radiator, and transient coolant models to screen the E3 cooling architecture before procurement.',
        'Developed cooling-duct concepts within the aerodynamic package and used an OpenFOAM fan/core surrogate to qualify the numerical method before detailed vehicle fluid simulation.',
      ],
    },
    {
      role: '3D Modelling Intern',
      organization: 'Felisiak Engineering & Development',
      place: 'Paris, France',
      period: 'Apr — Aug 2026, 17 weeks',
      bullets: [
        'Reconstructed the ESA Space Rider from public blueprints for a launch-campaign review application and delivered separate review and animation-ready assets for Unity and Blender.',
        'Built a scripted Blender audit, rollback, and export workflow and prepared the engineering report, defense poster, and browser-ready GLB.',
      ],
    },
    {
      role: 'Mobile Application Development Manager',
      organization: 'Inkeverse Group Ltd',
      href: 'https://ir.inkeverse.com/en/ir_overview.php',
      place: 'Beijing, China',
      period: 'Aug 2016 — Mar 2023',
      bullets: [
        'Led Lao You from inception to more than 2 million users; built the product from scratch, wrote 70% of its initial core code, and helped establish it as a revenue source.',
        'Independently developed voiceprint-recognition algorithms and real-time gift-rendering effects for live broadcasts.',
        'Designed a Ruby-based delivery pipeline that automated testing, packaging, and distribution across Android and iOS.',
        'Implemented code and resource obfuscation plus certificate pinning to increase resistance to reverse engineering and traffic interception.',
        'Integrated React Native and built a hotfix mechanism for controlled runtime updates.',
      ],
    },
  ],
  education: [
    {
      degree: 'Engineering Degree, Modelling & Computational Mechanics',
      institution: 'ESILV',
      place: 'Paris, France',
      period: 'Sep 2025 — 2027 expected',
      details: [
        'Computational fluid dynamics and finite-volume methods, finite-element methods, vehicle dynamics and powertrains, sustainable automotive engineering, structural optimization, machine learning, and digital twins.',
      ],
    },
    {
      degree: 'Bachelor of Computer Science',
      institution: 'Changchun University of Science and Technology',
      place: 'Changchun, China',
      period: 'Sep 2012 — Jul 2016, GPA 3.33/4.00',
      details: [
        'Patent: “Mouse with gamepad function” (CN203870574U, issued Oct 8, 2014).',
        'First Provincial Prize, China Undergraduate Mathematical Contest in Modeling (2014).',
        'First Prize, 8th CUST ACM Programming Competition (2013).',
        'National Scholarship, Ministry of Education award, top 0.2% nationwide (2014–2015).',
        'First Class Scholarship, awarded five times for academic excellence (2012–2015).',
      ],
    },
  ],
  skills: [
    {
      label: 'Simulation & numerical methods',
      value: 'OpenFOAM, Ansys Fluent, Ansys Mechanical, Star-CCM+, Abaqus, finite-volume fluid simulation, RANS, finite-element analysis, lattice-Boltzmann methods, POD/DMD, thermal-fluid modelling, mesh studies, and convergence studies.',
    },
    { label: 'CAD & 3D', value: 'CATIA, SolidWorks, and Blender.' },
    {
      label: 'Programming',
      value: 'Java/Kotlin, Python, Ruby/Ruby on Rails, C++, C, Rust, TypeScript/React, Node.js, and MATLAB/Simulink.',
    },
    { label: 'Languages', value: 'French (DELF B2), English (C1), and Chinese (native).' },
  ],
  community: {
    role: 'Core Organizer (part-time)',
    organization: 'Google Developer Group Beijing',
    href: 'https://gdg.community.dev/gdg-beijing/',
    place: 'Beijing, China',
    period: 'Nov 2015 — Mar 2023',
    bullets: [
      'Organized free technical events that regularly drew more than 200 attendees and featured speakers from Google and Silicon Valley.',
      'Led technical knowledge sharing across mobile development, open-source tools, and emerging engineering topics.',
    ],
  },
  closing: 'Detailed methods, figures, and evidence records are available in the',
  portfolioLabel: 'engineering portfolio',
  closingMark: 'Bing Gao, Paris',
};

export const cvLocales: Record<CvLocale, CvContent> = {
  en: english,
};
