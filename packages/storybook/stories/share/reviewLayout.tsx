import type { ReactElement, ReactNode } from 'react';
import React from 'react';

/**
 * Presentational scaffolding for the sharing-visibility review page. Uses the
 * daily.dev theme CSS variables so it follows Storybook's light/dark toggle,
 * and stays provider-free so it can wrap live components without adding
 * context of its own.
 */

const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const Page = ({ children }: { children: ReactNode }): ReactElement => (
  <div
    style={{
      fontFamily: SANS,
      color: 'var(--theme-text-primary)',
      background: 'var(--theme-background-default)',
      padding: '32px 40px 96px',
      maxWidth: 1180,
      margin: '0 auto',
    }}
  >
    {children}
  </div>
);

export const PageHeader = ({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}): ReactElement => (
  <header style={{ marginBottom: 36, maxWidth: 860 }}>
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: 'var(--theme-accent-cabbage-default)',
        marginBottom: 8,
      }}
    >
      {eyebrow}
    </div>
    <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, lineHeight: 1.15 }}>
      {title}
    </h1>
    {children && (
      <div
        style={{
          marginTop: 14,
          fontSize: 16,
          lineHeight: 1.55,
          color: 'var(--theme-text-secondary)',
          textWrap: 'pretty',
        }}
      >
        {children}
      </div>
    )}
  </header>
);

export const Section = ({
  n,
  title,
  badge,
  children,
}: {
  n: string;
  title: string;
  badge?: string;
  children: ReactNode;
}): ReactElement => (
  <section style={{ marginTop: 56 }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 12,
        marginBottom: 8,
        paddingBottom: 10,
        borderBottom: '1px solid var(--theme-divider-tertiary)',
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: 'var(--theme-text-tertiary)',
        }}
      >
        {n}
      </span>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{title}</h2>
      {badge && <Code>{badge}</Code>}
    </div>
    {children}
  </section>
);

export const Muted = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
}): ReactElement => (
  <p
    style={{
      fontSize: 15,
      lineHeight: 1.55,
      color: 'var(--theme-text-secondary)',
      margin: '0 0 16px',
      maxWidth: 820,
      textWrap: 'pretty',
      ...style,
    }}
  >
    {children}
  </p>
);

export const Code = ({ children }: { children: ReactNode }): ReactElement => (
  <code
    style={{
      fontSize: 12,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      color: 'var(--theme-text-tertiary)',
      background: 'var(--theme-surface-float)',
      padding: '2px 7px',
      borderRadius: 6,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </code>
);

type Tone = 'neutral' | 'on' | 'off';

const toneColor: Record<Tone, string> = {
  neutral: 'var(--theme-text-tertiary)',
  on: 'var(--theme-accent-avocado-default)',
  off: 'var(--theme-text-quaternary)',
};

/**
 * A single labelled specimen: caption on top, the live component on a surface
 * below. `tone` colours the caption rule so flag-on / flag-off columns read at
 * a glance.
 */
export const Specimen = ({
  label,
  note,
  tone = 'neutral',
  align = 'center',
  padded = true,
  children,
}: {
  label: string;
  note?: ReactNode;
  tone?: Tone;
  align?: 'center' | 'start';
  padded?: boolean;
  children: ReactNode;
}): ReactElement => (
  <div style={{ minWidth: 0 }}>
    <div
      style={{
        fontSize: 11.5,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: 0.7,
        color: toneColor[tone],
        marginBottom: 8,
        paddingBottom: 6,
        borderBottom: `2px solid ${toneColor[tone]}`,
      }}
    >
      {label}
    </div>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        minHeight: 76,
        padding: padded ? 20 : 0,
        borderRadius: 12,
        border: '1px solid var(--theme-divider-tertiary)',
        background: 'var(--theme-surface-float)',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
    {note && (
      <div
        style={{
          fontSize: 13,
          lineHeight: 1.5,
          color: 'var(--theme-text-tertiary)',
          marginTop: 8,
          textWrap: 'pretty',
        }}
      >
        {note}
      </div>
    )}
  </div>
);

export const Grid = ({
  cols = 2,
  gap = 24,
  children,
}: {
  cols?: number;
  gap?: number;
  children: ReactNode;
}): ReactElement => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gap,
      alignItems: 'start',
      marginBottom: 8,
    }}
  >
    {children}
  </div>
);

const cell: React.CSSProperties = {
  padding: '9px 12px',
  fontSize: 13,
  textAlign: 'left',
  verticalAlign: 'top',
  borderBottom: '1px solid var(--theme-divider-tertiary)',
  color: 'var(--theme-text-secondary)',
};

export const Table = ({
  columns,
  rows,
}: {
  columns: string[];
  rows: ReactNode[][];
}): ReactElement => (
  <div style={{ overflowX: 'auto', marginBottom: 16 }}>
    <table
      style={{
        width: '100%',
        minWidth: 640,
        borderCollapse: 'collapse',
        background: 'var(--theme-surface-float)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c}
              style={{
                ...cell,
                fontWeight: 700,
                color: 'var(--theme-text-primary)',
                borderBottom: '2px solid var(--theme-divider-secondary)',
              }}
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, ri) => (
          // eslint-disable-next-line react/no-array-index-key
          <tr key={`row-${ri}`}>
            {r.map((c, ci) => (
              <td key={columns[ci]} style={cell}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * Renders another story in a narrow iframe so the genuinely viewport-driven
 * branches (`useViewSize(ViewSize.Laptop)`) can be reviewed at mobile width on
 * the same page — no faking, it is the real component at 390px.
 */
export const DeviceFrame = ({
  storyId,
  width = 390,
  height = 220,
}: {
  storyId: string;
  width?: number;
  height?: number;
}): ReactElement => {
  // The embedded story is a separate document, so Storybook's theme toggle
  // doesn't reach it — mirror the root theme class into its globals instead.
  const [theme, setTheme] = React.useState('light');

  React.useEffect(() => {
    const root = document.documentElement;
    const sync = () =>
      setTheme(root.classList.contains('dark') ? 'dark' : 'light');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        width,
        height,
        flexShrink: 0,
        borderRadius: 16,
        border: '1px solid var(--theme-divider-secondary)',
        overflow: 'hidden',
        background: 'var(--theme-background-default)',
      }}
    >
      <iframe
        title={storyId}
        src={`/iframe.html?viewMode=story&id=${storyId}&globals=theme:${theme}`}
        style={{ width: '100%', height: '100%', border: 0 }}
      />
    </div>
  );
};
