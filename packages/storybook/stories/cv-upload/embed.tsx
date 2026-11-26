import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { BrowserChrome, Phone } from '../open-links-in/kit';

// Each production frame loads in its own iframe so Tailwind's media queries
// resolve against a phone's or a laptop's viewport, not the review page's.
// Frames load one at a time: several previews pulling the same module graph
// at once make the dev server's imports fail.

const frameSrc = (story: string, theme: string, args?: string): string =>
  `iframe.html?id=growth-cv-upload-2-production-frames--${story}&viewMode=story&globals=theme:${theme}${args ? `&args=${args}` : ''}`;

let queue = Promise.resolve();

const isRendered = (frame: HTMLIFrameElement | null): boolean => {
  const body = frame?.contentDocument?.body;
  return (
    !!body?.classList.contains('sb-show-main') ||
    !!body?.classList.contains('sb-show-errordisplay')
  );
};

const QueuedFrame = ({
  story,
  theme,
  args,
  className,
  width,
  height,
}: {
  story: string;
  theme: string;
  args?: string;
  className: string;
  width?: number;
  height?: number;
}): ReactElement => {
  const ref = useRef<HTMLIFrameElement>(null);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let release = (): void => undefined;
    queue = queue.then(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
          if (isCancelled) {
            resolve();
            return;
          }
          setIsStarted(true);
          const startedAt = Date.now();
          const poll = setInterval(() => {
            // A stuck frame holds the rest up for 20 seconds at most.
            if (isRendered(ref.current) || Date.now() - startedAt > 20000) {
              clearInterval(poll);
              resolve();
            }
          }, 250);
        }),
    );

    return () => {
      isCancelled = true;
      release();
    };
  }, []);

  return (
    <iframe
      ref={ref}
      title={story}
      src={isStarted ? frameSrc(story, theme, args) : undefined}
      width={width}
      height={height}
      className={className}
    />
  );
};

export const PhoneFrame = ({
  story,
  theme,
  args,
  height = 720,
}: {
  story: string;
  theme: string;
  // Story args, as Storybook's URL takes them: key:value;key:value.
  args?: string;
  height?: number;
}): ReactElement => (
  <Phone browser={BrowserChrome.None} height={height}>
    <QueuedFrame
      story={story}
      theme={theme}
      args={args}
      className="w-full flex-1 border-0"
    />
  </Phone>
);

// A 1280 by 800 laptop viewport, drawn at three quarters.
export const LaptopFrame = ({
  story,
  theme,
}: {
  story: string;
  theme: string;
}): ReactElement => (
  <div className="relative h-[37.5rem] w-[60rem] max-w-full overflow-hidden rounded-16 border border-border-subtlest-secondary shadow-3">
    <QueuedFrame
      story={story}
      theme={theme}
      width={1280}
      height={800}
      className="absolute left-0 top-0 origin-top-left scale-75 border-0"
    />
  </div>
);

// The top right of a laptop viewport, where the header's profile menu opens.
export const MenuCrop = ({
  story,
  theme,
}: {
  story: string;
  theme: string;
}): ReactElement => (
  <div className="relative h-[45rem] w-[22rem] overflow-hidden rounded-16 border border-border-subtlest-secondary shadow-3">
    <QueuedFrame
      story={story}
      theme={theme}
      width={1280}
      height={900}
      className="absolute right-0 top-[-3rem] border-0"
    />
  </div>
);
