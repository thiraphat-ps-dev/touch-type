import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Lang } from '../engine/layouts';

interface Props {
  text: string;
  pos: number;
  missed: number[];
  wrong: boolean;
  lang: Lang;
}

interface Cluster {
  start: number;
  end: number;
  text: string;
}

const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });

/**
 * The practice text, three lines at a time. Thai letters and their marks are drawn as
 * one cluster, so a mark is never split from its letter while you are mid-way through it.
 */
export function TextView({ text, pos, missed, wrong, lang }: Props) {
  const clusters = useMemo<Cluster[]>(
    () => [...segmenter.segment(text)].map((s) => ({ start: s.index, end: s.index + s.segment.length, text: s.segment })),
    [text],
  );
  const missedSet = useMemo(() => new Set(missed), [missed]);
  const box = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);

  useLayoutEffect(() => {
    const el = box.current?.querySelector<HTMLElement>('[data-state="current"]');
    if (!el || !box.current) return;
    const line = parseFloat(getComputedStyle(box.current).lineHeight) || 1;
    const row = Math.round(el.offsetTop / line);
    setShift(Math.max(0, row - 1) * line);
  }, [pos, text]);

  return (
    <div className="text-window" lang={lang}>
      <div className="text" ref={box} style={{ transform: `translateY(${-shift}px)` }}>
        {clusters.map((c) => {
          const state = c.end <= pos ? 'done' : c.start <= pos ? 'current' : 'todo';
          let err = false;
          for (let i = c.start; i < c.end && !err; i++) err = missedSet.has(i);
          return (
            <span
              key={c.start}
              data-state={state}
              data-err={err || undefined}
              data-wrong={(state === 'current' && wrong) || undefined}
              data-space={c.text === ' ' || undefined}
            >
              {c.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
