import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';

const useThemeClass = (): 'dark' | 'light' => {
  const read = () =>
    document.documentElement.classList.contains('light') ? 'light' : 'dark';
  const [theme, setTheme] = useState<'dark' | 'light'>(read);

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
};

// Each frame is a whole Storybook preview that imports a few hundred modules.
// Started together, the browser drops some of those requests and the preview
// shows "Failed to fetch dynamically imported module", so frames load one at
// a time and reload when the preview still ends on its error screen.
const MAX_ATTEMPTS = 3;
const STORY_TIMEOUT_MS = 30000;
let loadQueue: Promise<void> = Promise.resolve();

const waitForStory = (frame: HTMLIFrameElement): Promise<boolean> =>
  new Promise((resolve) => {
    const startedAt = Date.now();
    const check = () => {
      const body = frame.contentDocument?.body;

      if (body?.classList.contains('sb-show-errordisplay')) {
        resolve(false);
        return;
      }

      if (
        body?.classList.contains('sb-show-main') ||
        Date.now() - startedAt > STORY_TIMEOUT_MS
      ) {
        resolve(true);
        return;
      }

      setTimeout(check, 250);
    };

    check();
  });

// A live story, such as a real funnel step or the real post modal, at the width
// it ships on, scaled down to fit and still clickable.
export const LiveFrame = ({
  story,
  width,
  height,
  args,
  maxScale = 1,
}: {
  story: string;
  width: number;
  height: number;
  args?: string;
  maxScale?: number;
}): ReactElement => {
  const theme = useThemeClass();
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [available, setAvailable] = useState(0);
  const scale = Math.min(available / width, maxScale);
  const url = `/iframe.html?id=day-zero-retention-${story}&viewMode=story&globals=theme:${theme}${
    args ? `&args=${args}` : ''
  }`;

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) =>
      setAvailable(entry.contentRect.width),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    loadQueue = loadQueue.then(async () => {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        const frame = frameRef.current;

        if (isCancelled || !frame) {
          return;
        }

        const loaded = new Promise((resolve) => {
          frame.addEventListener('load', resolve, { once: true });
        });
        frame.src = attempt === 1 ? url : `${url}&attempt=${attempt}`;
        // eslint-disable-next-line no-await-in-loop -- one load at a time
        await loaded;

        // eslint-disable-next-line no-await-in-loop -- retry only on failure
        if (await waitForStory(frame)) {
          return;
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [url]);

  return (
    <div ref={ref} className="flex w-full min-w-0 justify-center">
      <div
        className="relative shrink-0 overflow-hidden rounded-16 border border-border-subtlest-tertiary"
        style={{ width: width * scale, height: height * scale }}
      >
        <iframe
          ref={frameRef}
          title={story}
          style={{
            width,
            height,
            border: 0,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
      </div>
    </div>
  );
};
