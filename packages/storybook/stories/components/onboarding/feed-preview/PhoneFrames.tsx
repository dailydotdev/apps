import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';

const PHONE = { width: 390, height: 844 };
// Frames boot one at a time: several cold iframes at once make Vite re-run
// dependency optimization and every frame fails to load.
const FRAME_STAGGER_MS = 900;

export interface PhoneFrame {
  id: string;
  label: string;
  // Storybook URL args for this frame.
  args?: string;
}

export const PhoneFrames = ({
  storyPrefix,
  frames,
  title,
  description,
}: {
  storyPrefix: string;
  frames: PhoneFrame[];
  title: string;
  description: string;
}): ReactElement => {
  const [mounted, setMounted] = useState(1);
  const theme = document.documentElement.classList.contains('light')
    ? 'light'
    : 'dark';

  useEffect(() => {
    if (mounted >= frames.length) {
      return undefined;
    }

    const timeout = setTimeout(
      () => setMounted((count) => count + 1),
      FRAME_STAGGER_MS,
    );

    return () => clearTimeout(timeout);
  }, [mounted, frames.length]);

  return (
    <div className="flex min-h-dvh flex-col gap-4 bg-background-default p-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold typo-title2">{title}</h1>
        <p className="text-text-tertiary typo-callout">{description}</p>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {frames.map(({ id, label, args = 'initialOpen:!true' }, index) => (
          <figure key={label} className="flex shrink-0 flex-col gap-2">
            <figcaption className="text-text-secondary typo-footnote">
              {label}
            </figcaption>
            <div
              className="overflow-hidden rounded-16 border border-border-subtlest-tertiary"
              style={PHONE}
            >
              {index < mounted && (
                <iframe
                  src={`/iframe.html?id=${storyPrefix}--${id}&viewMode=story&globals=theme:${theme}&args=${args}`}
                  style={{ ...PHONE, border: 0 }}
                  title={label}
                />
              )}
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
};
