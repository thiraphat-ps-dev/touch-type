// One practice round as a pure reducer. A wrong key counts as an error and the cursor
// waits until the right key is typed, so Thai marks never end up on the wrong letter.

export interface KeyStat {
  hit: number;
  miss: number;
  /** Total time spent reaching this key on correct strokes, in ms. */
  ms: number;
}

export interface Session {
  text: string;
  pos: number;
  errors: number;
  /** Positions where at least one wrong key was pressed. */
  missed: number[];
  startedAt: number | null;
  lastAt: number | null;
  finishedAt: number | null;
  /** The last wrong character, until the next keystroke. */
  wrong: string | null;
  keys: Record<string, KeyStat>;
}

export type SessionAction = { type: 'type'; ch: string; now: number } | { type: 'stop'; now: number } | { type: 'reset'; text: string };

export const newSession = (text: string): Session => ({
  text,
  pos: 0,
  errors: 0,
  missed: [],
  startedAt: null,
  lastAt: null,
  finishedAt: null,
  wrong: null,
  keys: {},
});

/** Pauses longer than this (looking away, a sip of coffee) don't count against a key. */
const MAX_GAP = 2000;

export function reduce(s: Session, a: SessionAction): Session {
  if (a.type === 'reset') return newSession(a.text);
  if (s.finishedAt !== null) return s;
  if (a.type === 'stop') return s.startedAt === null ? s : { ...s, finishedAt: a.now };

  const expected = s.text[s.pos];
  const startedAt = s.startedAt ?? a.now;
  const stat = s.keys[expected] ?? { hit: 0, miss: 0, ms: 0 };
  if (a.ch !== expected) {
    return {
      ...s,
      startedAt,
      lastAt: s.lastAt ?? a.now,
      errors: s.errors + 1,
      missed: s.missed.at(-1) === s.pos ? s.missed : [...s.missed, s.pos],
      wrong: a.ch,
      keys: { ...s.keys, [expected]: { ...stat, miss: stat.miss + 1 } },
    };
  }
  const gap = s.lastAt === null ? 0 : Math.min(MAX_GAP, a.now - s.lastAt);
  const pos = s.pos + 1;
  return {
    ...s,
    pos,
    startedAt,
    lastAt: a.now,
    wrong: null,
    finishedAt: pos >= s.text.length ? a.now : null,
    keys: { ...s.keys, [expected]: { hit: stat.hit + 1, miss: stat.miss, ms: stat.ms + (s.lastAt === null ? 0 : gap) } },
  };
}

export interface Score {
  /** Words per minute, counting five characters as one word. */
  wpm: number;
  /** Share of keystrokes that were right, 0..100. */
  accuracy: number;
  seconds: number;
}

export function score(s: Session, now: number): Score {
  if (s.startedAt === null) return { wpm: 0, accuracy: 100, seconds: 0 };
  const ms = Math.max(1, (s.finishedAt ?? now) - s.startedAt);
  const minutes = ms / 60000;
  const strokes = s.pos + s.errors;
  return {
    wpm: s.pos < 2 ? 0 : Math.round(s.pos / 5 / minutes),
    accuracy: strokes ? Math.round((s.pos / strokes) * 1000) / 10 : 100,
    seconds: Math.round(ms / 1000),
  };
}

export function mergeKeys(into: Record<string, KeyStat>, from: Record<string, KeyStat>): Record<string, KeyStat> {
  const out = { ...into };
  for (const [ch, st] of Object.entries(from)) {
    if (ch === ' ') continue;
    const prev = out[ch] ?? { hit: 0, miss: 0, ms: 0 };
    out[ch] = { hit: prev.hit + st.hit, miss: prev.miss + st.miss, ms: prev.ms + st.ms };
  }
  return out;
}

/**
 * Keys that need work: missed more than now and then, or reached clearly slower than
 * your usual pace. A key needs a handful of tries before it is judged.
 */
export function weakKeys(keys: Record<string, KeyStat>, limit = 6): string[] {
  const tried = Object.entries(keys).filter(([ch, st]) => ch !== ' ' && st.hit + st.miss >= 5);
  const hits = tried.reduce((a, [, st]) => a + st.hit, 0);
  const pace = hits ? tried.reduce((a, [, st]) => a + st.ms, 0) / hits : 0;
  return tried
    .map(([ch, st]) => {
      const missRate = st.miss / (st.hit + st.miss);
      const slow = pace && st.hit ? st.ms / st.hit / pace : 1;
      return { ch, missRate, slow, rank: missRate * 10 + slow };
    })
    .filter((k) => k.missRate >= 0.06 || k.slow >= 1.4)
    .sort((a, b) => b.rank - a.rank)
    .slice(0, limit)
    .map((k) => k.ch);
}

export function keyAccuracy(st: KeyStat | undefined): number | null {
  if (!st || st.hit + st.miss === 0) return null;
  return st.hit / (st.hit + st.miss);
}
