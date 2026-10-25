import { useEffect, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Writes `--p` (−1 when the element enters at the bottom of the viewport, 0 in the middle, 1 as it leaves at
 * the top) onto the element, so CSS can drift photos at a different speed from the page. Only runs while the
 * element is near the viewport, and never writes during React renders.
 */
export function useParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let raf = 0;
    let visible = false;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = ((vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2)) * 1;
      el.style.setProperty('--p', Math.max(-1, Math.min(1, p)).toFixed(3));
    };
    const onScroll = () => {
      if (visible && !raf) raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) update();
    }, { rootMargin: '120px 0px' });
    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced]);

  return ref;
}
