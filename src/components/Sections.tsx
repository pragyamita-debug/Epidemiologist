import { useEffect, useState, type CSSProperties } from 'react';
import { useCountUp } from '../hooks/useCountUp';
import { useInView } from '../hooks/useInView';
import { iconFor, splitNumbers } from '../lib/epi';
import type { Resume } from '../lib/types';
import { GlowCard } from './GlowCard';
import { Icon, type IconName } from './Icon';
import { Logo } from './Logo';

function Head({ label, title, id }: { label: string; title: string; id?: string }) {
  return (
    <div className="head" id={id}>
      <p className="label">{label}</p>
      <h2 className="title">{title}</h2>
    </div>
  );
}

/* ================= numbers ================= */

function Num({ value, plus, label, icon, run, delay, phase, accent }: { value: number; plus?: boolean; label: string; icon: IconName; run: boolean; delay: number; phase: number; accent: 'amber' | 'green' }) {
  const v = useCountUp(value, run, { duration: 2000, delay });
  return (
    <GlowCard className="num" accent={accent} speed={8} phase={phase}>
      <span className="num__icon">
        <Icon name={icon} size={18} />
      </span>
      <b>
        {Math.round(v)}
        {plus && <sup>+</sup>}
      </b>
      <small>{label}</small>
    </GlowCard>
  );
}

export function Numbers({ resume }: { resume: Resume }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const s = resume.stats;
  return (
    <section className="wrap section" id="numbers" aria-label="In numbers">
      <Head label="In numbers" title="A career, counted" />
      <div className="nums" ref={ref}>
        <Num value={s.years} plus={s.yearsPlus} label="Years of experience" icon="clock" run={inView} delay={0} phase={0} accent="amber" />
        <Num value={resume.projects.length} plus={s.projectsPlus} label="Studies & projects" icon="microscope" run={inView} delay={150} phase={0.25} accent="green" />
        <Num value={resume.achievements.length} label="Outcomes delivered" icon="trophy" run={inView} delay={300} phase={0.5} accent="amber" />
        <Num value={resume.skills.length} label="Skills & methods" icon="dna" run={inView} delay={450} phase={0.75} accent="green" />
      </div>
    </section>
  );
}

/* ================= expertise: skills as glass bubbles ================= */

export function Expertise({ resume }: { resume: Resume }) {
  return (
    <section className="wrap section" id="expertise" aria-label="Expertise">
      <Head label="Expertise" title="Methods & tools" />
      <ul className="skills">
        {resume.skills.map((s, i) => (
          <li key={s + i} className={`skill ${i < 4 ? 'skill--lg' : ''}`} style={{ '--i': i, '--bob': `${5 + (i % 5) * 0.7}s` } as CSSProperties}>
            <span className="skill__orb" aria-hidden>
              <Icon name={iconFor(s, i)} size={i < 4 ? 20 : 16} />
            </span>
            {s}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ================= career timeline ================= */

export function Career({ resume }: { resume: Resume }) {
  return (
    <section className="wrap section" id="career" aria-label="Career">
      <Head label="Career" title="Where the work happened" />
      <ol className="career">
        {resume.experience.map((e, i) => (
          <li key={e.role + i} className={`career__item ${e.current ? 'is-now' : ''}`} style={{ '--i': i } as CSSProperties}>
            <span className="career__dot" aria-hidden />
            <GlowCard className="career__card" accent={e.current ? 'amber' : 'green'} speed={9} phase={i * 0.3} tilt={false}>
              <div className="career__top">
                <div>
                  <h3>{e.role}</h3>
                  <p className="career__co">{[e.company, e.location].filter(Boolean).join(' · ')}</p>
                </div>
                {e.period && <span className="career__when">{e.period}</span>}
              </div>
              {e.bullets.length > 0 && (
                <ul>
                  {e.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </GlowCard>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ================= credentials ================= */

export function Credentials({ resume }: { resume: Resume }) {
  if (!resume.education.length && !resume.certifications.length) return null;
  return (
    <section className="wrap section" aria-label="Education and certifications">
      <Head label="Credentials" title="Training & certification" />
      <div className="creds">
        <GlowCard className="creds__card" accent="green" speed={10} phase={0.2} tilt={false}>
          <p className="label">
            <Icon name="graduation" size={15} /> Education
          </p>
          <ul>
            {resume.education.map((ed) => (
              <li key={ed.degree}>
                <b>{ed.degree}</b>
                <small>{[ed.institution, ed.year].filter(Boolean).join(' · ')}</small>
              </li>
            ))}
          </ul>
        </GlowCard>
        <GlowCard className="creds__card" accent="amber" speed={10} phase={0.6} tilt={false}>
          <p className="label">
            <Icon name="award" size={15} /> Certifications
          </p>
          <ul>
            {resume.certifications.map((c) => (
              <li key={c}>
                <b>{c}</b>
              </li>
            ))}
          </ul>
        </GlowCard>
      </div>
    </section>
  );
}

/* ================= outcomes ================= */

export function Outcomes({ resume }: { resume: Resume }) {
  if (!resume.achievements.length) return null;
  return (
    <section className="wrap section" id="outcomes" aria-label="Outcomes">
      <Head label="Outcomes" title="What changed because of it" />
      <ul className="outcomes">
        {resume.achievements.map((a, i) => (
          <li key={a + i} style={{ '--i': i } as CSSProperties}>
            <span className="outcomes__n">{String(i + 1).padStart(2, '0')}</span>
            <p>
              {splitNumbers(a).map((p, j) => (p.n ? <em key={j}>{p.t}</em> : <span key={j}>{p.t}</span>))}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ================= motto, goals & interests ================= */

export function Horizon({ resume }: { resume: Resume }) {
  const items = [...resume.goals.map((g) => ({ k: g.label || 'Goal', t: g.note ? `${g.value} (${g.note})` : g.value })), ...resume.interests.map((t) => ({ k: 'Interest', t }))];
  const [on, setOn] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const t = window.setInterval(() => setOn((o) => (o + 1) % items.length), 2600);
    return () => clearInterval(t);
  }, [items.length]);
  return (
    <section className="wrap section horizon" aria-label="Goals and interests">
      <span className="horizon__sun" aria-hidden />
      {resume.motto && <blockquote className="horizon__quote">“{resume.motto}”</blockquote>}
      <ul className="horizon__list">
        {items.map((it, i) => (
          <li key={it.t + i} className={i === on ? 'is-on' : ''} onPointerEnter={() => setOn(i)}>
            <small>{it.k}</small>
            {it.t}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ================= top bar & footer ================= */

export const NAV = [
  { id: 'stories', label: 'Stories' },
  { id: 'numbers', label: 'Numbers' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'career', label: 'Career' },
  { id: 'outcomes', label: 'Outcomes' },
  { id: 'contact', label: 'Contact' },
];

export function TopBar({ resume, active }: { resume: Resume; active: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className={`top ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="wrap top__inner">
        <a className="top__brand" href="#stories">
          <Logo size={28} />
          <span className="wordmark">{resume.name}</span>
        </a>
        <nav className={`top__links ${open ? 'is-open' : ''}`} aria-label="Sections">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={active === n.id ? 'is-active' : ''} aria-current={active === n.id ? 'location' : undefined} onClick={() => setOpen(false)}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="top__end">
          <a className="pill pill--sm" href={resume.email ? `mailto:${resume.email}` : '#contact'}>
            <Icon name="mail" size={15} /> Contact
          </a>
          <button className="icon-btn top__burger" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <Icon name={open ? 'close' : 'menu'} size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function Footer({ resume }: { resume: Resume }) {
  const web = (u: string) => (u.startsWith('http') ? u : `https://${u}`);
  const links = [
    resume.email && { icon: 'mail' as const, label: resume.email, href: `mailto:${resume.email}` },
    resume.phone && { icon: 'phone' as const, label: resume.phone, href: `tel:${resume.phone.replace(/[^\d+]/g, '')}` },
    resume.location && { icon: 'pin' as const, label: resume.location },
    resume.links.linkedin && { icon: 'linkedin' as const, label: 'LinkedIn', href: web(resume.links.linkedin) },
    resume.links.github && { icon: 'github' as const, label: 'GitHub', href: web(resume.links.github) },
  ].filter(Boolean) as { icon: 'mail' | 'phone' | 'pin' | 'linkedin' | 'github'; label: string; href?: string }[];

  return (
    <footer className="foot" id="contact">
      <div className="wrap foot__inner">
        <div className="foot__brand">
          <p className="foot__big">Let’s talk about the next story.</p>
          <small>{resume.headline}</small>
        </div>
        <ul className="foot__links">
          {links.map((l) => (
            <li key={l.label}>
              {l.href ? (
                <a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  <Icon name={l.icon} size={15} /> {l.label}
                </a>
              ) : (
                <span>
                  <Icon name={l.icon} size={15} /> {l.label}
                </span>
              )}
            </li>
          ))}
        </ul>
        {resume.cvUrl && (
          <div className="foot__actions">
            <a className="pill pill--glass pill--sm" href={resume.cvUrl} download>
              <Icon name="download" size={15} /> Download CV
            </a>
          </div>
        )}
      </div>
    </footer>
  );
}
