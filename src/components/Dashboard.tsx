import { useMemo, useState } from 'react';
import { useScrollSpy } from '../hooks/useScrollSpy';
import type { Resume } from '../lib/types';
import { buildStories, Hero } from './Hero';
import { Footer, NAV, TopBar } from './Sections';
import { Ahead, CareerOrbit, Cover, CredentialsSlide, Methods, OutcomesSlide } from './Slides';
import { StoryDialog } from './StoryDialog';
import './Dashboard.css';

const IDS = NAV.map((n) => n.id);

export function Dashboard({ resume }: { resume: Resume }) {
  const active = useScrollSpy(IDS, 140);
  const stories = useMemo(() => buildStories(resume), [resume]);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <TopBar resume={resume} active={active} />
      <main>
        <Hero resume={resume} stories={stories} onOpen={setOpen} />
        {/* the rest of the page is laid out as presentation slides */}
        <div className="deck">
          <Cover resume={resume} />
          <Methods resume={resume} />
          <CareerOrbit resume={resume} />
          <OutcomesSlide resume={resume} />
          <CredentialsSlide resume={resume} />
          <Ahead resume={resume} />
        </div>
      </main>
      <Footer resume={resume} />
      {open !== null && stories.length > 0 && <StoryDialog stories={stories} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}
