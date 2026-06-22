import React from 'react';
import type { CSSProperties, ReactNode } from 'react';

/**
 * Presentational scaffolding shared by the Open Graph review stories. Uses the
 * daily.dev theme CSS variables so it follows Storybook's light/dark toggle,
 * but keeps everything provider-free so the stories render standalone.
 */

const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const Page = ({
  children,
}: {
  children: ReactNode;
}): React.ReactElement => (
  <div
    style={{
      fontFamily: SANS,
      color: 'var(--theme-text-primary)',
      background: 'var(--theme-background-default)',
      padding: '32px 40px 80px',
      maxWidth: 1400,
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
}): React.ReactElement => (
  <header style={{ marginBottom: 40, maxWidth: 820 }}>
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: '#CE3DF3',
        marginBottom: 8,
      }}
    >
      {eyebrow}
    </div>
    <h1
      style={{
        fontSize: 34,
        fontWeight: 800,
        margin: 0,
        lineHeight: 1.15,
        textWrap: 'balance',
      }}
    >
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

export const Heading = ({
  children,
  badge,
}: {
  children: ReactNode;
  badge?: string;
}): React.ReactElement => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: 12,
      marginBottom: 6,
    }}
  >
    <h2
      style={{ fontSize: 22, fontWeight: 800, margin: 0, textWrap: 'balance' }}
    >
      {children}
    </h2>
    {badge && (
      <code
        style={{
          fontSize: 12,
          color: 'var(--theme-text-tertiary)',
          background: 'var(--theme-surface-float)',
          padding: '2px 8px',
          borderRadius: 6,
        }}
      >
        {badge}
      </code>
    )}
  </div>
);

export const Muted = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}): React.ReactElement => (
  <p
    style={{
      fontSize: 15,
      lineHeight: 1.5,
      color: 'var(--theme-text-secondary)',
      margin: '0 0 12px',
      textWrap: 'pretty',
      ...style,
    }}
  >
    {children}
  </p>
);

export const Bullets = ({
  items,
  tone = 'neutral',
  title,
}: {
  items: string[];
  tone?: 'neutral' | 'bad' | 'good';
  title?: string;
}): React.ReactElement => {
  const color = { bad: '#d4342c', good: '#1f9d55', neutral: 'inherit' }[tone];
  const mark = { bad: '✗', good: '✓', neutral: '•' }[tone];
  return (
    <div style={{ marginBottom: 14 }}>
      {title && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            color: 'var(--theme-text-tertiary)',
            marginBottom: 6,
          }}
        >
          {title}
        </div>
      )}
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {items.map((item) => (
          <li
            key={item}
            style={{
              display: 'flex',
              gap: 10,
              fontSize: 14,
              lineHeight: 1.5,
              color: 'var(--theme-text-secondary)',
              marginBottom: 6,
            }}
          >
            <span style={{ color, fontWeight: 700, flexShrink: 0 }}>
              {mark}
            </span>
            <span style={{ textWrap: 'pretty' }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const Divider = (): React.ReactElement => (
  <hr
    style={{
      border: 0,
      borderTop: '1px solid var(--theme-divider-tertiary)',
      margin: '48px 0',
    }}
  />
);

export const TwoCol = ({
  left,
  right,
  leftLabel,
  rightLabel,
}: {
  left: ReactNode;
  right: ReactNode;
  leftLabel: string;
  rightLabel: string;
}): React.ReactElement => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 28,
      alignItems: 'start',
    }}
  >
    {[
      { label: leftLabel, node: left, tone: '#d4342c' },
      { label: rightLabel, node: right, tone: '#1f9d55' },
    ].map((col) => (
      <div key={col.label}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            color: col.tone,
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: `2px solid ${col.tone}`,
          }}
        >
          {col.label}
        </div>
        {col.node}
      </div>
    ))}
  </div>
);

const specCell: CSSProperties = {
  padding: '8px 12px',
  fontSize: 13,
  textAlign: 'left',
  borderBottom: '1px solid var(--theme-divider-tertiary)',
  verticalAlign: 'top',
};
const specHead: CSSProperties = {
  ...specCell,
  fontWeight: 700,
  color: 'var(--theme-text-primary)',
  borderBottom: '2px solid var(--theme-divider-secondary)',
};

export const SpecTable = ({
  columns,
  rows,
}: {
  columns: string[];
  rows: string[][];
}): React.ReactElement => (
  <div style={{ overflowX: 'auto', marginBottom: 24 }}>
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        background: 'var(--theme-surface-float)',
        borderRadius: 8,
        overflow: 'hidden',
        minWidth: 720,
      }}
    >
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c} style={specHead}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.join('|')}>
            {r.map((c, ci) => (
              <td
                key={columns[ci]}
                style={{ ...specCell, color: 'var(--theme-text-secondary)' }}
              >
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** A 1200×630 (by default) frame for rendering share-image mock-ups. */
export const OgFrame = ({
  width,
  ratio = '1200 / 630',
  children,
}: {
  width: number | string;
  ratio?: string;
  children: ReactNode;
}): React.ReactElement => (
  <div
    style={{
      position: 'relative',
      width,
      maxWidth: '100%',
      aspectRatio: ratio,
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
      flexShrink: 0,
    }}
  >
    {children}
  </div>
);

export const CodeBlock = ({
  children,
}: {
  children: ReactNode;
}): React.ReactElement => (
  <pre
    style={{
      background: 'var(--theme-surface-float)',
      border: '1px solid var(--theme-divider-tertiary)',
      borderRadius: 8,
      padding: '16px 18px',
      fontSize: 12.5,
      lineHeight: 1.55,
      overflowX: 'auto',
      color: 'var(--theme-text-primary)',
      whiteSpace: 'pre',
    }}
  >
    <code>{children}</code>
  </pre>
);
