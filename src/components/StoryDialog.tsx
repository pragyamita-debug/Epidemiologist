import { useEffect, useRef } from 'react';
import type { Story } from './Hero';
import { Icon } from './Icon';

interface Props {
  stories: Story[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}

/** One story at a time: the bubble photo, the role or project, and its details. Arrow keys move between stories. */
export function StoryDialog({ stories, index, onIndex, onClose }: Props) {
  const story = stories[index];
  const panel = useRef<HTMLDivElement>(null);
  const n = stories.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((index + 1) % n);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + n) % n);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [index, n, onClose, onIndex]);

  useEffect(() => panel.current?.focus(), []);

  if (!story) return null;
  return (
    <div className="story" role="dialog" aria-modal="true" aria-label={story.title} onClick={onClose}>
      <div className="story__panel" ref={panel} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn story__close" onClick={onClose} aria-label="Close">
          <Icon name="close" size={16} />
        </button>
        <div className="story__photo" key={story.key}>
          <img src={story.photo} alt="" />
        </div>
        <div className="story__body" key={`${story.key}-body`}>
          <p className="label">
            {story.kind} · Story {index + 1} of {n}
          </p>
          <h2>{story.title}</h2>
          {story.meta && <p className="story__meta">{story.meta}</p>}
          {story.text.length > 0 && (
            <ul>
              {story.text.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          {story.tags.length > 0 && (
            <div className="story__tags">
              {story.tags.map((t) => (
                <span className="chip" key={t}>
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="story__nav">
            <button className="pill pill--glass pill--sm" onClick={() => onIndex((index - 1 + n) % n)} aria-label="Previous story">
              <Icon name="arrowLeft" size={15} /> Previous
            </button>
            <span className="story__dots" aria-hidden>
              {stories.map((s, i) => (
                <i key={s.key} className={i === index ? 'is-on' : ''} />
              ))}
            </span>
            <button className="pill pill--sm" onClick={() => onIndex((index + 1) % n)} aria-label="Next story">
              Next <Icon name="arrowRight" size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
