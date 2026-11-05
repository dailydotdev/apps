import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';

// Pages here show many stories. A running story is slow to load, so a preview is
// a picture of it from scripts/startups-previews.mjs, and clicking opens it live.
// A story with no picture runs in an iframe. Storybook's dev server can't load
// many at once (dynamic imports fail), so those load one at a time, when they're
// near the screen, retry if a story fails, and unload once they're far away.

type Release = () => void;

const waiting: ((release: Release) => void)[] = [];
let isBusy = false;

const next = (): void => {
  const task = waiting.shift();

  if (!task) {
    isBusy = false;
    return;
  }

  isBusy = true;
  task(next);
};

const enqueue = (task: (release: Release) => void): (() => void) => {
  waiting.push(task);

  if (!isBusy) {
    next();
  }

  return () => {
    const index = waiting.indexOf(task);

    if (index >= 0) {
      waiting.splice(index, 1);
    }
  };
};

const blurFrame = (frame: HTMLIFrameElement | null): void => {
  (frame?.contentDocument?.activeElement as HTMLElement | null)?.blur();
  frame?.blur();
};

/**
 * Removing an iframe that holds focus fires blur synchronously, and when React
 * is the one removing it, that crashes the page's React: jumps and switches
 * stop responding. So focus leaves first, before the update that removes it.
 */
export const blurFrames = (): void => {
  document.querySelectorAll('iframe').forEach(blurFrame);
};

const MAX_RETRIES = 3;
const SETTLE_TIMEOUT_MS = 30000;

const getStatus = (
  frame: HTMLIFrameElement,
): 'ready' | 'failed' | 'loading' => {
  const doc = frame.contentDocument;
  const error = doc?.querySelector('.sb-errordisplay');
  const view = frame.contentWindow;

  if (error && view?.getComputedStyle(error).display !== 'none') {
    return 'failed';
  }

  return doc?.querySelector('#storybook-root')?.children.length
    ? 'ready'
    : 'loading';
};

export const Frame = ({
  storyId,
  title,
  width = 1280,
  height = 860,
  maxWidth,
}: {
  storyId: string;
  title: string;
  width?: number;
  height?: number;
  maxWidth?: number;
}): ReactElement => {
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.4);
  const [isLive, setLive] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [isStarted, setStarted] = useState(false);
  const [isFailed, setFailed] = useState(false);
  const [isReady, setReady] = useState(false);
  const releaseRef = useRef<Release>();

  useEffect(() => {
    const box = boxRef.current;

    if (!box || !isLive) {
      return undefined;
    }

    const resize = new ResizeObserver(([entry]) =>
      setScale(entry.contentRect.width / width),
    );
    resize.observe(box);

    let cancel: (() => void) | undefined;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cancel = enqueue((release) => {
            releaseRef.current = release;
            setStarted(true);
          });
          return;
        }

        blurFrame(frameRef.current);
        cancel?.();
        cancel = undefined;
        releaseRef.current?.();
        releaseRef.current = undefined;
        setStarted(false);
        setFailed(false);
        setReady(false);
        setAttempt(0);
      },
      { rootMargin: '800px' },
    );
    near.observe(box);

    return () => {
      resize.disconnect();
      near.disconnect();
      cancel?.();
      releaseRef.current?.();
      releaseRef.current = undefined;
    };
  }, [isLive, width]);

  useEffect(() => {
    if (!isStarted) {
      return undefined;
    }

    const startedAt = Date.now();
    const poll = setInterval(() => {
      const frame = frameRef.current;
      const status = frame ? getStatus(frame) : 'loading';
      const isTimedOut = Date.now() - startedAt > SETTLE_TIMEOUT_MS;

      if (status === 'loading' && !isTimedOut) {
        return;
      }

      clearInterval(poll);

      if (status === 'failed' && attempt < MAX_RETRIES) {
        setAttempt(attempt + 1);
        return;
      }

      setFailed(status !== 'ready');
      setReady(status === 'ready');
      releaseRef.current?.();
      releaseRef.current = undefined;
    }, 250);

    return () => clearInterval(poll);
  }, [attempt, isStarted]);

  return (
    <div
      ref={boxRef}
      className="relative w-full overflow-hidden rounded-12 border border-border-subtlest-tertiary"
      style={{
        aspectRatio: `${width} / ${height}`,
        maxWidth,
        background: '#0E1217',
      }}
    >
      {!isReady && !isFailed && (
        <p className="flex h-full items-center justify-center text-text-tertiary typo-footnote">
          Loading…
        </p>
      )}
      {!isLive && (
        <a
          href={`/?path=/story/${storyId}`}
          target="_top"
          aria-label={`Open ${title} live`}
          className="absolute inset-0"
        >
          <img
            src={`/startups-onboarding/previews/${storyId}.${width}.webp`}
            alt=""
            loading="lazy"
            className="size-full object-cover"
            onError={() => setLive(true)}
          />
        </a>
      )}
      {isLive && isStarted && (
        <iframe
          key={attempt}
          ref={frameRef}
          title={title}
          src={`iframe.html?id=${storyId}&viewMode=story&globals=theme:dark`}
          className="absolute left-0 top-0"
          style={{
            width,
            height,
            background: '#0E1217',
            opacity: isReady || isFailed ? 1 : 0,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          data-preview-frame
        />
      )}
      {isFailed && (
        <p className="absolute inset-x-0 bottom-0 bg-background-default p-2 text-center text-text-secondary typo-footnote">
          This preview didn&apos;t load. Use Open to see it.
        </p>
      )}
    </div>
  );
};
