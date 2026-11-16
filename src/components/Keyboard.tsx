import { ROWS, display, isKey, type KeyDef, type Lang } from '../engine/layouts';

interface Props {
  lang: Lang;
  /** Key to press next, and the Shift key to hold with it. */
  target?: string | null;
  shift?: string | null;
  pressed?: ReadonlySet<string>;
  /** A key pressed by mistake, flashed in red. */
  wrong?: string | null;
  /** Heatmap: accuracy 0..1 per key code, or null for no data. */
  heat?: Record<string, number | null>;
}

/** Colour for an accuracy: red below 85%, through amber, to green at 100%. */
function heatColor(acc: number) {
  const t = Math.max(0, Math.min(1, (acc - 0.85) / 0.15));
  return `oklch(70% 0.16 ${25 + t * 120})`;
}

export function Keyboard({ lang, target, shift, pressed, wrong, heat }: Props) {
  return (
    <div className="keyboard" lang={lang} aria-hidden="true">
      {ROWS.map((row, r) => (
        <div className="kb-row" key={r} data-row={r}>
          {row.map((key) => {
            if (!isKey(key)) {
              const on = key.code === shift;
              return (
                <div
                  key={key.code}
                  className="key mod"
                  data-target={on || undefined}
                  data-pressed={pressed?.has(key.code) || undefined}
                  style={{ gridColumn: `span ${key.width * 4}` }}
                >
                  {key.label}
                </div>
              );
            }
            return <Cap key={key.code} k={key} lang={lang} target={target} pressed={pressed} wrong={wrong} heat={heat} />;
          })}
        </div>
      ))}
    </div>
  );
}

function Cap({ k, lang, target, pressed, wrong, heat }: { k: KeyDef } & Props) {
  const [base, shifted] = k[lang];
  const space = k.code === 'Space';
  const span = space ? 25 : k.code === 'Backslash' ? 6 : 4;
  const acc = heat ? heat[k.code] : undefined;
  return (
    <div
      className="key"
      data-finger={k.finger}
      data-home={k.code === 'KeyF' || k.code === 'KeyJ' || undefined}
      data-target={k.code === target || undefined}
      data-pressed={pressed?.has(k.code) || undefined}
      data-wrong={k.code === wrong || undefined}
      style={{
        gridColumn: space ? `16 / span ${span}` : `span ${span}`,
        background: acc === undefined ? undefined : acc === null ? 'var(--heat-none)' : heatColor(acc),
      }}
    >
      {!space && (
        <>
          <span className="base">{display(base)}</span>
          {shifted !== base.toUpperCase() && <span className="shifted">{display(shifted)}</span>}
        </>
      )}
    </div>
  );
}
