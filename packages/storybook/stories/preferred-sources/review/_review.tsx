import React from 'react';
import type { ReactNode } from 'react';

/**
 * Chrome for the review stories. Deliberately provider-free and styled with
 * theme variables so it reads as annotation around the product, not as part
 * of it.
 */

export type Viewport = 'desktop' | 'tablet' | 'mobile';

/** Widths chosen to land on the app's own breakpoints: tablet 656, laptop 1020. */
export const viewportWidth: Record<Viewport, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 390,
};

export const Note = ({ children }: { children: ReactNode }) => (
  <p
    style={{
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      fontSize: 13,
      lineHeight: 1.5,
      color: 'var(--theme-text-tertiary)',
      margin: '0 0 12px',
      maxWidth: 780,
      textWrap: 'pretty',
    }}
  >
    {children}
  </p>
);

/** Labels one rendered state. Used inside placement stories. */
export const State = ({
  label,
  tone = 'current',
  children,
}: {
  label: string;
  tone?: 'current' | 'proposed';
  children: ReactNode;
}) => (
  <section style={{ marginBottom: 32 }}>
    <div
      style={{
        display: 'inline-block',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 10.5,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        padding: '3px 9px',
        borderRadius: 999,
        marginBottom: 10,
        color: tone === 'proposed' ? '#1f9d55' : 'var(--theme-text-tertiary)',
        border: `1px solid ${
          tone === 'proposed' ? '#1f9d55' : 'var(--theme-divider-tertiary)'
        }`,
      }}
    >
      {label}
    </div>
    <div
      style={{
        border: '1px solid var(--theme-divider-tertiary)',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--theme-background-default)',
      }}
    >
      {children}
    </div>
  </section>
);

/**
 * Renders another story inside an iframe at a real viewport width, scaled to
 * fit. An iframe is the only way to make the app's own Tailwind breakpoints
 * fire — a narrow div does not change `window.innerWidth`.
 */
export const StoryFrame = ({
  id,
  args,
  viewport,
  height,
  scale,
}: {
  id: string;
  args?: Record<string, string | boolean>;
  viewport: Viewport;
  height: number;
  scale: number;
}) => {
  const width = viewportWidth[viewport];
  const argString = args
    ? `&args=${Object.entries(args)
        .map(([k, v]) => `${k}:${v}`)
        .join(';')}`
    : '';
  const src = `/iframe.html?id=${id}&viewMode=story&globals=theme:dark${argString}`;

  return (
    <div
      style={{
        width: width * scale,
        height: height * scale,
        overflow: 'hidden',
        borderRadius: 10,
        border: '1px solid var(--theme-divider-tertiary)',
        background: '#0F1218',
        flex: 'none',
      }}
    >
      <iframe
        title={`${id} · ${viewport}`}
        src={src}
        style={{
          width,
          height,
          border: 0,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          display: 'block',
        }}
      />
    </div>
  );
};

export const openHref = (
  id: string,
  args?: Record<string, string | boolean>,
): string =>
  `/?path=/story/${id}${
    args
      ? `&args=${Object.entries(args)
          .map(([k, v]) => `${k}:${v}`)
          .join(';')}`
      : ''
  }`;
