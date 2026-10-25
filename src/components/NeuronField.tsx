import { useEffect, useRef } from 'react';
import neuron from '../assets/photos/neuron-field.jpg';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Cell {
  x: number;
  y: number;
  r: number;
  hue: number; // 0 = teal soma, 1 = violet nucleus
  flash: number; // 0..1, set when a signal arrives
  drift: number;
}
interface Link {
  a: number;
  b: number;
  /** two control points per strand so filaments wander like the ones in the photo */
  strands: { c1: [number, number]; c2: [number, number] }[];
  grow: number; // 0..1 how far the filament has reached
  life: number; // seconds left before it starts to retract (Infinity = permanent)
  dying: boolean;
}
interface Pulse {
  link: number;
  t: number;
  speed: number;
  back: boolean;
}
interface Mote {
  x: number;
  y: number;
  r: number;
  a: number;
  vx: number;
  vy: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function bezier(p0: number, p1: number, p2: number, p3: number, t: number) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

/**
 * The background below the hero: the neuron photo, with a living network drawn over it on a canvas.
 * Cells sprout filaments that grow until they reach a neighbour, signals travel cell to cell and make
 * the receiving cell flash, some links retract and new ones grow elsewhere, and soft bokeh drifts past.
 * The layer is sticky (one viewport tall), so the canvas never has to be larger than the screen,
 * and the loop pauses when the section is off-screen or the tab is hidden.
 */
export function NeuronField() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = host.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let cells: Cell[] = [];
    let links: Link[] = [];
    let pulses: Pulse[] = [];
    let motes: Mote[] = [];
    let raf = 0;
    let last = 0;
    let running = false;
    let spawnIn = 1.2;

    const strandsFor = (a: Cell, b: Cell) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      return Array.from({ length: 2 }, (_, i) => {
        const bend = rand(-0.28, 0.28) * len + (i ? rand(6, 14) : 0);
        return {
          c1: [a.x + dx * 0.3 + nx * bend, a.y + dy * 0.3 + ny * bend] as [number, number],
          c2: [a.x + dx * 0.7 - nx * bend * rand(0.4, 1), a.y + dy * 0.7 - ny * bend * rand(0.4, 1)] as [number, number],
        };
      });
    };

    const linkExists = (a: number, b: number) => links.some((l) => (l.a === a && l.b === b) || (l.a === b && l.b === a));

    const nearest = (i: number, k: number) =>
      cells
        .map((c, j) => ({ j, d: Math.hypot(c.x - cells[i].x, c.y - cells[i].y) }))
        .filter((o) => o.j !== i)
        .sort((p, q) => p.d - q.d)
        .slice(0, k)
        .map((o) => o.j);

    const build = () => {
      const r = el.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // scatter cells with a minimum spacing so the web stays readable
      const count = Math.round(Math.min(26, Math.max(9, (w * h) / 70000)));
      cells = [];
      let guard = 0;
      while (cells.length < count && guard++ < 2000) {
        const c = { x: rand(0.04, 0.96) * w, y: rand(0.06, 0.94) * h, r: rand(3, 8), hue: Math.random() < 0.35 ? 1 : 0, flash: 0, drift: rand(0, Math.PI * 2) };
        if (cells.every((o) => Math.hypot(o.x - c.x, o.y - c.y) > Math.min(w, h) * 0.17)) cells.push(c);
      }
      // a permanent backbone: every cell joined to its two nearest neighbours
      links = [];
      cells.forEach((_, i) => {
        for (const j of nearest(i, 2)) {
          if (!linkExists(i, j)) links.push({ a: i, b: j, strands: strandsFor(cells[i], cells[j]), grow: reduced ? 1 : rand(-0.6, 0), life: Infinity, dying: false });
        }
      });
      pulses = [];
      motes = Array.from({ length: Math.round(Math.max(10, (w * h) / 60000)) }, () => ({ x: rand(0, w), y: rand(0, h), r: rand(6, 26), a: rand(0.05, 0.22), vx: rand(-6, 6), vy: rand(-10, -2) }));
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, w, h);

      // bokeh
      for (const m of motes) {
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        if (m.y < -40) m.y = h + 40;
        if (m.x < -40) m.x = w + 40;
        if (m.x > w + 40) m.x = -40;
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
        g.addColorStop(0, `rgba(190, 225, 230, ${m.a})`);
        g.addColorStop(1, 'rgba(190, 225, 230, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // filaments: each strand is drawn up to how far it has grown
      ctx.lineCap = 'round';
      links.forEach((l) => {
        if (l.grow <= 0) return;
        const a = cells[l.a];
        const b = cells[l.b];
        const reach = Math.min(1, l.grow);
        l.strands.forEach((s, si) => {
          ctx.beginPath();
          const steps = 28;
          for (let k = 0; k <= steps * reach; k++) {
            const t = k / steps;
            const x = bezier(a.x, s.c1[0], s.c2[0], b.x, t);
            const y = bezier(a.y, s.c1[1], s.c2[1], b.y, t);
            if (k === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = si ? 'rgba(120, 210, 225, 0.22)' : 'rgba(140, 225, 238, 0.5)';
          ctx.lineWidth = si ? 0.7 : 1.1;
          ctx.shadowColor = 'rgba(80, 200, 220, 0.8)';
          ctx.shadowBlur = si ? 0 : 6;
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
        // the growing tip glows
        if (reach < 1) {
          const s = l.strands[0];
          const x = bezier(a.x, s.c1[0], s.c2[0], b.x, reach);
          const y = bezier(a.y, s.c1[1], s.c2[1], b.y, reach);
          ctx.fillStyle = 'rgba(220, 250, 255, 0.95)';
          ctx.beginPath();
          ctx.arc(x, y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // signals running cell to cell
      for (const p of pulses) {
        const l = links[p.link];
        if (!l) continue;
        const a = cells[l.a];
        const b = cells[l.b];
        const s = l.strands[0];
        const t = p.back ? 1 - p.t : p.t;
        const x = bezier(a.x, s.c1[0], s.c2[0], b.x, t);
        const y = bezier(a.y, s.c1[1], s.c2[1], b.y, t);
        const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
        g.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        g.addColorStop(0.3, 'rgba(150, 235, 245, 0.6)');
        g.addColorStop(1, 'rgba(150, 235, 245, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();
      }

      // cells: a web-like soma with a glowing nucleus that flashes when a signal arrives
      const now = performance.now() / 1000;
      for (const c of cells) {
        const breathe = 1 + Math.sin(now * 1.3 + c.drift) * 0.08;
        const glow = c.r * (3.2 + c.flash * 3) * breathe;
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, glow);
        const col = c.hue ? '150, 120, 255' : '110, 215, 230';
        g.addColorStop(0, `rgba(${col}, ${0.55 + c.flash * 0.45})`);
        g.addColorStop(0.35, `rgba(${col}, ${0.18 + c.flash * 0.2})`);
        g.addColorStop(1, `rgba(${col}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(c.x, c.y, glow, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(170, 235, 245, ${0.35 + c.flash * 0.4})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r * 1.7 * breathe, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = c.hue ? 'rgba(170, 140, 255, 0.95)' : 'rgba(200, 245, 250, 0.9)';
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (dt: number) => {
      // grow / retract filaments
      for (const l of links) {
        if (l.dying) l.grow -= dt * 0.5;
        else if (l.grow < 1) l.grow += dt * 0.42;
        if (l.life !== Infinity && l.grow >= 1) {
          l.life -= dt;
          if (l.life <= 0) l.dying = true;
        }
      }
      links = links.filter((l) => !(l.dying && l.grow <= 0));

      // now and then a cell reaches out to a further neighbour — new connections keep forming
      spawnIn -= dt;
      if (spawnIn <= 0 && cells.length > 3) {
        spawnIn = rand(1.2, 2.6);
        const i = (Math.random() * cells.length) | 0;
        const options = nearest(i, 5).filter((j) => !linkExists(i, j));
        if (options.length) {
          const j = options[(Math.random() * options.length) | 0];
          links.push({ a: i, b: j, strands: strandsFor(cells[i], cells[j]), grow: 0, life: rand(5, 10), dying: false });
        }
      }

      // signals: start on fully grown links, and when one arrives it may fire onward
      if (Math.random() < dt * 2.4) {
        const ready = links.map((l, k) => (l.grow >= 1 && !l.dying ? k : -1)).filter((k) => k >= 0);
        if (ready.length) pulses.push({ link: ready[(Math.random() * ready.length) | 0], t: 0, speed: rand(0.35, 0.7), back: Math.random() < 0.5 });
      }
      const arrived: Pulse[] = [];
      for (const p of pulses) {
        p.t += dt * p.speed;
        if (p.t >= 1) arrived.push(p);
      }
      pulses = pulses.filter((p) => p.t < 1 && links[p.link]);
      for (const p of arrived) {
        const l = links[p.link];
        if (!l) continue;
        const target = p.back ? l.a : l.b;
        cells[target].flash = 1;
        if (Math.random() < 0.55 && pulses.length < 40) {
          const next = links.map((q, k) => ((q.a === target || q.b === target) && q !== l && q.grow >= 1 ? k : -1)).filter((k) => k >= 0);
          if (next.length) {
            const k = next[(Math.random() * next.length) | 0];
            pulses.push({ link: k, t: 0, speed: rand(0.35, 0.7), back: links[k].b === target });
          }
        }
      }
      for (const c of cells) c.flash = Math.max(0, c.flash - dt * 1.4);
    };

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - (last || t)) / 1000);
      last = t;
      step(dt);
      draw(dt);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    build();
    if (reduced) draw(0);

    const ro = new ResizeObserver(() => {
      build();
      if (reduced) draw(0);
    });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop()));
    io.observe(el.parentElement ?? el);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reduced]);

  return (
    <div className="neuro" aria-hidden>
      <div className="neuro__view" ref={host}>
        <img className="neuro__photo" src={neuron} alt="" />
        <canvas ref={canvas} className="neuro__canvas" />
      </div>
    </div>
  );
}
