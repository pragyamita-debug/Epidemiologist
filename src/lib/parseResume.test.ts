import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findDateRange, mergedMonths } from './dates';
import { parseResume } from './parseResume';

const TODAY = new Date(2026, 9, 23); // 23 Oct 2026

describe('dates', () => {
  it('reads month-year ranges with an open end', () => {
    const r = findDateRange('Designer | Jan 2024 – Present', TODAY)!;
    expect(r.label).toBe('Jan 2024 – Present');
    expect(r.current).toBe(true);
  });

  it('reads numeric and year-only ranges', () => {
    expect(findDateRange('03/2021 - 06/2023')!.label).toBe('Mar 2021 – Jun 2023');
    expect(findDateRange('2018 to 2020')!.label).toBe('2018 – 2020');
  });

  it('counts overlapping jobs once', () => {
    const a = findDateRange('Jan 2020 - Jan 2022')!;
    const b = findDateRange('Jan 2021 - Jan 2023')!;
    expect(mergedMonths([a, b])).toBe(36);
  });
});

describe('parseResume — sample CV', () => {
  const cv = parseResume(readFileSync('src/data/sample-cv.txt', 'utf8'), TODAY);

  it('pulls the header', () => {
    expect(cv.name).toBe('Morgan Ellis');
    expect(cv.headline).toBe('Epidemiologist | Infectious Disease & Outbreak Response');
    expect(cv.tagline).toMatch(/^Turning data into decisions/);
    expect(cv.email).toBe('morgan.ellis@example.com');
    expect(cv.phone).toBe('+44 20 7946 0321');
    expect(cv.location).toBe('London, UK');
    expect(cv.links.linkedin).toContain('linkedin.com/in/morgan-ellis-example');
  });

  it('builds experience and stats', () => {
    expect(cv.experience).toHaveLength(3);
    expect(cv.experience[0]).toMatchObject({ role: 'Senior Epidemiologist', company: 'Example Public Health Agency', current: true });
    expect(cv.stats.years).toBe(9);
    expect(cv.stats.yearsPlus).toBe(true);
  });

  it('keeps one-line degrees apart', () => {
    expect(cv.education).toHaveLength(2);
    expect(cv.education.map((e) => e.year)).toEqual(['2016', '2015']);
    expect(cv.education[0]).toMatchObject({ short: 'M.Sc.', field: 'Epidemiology' });
  });

  it('reads skills, projects, certifications and the rest', () => {
    expect(cv.skills).toHaveLength(12);
    expect(cv.skills).toContain('R');
    expect(cv.projects).toHaveLength(7);
    expect(cv.projects[0].title).toBe('Early-Warning Surveillance Dashboard');
    expect(cv.certifications).toHaveLength(3);
    expect(cv.achievements).toHaveLength(5);
    expect(cv.goals[0]).toEqual({ label: 'Goal', value: 'Lead a national surveillance programme', note: 'within five years' });
    expect(cv.motto).toBe('Every number is a person.');
    expect(cv.interests).toHaveLength(5);
  });
});

describe('parseResume — other layouts', () => {
  it('handles "Role at Company" and two-line headers', () => {
    const cv = parseResume(
      `Jane Doe
Senior Product Designer
jane@doe.design · +1 415 555 0101 · San Francisco
EXPERIENCE
Senior Product Designer at Figma
Mar 2021 - Present
- Led the design system
Acme Corp
UX Designer, 2017 - 2021
- Shipped mobile app
Education
Bachelor of Design (B.Des) - National Institute of Design, 2017
Skills
Design tools: Figma, Framer, Protopie
Research: Usability testing, Interviews`,
      TODAY,
    );
    expect(cv.name).toBe('Jane Doe');
    expect(cv.headline).toBe('Senior Product Designer');
    expect(cv.location).toBe('San Francisco');
    expect(cv.phone).toBe('+1 415 555 0101');
    expect(cv.experience).toHaveLength(2);
    expect(cv.experience[0]).toMatchObject({ role: 'Senior Product Designer', company: 'Figma' });
    expect(cv.experience[1]).toMatchObject({ role: 'UX Designer', company: 'Acme Corp' });
    expect(cv.stats.years).toBe(9);
    expect(cv.education[0].rank).toBe(3);
    expect(cv.skills).toEqual(['Figma', 'Framer', 'Protopie', 'Usability testing', 'Interviews']);
  });

  it('keeps un-bulleted descriptions with their role (Word CVs)', () => {
    const cv = parseResume(
      `Sam Patel
Interaction Designer
Experience
Interaction Designer at Monzo
Sep 2021 – Present
Shipped the savings pots redesign
Junior Designer — Ustwo | 2018 - 2021
Worked on wellbeing apps`,
      TODAY,
    );
    expect(cv.experience).toHaveLength(2);
    expect(cv.experience[0]).toMatchObject({ role: 'Interaction Designer', company: 'Monzo', bullets: ['Shipped the savings pots redesign'] });
    expect(cv.experience[1]).toMatchObject({ role: 'Junior Designer', company: 'Ustwo', bullets: ['Worked on wellbeing apps'] });
  });
});
