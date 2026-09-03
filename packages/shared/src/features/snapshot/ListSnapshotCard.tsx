import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { SnapshotFrame } from './SnapshotFrame';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];

export interface SnapshotListItem {
  title: string;
  meta?: string;
}

export interface ListSnapshotCardProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  items: SnapshotListItem[];
  footer?: string;
  seed?: string;
}

/**
 * One card for every "a list of posts" share — the briefing, the best-of
 * archive, a feed digest — which are the same object with a different label.
 */
function ListSnapshotCardComponent(
  { eyebrow, title, subtitle, items, footer, seed }: ListSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const visible = items.slice(0, 5);

  return (
    <SnapshotFrame ref={ref} seed={seed ?? title}>
      <div className="flex flex-1 flex-col">
        <span
          className="font-bold uppercase"
          style={{
            color: colors.cabbage['10'],
            fontSize: 22,
            letterSpacing: 2,
          }}
        >
          {eyebrow}
        </span>

        <h1
          className="snapshot-copy mt-4 font-bold text-white"
          style={{
            fontSize: 50,
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <span
            className="mt-2 truncate"
            style={{ color: MUTED, fontSize: 26 }}
          >
            {subtitle}
          </span>
        )}

        <ol className="mt-7 flex w-full flex-col gap-5">
          {visible.map((item, index) => (
            <li key={item.title} className="flex w-full items-start gap-4">
              <span
                className="shrink-0 font-bold"
                style={{
                  color: colors.cabbage['10'],
                  fontSize: 28,
                  lineHeight: 1.3,
                  width: 40,
                }}
              >
                {index + 1}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span
                  className="font-bold text-white"
                  style={{
                    fontSize: 30,
                    lineHeight: 1.25,
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    overflow: 'hidden',
                  }}
                >
                  {item.title}
                </span>
                {item.meta && (
                  <span style={{ color: MUTED, fontSize: 24 }}>
                    {item.meta}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>

        {footer && (
          <span
            className="mt-auto"
            style={{
              paddingTop: 26,
              borderTop: `1px solid ${DIVIDER}`,
              color: MUTED,
              fontSize: 26,
            }}
          >
            {footer}
          </span>
        )}
      </div>
    </SnapshotFrame>
  );
}

export const ListSnapshotCard = forwardRef(ListSnapshotCardComponent);
