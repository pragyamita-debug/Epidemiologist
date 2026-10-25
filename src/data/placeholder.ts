import type { Resume } from '../lib/types';

/**
 * What the page shows before anyone uploads a CV: the full design, filled with
 * neutral placeholder text. Uploading a CV replaces every field below.
 */
export const placeholder: Resume = {
  name: 'Your Name',
  headline: 'Your Role | Your Specialty',
  tagline: 'One sentence about the health questions you answer and why they matter.',
  email: 'you@example.com',
  phone: '+00 00000 00000',
  location: 'Your City, Country',
  links: {
    linkedin: 'https://www.linkedin.com/',
    github: 'https://github.com/',
  },
  summary:
    'Two or three sentences about the populations you study, the methods you use and what you are looking for next. Upload a CV and this is replaced by your own profile.',
  motto: 'Every number is a person.',

  experience: [
    { role: 'Your Current Role', company: 'Company Name', period: '2023 – Present', current: true, months: 0, bullets: ['What you are responsible for.', 'A result you are proud of.'] },
    { role: 'Previous Role', company: 'Company Name', period: '2020 – 2023', current: false, months: 0, bullets: ['What you delivered there.'] },
    { role: 'Earlier Role', company: 'Company Name', period: '2018 – 2020', current: false, months: 0, bullets: ['Where you started.'] },
  ],

  education: [{ degree: 'Your Degree in Your Subject', short: 'M.Sc.', field: 'Your Subject', institution: 'Your University', year: '2020', rank: 4 }],

  skills: [
    'Skill One',
    'Skill Two',
    'Skill Three',
    'Skill Four',
    'Skill Five',
    'Method One',
    'Method Two',
    'Method Three',
    'Tool One',
    'Tool Two',
    'Tool Three',
    'Tool Four',
  ],

  projects: [
    { title: 'Your Study or Project', description: 'What it was and why it mattered.', tags: ['Method', 'Tool'] },
    { title: 'Project Two', description: 'What it was and why it mattered.', tags: [] },
    { title: 'Project Three', description: 'What it was and why it mattered.', tags: [] },
    { title: 'Project Four', description: 'What it was and why it mattered.', tags: [] },
    { title: 'Project Five', description: 'What it was and why it mattered.', tags: [] },
    { title: 'Project Six', description: 'What it was and why it mattered.', tags: [] },
  ],

  achievements: ['Your First Achievement', 'A Result With A Number', 'An Award You Received', 'A Milestone You Reached', 'Something You Improved'],
  certifications: ['Certification One', 'Certification Two', 'Certification Three'],

  goals: [
    { label: 'Goal', value: 'Your next milestone', note: 'a measurable target' },
    { label: 'Next Step', value: 'What you are working on now' },
  ],

  interests: ['Interest One', 'Interest Two', 'Interest Three', 'Interest Four', 'Interest Five'],
  languages: [],

  stats: { years: 5, yearsPlus: true, projects: 6, projectsPlus: false, skills: 12 },
};
