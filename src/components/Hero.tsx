import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import b1 from '../assets/photos/bubble-1.webp';
import b2 from '../assets/photos/bubble-2.webp';
import b3 from '../assets/photos/bubble-3.webp';
import b4 from '../assets/photos/bubble-4.webp';
import b5 from '../assets/photos/bubble-5.webp';
import b6 from '../assets/photos/bubble-6.webp';
import b7 from '../assets/photos/bubble-7.webp';
import { useCountUp } from '../hooks/useCountUp';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { splitHeadline, twoLines } from '../lib/epi';
import type { Resume } from '../lib/types';
import { Icon } from './Icon';

export interface Story {
  key: string;
  kind: 'Role' | 'Project';
  title: string;
  meta?: string;
  text: string[];
  tags: string[];
  photo: string;
}

/**
 * The stage is laid out on a fixed 1240×900 grid (the cascade from the design, turned landscape) and the whole
 * stage is zoomed to fit narrower windows, so bubbles, labels and connector lines always stay in register.
 * x / y are bubble centres, d the diameter, depth how strongly it follows the pointer.
 */
const STAGE = { w: 1240, h: 900 };
const SLOTS = [
  { photo: b2, x: 578, y: 300, d: 262, depth: 1, side: 'left', ly: 420, bob: 7.5 },
  { photo: b6, x: 598, y: 732, d: 286, depth: 0.7, side: 'left', ly: 800, bob: 9 },
  { photo: b4, x: 776, y: 548, d: 234, depth: 1.25, side: 'right', ly: 560, bob: 8.2 },
  { photo: b1, x: 742, y: 112, d: 186, depth: 1.5, side: 'right', ly: 112, bob: 6.8 },
  { photo: b5, x: 486, y: 586, d: 194, depth: 0.9, side: 'left', ly: 610, bob: 8.8 },
  { photo: b3, x: 632, y: 500, d: 172, depth: 1.1, side: 'none', ly: 0, bob: 7.1 },
  { photo: b7, x: 758, y: 298, d: 90, depth: 1.8, side: 'right', ly: 300, bob: 5.6 },
] as const;

export function buildStories(resume: Resume): Story[] {
  const roles: Omit<Story, 'photo'>[] = resume.experience.map((e, i) => ({
    key: `role-${i}`,
    kind: 'Role',
    title: e.role,
    meta: [e.company, e.period].filter(Boolean).join(' · '),
    text: e.bullets,
    tags: [],
  }));
  const projects: Omit<Story, 'photo'>[] = resume.projects.map((p, i) => ({
    key: `project-${i}`,
    kind: 'Project',
    title: p.title,
    meta: p.meta || p.tags.slice(0, 3).join(' · ') || undefined,
    text: p.description ? [p.description] : [],
    tags: p.tags,
  }));
  // lead with up to three roles, then fill the cascade with projects (then any remaining roles)
  const picked = [...roles.slice(0, 3), ...projects, ...roles.slice(3)].slice(0, SLOTS.length);
  return picked.map((s, i) => ({ ...s, photo: SLOTS[i].photo }));
}

/** Zoom that fits the 1240px stage between 680px and 1240px; phones get the compact layout instead. */
function useStageFit() {
  const read = () => {
    const w = typeof document === 'undefined' ? 1440 : document.documentElement.clientWidth;
    if (w >= STAGE.w) return { zoom: 1, compact: false };
    if (w >= 680) return { zoom: w / STAGE.w, compact: false };
    return { zoom: w / 560, compact: true };
  };
  const [fit, setFit] = useState(read);
  useEffect(() => {
    const on = () => setFit(read());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return fit;
}

interface Props {
  resume: Resume;
  stories: Story[];
  isExample: boolean;
  onUpload: () => void;
  onOpen: (i: number) => void;
}

export function Hero({ resume, stories, isExample, onUpload, onOpen }: Props) {
  const [role, focus] = splitHeadline(resume.headline);
  const reduced = useReducedMotion();
  const { zoom, compact } = useStageFit();
  const [hot, setHot] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const count = useCountUp(stories.length, ready, { duration: 1600, delay: 400 });

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  // pointer parallax: write -1…1 into CSS vars; each bubble moves by its own depth
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (reduced || e.pointerType === 'touch' || !stage.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    stage.current.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    stage.current.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };

  const title = (
    <div className="hero__head">
      <h1 className="hero__title">
        <span className="hero__num">{Math.round(count)}</span> public health
        <br />
        stories
      </h1>
      <p className="hero__who">
        {resume.name} <span>—</span> {role}
        {focus && <em>{focus}</em>}
      </p>
      <div className="hero__actions">
        {isExample ? (
          <button className="pill" onClick={onUpload}>
            <Icon name="upload" size={16} /> Upload your CV
          </button>
        ) : (
          <a className="pill" href={resume.email ? `mailto:${resume.email}` : '#contact'}>
            <Icon name="mail" size={16} /> Get in touch
          </a>
        )}
        <button className="pill pill--glass" onClick={() => onOpen(0)}>
          Read the stories
        </button>
      </div>
    </div>
  );

  const slots = SLOTS.slice(0, stories.length);
  const t1 = slots[3] ?? slots[0];

  return (
    <section className={`hero ${ready ? 'is-ready' : ''} ${compact ? 'is-compact' : ''}`} id="stories" onPointerMove={onMove} aria-label="Stories">
      <div className="hero__motes" aria-hidden>
        {Array.from({ length: 14 }, (_, i) => (
          <i key={i} style={{ '--i': i } as CSSProperties} />
        ))}
      </div>

      {compact && <div className="wrap">{title}</div>}

      <div className="hero__fit" style={{ height: STAGE.h * zoom }}>
        <div className="stage" ref={stage} style={{ width: STAGE.w, height: STAGE.h, zoom, marginLeft: compact ? -362 : undefined } as CSSProperties}>
          {/* the rising sun and the teal sphere behind the cascade, and the cascade's shadow on the floor */}
          <span className="stage__sun" aria-hidden />
          <span className="stage__sea" aria-hidden />
          <span className="stage__shadow" aria-hidden />
          {!compact && title}

          {/* connector lines: label → bubble, and the dotted line from the title to the first bubble */}
          <svg className="stage__lines" viewBox={`0 0 ${STAGE.w} ${STAGE.h}`} aria-hidden>
            {!compact && t1 && <path className="stage__dots" d={`M300,${t1.y + 70} L${t1.x - t1.d / 2 - 10},${t1.y + 40}`} />}
            {slots.map((s, i) => {
              if (s.side === 'none' || compact) return null;
              const x0 = s.side === 'left' ? 340 : 930;
              // aim at the bubble's rim on the line between the label and the centre
              const dx = s.x - x0;
              const dy = s.y - s.ly;
              const l = Math.hypot(dx, dy) || 1;
              const ex = s.x - (dx / l) * (s.d / 2 + 6);
              const ey = s.y - (dy / l) * (s.d / 2 + 6);
              return (
                <g key={i} className={`stage__link ${hot === i ? 'is-hot' : ''}`} style={{ '--i': i } as CSSProperties}>
                  <path d={`M${x0},${s.ly} L${ex.toFixed(1)},${ey.toFixed(1)}`} pathLength={100} />
                  <circle cx={ex} cy={ey} r={3.2} />
                </g>
              );
            })}
          </svg>

          {!compact &&
            slots.map((s, i) => {
              if (s.side === 'none') return null;
              const st = stories[i];
              const [l1, l2] = twoLines(st.title);
              return (
                <button
                  key={st.key}
                  className={`tag tag--${s.side} ${hot === i ? 'is-hot' : ''}`}
                  style={{ top: s.ly, '--i': i } as CSSProperties}
                  onPointerEnter={() => setHot(i)}
                  onPointerLeave={() => setHot(null)}
                  onFocus={() => setHot(i)}
                  onBlur={() => setHot(null)}
                  onClick={() => onOpen(i)}
                >
                  <span className="tag__title">
                    {l1}
                    {l2 && <br />}
                    {l2}
                  </span>
                  {st.meta && <span className="tag__meta">{st.meta}</span>}
                </button>
              );
            })}

          {slots.map((s, i) => (
            <button
              key={stories[i].key}
              className={`bubble ${hot === i ? 'is-hot' : ''}`}
              style={{ left: s.x - s.d / 2, top: s.y - s.d / 2, width: s.d, height: s.d, '--depth': s.depth, '--bob': `${s.bob}s`, '--i': i } as CSSProperties}
              onPointerEnter={() => setHot(i)}
              onPointerLeave={() => setHot(null)}
              onFocus={() => setHot(i)}
              onBlur={() => setHot(null)}
              onClick={() => onOpen(i)}
              aria-label={`${stories[i].kind}: ${stories[i].title}`}
            >
              <span className="bubble__float">
                <img src={s.photo} alt="" draggable={false} />
                <span className="bubble__glass" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
