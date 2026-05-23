export type CvLocale = 'en' | 'fr' | 'cn';

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
  route: '/cv',
  pageTitle: 'Professional CV',
  description: 'Bing Gao — computational mechanics engineering student working across fluid simulation, thermal systems, numerical verification, and engineering software.',
  eyebrow: 'Professional CV, 2026',
  name: 'Bing Gao',
  portraitAlt: 'Bing Gao in the Faroe Islands',
  role: 'Computational Mechanics Engineering Student / Fluid Simulation, Thermal Systems & Engineering Software',
  summary: 'Engineer with nearly 7 years in mobile software development and technical leadership, now applying experience from a product serving more than 2 million users to fluid simulation, finite-element analysis, thermal modelling, and numerical verification while completing a French engineering degree.',
  downloadLabel: 'PDF',
  downloadUrl: '/cv-en.pdf',
  contactLabel: 'Contact me',
  languageNavigationLabel: 'CV language',
  contactNavigationLabel: 'Contact information',
  languageLinks: [
    { label: 'English', href: '/cv' },
    { label: 'French', href: '/fr/cv' },
    { label: 'Chinese', href: '/cn/cv' },
  ],
  contact: {
    email: 'gaobing1230@gmail.com',
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

const french: CvContent = {
  locale: 'fr',
  route: '/fr/cv',
  pageTitle: 'Curriculum vitæ',
  description: 'Bing Gao — élève-ingénieur en mécanique numérique, spécialisé en mécanique des fluides numérique, systèmes thermiques, vérification numérique et logiciels d’ingénierie.',
  eyebrow: 'Curriculum vitæ, 2026',
  name: 'Bing Gao',
  portraitAlt: 'Bing Gao aux Îles Féroé',
  role: 'Élève-ingénieur en mécanique numérique / Mécanique des fluides numérique, systèmes thermiques et logiciels d’ingénierie',
  summary: 'Ingénieur avec près de 7 ans en développement logiciel mobile et encadrement technique, appliquant l’expérience d’un produit de plus de 2 millions d’utilisateurs à la mécanique des fluides numérique, aux éléments finis, à la modélisation thermique et à la vérification numérique pendant son Diplôme d’Ingénieur.',
  downloadLabel: 'PDF',
  downloadUrl: '/cv-fr.pdf',
  contactLabel: 'Me contacter',
  languageNavigationLabel: 'Langue du curriculum vitæ',
  contactNavigationLabel: 'Coordonnées',
  languageLinks: [
    { label: 'Anglais', href: '/cv' },
    { label: 'Français', href: '/fr/cv' },
    { label: 'Chinois', href: '/cn/cv' },
  ],
  contact: {
    email: 'gaobing1230@gmail.com',
    location: 'Paris, France',
    linkedinLabel: 'LinkedIn',
    githubLabel: 'Dépôts de code',
  },
  facts: [
    { value: 'Près de 7 ans', label: 'Livraison logicielle et encadrement technique' },
    { value: '2 M+', label: 'Utilisateurs d’un produit construit à partir de zéro' },
    { value: '2027', label: 'Diplôme d’Ingénieur prévu' },
  ],
  sections: {
    experience: { number: '01', title: 'Expérience', subtitle: 'Ingénierie et livraison de produits' },
    education: { number: '02', title: 'Formation', subtitle: 'Mécanique, calcul et logiciel' },
    skills: { number: '03', title: 'Compétences clés', subtitle: 'Outils et langues de travail' },
    community: { number: '04', title: 'Communauté', subtitle: 'Transmission technique à grande échelle' },
  },
  experience: [
    {
      role: 'Ingénieur aérodynamique',
      organization: 'Vinci Eco Drive, Formula Student ESILV',
      href: 'https://vinciecodrive.fr/',
      place: 'Paris, France',
      period: 'Sept. 2025 — Aujourd’hui',
      bullets: [
        'Piloté la modélisation thermique de la batterie, de l’onduleur et du moteur en couplant modèles hydrauliques, radiateur et transitoires afin d’évaluer l’architecture de refroidissement E3 avant achat.',
        'Développé des concepts de conduits de refroidissement dans le package aérodynamique et utilisé un modèle substitut OpenFOAM ventilateur/cœur pour qualifier la méthode numérique avant toute simulation détaillée du véhicule.',
      ],
    },
    {
      role: 'Stagiaire en modélisation 3D',
      organization: 'Felisiak Ingénierie & Développement',
      place: 'Paris, France',
      period: 'Avr. — août 2026, 17 semaines',
      bullets: [
        'Reconstruit le Space Rider de l’ESA à partir de plans publics pour une application de revue de campagne de lancement et livré des ressources distinctes pour la revue et l’animation sous Unity et Blender.',
        'Développé un processus scripté d’audit, de retour arrière et d’export sous Blender, puis préparé le rapport d’ingénierie, le poster de soutenance et le GLB pour navigateur.',
      ],
    },
    {
      role: 'Responsable du développement d’applications mobiles',
      organization: 'Inkeverse Group Ltd',
      href: 'https://ir.inkeverse.com/en/ir_overview.php',
      place: 'Pékin, Chine',
      period: 'Août 2016 — mars 2023',
      bullets: [
        'Piloté Lao You de sa création à plus de 2 millions d’utilisateurs ; construit le produit à partir de zéro, écrit 70 % de son noyau initial et contribué à en faire une source de revenus.',
        'Développé de manière autonome des algorithmes d’empreinte vocale et des effets de cadeaux en temps réel pour la diffusion en direct.',
        'Conçu une chaîne de livraison en Ruby automatisant les tests, la création des paquets et la distribution sur Android et iOS.',
        'Mis en place l’obscurcissement du code et des ressources ainsi que l’épinglage de certificat pour renforcer la résistance à l’ingénierie inverse et à l’interception du trafic.',
        'Intégré React Native et construit un mécanisme de correctifs à chaud pour des mises à jour contrôlées à l’exécution.',
      ],
    },
  ],
  education: [
    {
      degree: 'Diplôme d’Ingénieur, modélisation et mécanique numérique',
      institution: 'ESILV',
      place: 'Paris, France',
      period: 'Sept. 2025 — 2027 prévu',
      details: [
        'Mécanique des fluides numérique et volumes finis, éléments finis, dynamique du véhicule et groupes motopropulseurs, ingénierie automobile durable, optimisation structurelle, apprentissage automatique et jumeaux numériques.',
      ],
    },
    {
      degree: 'Licence en informatique',
      institution: 'Université des sciences et technologies de Changchun',
      place: 'Changchun, Chine',
      period: 'Sept. 2012 — juil. 2016, moyenne 3,33/4,00',
      details: [
        'Brevet : « Souris avec fonction de manette de jeu » (CN203870574U, délivré le 8 oct. 2014).',
        'Premier prix provincial, concours chinois de modélisation mathématique pour étudiants (2014).',
        'Premier prix, 8e concours de programmation ACM de la CUST (2013).',
        'Bourse nationale du ministère de l’Éducation, classement dans les 0,2 % premiers en Chine (2014–2015).',
        'Bourse de première classe, obtenue cinq fois pour excellence académique (2012–2015).',
      ],
    },
  ],
  skills: [
    {
      label: 'Simulation et méthodes numériques',
      value: 'OpenFOAM, Ansys Fluent, Ansys Mechanical, Star-CCM+, Abaqus, mécanique des fluides numérique par volumes finis, RANS, éléments finis, méthode de Boltzmann sur réseau, POD/DMD, modélisation thermo-fluidique, études de maillage et de convergence.',
    },
    { label: 'CAO et 3D', value: 'CATIA, SolidWorks et Blender.' },
    {
      label: 'Programmation',
      value: 'Java/Kotlin, Python, Ruby/Ruby on Rails, C++, C, Rust, TypeScript/React, Node.js et MATLAB/Simulink.',
    },
    { label: 'Langues', value: 'Français (DELF B2), anglais (C1) et chinois (langue maternelle).' },
  ],
  community: {
    role: 'Organisateur principal à temps partiel',
    organization: 'Google Developer Group Beijing',
    href: 'https://gdg.community.dev/gdg-beijing/',
    place: 'Pékin, Chine',
    period: 'Nov. 2015 — mars 2023',
    bullets: [
      'Organisé des événements techniques gratuits réunissant régulièrement plus de 200 participants et des intervenants de Google et de la Silicon Valley.',
      'Animé le partage de connaissances sur le développement mobile, les logiciels libres et les sujets d’ingénierie émergents.',
    ],
  },
  closing: 'Les méthodes détaillées, les figures et les dossiers de preuves sont disponibles dans le',
  portfolioLabel: 'portfolio d’ingénierie',
  closingMark: 'Bing Gao, Paris',
};

const chinese: CvContent = {
  locale: 'cn',
  route: '/cn/cv',
  pageTitle: '个人简历',
  description: 'Bing Gao——计算力学工程专业学生，研究方向涵盖流体数值模拟、热系统、数值验证与工程软件。',
  eyebrow: '个人简历, 2026',
  name: 'Bing Gao',
  portraitAlt: 'Bing Gao 在法罗群岛',
  role: '计算力学工程专业学生 / 流体数值模拟、热系统与工程软件',
  summary: '拥有近 7 年移动软件开发与技术管理经验；目前在攻读法国工程师学位，并将服务超过 200 万用户的产品交付经验应用于流体数值模拟、有限元分析、热建模和数值验证。',
  downloadLabel: 'PDF',
  downloadUrl: '/cv-cn.pdf',
  contactLabel: '联系我',
  languageNavigationLabel: '简历语言',
  contactNavigationLabel: '联系方式',
  languageLinks: [
    { label: '英文', href: '/cv' },
    { label: '法文', href: '/fr/cv' },
    { label: '中文', href: '/cn/cv' },
  ],
  contact: {
    email: 'gaobing1230@gmail.com',
    location: '法国巴黎',
    linkedinLabel: '职业主页',
    githubLabel: '代码主页',
  },
  facts: [
    { value: '近 7 年', label: '软件交付与技术管理经验' },
    { value: '200 万+', label: '从零构建产品的用户规模' },
    { value: '2027 年', label: '预计取得工程师学位' },
  ],
  sections: {
    experience: { number: '01', title: '工作经历', subtitle: '工程实践与产品交付' },
    education: { number: '02', title: '教育经历', subtitle: '力学、计算与软件' },
    skills: { number: '03', title: '核心技能', subtitle: '工具与工作语言' },
    community: { number: '04', title: '技术社区', subtitle: '面向开发者的知识传播' },
  },
  experience: [
    {
      role: '空气动力学工程师',
      organization: 'Vinci Eco Drive，ESILV 方程式学生车队',
      href: 'https://vinciecodrive.fr/',
      place: '法国巴黎',
      period: '2025 年 9 月至今',
      bullets: [
        '负责电池、逆变器和电机的热系统建模，耦合液压、散热器与瞬态冷却液模型，在采购前筛查 E3 冷却架构。',
        '在空气动力学套件中开发冷却风道概念，并使用 OpenFOAM 风扇与多孔芯体替代模型，在整车详细流体模拟前验证数值方法。',
      ],
    },
    {
      role: '三维建模实习生',
      organization: 'Felisiak 工程与开发',
      place: '法国巴黎',
      period: '2026 年 4 月至 8 月, 17 周',
      bullets: [
        '依据公开图纸重建欧洲空间局 Space Rider，为发射活动评审应用交付独立的评审资产，以及适用于 Unity 和 Blender 的动画资产。',
        '建立 Blender 脚本化审计、回滚与导出流程，并完成工程报告、答辩海报和浏览器版 GLB。',
      ],
    },
    {
      role: '移动应用开发经理',
      organization: 'Inkeverse 集团',
      href: 'https://ir.inkeverse.com/en/ir_overview.php',
      place: '中国北京',
      period: '2016 年 8 月至 2023 年 3 月',
      bullets: [
        '从零构建 Lao You，并带领产品发展到超过 200 万用户；编写了 70% 的初始核心代码，并推动其成为收入来源。',
        '独立开发声纹识别算法和直播实时礼物渲染效果。',
        '设计基于 Ruby 的交付流水线，自动完成 Android 与 iOS 的测试、打包和分发。',
        '实施代码与资源混淆及证书固定，提高对逆向工程和流量拦截的抵抗能力。',
        '集成 React Native，并建立受控运行时更新的热修复机制。',
      ],
    },
  ],
  education: [
    {
      degree: '工程师学位，建模与计算力学方向',
      institution: 'ESILV',
      place: '法国巴黎',
      period: '2025 年 9 月至 2027 年，预计',
      details: [
        '计算流体力学与有限体积法、有限元法、车辆动力学与动力总成、可持续汽车工程、结构优化、机器学习和数字孪生。',
      ],
    },
    {
      degree: '计算机科学学士',
      institution: '长春理工大学',
      place: '中国长春',
      period: '2012 年 9 月至 2016 年 7 月, 平均绩点 3.33/4.00',
      details: [
        '专利：“带游戏手柄功能的鼠标”（CN203870574U，2014 年 10 月 8 日授权）。',
        '中国大学生数学建模竞赛省级一等奖（2014）。',
        '长春理工大学第八届 ACM 程序设计竞赛一等奖（2013）。',
        '教育部国家奖学金，全国前 0.2%（2014—2015）。',
        '一等学业奖学金五次（2012—2015）。',
      ],
    },
  ],
  skills: [
    {
      label: '仿真与数值方法',
      value: 'OpenFOAM、Ansys Fluent、Ansys Mechanical、Star-CCM+、Abaqus、有限体积计算流体力学、RANS、有限元分析、格子玻尔兹曼方法、POD/DMD、热流体建模、网格研究和收敛性研究。',
    },
    { label: '计算机辅助设计与三维建模', value: 'CATIA、SolidWorks 和 Blender。' },
    {
      label: '编程',
      value: 'Java/Kotlin、Python、Ruby/Ruby on Rails、C++、C、Rust、TypeScript/React、Node.js 和 MATLAB/Simulink。',
    },
    { label: '语言', value: '法语（DELF B2）、英语（C1）和中文（母语）。' },
  ],
  community: {
    role: '核心组织者，兼职',
    organization: '北京谷歌开发者社区',
    href: 'https://gdg.community.dev/gdg-beijing/',
    place: '中国北京',
    period: '2015 年 11 月至 2023 年 3 月',
    bullets: [
      '组织免费技术活动，通常吸引超过 200 名参与者，并邀请来自谷歌和硅谷的讲者。',
      '围绕移动开发、开源工具和新兴工程主题组织技术知识分享。',
    ],
  },
  closing: '详细方法、图表和证据记录请参阅',
  portfolioLabel: '工程作品集',
  closingMark: 'Bing Gao, 法国巴黎',
};

export const cvLocales: Record<CvLocale, CvContent> = {
  en: english,
  fr: french,
  cn: chinese,
};
