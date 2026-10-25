# Stories from the Field — Epidemiologist Portfolio

An animated epidemiologist portfolio in a "microbiome stories" style: every role and study is a glass bubble
floating over a rising orange sun on deep teal water, with labels and connector lines, counted numbers, methods,
career, credentials and outcomes underneath.

## Edit the content

Everything on the page comes from **`src/data/profile.ts`**. Replace the placeholder values ("Your Name",
"Project Two" …) and the whole page updates — no other file needs to change.

| On the page | Field in `profile.ts` |
| --- | --- |
| Heading ("Stories from the field") | `title` — set in two lines, the second in italic |
| "07 stories · 5+ years" | number of stories and `stats.years` (both count up) |
| Glass bubbles + labels | the first three `experience` entries, then `projects` — click a bubble to read the story |
| A career, counted | `stats.years`, projects, achievements, skills |
| Methods & tools | `skills` |
| Where the work happened | `experience` |
| Training & certification | `education`, `certifications` |
| What changed because of it | `achievements` (numbers are set in the display serif) |
| Motto + goals & interests | `motto`, `goals`, `interests` |

To offer a "Download CV" button, put the file in `public/` and set `cvUrl`.

## Motion

- The sun rises on load; the bubbles drift in, bob on their own rhythm and follow the pointer at different depths.
- A light travels around each bubble's rim and every card border; hovering a bubble or its label lights both up
  and the connector line between them.
- The connector lines draw themselves, their end nodes blink, and small bubbles rise through the water.
- Numbers count up when they scroll into view. Everything respects `prefers-reduced-motion`.

## Photos

The bubble photos are cut from the reference design, feathered to circles and enlarged with Real-ESRGAN.

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
  components/Sections.tsx    numbers, methods, career, credentials, outcomes, goals, top bar, footer
```
