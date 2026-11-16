import { type Lang, isLeadingVowel, isThaiConsonant, needsBase } from '../engine/layouts';
import { ENGLISH_SENTENCES, ENGLISH_WORDS, THAI_SENTENCES, THAI_WORDS } from './words';

export interface Lesson {
  id: string;
  title: { th: string; en: string };
  /** Characters this lesson introduces. Earlier lessons' keys stay in play. */
  keys: string;
  kind: 'keys' | 'words' | 'sentences';
}

const L = (id: string, th: string, en: string, keys: string, kind: Lesson['kind'] = 'keys'): Lesson => ({
  id,
  title: { th, en },
  keys,
  kind,
});

export const LESSONS: Record<Lang, Lesson[]> = {
  th: [
    L('th-home', 'แถวกลาง', 'Home row', 'ฟหกด่าสว'),
    L('th-home2', 'แถวกลาง: เ ไม้โท และ ง', 'Home row: เ, ไม้โท and ง', 'เ้ง'),
    L('th-top-r', 'แถวบน ขวา', 'Top row, right', 'ีรนยบล'),
    L('th-top-l', 'แถวบน ซ้าย', 'Top row, left', 'ไำพะัๆ'),
    L('th-bottom', 'แถวล่าง', 'Bottom row', 'อทมแิื'),
    L('th-bottom2', 'แถวล่าง ทั้งแถว', 'Whole bottom row', 'ผปใฝ'),
    L('th-num', 'แถวตัวเลข', 'Number row', 'ภถุึคตจขช'),
    L('th-shift1', 'Shift: ตัวที่ใช้บ่อย', 'Shift: common', 'โ็ู์๊๋ซศษฉ'),
    L('th-shift2', 'Shift: ตัวที่เหลือ', 'Shift: the rest', 'ฤฆฏฌฎฑธณญฐฮฒฬฯ'),
    L('th-words', 'คำที่ใช้บ่อย', 'Common words', '', 'words'),
    L('th-sentences', 'ประโยค', 'Sentences', '', 'sentences'),
  ],
  en: [
    L('en-home', 'แถวกลาง', 'Home row', 'asdfjkl;'),
    L('en-gh', 'แถวกลาง: g และ h', 'Home row: g and h', 'gh'),
    L('en-ei', 'e และ i', 'e and i', 'ei'),
    L('en-ru', 'r และ u', 'r and u', 'ru'),
    L('en-tyo', 't, y และ o', 't, y and o', 'tyo'),
    L('en-wqp', 'w, q และ p', 'w, q and p', 'wqp'),
    L('en-cnm', 'c, n, m และจุลภาค', 'c, n, m, comma and period', 'cnm,.'),
    L('en-bottom', 'แถวล่าง ทั้งแถว', 'Whole bottom row', 'vbxz/'),
    L('en-shift', 'ตัวพิมพ์ใหญ่', 'Capitals', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\''),
    L('en-num', 'ตัวเลข', 'Numbers', '1234567890-='),
    L('en-sym', 'สัญลักษณ์', 'Symbols', '!@#$%^&*()_+[]{}\\|`~<>?:"'),
    L('en-words', 'คำที่ใช้บ่อย', 'Common words', '', 'words'),
    L('en-sentences', 'ประโยค', 'Sentences', '', 'sentences'),
  ],
};

/** Every key a lesson may use: its own plus all earlier lessons'. */
export function allowedKeys(lang: Lang, index: number): Set<string> {
  const set = new Set<string>([' ']);
  for (const lesson of LESSONS[lang].slice(0, index + 1)) for (const ch of lesson.keys) set.add(ch);
  return set;
}

export type Rng = () => number;
export const seeded = (seed: number): Rng => {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};
const pick = <T,>(arr: T[], r: Rng) => arr[Math.floor(r() * arr.length)];
function shuffle<T>(arr: T[], r: Rng): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const words = (lang: Lang) => (lang === 'th' ? THAI_WORDS : ENGLISH_WORDS);
export const sentences = (lang: Lang) => (lang === 'th' ? THAI_SENTENCES : ENGLISH_SENTENCES);

const fits = (word: string, allowed: Set<string>) => [...word].every((ch) => allowed.has(ch));

/** A short drill for one key: repeated plainly in English, attached to a consonant in Thai. */
export function drill(ch: string, lang: Lang, allowed: Set<string>, r: Rng): string {
  if (lang === 'en') {
    const pool = [...allowed].filter((c) => c !== ' ' && /[a-z;]/.test(c));
    if (/[A-Z]/.test(ch)) return ch + ch.toLowerCase() + pick(pool, r);
    if (!/[a-z]/.test(ch)) return ch + ch;
    return ch + ch + pick(pool, r) + ch;
  }
  const bases = [...allowed].filter(isThaiConsonant);
  const base = allowed.has('ก') ? 'ก' : bases.length ? pick(bases, r) : 'ก';
  if (needsBase(ch)) return base + ch + (ch === 'ำ' || ch === 'ๆ' ? '' : base + ch);
  if (isLeadingVowel(ch)) return ch + base + ch + pick(bases.length ? bases : [base], r);
  if (isThaiConsonant(ch)) return ch + 'า' + ch;
  return ch + ch;
}

const capitalise = (w: string) => w[0].toUpperCase() + w.slice(1);

/**
 * Words for one practice round. New keys (`focus`) show up more often: as drills and
 * in real words that use them. Everything stays within the keys allowed so far.
 */
export function compose(lang: Lang, allowed: Set<string>, focus: string[], count: number, r: Rng): string {
  const capitals = lang === 'en' && allowed.has('A');
  const pool = words(lang).filter((w) => fits(w, allowed));
  const focused = focus.length ? pool.filter((w) => [...w].some((ch) => focus.includes(ch))) : pool;
  const out: string[] = [];
  const drills = pool.length < 6 ? 0.6 : focus.length ? 0.25 : 0;
  for (let i = 0; i < count; i++) {
    if (focus.length && (r() < drills || !pool.length)) {
      out.push(drill(pick(focus, r), lang, allowed, r));
      continue;
    }
    let w = pick(focused.length && r() < 0.7 ? focused : pool, r);
    if (capitals && r() < 0.35) w = capitalise(w);
    if (lang === 'en' && allowed.has('1') && r() < 0.15) w += ' ' + Math.floor(r() * 2000);
    out.push(w);
  }
  // no word twice in a row
  for (let i = 1; i < out.length; i++) if (out[i] === out[i - 1] && pool.length > 2) out[i] = pick(pool, r);
  return out.join(' ');
}

export function lessonText(lang: Lang, index: number, r: Rng): string {
  const lesson = LESSONS[lang][index];
  if (lesson.kind === 'sentences') return shuffle(sentences(lang), r).slice(0, 3).join(' ');
  if (lesson.kind === 'words') return shuffle(words(lang), r).slice(0, 30).join(' ');
  const allowed = allowedKeys(lang, index);
  let text = compose(lang, allowed, [...lesson.keys], lang === 'th' ? 26 : 24, r);
  // symbols are easier to learn inside a sentence-like line
  if (lesson.id === 'en-sym') text = shuffle(ENGLISH_SENTENCES.filter((s) => /[^a-zA-Z ,.]/.test(s)), r).slice(0, 2).join(' ') + ' ' + text;
  return text;
}

/** A long run of common words for the timed test. */
export function testText(lang: Lang, r: Rng): string {
  const pool = words(lang).filter((w) => w.length > 1);
  return Array.from({ length: 220 }, () => pick(pool, r)).join(' ');
}

/** Words that use the given weak keys, with drills for keys no word covers. */
export function weakText(lang: Lang, weak: string[], r: Rng): string {
  const all = new Set<string>(words(lang).join('') + ' ');
  for (const ch of weak) all.add(ch);
  return compose(lang, all, weak, 28, r);
}
