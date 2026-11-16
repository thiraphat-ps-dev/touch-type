import { useEffect, useMemo, useReducer, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { charFor, display, strokeFor, thaiName, type Lang } from '../engine/layouts';
import { newSession, reduce, score, type Score, type Session } from '../engine/session';
import type { Strings } from '../i18n';
import { Keyboard } from './Keyboard';
import { TextView } from './TextView';

interface Props {
  text: string;
  lang: Lang;
  t: Strings;
  /** Seconds for a timed round; untimed rounds end at the last character. */
  limit?: number;
  onFinish: (session: Session, score: Score) => void;
  /** Esc: a fresh text from the parent. */
  onRestart: () => void;
  /** Buttons and notes shown under the results. */
  done?: ReactNode;
}

export function Practice({ text, lang, t, limit, onFinish, onRestart, done }: Props) {
  const [s, dispatch] = useReducer(reduce, text, newSession);
  const [now, setNow] = useState(() => performance.now());
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState<ReadonlySet<string>>(new Set());
  const input = useRef<HTMLInputElement>(null);
  const reported = useRef(false);

  useEffect(() => {
    dispatch({ type: 'reset', text });
    reported.current = false;
    // On phones and tablets, wait for a tap so the on-screen keyboard doesn't pop up by itself.
    if (!matchMedia('(pointer: coarse)').matches) input.current?.focus({ preventScroll: true });
  }, [text]);

  const running = s.startedAt !== null && s.finishedAt === null;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const n = performance.now();
      setNow(n);
      if (limit && s.startedAt !== null && n - s.startedAt >= limit * 1000) dispatch({ type: 'stop', now: s.startedAt + limit * 1000 });
    }, 200);
    return () => clearInterval(id);
  }, [running, limit, s.startedAt]);

  useEffect(() => {
    if (s.finishedAt === null || reported.current) return;
    reported.current = true;
    onFinish(s, score(s, s.finishedAt));
  }, [s, onFinish]);

  function onKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      onRestart();
      return;
    }
    setPressed((p) => new Set(p).add(e.code));
    if (e.repeat) return;
    const ch = charFor(e.code, e.shiftKey, lang) ?? (e.key.length === 1 ? e.key : null);
    // Anything else (an on-screen keyboard sends "Unidentified") arrives as text through onInput.
    if (ch === null) return;
    e.preventDefault();
    type(ch);
  }

  function type(chars: string) {
    if (s.finishedAt !== null) return;
    const n = performance.now();
    for (const ch of chars) dispatch({ type: 'type', ch, now: n });
    setNow(n);
  }

  /** Text from an on-screen keyboard: type it and clear the hidden field. */
  function onInput(e: FormEvent<HTMLInputElement>) {
    if ((e.nativeEvent as InputEvent).isComposing) return;
    const el = e.currentTarget;
    type(el.value);
    el.value = '';
  }

  function onKeyUp(e: KeyboardEvent) {
    setPressed((p) => {
      const next = new Set(p);
      next.delete(e.code);
      return next;
    });
  }

  const sc = score(s, now);
  const finished = s.finishedAt !== null;
  const expected = s.text[s.pos];
  const stroke = expected === undefined ? null : strokeFor(expected, lang);
  const wrongKey = s.wrong ? strokeFor(s.wrong, lang)?.key.code : null;
  const remaining = limit ? Math.max(0, limit - (s.startedAt === null ? 0 : Math.floor((now - s.startedAt) / 1000))) : null;

  const missed = useMemo(
    () =>
      Object.entries(s.keys)
        .filter(([ch, st]) => st.miss > 0 && ch !== ' ')
        .sort((a, b) => b[1].miss - a[1].miss)
        .slice(0, 8),
    [s.keys],
  );

  return (
    <div className="practice">
      <dl className="meters">
        <div>
          <dt>
            {t.wpm} <abbr title={t.wpmNote}>?</abbr>
          </dt>
          <dd>{sc.wpm}</dd>
        </div>
        <div>
          <dt>{t.accuracy}</dt>
          <dd>{sc.accuracy}%</dd>
        </div>
        <div>
          <dt>{remaining === null ? t.time : t.left}</dt>
          <dd>{remaining === null ? `${sc.seconds}s` : `${remaining}s`}</dd>
        </div>
        <div>
          <dt>{t.errors}</dt>
          <dd>{s.errors}</dd>
        </div>
      </dl>
      {!limit && <progress className="progress" max={s.text.length} value={s.pos} aria-label={t.time} />}

      <div
        className="type-area"
        data-focused={focused || undefined}
        onClick={() => input.current?.focus({ preventScroll: true })}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setPressed(new Set());
        }}
      >
        <input
          ref={input}
          className="catcher"
          aria-label={t.clickToStart}
          lang={lang}
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="next"
          onInput={onInput}
          onCompositionEnd={(e) => {
            type(e.currentTarget.value);
            e.currentTarget.value = '';
          }}
        />
        <TextView text={s.text} pos={s.pos} missed={s.missed} wrong={!!s.wrong} lang={lang} />
        {!focused && !finished && (
          <div className="focus-hint">
            <span className="fine">{t.clickToStart}</span>
            <span className="coarse">{t.tapToStart}</span>
            <small className="fine">{t.noSwitch}</small>
            <small className="coarse">{t.touchNote}</small>
          </div>
        )}
      </div>

      {finished ? (
        <section className="results" aria-live="polite">
          <h3>{t.done}</h3>
          <p className="big">
            <strong>{sc.wpm}</strong> {t.wpm} · <strong>{sc.accuracy}%</strong> {t.accuracy} · {sc.seconds}s
          </p>
          <p className="muted">
            {t.missedKeys}:{' '}
            {missed.length ? (
              <span className="chips" lang={lang}>
                {missed.map(([ch, st]) => (
                  <kbd key={ch}>
                    {display(ch)} <small>×{st.miss}</small>
                  </kbd>
                ))}
              </span>
            ) : (
              t.noMisses
            )}
          </p>
          {done}
        </section>
      ) : (
        <p className="hint" aria-live="off">
          <span className="muted">{t.next}:</span>{' '}
          {stroke && expected !== undefined && (
            <>
              <kbd lang={lang}>{expected === ' ' ? t.space : display(expected)}</kbd>
              {lang === 'th' && thaiName(expected) && <span className="name"> {thaiName(expected)}</span>}
              <span className="muted">
                {' '}
                · {t.fingers[stroke.key.finger]}
                {stroke.shiftCode && ` · ${t.withShift(stroke.shiftCode === 'ShiftLeft' ? t.sideLeft : t.sideRight)}`}
              </span>
            </>
          )}
          <span className="restart">
            <kbd>{t.restartKey}</kbd> {t.restart}
          </span>
        </p>
      )}

      <Keyboard
        lang={lang}
        target={finished ? null : stroke?.key.code}
        shift={finished ? null : stroke?.shiftCode}
        pressed={pressed}
        wrong={wrongKey}
      />
    </div>
  );
}
