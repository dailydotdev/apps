import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

export const Page = ({
  eyebrow,
  title,
  children,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="min-h-screen bg-background-default px-4 py-8 text-text-primary tablet:px-10">
    <div className="mx-auto flex w-full max-w-[75rem] flex-col gap-8">
      <header className="flex max-w-[48rem] flex-col gap-2">
        <p className="font-bold text-text-tertiary typo-footnote">{eyebrow}</p>
        <h1 className="font-bold typo-title1">{title}</h1>
        {intro && (
          <div className="text-text-secondary typo-callout">{intro}</div>
        )}
      </header>
      {children}
    </div>
  </div>
);

export const Section = ({
  title,
  children,
  note,
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h2 className="font-bold typo-title3">{title}</h2>
      {note && <p className="text-text-tertiary typo-callout">{note}</p>}
    </div>
    {children}
  </section>
);

export const Labeled = ({
  label,
  tone = 'neutral',
  children,
  className,
}: {
  label: string;
  tone?: 'before' | 'after' | 'neutral';
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <figure className={classNames('flex min-w-0 flex-col gap-2', className)}>
    <figcaption
      className={classNames(
        'self-start rounded-8 px-2 py-0.5 font-bold typo-caption1',
        tone === 'before' && 'bg-accent-ketchup-default text-white',
        tone === 'after' && 'bg-accent-avocado-default text-white',
        tone === 'neutral' && 'bg-surface-float text-text-secondary',
      )}
    >
      {label}
    </figcaption>
    {children}
  </figure>
);

export const Shot = ({
  src,
  alt,
  width,
}: {
  src: string;
  alt: string;
  width?: number;
}): ReactElement => (
  <img
    src={src}
    alt={alt}
    className="w-full rounded-16 border border-border-subtlest-tertiary"
    style={width ? { maxWidth: width } : undefined}
  />
);

// Renders a story at a phone viewport. Tailwind breakpoints follow the
// viewport, so a narrow div would still get the desktop layout.
export const PhoneFrame = ({
  storyId,
  title,
  height,
}: {
  storyId: string;
  title: string;
  /** Crops the phone to its top, in px. Defaults to a full 844px screen. */
  height?: number;
}): ReactElement => (
  <iframe
    title={title}
    src={`iframe.html?id=${storyId}&viewMode=story`}
    className="h-[52.75rem] w-[24.375rem] shrink-0 rounded-24 border border-border-subtlest-tertiary bg-background-default"
    style={height ? { height } : undefined}
  />
);

// Renders a story at a real desktop viewport, scaled down to the column, so
// the "after" compares like for like with a full-width capture.
export const DesktopFrame = ({
  storyId,
  title,
  width = 1280,
  height = 860,
}: {
  storyId: string;
  title: string;
  width?: number;
  height?: number;
}): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) =>
      setScale(entry.contentRect.width / width),
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [width]);

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-16 border border-border-subtlest-tertiary"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <iframe
        title={title}
        src={`iframe.html?id=${storyId}&viewMode=story`}
        className="absolute left-0 top-0 origin-top-left"
        style={{ width, height, transform: `scale(${scale})` }}
      />
    </div>
  );
};

export const Checklist = ({
  items,
}: {
  items: { done: boolean; text: ReactNode }[];
}): ReactElement => (
  <ul className="flex flex-col gap-2">
    {items.map(({ done, text }, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <li key={index} className="flex items-start gap-2 typo-callout">
        <span
          className={classNames(
            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-6 font-bold typo-caption1',
            done
              ? 'bg-accent-avocado-default text-white'
              : 'bg-surface-float text-text-tertiary',
          )}
        >
          {done ? '✓' : '·'}
        </span>
        <span className="text-text-secondary">{text}</span>
      </li>
    ))}
  </ul>
);

export const beforeShots = {
  verifyDesktop: new URL('./before/verify-desktop.jpg', import.meta.url).href,
  verifyPhone: new URL('./before/verify-phone.jpg', import.meta.url).href,
};
