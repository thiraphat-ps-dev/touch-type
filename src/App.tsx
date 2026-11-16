import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Dialog, Kbd, Stat, Tabs, ToggleGroup } from 'thira-ui';
import { Practice } from './components/Practice';
import { Keyboard } from './components/Keyboard';
import { LESSONS, lessonText, testText, weakText } from './content/lessons';
import { KEYS, display, type Lang } from './engine/layouts';
import { mergeKeys, weakKeys, type Score, type Session } from './engine/session';
import { STRINGS, type Strings } from './i18n';
import { emptyData, useData, type Data, type LangData, type Mode } from './store';

const PASS = 95;
const rand = () => Math.random();

export function App() {
  const [data, setData] = useData();
  const { lang, ui } = data;
  const t = STRINGS[ui];
  const ld = data[lang];
  useEffect(() => {
    document.documentElement.lang = ui;
  }, [ui]);
  useEffect(() => {
    document.documentElement.dataset.theme = data.theme;
  }, [data.theme]);

  const update = useCallback(
    (fn: (d: LangData) => LangData) => setData((d: Data) => ({ ...d, [d.lang]: fn(d[d.lang]) })),
    [setData],
  );

  /** Every finished round: merge key stats and log it. */
  const record = useCallback(
    (mode: Mode, s: Session, sc: Score, extra?: (d: LangData) => LangData) =>
      update((d) => {
        let next: LangData = {
          ...d,
          keys: mergeKeys(d.keys, s.keys),
          history: [{ at: Date.now(), mode, wpm: sc.wpm, accuracy: sc.accuracy }, ...d.history].slice(0, 200),
        };
        if (extra) next = extra(next);
        return next;
      }),
    [update],
  );

  return (
    <div className="app">
      <header className="top">
        <div>
          <h1>
            {t.title} {ui === 'th' && <span className="sub">Touch Type</span>}
          </h1>
          <p className="tagline">{t.tagline}</p>
        </div>
        <div className="controls">
          <ToggleGroup
            size="sm"
            aria-label={t.practiceLang}
            value={[lang]}
            onValueChange={(v) => {
              const l = v[0];
              if (l === 'th' || l === 'en') setData((d) => ({ ...d, lang: l }));
            }}
          >
            <ToggleGroup.Item value="th" lang="th">
              {t.langTh}
            </ToggleGroup.Item>
            <ToggleGroup.Item value="en" lang="en">
              {t.langEn}
            </ToggleGroup.Item>
          </ToggleGroup>
          <Button
            size="sm"
            variant="ghost"
            aria-pressed={data.theme === 'dark'}
            aria-label={t.themeDark}
            onClick={() => setData((d) => ({ ...d, theme: d.theme === 'dark' ? 'light' : 'dark' }))}
          >
            <span aria-hidden="true">{data.theme === 'dark' ? '☀' : '☾'}</span>
            <span className="btn-label">{data.theme === 'dark' ? t.themeLight : t.themeDark}</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setData((d) => ({ ...d, ui: d.ui === 'th' ? 'en' : 'th' }))}>
            {t.uiSwitch}
          </Button>
        </div>
      </header>

      <Tabs defaultValue="lessons">
        <Tabs.List aria-label={t.title}>
          <Tabs.Tab value="lessons">{t.tabLessons}</Tabs.Tab>
          <Tabs.Tab value="weak">{t.tabWeak}</Tabs.Tab>
          <Tabs.Tab value="test">{t.tabTest}</Tabs.Tab>
          <Tabs.Tab value="stats">{t.tabStats}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="lessons">
          <LessonsPanel key={lang} lang={lang} ui={ui} t={t} ld={ld} record={record} update={update} />
        </Tabs.Panel>
        <Tabs.Panel value="weak">
          <WeakPanel key={lang} lang={lang} t={t} ld={ld} record={record} />
        </Tabs.Panel>
        <Tabs.Panel value="test">
          <TestPanel key={lang} lang={lang} t={t} ld={ld} record={record} />
        </Tabs.Panel>
        <Tabs.Panel value="stats">
          <StatsPanel lang={lang} t={t} ld={ld} onReset={() => update(() => emptyData()[lang])} />
        </Tabs.Panel>
      </Tabs>

      <footer className="foot">
        {t.savedLocally} ·{' '}
        <a href="https://github.com/thiraphat-ps-dev/touch-type">GitHub</a>
      </footer>
    </div>
  );
}

type Record_ = (mode: Mode, s: Session, sc: Score, extra?: (d: LangData) => LangData) => void;

function LessonsPanel({
  lang,
  ui,
  t,
  ld,
  record,
  update,
}: {
  lang: Lang;
  ui: Lang;
  t: Strings;
  ld: LangData;
  record: Record_;
  update: (fn: (d: LangData) => LangData) => void;
}) {
  const lessons = LESSONS[lang];
  const index = Math.min(ld.lesson, lessons.length - 1);
  const lesson = lessons[index];
  const [text, setText] = useState(() => lessonText(lang, index, rand));
  const [last, setLast] = useState<Score | null>(null);

  const go = (i: number) => {
    update((d) => ({ ...d, lesson: i }));
    setText(lessonText(lang, i, rand));
    setLast(null);
  };

  const onFinish = useCallback(
    (s: Session, sc: Score) => {
      setLast(sc);
      record('lesson', s, sc, (d) => {
        const prev = d.lessons[lesson.id];
        const passed = sc.accuracy >= PASS;
        return {
          ...d,
          lessons: {
            ...d.lessons,
            [lesson.id]: {
              wpm: Math.max(prev?.wpm ?? 0, passed ? sc.wpm : 0),
              accuracy: Math.max(prev?.accuracy ?? 0, sc.accuracy),
              passed: (prev?.passed ?? false) || passed,
            },
          },
        };
      });
    },
    [lesson.id, record],
  );

  return (
    <div className="lessons">
      <div className="lesson-picker">
        <Button size="sm" variant="outline" aria-label={t.prevLesson} disabled={index === 0} onClick={() => go(index - 1)}>
          ‹
        </Button>
        <select aria-label={t.chooseLesson} value={index} onChange={(e) => go(Number(e.target.value))}>
          {lessons.map((l, i) => (
            <option key={l.id} value={i}>
              {i + 1}. {l.title[ui]}
              {ld.lessons[l.id]?.passed ? ' ✓' : ''}
            </option>
          ))}
        </select>
        <Button size="sm" variant="outline" aria-label={t.nextLesson} disabled={index === lessons.length - 1} onClick={() => go(index + 1)}>
          ›
        </Button>
      </div>
      <nav className="lesson-list" aria-label={t.tabLessons}>
        <ol>
          {lessons.map((l, i) => {
            const st = ld.lessons[l.id];
            return (
              <li key={l.id}>
                <button type="button" aria-current={i === index ? 'step' : undefined} onClick={() => go(i)}>
                  <span className="num">{i + 1}</span>
                  <span className="name">{l.title[ui]}</span>
                  {st?.passed ? (
                    <Badge tone="success" size="sm">
                      {st.wpm} {t.wpm}
                    </Badge>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      <section className="lesson-main">
        <div className="lesson-head">
          <h2>
            {index + 1}. {lesson.title[ui]}
          </h2>
          {lesson.keys && (
            <p className="muted">
              {t.newKeys}:{' '}
              <span className="chips" lang={lang}>
                {[...lesson.keys].map((ch) => (
                  <Kbd key={ch}>{display(ch)}</Kbd>
                ))}
              </span>
            </p>
          )}
          <p className="muted small">{t.passHint}</p>
        </div>
        <Practice
          text={text}
          lang={lang}
          t={t}
          onFinish={onFinish}
          onRestart={() => {
            setText(lessonText(lang, index, rand));
            setLast(null);
          }}
          done={
            <>
              <p className={last && last.accuracy >= PASS ? 'pass' : 'muted'}>{last && last.accuracy >= PASS ? t.passedNow : t.notYet}</p>
              <div className="actions">
                <Button
                  variant={last && last.accuracy >= PASS ? 'outline' : 'solid'}
                  onClick={() => {
                    setText(lessonText(lang, index, rand));
                    setLast(null);
                  }}
                >
                  {t.again}
                </Button>
                {index < lessons.length - 1 && (
                  <Button variant={last && last.accuracy >= PASS ? 'solid' : 'outline'} onClick={() => go(index + 1)}>
                    {t.nextLesson}
                  </Button>
                )}
              </div>
            </>
          }
        />
      </section>
    </div>
  );
}

function WeakPanel({ lang, t, ld, record }: { lang: Lang; t: Strings; ld: LangData; record: Record_ }) {
  const weak = useMemo(() => weakKeys(ld.keys), [ld.keys]);
  const [focus, setFocus] = useState(weak);
  const [text, setText] = useState(() => (weak.length ? weakText(lang, weak, rand) : ''));
  const fresh = () => {
    setFocus(weak);
    setText(weak.length ? weakText(lang, weak, rand) : '');
  };
  const onFinish = useCallback((s: Session, sc: Score) => record('weak', s, sc), [record]);

  if (!focus.length) {
    return (
      <div className="panel-intro">
        <p>{t.noWeak}</p>
        {weak.length > 0 && <Button onClick={fresh}>{t.newRound}</Button>}
      </div>
    );
  }
  return (
    <div className="single">
      <div className="lesson-head">
        <p>{t.weakIntro}</p>
        <p className="muted">
          {t.weakKeys}:{' '}
          <span className="chips" lang={lang}>
            {focus.map((ch) => (
              <Kbd key={ch}>{display(ch)}</Kbd>
            ))}
          </span>
        </p>
      </div>
      <Practice
        text={text}
        lang={lang}
        t={t}
        onFinish={onFinish}
        onRestart={fresh}
        done={
          <div className="actions">
            <Button onClick={fresh}>{t.newRound}</Button>
          </div>
        }
      />
    </div>
  );
}

function TestPanel({ lang, t, ld, record }: { lang: Lang; t: Strings; ld: LangData; record: Record_ }) {
  const [text, setText] = useState(() => testText(lang, rand));
  const best = Math.max(0, ...ld.history.filter((h) => h.mode === 'test').map((h) => h.wpm));
  const onFinish = useCallback((s: Session, sc: Score) => record('test', s, sc), [record]);
  const fresh = () => setText(testText(lang, rand));
  return (
    <div className="single">
      <div className="lesson-head">
        <p>{t.testIntro}</p>
        {best > 0 && (
          <p className="muted">
            {t.best}: <strong>{best}</strong> {t.wpm}
          </p>
        )}
      </div>
      <Practice
        text={text}
        lang={lang}
        t={t}
        limit={60}
        onFinish={onFinish}
        onRestart={fresh}
        done={
          <div className="actions">
            <Button onClick={fresh}>{t.again}</Button>
          </div>
        }
      />
    </div>
  );
}

function StatsPanel({ lang, t, ld, onReset }: { lang: Lang; t: Strings; ld: LangData; onReset: () => void }) {
  const heat = useMemo(() => {
    const out: Record<string, number | null> = {};
    for (const key of KEYS) {
      let hit = 0;
      let miss = 0;
      for (const ch of new Set(key[lang])) {
        const st = ld.keys[ch];
        if (st) {
          hit += st.hit;
          miss += st.miss;
        }
      }
      out[key.code] = key.code === 'Space' ? null : hit + miss ? hit / (hit + miss) : null;
    }
    return out;
  }, [ld.keys, lang]);
  const tests = ld.history.filter((h) => h.mode === 'test');
  const recent = ld.history.slice(0, 10);
  const avg = recent.length ? Math.round((recent.reduce((a, h) => a + h.accuracy, 0) / recent.length) * 10) / 10 : null;
  const weak = weakKeys(ld.keys);
  const modeName = { lesson: t.modeLesson, weak: t.modeWeak, test: t.modeTest };
  const fmt = new Intl.DateTimeFormat(t === STRINGS.th ? 'th-TH' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="stats">
      <div className="summary">
        <Stat label={t.rounds} value={ld.history.length} />
        <Stat
          label={t.bestTest}
          value={tests.length ? Math.max(...tests.map((h) => h.wpm)) : '–'}
          unit={tests.length ? t.wpm : undefined}
        />
        <Stat label={t.avgAccuracy} value={avg === null ? '–' : avg} unit={avg === null ? undefined : '%'} />
      </div>

      <section>
        <h3>{t.heatmap}</h3>
        <p className="muted small">{t.heatLegend}</p>
        <Keyboard lang={lang} heat={heat} />
        {weak.length > 0 && (
          <p className="muted">
            {t.weakKeys}:{' '}
            <span className="chips" lang={lang}>
              {weak.map((ch) => (
                <Kbd key={ch}>{display(ch)}</Kbd>
              ))}
            </span>
          </p>
        )}
      </section>

      <section>
        <h3>{t.history}</h3>
        {recent.length ? (
          <table className="history">
            <thead>
              <tr>
                <th scope="col">{t.date}</th>
                <th scope="col">{t.mode}</th>
                <th scope="col">{t.wpm}</th>
                <th scope="col">{t.accuracy}</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((h) => (
                <tr key={h.at}>
                  <td>{fmt.format(h.at)}</td>
                  <td>{modeName[h.mode]}</td>
                  <td>{h.wpm}</td>
                  <td>{h.accuracy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">{t.empty}</p>
        )}
      </section>

      <Dialog>
        <Dialog.Trigger render={<Button variant="danger" size="sm" />}>{t.reset}</Dialog.Trigger>
        <Dialog.Content title={t.resetTitle} description={t.resetBody} size="sm">
          <Dialog.Footer>
            <Dialog.Close render={<Button variant="outline" />}>{t.cancel}</Dialog.Close>
            <Dialog.Close render={<Button variant="danger" />} onClick={onReset}>
              {t.confirmReset}
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
