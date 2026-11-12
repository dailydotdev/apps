import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { COMMENTS_TEASER_MIN_SKELETONS } from './commentsTeaser';

// Sized before the first paint, so the list never jumps from two rows to a
// full screen in front of the reader.
const useBeforePaint =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

const Bar = ({
  className,
  style,
}: {
  className: string;
  style?: CSSProperties;
}): ReactElement => (
  <span
    className={classNames('block rounded-4 bg-surface-active', className)}
    style={style}
  />
);

/**
 * A comment drawn in grey on the post page's thread-style comment: no card,
 * 40px avatar, name, handle and time with the reputation badge under them,
 * then text and actions on the 52px text column. Still, not pulsing: a pulse
 * reads as loading and the reader waits; a still shape reads as "there is
 * more here". surface-active, as X's 8% grey vanishes on the dark theme.
 */
export const SkeletonComment = ({
  lines = [100, 78],
}: {
  lines?: number[];
}): ReactElement => (
  <div aria-hidden className="flex flex-col">
    <div className="flex flex-row">
      <span className="size-10 shrink-0 rounded-12 bg-surface-active" />
      <div className="ml-3 flex flex-1 flex-col gap-1.5 pt-1">
        <div className="flex items-center gap-2">
          <Bar className="h-3 w-24" />
          <Bar className="h-3 w-16" />
          <Bar className="h-3 w-6" />
        </div>
        <Bar className="h-3.5 w-10 !rounded-6" />
      </div>
    </div>
    <div className="ml-[52px] mt-3 flex flex-col gap-2.5">
      {lines.map((width) => (
        <Bar key={width} className="h-3" style={{ width: `${width}%` }} />
      ))}
    </div>
    <div className="ml-[52px] mt-4 flex items-center gap-5">
      {['upvote', 'downvote', 'reply', 'share', 'menu'].map((key) => (
        <span key={key} className="size-5 rounded-6 bg-surface-active" />
      ))}
      <Bar className="ml-auto h-3 w-16" />
    </div>
  </div>
);

/**
 * Skeleton comments where the hidden ones would be: at least two, and as
 * many as fill the window below the first (X: max(2, ceil(space / row))),
 * measured before paint and on resize. Tapping one asks the reader to sign
 * up.
 */
export function CommentsTeaserSkeleton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}): ReactElement {
  const root = useRef<HTMLButtonElement>(null);
  const [count, setCount] = useState(COMMENTS_TEASER_MIN_SKELETONS);

  useBeforePaint(() => {
    const measure = () => {
      const element = root.current;
      const row = element?.firstElementChild;
      const rowHeight = row?.getBoundingClientRect().height ?? 0;
      if (!element || !rowHeight) {
        return;
      }
      // Row plus the 24px gap between rows.
      const space = window.innerHeight - element.getBoundingClientRect().top;
      const next = Math.max(
        COMMENTS_TEASER_MIN_SKELETONS,
        Math.ceil(space / (rowHeight + 24)),
      );
      setCount((current) => (current === next ? current : next));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <button
      ref={root}
      type="button"
      tabIndex={-1}
      aria-hidden
      // Out of the tab order and hidden from assistive tech, so focus
      // returning here after the sign-up modal closes draws no ring.
      className={classNames(
        'flex w-full flex-col gap-6 text-left focus:outline-none',
        className,
      )}
      onClick={onClick}
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonComment
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          lines={index % 2 ? [92, 54] : [100, 78]}
        />
      ))}
    </button>
  );
}
