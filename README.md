# Stories from the Field — Epidemiologist Portfolio

An animated epidemiologist portfolio. The top is a "microbiome stories" scene: every role and study is a glass
bubble floating over a rising orange sun on deep teal water. Below it the page turns into a lavender presentation
deck — a glass-DNA cover with outlined counting figures, numbered divider slides (01 methods, 02 outcomes, 03 goals)
with glass photos, a career orbit and a glass pie for credentials.

## Edit the content

Everything on the page comes from **`src/data/profile.ts`**. Replace the placeholder values ("Your Name",
"Project Two" …) and the whole page updates — no other file needs to change.

| On the page | Field in `profile.ts` |
| --- | --- |
| Heading ("Stories from the field") | `title` — set in two lines, the second in italic |
| "07 stories · 5+ years" | number of stories and `stats.years` (both count up) |
| Glass bubbles + labels | the first three `experience` entries, then `projects` — click a bubble to read the story |
| DNA cover (big outlined figures) | `stats.years`, projects, achievements, skills — all count up |
| 01 Methods & tools | `skills` (first six in the card, the rest as glass chips) |
| Career orbit | `experience`, numbered around the centre |
| 02 What changed because of it | `achievements` |
| Training & certification (glass pie) | `education`, `certifications` |
| 03 slide (title = motto) | `motto`, `goals`, `interests` |

To offer a "Download CV" button, put the file in `public/` and set `cvUrl`.

## Motion

- The sun rises on load; the bubbles drift in, bob on their own rhythm and follow the pointer at different depths.
- A light travels around each bubble's rim and every card border; hovering a bubble or its label lights both up
  and the connector line between them.
- The connector lines draw themselves, their end nodes blink, and small bubbles rise through the water.
- Numbers count up when they scroll into view. Everything respects `prefers-reduced-motion`.

## Photos

The bubble photos and the glass DNA, flower, bar chart, pie and globe photos are cut from the reference designs
(slide text painted out) and enlarged with Real-ESRGAN. On the slides they fade in when revealed, drift with the
scroll, slowly breathe in and out, and catch a passing glint of light.

## Develop

```bash
npm install
npm run dev          # local dev server
npm run typecheck
npm run build        # static build in dist/ (deployed to GitHub Pages by .github/workflows/deploy.yml)
npm run build:single # one self-contained dist-single/index.html
```

Stack: Vite, React 18, TypeScript. Fonts (Instrument Serif, Inter) are
bundled locally, so the page makes no third-party requests.

## Structure

```
src/
  data/profile.ts            all the content
  lib/epi.ts                 picks icons for skills and stories, splits headings, highlights numbers
  components/Hero.tsx        sun, bubble cascade, labels and connector lines (1240×900 stage, zoomed to fit)
  components/StoryDialog.tsx one story at a time, with arrow-key navigation
  components/Slides.tsx      the presentation slides below the hero
  components/Sections.tsx    top bar and footer
  hooks/useParallax.ts       scroll position → --p for the drifting photos
```
