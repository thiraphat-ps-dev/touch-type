import { useEffect, useState } from 'react';
import type { Lang } from './engine/layouts';
import type { KeyStat } from './engine/session';

export type Mode = 'lesson' | 'weak' | 'test';

export interface Round {
  at: number;
  mode: Mode;
  wpm: number;
  accuracy: number;
}

export interface LangData {
  keys: Record<string, KeyStat>;
  lessons: Record<string, { wpm: number; accuracy: number; passed: boolean }>;
  history: Round[];
  lesson: number;
}

export interface Data {
  ui: Lang;
  lang: Lang;
  th: LangData;
  en: LangData;
}

const KEY = 'touch-type:v1';
const emptyLang = (): LangData => ({ keys: {}, lessons: {}, history: [], lesson: 0 });
export const emptyData = (): Data => ({ ui: 'th', lang: 'th', th: emptyLang(), en: emptyLang() });

function load(): Data {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyData();
    const d = JSON.parse(raw) as Partial<Data>;
    const base = emptyData();
    return {
      ui: d.ui === 'en' ? 'en' : 'th',
      lang: d.lang === 'en' ? 'en' : 'th',
      th: { ...base.th, ...d.th },
      en: { ...base.en, ...d.en },
    };
  } catch {
    return emptyData();
  }
}

/** App data kept in localStorage. It still works (in memory) if storage is blocked. */
export function useData() {
  const [data, setData] = useState<Data>(load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* private mode or blocked storage: keep going in memory */
    }
  }, [data]);
  return [data, setData] as const;
}
