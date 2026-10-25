import { useMemo, useState } from 'react';
import { useScrollSpy } from '../hooks/useScrollSpy';
import type { StoredProfile } from '../lib/types';
import { buildStories, Hero } from './Hero';
import { Career, Credentials, Expertise, Footer, Horizon, NAV, Numbers, Outcomes, TopBar } from './Sections';
import { StoryDialog } from './StoryDialog';
import './Dashboard.css';

const IDS = NAV.map((n) => n.id);

interface Props {
  profile: StoredProfile;
  isExample: boolean;
  onUploadNew: () => void;
  onEdit: () => void;
  onReset: () => void;
  onDownloadCv: () => void;
}

export function Dashboard({ profile, isExample, onUploadNew, onEdit, onReset, onDownloadCv }: Props) {
  const { resume } = profile;
  const active = useScrollSpy(IDS, 140);
  const stories = useMemo(() => buildStories(resume), [resume]);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <TopBar resume={resume} active={active} isExample={isExample} onUpload={onUploadNew} />
      <main>
        <Hero resume={resume} stories={stories} isExample={isExample} onUpload={onUploadNew} onOpen={setOpen} />
        <Numbers resume={resume} />
        <Expertise resume={resume} />
        <Career resume={resume} />
        <Credentials resume={resume} />
        <Outcomes resume={resume} />
        <Horizon resume={resume} />
      </main>
      <Footer resume={resume} isExample={isExample} onUpload={onUploadNew} onEdit={onEdit} onReset={onReset} onDownloadCv={onDownloadCv} />
      {open !== null && stories.length > 0 && <StoryDialog stories={stories} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}
