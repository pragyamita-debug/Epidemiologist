# Epidemiologist CV Dashboard

Candidates upload a CV (PDF, DOCX or TXT) and get an animated dashboard in a "microbiome stories" style: every role
and study becomes a glass bubble floating over a rising orange sun on deep teal water, with labels and connector
lines, counted numbers, methods, career, credentials and outcomes underneath.

The CV is read **in the browser** — nothing is uploaded to a server. The parsed profile is kept in `localStorage`
on the candidate's own device.

## What goes where

| On the page | Filled from the CV |
| --- | --- |
| "7 public health stories" | the number of stories counts up |
| Glass bubbles + labels | up to three roles, then projects / studies — click a bubble to read the story |
| A career, counted | years of experience, studies & projects, outcomes, skills (all count up) |
| Methods & tools | skills, each in a glass orb with a matching icon |
| Where the work happened | experience timeline |
| Training & certification | education and certifications |
| What changed because of it | achievements, with their numbers set in the display serif |
| Motto + goals & interests | motto, goals and interests over a second rising sun |

Before anything is uploaded the page shows the full design with neutral placeholders ("Your Name", "Project Two" …).

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
npm test             # parser tests (vitest)
npm run build        # static build in dist/ (deployed to GitHub Pages by .github/workflows/deploy.yml)
npm run build:single # one self-contained dist-single/index.html
```

Stack: Vite, React 18, TypeScript, pdf.js and mammoth for reading files. Fonts (Instrument Serif, Inter) are
bundled locally, so the page makes no third-party requests.

## Structure

```
src/
  App.tsx                    upload → read → review → dashboard flow
  lib/parseResume.ts         turns CV text into a structured profile (tested in parseResume.test.ts)
  lib/epi.ts                 picks icons for skills and stories, splits labels, highlights numbers
  components/Hero.tsx        sun, bubble cascade, labels and connector lines (1240×900 stage, zoomed to fit)
  components/StoryDialog.tsx one story at a time, with arrow-key navigation
  components/Sections.tsx    numbers, methods, career, credentials, outcomes, goals, top bar, footer
  data/sample-cv.txt         a fictional sample CV for trying the flow
```

The sample CV and every name, email and organisation in it are fictional.
