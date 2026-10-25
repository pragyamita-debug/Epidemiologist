import type { IconName } from '../components/Icon';

/** Epidemiology / public-health terms → icon. First match wins, so specific rules sit above broad ones. */
const RULES: [RegExp, IconName][] = [
  [/outbreak|infect|virus|pathogen|cholera|measles|dengue|covid|influenza|tb\b|malaria/i, 'virus'],
  [/surveil|monitor|early.warning|wastewater|sentinel/i, 'activity'],
  [/genom|dna|sequenc|molecular|pcr/i, 'dna'],
  [/lab|microbio|antimicrob|resistance|specimen|microscop/i, 'microscope'],
  [/model|statist|biostat|regression|forecast|analy/i, 'chart'],
  [/study|cohort|trial|research|review|evidence|paper|publish/i, 'book'],
  [/vaccin|immuni|prevent|protect/i, 'shield'],
  [/map|gis|spatial|geo/i, 'globe'],
  [/field|contact.trac|train|teach|workshop|community|staff/i, 'users'],
  [/survey|questionnaire|data collection|clipboard/i, 'clipboard'],
  [/policy|guidance|govern|advis|minister/i, 'policy'],
  [/equity|justice|access/i, 'scale'],
  [/\br\b|sas|stata|python|sql|shiny|code|programm/i, 'code'],
  [/visual|dashboard|report|storytell/i, 'chart'],
  [/one health|environment|climate|water/i, 'drop'],
];

const FALLBACK: IconName[] = ['bubble', 'microscope', 'virus', 'chart', 'globe', 'users', 'dna', 'activity'];

export function iconFor(text: string, i = 0): IconName {
  return RULES.find(([re]) => re.test(text))?.[1] ?? FALLBACK[i % FALLBACK.length];
}

/** Splits a short heading into two balanced lines, like the labels in the design. */
export function twoLines(text: string): [string, string] {
  const words = text.split(/\s+/);
  if (words.length < 2) return [text, ''];
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
    if (d < diff) {
      diff = d;
      best = i;
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}

export function splitHeadline(headline: string): [string, string] {
  const [role, ...rest] = headline.split(/\s*[|·•]\s*|\s+[—–]\s+/);
  return [role?.trim() || headline, rest.join(' · ').trim()];
}

/** Wraps numbers ("38%", "5 days", "120") so they can be set in the display serif. */
export function splitNumbers(text: string): { t: string; n: boolean }[] {
  return text.split(/(\d[\d,.]*\s?%?)/).filter(Boolean).map((t) => ({ t, n: /^\d/.test(t) }));
}
