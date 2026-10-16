import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';

/* Renders another story in an iframe at a real device width, scaled to fit.
   An iframe is the only honest way to show breakpoints: Tailwind's tablet:/
   laptop: prefixes are media queries on the window, so a scaled <div> at
   375px would still get the desktop layout. */

export const storyUrl = (id: string, args?: Record<string, string | number | boolean>): string => {
  const a = args
    ? `&args=${Object.entries(args).map(([k, v]) => `${k}:${typeof v === 'boolean' ? `!${v}` : v}`).join(';')}`
    : '';
  return `iframe.html?id=${id}&viewMode=story&globals=theme:dark${a}`;
};

export const Frame = ({
  id,
  args,
  width,
  height,
  label,
  note,
  maxWidth,
}: {
  id: string;
  args?: Record<string, string | number | boolean>;
  width: number;
  height: number;
  label?: string;
  note?: string;
  /** Cap the rendered width (px) — the frame scales down to fit. */
  maxWidth?: number;
}): ReactElement => {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = box.current;
    if (!el) {
      return undefined;
    }
    const fit = () => setScale(Math.min(1, el.getBoundingClientRect().width / width));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <figure className="flex min-w-0 flex-col gap-1.5" style={{ width: maxWidth ? `min(100%, ${maxWidth}px)` : '100%' }}>
      <div ref={box} className="w-full overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default" style={{ height: height * scale }}>
        <iframe
          title={label ?? id}
          src={storyUrl(id, args)}
          loading="lazy"
          style={{ width, height, transform: `scale(${scale})`, transformOrigin: '0 0', border: 0, display: 'block' }}
        />
      </div>
      {(label || note) && (
        <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3 typo-caption1">
          {label && <b className="text-text-primary">{label}</b>}
          {note && <span className="text-text-tertiary">{note}</span>}
        </figcaption>
      )}
    </figure>
  );
};
