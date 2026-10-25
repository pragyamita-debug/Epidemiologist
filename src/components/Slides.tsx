import type { CSSProperties, ReactNode } from 'react';
import bars from '../assets/photos/glass-bars.jpg';
import dna from '../assets/photos/glass-dna.jpg';
import flower from '../assets/photos/glass-flower.jpg';
import globe from '../assets/photos/glass-globe.jpg';
import pie from '../assets/photos/glass-pie.jpg';
import { useCountUp } from '../hooks/useCountUp';
import { useInView } from '../hooks/useInView';
import { useParallax } from '../hooks/useParallax';
import { iconFor, twoLines } from '../lib/epi';
import type { Resume } from '../lib/types';
import { GlowCard } from './GlowCard';
import { Icon } from './Icon';

/* ================= shared pieces ================= */

/** A photo that drifts with the scroll, breathes slowly, and catches a glint of light now and then. */
function Photo({ src, className = '' }: { src: string; className?: string }) {
  const ref = useParallax<HTMLDivElement>();
  return (
    <div className={`ph ${className}`} ref={ref} aria-hidden>
      <img src={src} alt="" loading="lazy" draggable={false} />
      <span className="ph__glint" />
    </div>
  );
}

/**
 * One full-width band of the page. There are no boxes: each band's top and bottom edges fade through the same
 * soft violet "seam" colour, so neighbouring bands always melt into each other whichever ones are shown.
 * Its contents reveal when it scrolls into view.
 */
function Slide({ id, tone, children, label }: { id?: string; tone: 'violet' | 'mint' | 'light' | 'cover'; children: ReactNode; label: string }) {
  const [ref, inView] = useInView<HTMLElement>(0.18);
  return (
    <section ref={ref} id={id} aria-label={label} className={`slide slide--${tone} ${inView ? 'is-in' : ''}`}>
      {children}
    </section>
  );
}

/** "01 / Methods & tools" — the white index card with a numbered list, like the section dividers in the deck. */
function IndexCard({ n, items, foot }: { n: string; items: { t: string; sub?: string }[]; foot?: string }) {
  return (
    <GlowCard className="index" accent="purple" speed={8} phase={0.2}>
      <b className="index__n">{n}</b>
      <ul>
        {items.map((it, i) => (
          <li key={it.t + i} style={{ '--i': i } as CSSProperties}>
            <span>
              {it.t}
              {it.sub && <small>{it.sub}</small>}
            </span>
            <Icon name="chevronRight" size={13} />
          </li>
        ))}
      </ul>
      {foot && <span className="index__foot">{foot}</span>}
    </GlowCard>
  );
}

function Divider({ id, n, title, items, photo, tone, foot, label, children }: { id?: string; n: string; title: string; items: { t: string; sub?: string }[]; photo: string; tone: 'violet' | 'mint'; foot?: string; label: string; children?: ReactNode }) {
  const [a, b] = twoLines(title);
  return (
    <Slide id={id} tone={tone} label={label}>
      <Photo src={photo} className="divider__photo" />
      <div className="divider wrap">
        <IndexCard n={n} items={items} foot={foot} />
        <div className="divider__side">
          <h2 className="divider__title">
            {a}
            {b && <br />}
            {b}
          </h2>
          {children}
        </div>
      </div>
    </Slide>
  );
}

/* ================= cover: the DNA, with big outlined counting figures ================= */

export function Cover({ resume }: { resume: Resume }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const s = resume.stats;
  const years = useCountUp(s.years, inView, { duration: 2200, delay: 300 });
  const projects = useCountUp(resume.projects.length, inView, { duration: 2200, delay: 600 });
  const outcomes = useCountUp(resume.achievements.length, inView, { duration: 1800, delay: 900 });
  const skills = useCountUp(resume.skills.length, inView, { duration: 1800, delay: 1100 });
  const pad = (v: number) => String(Math.round(v)).padStart(2, '0');
  return (
    <Slide id="overview" tone="cover" label="Overview in numbers">
      <Photo src={dna} className="cover__photo" />
      <div className="cover wrap" ref={ref}>
        <p className="cover__kicker">Portfolio overview</p>
        <div className="cover__figs">
          <div className="cover__row">
            <b className="outline">{pad(years)}</b>
            <span>
              Years in
              <br />
              public health{s.yearsPlus ? ' +' : ''}
            </span>
          </div>
          <div className="cover__row cover__row--2">
            <span>
              Studies &amp;
              <br />
              projects
            </span>
            <b className="outline">{pad(projects)}</b>
          </div>
        </div>
        <ul className="cover__chips">
          <li>
            <b>{pad(outcomes)}</b> outcomes delivered
          </li>
          <li>
            <b>{pad(skills)}</b> methods &amp; tools
          </li>
        </ul>
      </div>
    </Slide>
  );
}

/* ================= 01 methods & tools ================= */

export function Methods({ resume }: { resume: Resume }) {
  const lead = resume.skills.slice(0, 6);
  const rest = resume.skills.slice(6);
  return (
    <Divider id="expertise" n="01" title="Methods & tools" items={lead.map((t) => ({ t }))} photo={flower} tone="violet" foot={`${resume.skills.length} in total`} label="Methods and tools">
      {rest.length > 0 && (
        <ul className="glass-chips">
          {rest.map((s, i) => (
            <li key={s + i} style={{ '--i': i } as CSSProperties}>
              <Icon name={iconFor(s, i)} size={14} /> {s}
            </li>
          ))}
        </ul>
      )}
    </Divider>
  );
}

/* ================= career: roles around a centre, like the "structure" slide ================= */

export function CareerOrbit({ resume }: { resume: Resume }) {
  const roles = resume.experience.slice(0, 6);
  const n = roles.length;
  const right = Math.ceil(n / 2);
  // first half down the right side, the rest up the left side
  const angle = (i: number) => {
    if (i < right) return right === 1 ? 0 : -42 + (84 / (right - 1)) * i;
    const k = i - right;
    const m = n - right;
    return m === 1 ? 180 : 222 - (84 / (m - 1)) * k;
  };
  return (
    <Slide id="career" tone="light" label="Career">
      <div className="orbit-slide wrap">
        <header className="slide__head">
          <span className="slide__pill" aria-hidden />
          <div>
            <p className="slide__eyebrow">Career</p>
            <h2>Where the work happened</h2>
          </div>
        </header>
        <div className="orbit2">
          <span className="orbit2__ring" aria-hidden />
          <span className="orbit2__ring orbit2__ring--outer" aria-hidden />
          <div className="orbit2__core">
            Career
            <br />
            path
          </div>
          {roles.map((r, i) => {
            const a = (angle(i) * Math.PI) / 180;
            const side = Math.cos(a) >= 0 ? 'r' : 'l';
            return (
              <div key={r.role + i} className={`node node--${side} ${r.current ? 'is-now' : ''}`} style={{ left: `${50 + 34 * Math.cos(a)}%`, top: `${50 + 40 * Math.sin(a)}%`, '--i': i } as CSSProperties}>
                <span className="node__dot">{i + 1}</span>
                <div className="node__text">
                  <b>{r.role}</b>
                  <small>{[r.company, r.period].filter(Boolean).join(' · ')}</small>
                  {r.bullets[0] && <p>{r.bullets[0]}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Slide>
  );
}

/* ================= 02 outcomes ================= */

export function OutcomesSlide({ resume }: { resume: Resume }) {
  if (!resume.achievements.length) return null;
  return (
    <Divider id="outcomes" n="02" title="What changed because of it" items={resume.achievements.slice(0, 6).map((t) => ({ t }))} photo={bars} tone="mint" foot={`${resume.achievements.length} outcomes`} label="Outcomes" />
  );
}

/* ================= credentials: the glass pie with call-outs ================= */

export function CredentialsSlide({ resume }: { resume: Resume }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const certs = useCountUp(resume.certifications.length, inView, { duration: 1600, delay: 300 });
  const callouts = [...resume.education.map((e) => ({ t: e.degree, s: [e.institution, e.year].filter(Boolean).join(' · ') })), ...resume.certifications.map((c) => ({ t: c, s: 'Certification' }))].slice(0, 6);
  if (!callouts.length) return null;
  return (
    <Slide id="credentials" tone="light" label="Training and certification">
      <div className="pie-slide wrap" ref={ref}>
        <div className="pie-slide__left">
          <header className="slide__head">
            <span className="slide__pill" aria-hidden />
            <div>
              <p className="slide__eyebrow">Credentials</p>
              <h2>Training &amp; certification</h2>
            </div>
          </header>
          <p className="pie-slide__lede">{resume.education[0] ? `${resume.education[0].degree}${resume.education[0].institution ? `, ${resume.education[0].institution}` : ''}.` : 'Formal training and recognised certifications.'}</p>
          <GlowCard className="figure" accent="purple" speed={9} phase={0.5} tilt={false}>
            <b>
              {Math.round(certs)}
              <small>certifications</small>
            </b>
            <p>Recognised credentials held alongside {resume.education.length} degree{resume.education.length === 1 ? '' : 's'}.</p>
          </GlowCard>
        </div>
        <div className="pie-slide__right">
          <ul className="callouts">
            {callouts.map((c, i) => (
              <li key={c.t + i} style={{ '--i': i } as CSSProperties}>
                <i aria-hidden />
                <span>
                  {c.t}
                  <small>{c.s}</small>
                </span>
              </li>
            ))}
          </ul>
          <Photo src={pie} className="pie-slide__photo" />
        </div>
      </div>
    </Slide>
  );
}

/* ================= 03 looking ahead ================= */

export function Ahead({ resume }: { resume: Resume }) {
  const items = [...resume.goals.map((g) => ({ t: g.value, sub: g.note || g.label })), ...resume.interests.map((t) => ({ t, sub: 'Interest' }))].slice(0, 6);
  if (!items.length) return null;
  return (
    <Divider id="ahead" n="03" title={resume.motto || 'Looking ahead'} items={items} photo={globe} tone="violet" foot="Goals & interests" label="Goals and interests" />
  );
}
