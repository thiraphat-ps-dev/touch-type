import { describe, expect, it } from 'vitest';
import { LESSONS, allowedKeys, lessonText, seeded, testText, weakText } from '../content/lessons';
import { ENGLISH_SENTENCES, ENGLISH_WORDS, THAI_SENTENCES, THAI_WORDS } from '../content/words';
import { KEYS, canType, charFor, strokeFor } from './layouts';
import { newSession, reduce, score, weakKeys } from './session';

describe('layouts', () => {
  it('gives every character exactly one key per layout', () => {
    for (const lang of ['th', 'en'] as const) {
      const seen = new Map<string, string>();
      for (const key of KEYS) {
        if (key.code === 'Space') continue;
        for (const ch of key[lang]) {
          expect(seen.get(ch), `${lang} ${ch} on ${key.code} and ${seen.get(ch)}`).toBeUndefined();
          seen.set(ch, key.code);
        }
      }
    }
  });

  it('maps physical keys to Kedmanee', () => {
    expect(['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon'].map((c) => charFor(c, false, 'th')).join('')).toBe('ฟหกด่าสว');
    expect(charFor('KeyF', true, 'th')).toBe('โ');
    expect(charFor('KeyF', false, 'en')).toBe('f');
    expect(charFor('Space', false, 'th')).toBe(' ');
    expect(charFor('Enter', false, 'th')).toBeNull();
  });

  it('holds Shift with the other hand', () => {
    expect(strokeFor('โ', 'th')).toMatchObject({ shift: true, shiftCode: 'ShiftRight' });
    expect(strokeFor('ซ', 'th')).toMatchObject({ shift: true, shiftCode: 'ShiftLeft' });
    expect(strokeFor('A', 'en')?.shiftCode).toBe('ShiftRight');
  });
});

describe('content', () => {
  it('only uses typeable characters', () => {
    for (const w of THAI_WORDS) expect(canType(w, 'th'), w).toBe(true);
    for (const s of THAI_SENTENCES) expect(canType(s, 'th'), s).toBe(true);
    for (const w of ENGLISH_WORDS) expect(canType(w, 'en'), w).toBe(true);
    for (const s of ENGLISH_SENTENCES) expect(canType(s, 'en'), s).toBe(true);
  });

  it('builds every lesson from its allowed keys', () => {
    for (const lang of ['th', 'en'] as const) {
      LESSONS[lang].forEach((lesson, i) => {
        for (let seed = 1; seed < 40; seed++) {
          const text = lessonText(lang, i, seeded(seed));
          expect(text.length, lesson.id).toBeGreaterThan(40);
          expect(canType(text, lang), `${lesson.id}: ${text}`).toBe(true);
          expect(text).not.toMatch(/^\s|\s$|\s\s/);
          if (lesson.kind === 'keys' && lesson.id !== 'en-sym') {
            const allowed = allowedKeys(lang, i);
            for (const ch of text) expect(allowed.has(ch), `${lesson.id} uses ${ch}`).toBe(true);
          }
        }
      });
    }
  });

  it('introduces every key of the layout somewhere', () => {
    for (const lang of ['th', 'en'] as const) {
      const taught = allowedKeys(lang, LESSONS[lang].length - 1);
      const missing = KEYS.flatMap((k) => [...k[lang]]).filter((ch) => !taught.has(ch));
      // Obsolete letters and rare symbols are only drilled on request.
      const rare = lang === 'th' ? 'ฃฅฦํฺ_%+/-๑๒๓๔๕๖๗๘๙๐฿ๅ".,()?' : '';
      expect(missing.filter((ch) => !rare.includes(ch))).toEqual([]);
    }
  });

  it('makes timed and weak-key texts', () => {
    expect(canType(testText('th', seeded(3)), 'th')).toBe(true);
    const text = weakText('th', ['ฆ', 'ษ'], seeded(4));
    expect(canType(text, 'th')).toBe(true);
    expect(text).toMatch(/ฆ|ษ/);
  });

  it('stays in the Basic Multilingual Plane, so string indexes are characters', () => {
    const all = [...THAI_WORDS, ...ENGLISH_WORDS, ...THAI_SENTENCES, ...ENGLISH_SENTENCES].join('');
    expect([...all].length).toBe(all.length);
  });
});

describe('session', () => {
  it('waits on a wrong key and finishes on the last one', () => {
    let s = newSession('กา');
    s = reduce(s, { type: 'type', ch: 'ก', now: 1000 });
    s = reduce(s, { type: 'type', ch: 'ด', now: 1200 });
    expect(s).toMatchObject({ pos: 1, errors: 1, wrong: 'ด', missed: [1] });
    s = reduce(s, { type: 'type', ch: 'า', now: 1400 });
    expect(s).toMatchObject({ pos: 2, wrong: null, finishedAt: 1400 });
    expect(s.keys['า']).toEqual({ hit: 1, miss: 1, ms: 400 });
    expect(reduce(s, { type: 'type', ch: 'x', now: 2000 })).toBe(s);
  });

  it('scores words per minute and accuracy', () => {
    let s = newSession('aaaaaaaaaa');
    for (let i = 0; i < 10; i++) s = reduce(s, { type: 'type', ch: 'a', now: i * 600 });
    s = reduce(newSession('ab'), { type: 'type', ch: 'a', now: 0 });
    s = reduce(s, { type: 'type', ch: 'x', now: 100 });
    s = reduce(s, { type: 'type', ch: 'b', now: 200 });
    expect(score(s, 200).accuracy).toBeCloseTo(66.7);
    let t = newSession('a'.repeat(50));
    for (let i = 0; i < 50; i++) t = reduce(t, { type: 'type', ch: 'a', now: (i + 1) * 200 });
    // 50 characters = 10 words; started at the first stroke, 9.8 s later
    expect(score(t, 0).wpm).toBe(61);
  });

  it('only flags keys that are missed or slow', () => {
    const weak = weakKeys({
      a: { hit: 20, miss: 0, ms: 4000 },
      b: { hit: 5, miss: 5, ms: 1000 },
      c: { hit: 1, miss: 0, ms: 100 },
      d: { hit: 10, miss: 0, ms: 6000 },
      e: { hit: 30, miss: 1, ms: 6000 },
    });
    expect(weak).toEqual(['b', 'd']);
  });
});
