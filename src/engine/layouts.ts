// Physical keys of a US (ANSI) keyboard and what each one types in each layout.
// Keystrokes are read by position (KeyboardEvent.code), so learners never have to
// switch their system input language: the same key gives "f" in English and "ด" in Thai.

export type Lang = 'th' | 'en';
export type Finger = 'lp' | 'lr' | 'lm' | 'li' | 'ri' | 'rm' | 'rr' | 'rp' | 'th';

export interface KeyDef {
  code: string;
  finger: Finger;
  /** [unshifted, shifted] for each layout */
  en: [string, string];
  th: [string, string];
}

/** Decorative keys drawn on the on-screen keyboard but never typed. */
export interface SpacerKey {
  code: string;
  label: string;
  width: number;
}

const k = (code: string, finger: Finger, en: string, th: string): KeyDef => ({
  code,
  finger,
  en: [en[0], en[1]],
  th: [th[0], th[1]],
});

// Thai Kedmanee (TIS 820-2538). Each string is "unshifted + shifted".
export const ROWS: (KeyDef | SpacerKey)[][] = [
  [
    k('Backquote', 'lp', '`~', '_%'),
    k('Digit1', 'lp', '1!', 'ๅ+'),
    k('Digit2', 'lr', '2@', '/๑'),
    k('Digit3', 'lm', '3#', '-๒'),
    k('Digit4', 'li', '4$', 'ภ๓'),
    k('Digit5', 'li', '5%', 'ถ๔'),
    k('Digit6', 'ri', '6^', 'ุู'),
    k('Digit7', 'ri', '7&', 'ึ฿'),
    k('Digit8', 'rm', '8*', 'ค๕'),
    k('Digit9', 'rr', '9(', 'ต๖'),
    k('Digit0', 'rp', '0)', 'จ๗'),
    k('Minus', 'rp', '-_', 'ข๘'),
    k('Equal', 'rp', '=+', 'ช๙'),
    { code: 'Backspace', label: '⌫', width: 2 },
  ],
  [
    { code: 'Tab', label: 'Tab', width: 1.5 },
    k('KeyQ', 'lp', 'qQ', 'ๆ๐'),
    k('KeyW', 'lr', 'wW', 'ไ"'),
    k('KeyE', 'lm', 'eE', 'ำฎ'),
    k('KeyR', 'li', 'rR', 'พฑ'),
    k('KeyT', 'li', 'tT', 'ะธ'),
    k('KeyY', 'ri', 'yY', 'ัํ'),
    k('KeyU', 'ri', 'uU', 'ี๊'),
    k('KeyI', 'rm', 'iI', 'รณ'),
    k('KeyO', 'rr', 'oO', 'นฯ'),
    k('KeyP', 'rp', 'pP', 'ยญ'),
    k('BracketLeft', 'rp', '[{', 'บฐ'),
    k('BracketRight', 'rp', ']}', 'ล,'),
    k('Backslash', 'rp', '\\|', 'ฃฅ'),
  ],
  [
    { code: 'CapsLock', label: 'Caps', width: 1.75 },
    k('KeyA', 'lp', 'aA', 'ฟฤ'),
    k('KeyS', 'lr', 'sS', 'หฆ'),
    k('KeyD', 'lm', 'dD', 'กฏ'),
    k('KeyF', 'li', 'fF', 'ดโ'),
    k('KeyG', 'li', 'gG', 'เฌ'),
    k('KeyH', 'ri', 'hH', '้็'),
    k('KeyJ', 'ri', 'jJ', '่๋'),
    k('KeyK', 'rm', 'kK', 'าษ'),
    k('KeyL', 'rr', 'lL', 'สศ'),
    k('Semicolon', 'rp', ';:', 'วซ'),
    k('Quote', 'rp', '\'"', 'ง.'),
    { code: 'Enter', label: 'Enter', width: 2.25 },
  ],
  [
    { code: 'ShiftLeft', label: 'Shift', width: 2.25 },
    k('KeyZ', 'lp', 'zZ', 'ผ('),
    k('KeyX', 'lr', 'xX', 'ป)'),
    k('KeyC', 'lm', 'cC', 'แฉ'),
    k('KeyV', 'li', 'vV', 'อฮ'),
    k('KeyB', 'li', 'bB', 'ิฺ'),
    k('KeyN', 'ri', 'nN', 'ื์'),
    k('KeyM', 'ri', 'mM', 'ท?'),
    k('Comma', 'rm', ',<', 'มฒ'),
    k('Period', 'rr', '.>', 'ใฬ'),
    k('Slash', 'rp', '/?', 'ฝฦ'),
    { code: 'ShiftRight', label: 'Shift', width: 2.75 },
  ],
  [k('Space', 'th', '  ', '  ')],
];

export const isKey = (key: KeyDef | SpacerKey): key is KeyDef => 'finger' in key;

export const KEYS: KeyDef[] = ROWS.flat().filter(isKey);
const BY_CODE = new Map(KEYS.map((key) => [key.code, key]));

/** The character a physical key types, or null for keys outside the layout. */
export function charFor(code: string, shift: boolean, lang: Lang): string | null {
  const key = BY_CODE.get(code);
  return key ? key[lang][shift ? 1 : 0] : null;
}

export interface Stroke {
  key: KeyDef;
  shift: boolean;
  /** Which Shift key: the one on the other hand from the typing finger. */
  shiftCode?: 'ShiftLeft' | 'ShiftRight';
}

const strokeMaps: Record<Lang, Map<string, Stroke>> = { th: new Map(), en: new Map() };
for (const lang of ['th', 'en'] as const) {
  for (const key of KEYS) {
    key[lang].forEach((ch, level) => {
      if (strokeMaps[lang].has(ch)) return; // Space is listed twice
      const shift = level === 1;
      strokeMaps[lang].set(ch, {
        key,
        shift,
        shiftCode: shift ? (key.finger.startsWith('l') ? 'ShiftRight' : 'ShiftLeft') : undefined,
      });
    });
  }
}

/** How to type a character: which key, and whether Shift is held. */
export function strokeFor(ch: string, lang: Lang): Stroke | null {
  return strokeMaps[lang].get(ch) ?? null;
}

export function canType(text: string, lang: Lang): boolean {
  for (const ch of text) if (!strokeMaps[lang].has(ch)) return false;
  return true;
}

// ---- Thai script helpers

/** Marks that sit above or below the previous letter. */
export const isThaiMark = (ch: string) => /[ัิ-ฺ็-๎]/.test(ch);
/** Vowels written before the consonant they follow in speech. */
export const isLeadingVowel = (ch: string) => /[เ-ไ]/.test(ch);
/** Characters that look odd alone and are drilled after a consonant. */
export const needsBase = (ch: string) => isThaiMark(ch) || /[ะาำๅๆ]/.test(ch);
export const isThaiConsonant = (ch: string) => /[ก-ฮ]/.test(ch);

/** A keycap or hint label: marks get a dotted circle so they are visible. */
export const display = (ch: string) => (ch === ' ' ? '␣' : isThaiMark(ch) ? '◌' + ch : ch);

const THAI_NAMES: Record<string, string> = {
  'ั': 'ไม้หันอากาศ',
  'ิ': 'สระอิ',
  'ี': 'สระอี',
  'ึ': 'สระอึ',
  'ื': 'สระอือ',
  'ุ': 'สระอุ',
  'ู': 'สระอู',
  'ะ': 'สระอะ',
  'า': 'สระอา',
  'ำ': 'สระอำ',
  'เ': 'สระเอ',
  'แ': 'สระแอ',
  'โ': 'สระโอ',
  'ใ': 'ไม้ม้วน',
  'ไ': 'ไม้มลาย',
  '่': 'ไม้เอก',
  '้': 'ไม้โท',
  '๊': 'ไม้ตรี',
  '๋': 'ไม้จัตวา',
  '็': 'ไม้ไต่คู้',
  '์': 'การันต์',
  'ํ': 'นิคหิต',
  'ฺ': 'พินทุ',
  'ๆ': 'ไม้ยมก',
  'ฯ': 'ไปยาลน้อย',
  'ๅ': 'ลากข้าง',
};
export const thaiName = (ch: string) => THAI_NAMES[ch];
