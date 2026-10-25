import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
// @ts-expect-error react-dom ships no types in this package
import { createPortal } from 'react-dom';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { mountFrame } from '../../../_frame';
import { PostPageWithFeed } from '../page';
import { KeepReading } from './KeepReading';

// A 52-second team demo of Keep reading as it ships (dailydotdev/apps#7018):
// the post page in the new layout, desktop and phone side by side, the feed
// after the comments. Same machinery as the exploration's video: everything
// on screen is a function of one clock, so a recorder can step it frame by
// frame (window.__demoRecording + window.__demo.seek(t)).

const W = 1920;
const H = 1080;

interface Scene {
  id: 'title' | 'today' | 'feed' | 'more' | 'open' | 'ships' | 'ask';
  duration: number;
}

const SCENES: Scene[] = [
  { id: 'title', duration: 4.5 },
  { id: 'today', duration: 5 },
  { id: 'feed', duration: 12 },
  { id: 'more', duration: 9 },
  { id: 'open', duration: 10 },
  { id: 'ships', duration: 7 },
  { id: 'ask', duration: 5 },
];

const starts = SCENES.reduce<number[]>(
  (list, scene, index) => [
    ...list,
    index ? list[index - 1] + SCENES[index - 1].duration : 0,
  ],
  [],
);

export const KEEP_READING_VIDEO_DURATION =
  starts[starts.length - 1] + SCENES[SCENES.length - 1].duration;

/* ----------------------------------------------------------------- time */

const clamp = (value: number): number => Math.min(1, Math.max(0, value));
const progress = (t: number, from: number, to: number): number =>
  clamp((t - from) / (to - from));
const ease = (x: number): number =>
  x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
const easeOut = (x: number): number => 1 - (1 - x) ** 3;
const lerp = (from: number, to: number, x: number): number =>
  from + (to - from) * x;

/** Local time in a scene, or null outside it. */
const local = (t: number, id: Scene['id']): number | null => {
  const index = SCENES.findIndex((scene) => scene.id === id);
  const start = starts[index];
  const end = start + SCENES[index].duration;
  return t >= start && t < end ? t - start : null;
};

/**
 * A scene's live post pages exist from 1.5s before it starts until it ends:
 * all six at once outgrow a headless tab's memory and crash it.
 */
const mounted = (t: number, id: Scene['id']): boolean => {
  const index = SCENES.findIndex((scene) => scene.id === id);
  return t >= starts[index] - 1.5 && t < starts[index] + SCENES[index].duration;
};

/** A scene fades in over its first 0.4s and out over its last 0.4s. */
const sceneOpacity = (t: number, id: Scene['id']): number => {
  const index = SCENES.findIndex((scene) => scene.id === id);
  const s = local(t, id);
  if (s === null) {
    return 0;
  }
  const { duration } = SCENES[index];
  const fadeIn = index === 0 ? 1 : progress(s, 0, 0.4);
  const fadeOut =
    index === SCENES.length - 1 ? 1 : 1 - progress(s, duration - 0.4, duration);
  return Math.min(fadeIn, fadeOut);
};

/** Text that rises in at `at` seconds into its scene, and leaves at `until`. */
const rise = (s: number, at: number, until = Infinity): CSSProperties => {
  const enter = easeOut(progress(s, at, at + 0.6));
  const leave = Number.isFinite(until)
    ? 1 - progress(s, until - 0.3, until)
    : 1;
  return {
    opacity: Math.min(enter, leave),
    transform: `translateY(${(1 - enter) * 18}px)`,
  };
};

/* --------------------------------------------------------------- frames */

const LAPTOP = { width: 1440, height: 900, scale: 0.8 };
const PHONE = { width: 390, height: 844, scale: 0.86 };

type ScreenKind = 'laptop' | 'phone';
type Windows = Record<string, Window | null>;

/** A blank document of its own size, portaled into like Device does. */
const Screen = ({
  width,
  height,
  scale,
  onWindow,
  children,
}: {
  width: number;
  height: number;
  scale: number;
  onWindow: (view: Window | null) => void;
  children: ReactNode;
}): ReactElement => {
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const doc = frame?.contentDocument;
    if (!frame || !doc) {
      return undefined;
    }
    const unmount = mountFrame(doc);
    setBody(doc.body);
    onWindow(frame.contentWindow);
    return () => {
      onWindow(null);
      unmount();
    };
  }, [frame, onWindow]);

  return (
    <div
      data-screen
      style={{ width: width * scale, height: height * scale }}
      className="overflow-hidden"
    >
      <iframe
        ref={setFrame}
        title="Screen"
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          border: 0,
          display: 'block',
        }}
      >
        {body && createPortal(children, body)}
      </iframe>
    </div>
  );
};

const LaptopFrame = ({ children }: { children: ReactNode }): ReactElement => (
  <div
    className="overflow-hidden rounded-20 border border-border-subtlest-tertiary bg-background-subtle"
    style={{ boxShadow: '0 40px 80px -24px rgba(0,0,0,0.6)' }}
  >
    <div className="flex h-[2.125rem] items-center gap-3 border-b border-border-subtlest-tertiary px-4">
      <span className="flex gap-1.5">
        {[0, 1, 2].map((dot) => (
          <span key={dot} className="size-2.5 rounded-full bg-surface-float" />
        ))}
      </span>
      <span className="mx-auto rounded-8 bg-surface-float px-10 py-0.5 text-text-tertiary typo-caption1">
        app.daily.dev
      </span>
    </div>
    {children}
  </div>
);

const PhoneFrame = ({ children }: { children: ReactNode }): ReactElement => (
  <div
    className="rounded-[3.25rem] p-2.5"
    style={{
      background: '#000',
      boxShadow:
        '0 0 0 1px rgba(255,255,255,0.12), 0 40px 80px -24px rgba(0,0,0,0.7)',
    }}
  >
    <div className="overflow-hidden rounded-[2.625rem]">{children}</div>
  </div>
);

/** One scene's laptop and phone, each a real post page. */
const DeviceRow = ({
  id,
  laptop,
  phone,
  register,
}: {
  id: string;
  laptop: ReactNode;
  phone: ReactNode;
  register: (key: string, view: Window | null) => void;
}): ReactElement => {
  const onLaptop = useCallback(
    (view: Window | null) => register(`${id}-laptop`, view),
    [id, register],
  );
  const onPhone = useCallback(
    (view: Window | null) => register(`${id}-phone`, view),
    [id, register],
  );
  return (
    <div className="flex items-start gap-14">
      <LaptopFrame>
        <Screen {...LAPTOP} onWindow={onLaptop}>
          <Suspense fallback={null}>{laptop}</Suspense>
        </Screen>
      </LaptopFrame>
      <PhoneFrame>
        <Screen {...PHONE} onWindow={onPhone}>
          <Suspense fallback={null}>{phone}</Suspense>
        </Screen>
      </PhoneFrame>
    </div>
  );
};

/** The post page with Keep reading under it, as the flag ships it. */
const WithFeed = ({ tab }: { tab?: string }): ReactElement => (
  <PostPageWithFeed
    start="top"
    renderFeed={(host) => <KeepReading host={host} initialTab={tab} />}
  />
);

/* ------------------------------------------------------------- chrome */

const accent = 'var(--theme-accent-cabbage-default)';

const Eyebrow = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}): ReactElement => (
  <span
    className="font-bold uppercase"
    style={{ color: accent, fontSize: 20, letterSpacing: '0.14em', ...style }}
  >
    {children}
  </span>
);

/** Eyebrow, title and a line that can change mid-scene. */
const Caption = ({
  s,
  eyebrow,
  title,
  lines,
}: {
  s: number;
  eyebrow: string;
  title: string;
  /** [from second, text] */
  lines: [number, string][];
}): ReactElement => (
  <div className="absolute flex flex-col gap-3" style={{ left: 178, top: 58 }}>
    <Eyebrow style={rise(s, 0.15)}>{eyebrow}</Eyebrow>
    <h2
      className="font-bold text-text-primary"
      style={{ fontSize: 54, lineHeight: 1.08, ...rise(s, 0.25) }}
    >
      {title}
    </h2>
    <div className="relative" style={{ height: 34 }}>
      {lines.map(([at, text], index) => (
        <p
          key={text}
          className="absolute left-0 top-0 whitespace-nowrap text-text-secondary"
          style={{
            fontSize: 26,
            ...rise(s, at + 0.35, lines[index + 1]?.[0] ?? Infinity),
          }}
        >
          {text}
        </p>
      ))}
    </div>
  </div>
);

const Footer = ({ current }: { current: Scene['id'] }): ReactElement => (
  <div
    className="absolute flex items-center justify-between text-text-tertiary"
    style={{ left: 178, right: 178, bottom: 30, fontSize: 18 }}
  >
    <span className="flex items-center gap-3">
      <LogoIcon className={{ container: 'h-6 w-auto' }} />
      Keep reading · post page feed
    </span>
    <span className="flex items-center gap-2">
      {(
        [
          ['today', 'Today'],
          ['feed', 'Keep reading'],
          ['more', 'Endless'],
          ['open', 'Open a post'],
        ] as const
      ).map(([id, label]) => (
        <span
          key={id}
          className="rounded-10 px-3 py-1 font-bold"
          style={
            id === current
              ? { background: accent, color: '#fff' }
              : { background: 'var(--theme-surface-float)' }
          }
        >
          {label}
        </span>
      ))}
    </span>
  </div>
);

const Layer = ({
  opacity,
  children,
}: {
  opacity: number;
  children: ReactNode;
}): ReactElement => (
  <div
    className="absolute inset-0"
    style={{ opacity, pointerEvents: opacity > 0.5 ? 'auto' : 'none' }}
  >
    {children}
  </div>
);

/** A pointer drawn over the stage: where the click happens, and when. */
const Cursor = React.forwardRef<HTMLDivElement>(function Cursor(
  _props,
  ref,
): ReactElement {
  return (
    <div
      ref={ref}
      className="pointer-events-none absolute left-0 top-0 z-max"
      style={{ opacity: 0 }}
    >
      <span
        data-ring
        className="absolute rounded-full"
        style={{
          left: -22,
          top: -22,
          width: 44,
          height: 44,
          background: 'rgba(255,255,255,0.35)',
          opacity: 0,
        }}
      />
      <svg
        width="34"
        height="40"
        viewBox="0 0 17 20"
        style={{ display: 'block' }}
      >
        <path
          d="M1 1v15.5l4.2-4 2.7 6.3 2.6-1.1-2.6-6.2H14z"
          fill="#fff"
          stroke="#0e1217"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});

/* ------------------------------------------------------------- scripts */

const feedTop = (view: Window): number => {
  const anchor = view.document.getElementById('post-feed');
  return anchor ? anchor.getBoundingClientRect().top + view.scrollY : 0;
};

/** The last scroll position that still shows only the feed, not past it. */
const feedEnd = (view: Window): number => {
  const feed = view.document.getElementById('post-feed')?.nextElementSibling;
  return feed
    ? feed.getBoundingClientRect().bottom + view.scrollY - view.innerHeight
    : Infinity;
};

const pageEnd = (view: Window): number =>
  view.document.documentElement.scrollHeight - view.innerHeight;

const scroll = (view: Window | null, y: number): void => {
  view?.scrollTo({ top: Math.max(0, Math.round(y)), behavior: 'instant' });
};

/** Lazy covers would still be blank when a frame is captured. */
const eager = (view: Window | null): void => {
  view?.document
    .querySelectorAll<HTMLImageElement>('img[loading="lazy"]')
    .forEach((img) => {
      // eslint-disable-next-line no-param-reassign
      img.loading = 'eager';
    });
};

interface Target {
  view: Window;
  element: Element;
  screen: ScreenKind;
  /** Where on the element, as fractions of its box (or px from the top). */
  at?: { x: number; y: number };
}

/* --------------------------------------------------------------- stage */

declare global {
  interface Window {
    __demoRecording?: boolean;
    __demo?: {
      duration: number;
      ready: () => boolean;
      seek: (t: number) => Promise<void>;
    };
  }
}

const Stage = ({ onLoop }: { onLoop: () => void }): ReactElement => {
  const [clock, setClock] = useState({ t: 0, n: 0 });
  const { t } = clock;
  const clockRef = useRef(t);
  clockRef.current = t;
  const windows = useRef<Windows>({});
  const fired = useRef(new Set<string>());
  const pending = useRef<(() => void) | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);

  const register = useCallback((key: string, view: Window | null) => {
    windows.current[key] = view;
  }, []);

  /** A screen's top-left on the stage, in stage pixels. */
  const screenBox = (key: string): DOMRect | null => {
    const view = windows.current[key];
    const frame = view?.frameElement as HTMLElement | null;
    const root = stage.current;
    if (!frame || !root) {
      return null;
    }
    const scale = root.getBoundingClientRect().width / W;
    const box = frame.getBoundingClientRect();
    const origin = root.getBoundingClientRect();
    return new DOMRect(
      (box.left - origin.left) / scale,
      (box.top - origin.top) / scale,
      box.width / scale,
      box.height / scale,
    );
  };

  /** Where an element inside a screen sits on the stage. */
  const pointOf = (key: string, target: Target): { x: number; y: number } => {
    const box = screenBox(key);
    const rect = target.element.getBoundingClientRect();
    const scale = target.screen === 'laptop' ? LAPTOP.scale : PHONE.scale;
    const at = target.at ?? { x: 0.5, y: 0.5 };
    const y = at.y > 1 ? at.y : rect.height * at.y;
    return {
      x: (box?.x ?? 0) + (rect.left + rect.width * at.x) * scale,
      y: (box?.y ?? 0) + (rect.top + y) * scale,
    };
  };

  /**
   * The cursor glides from `from` to the target between `move[0]` and
   * `move[1]`, presses, and clicks once at `move[1] + 0.12`.
   */
  const pointer = (
    s: number,
    key: string,
    target: Target | null,
    move: [number, number],
    show: [number, number],
    from: { x: number; y: number },
    click: () => void,
    clickId: string,
  ): void => {
    const node = cursor.current;
    if (!node) {
      return;
    }
    const visible = Math.min(
      progress(s, show[0], show[0] + 0.3),
      1 - progress(s, show[1] - 0.3, show[1]),
    );
    // The click lands even when a seek skips past the cursor's moment.
    if (target && s >= move[1] + 0.12 && !fired.current.has(clickId)) {
      fired.current.add(clickId);
      click();
    }
    if (!target || visible <= 0) {
      node.style.opacity = '0';
      return;
    }
    const to = pointOf(key, target);
    const glide = ease(progress(s, move[0], move[1]));
    const x = lerp(from.x, to.x, glide);
    const y = lerp(from.y, to.y, glide);
    const press =
      progress(s, move[1], move[1] + 0.12) -
      progress(s, move[1] + 0.12, move[1] + 0.3);
    node.style.opacity = `${visible}`;
    node.style.transform = `translate(${x}px, ${y}px) scale(${
      1 - press * 0.12
    })`;
    const ring = node.querySelector<HTMLElement>('[data-ring]');
    if (ring) {
      const pulse = progress(s, move[1] + 0.08, move[1] + 0.6);
      ring.style.opacity = `${pulse > 0 && pulse < 1 ? 1 - pulse : 0}`;
      ring.style.transform = `scale(${0.6 + pulse * 1.2})`;
    }
  };

  /** The visible element among a tab label's three rows (phone, tablet, laptop). */
  const visibleTab = (view: Window, label: string): Element | undefined =>
    [...view.document.querySelectorAll('[data-testid="postPageFeed"] button')]
      .filter((button) => button.textContent === label)
      .find((button) => (button as HTMLElement).offsetParent !== null);

  /** A card's own link: the largest anchor in it covers the whole card. */
  const cardLink = (card: Element | undefined): HTMLAnchorElement | undefined =>
    card
      ? [...card.querySelectorAll<HTMLAnchorElement>('a[href]')].sort(
          (x, y) =>
            y.offsetWidth * y.offsetHeight - x.offsetWidth * x.offsetHeight,
        )[0]
      : undefined;

  const firstCard = (view: Window): Element | undefined =>
    view.document.querySelector(
      '[data-testid="postPageFeed"] article:not([aria-busy])',
    ) ?? undefined;

  // Everything the clock moves that is not React state: scroll positions,
  // the cursor, and the clicks it makes.
  useLayoutEffect(() => {
    const win = windows.current;
    Object.values(win).forEach(eager);
    let cursorUsed = false;

    const today = local(t, 'today');
    if (today !== null) {
      ['laptop', 'phone'].forEach((screen) => {
        const view = win[`today-${screen}`];
        if (!view) {
          return;
        }
        const end = pageEnd(view);
        const span = screen === 'laptop' ? 1400 : 2000;
        scroll(view, lerp(end - span, end, ease(progress(today, 0.4, 4.4))));
      });
    }

    const feed = local(t, 'feed');
    if (feed !== null) {
      const laptop = win['feed-laptop'];
      const phone = win['feed-phone'];
      if (laptop) {
        const top = feedTop(laptop);
        let y = top - 360;
        if (feed >= 0.8) {
          y = lerp(top - 360, top - 40, ease(progress(feed, 0.8, 3.6)));
        }
        if (feed >= 6.8) {
          y = lerp(top - 40, top + 1500, ease(progress(feed, 6.8, 11.6)));
        }
        scroll(laptop, Math.min(y, feedEnd(laptop)));
        const tab = visibleTab(laptop, '#career');
        const box = screenBox('feed-laptop');
        pointer(
          feed,
          'feed-laptop',
          tab ? { view: laptop, element: tab, screen: 'laptop' } : null,
          [4.6, 5.8],
          [4.4, 7.4],
          {
            x: (box?.x ?? 0) + (box?.width ?? 0) * 0.8,
            y: (box?.y ?? 0) + (box?.height ?? 0) * 0.85,
          },
          () => (tab as HTMLElement | undefined)?.click(),
          'feed-tab',
        );
        cursorUsed = true;
      }
      if (phone) {
        const top = feedTop(phone);
        scroll(
          phone,
          Math.min(
            feedEnd(phone),
            lerp(top - 300, top + 2200, ease(progress(feed, 0.8, 11.6))),
          ),
        );
      }
    }

    const more = local(t, 'more');
    if (more !== null) {
      const laptop = win['more-laptop'];
      const phone = win['more-phone'];
      if (laptop) {
        // For you: page after page, the next loading as the list nears it.
        const top = feedTop(laptop);
        scroll(
          laptop,
          Math.min(
            feedEnd(laptop) + 200,
            lerp(top - 40, top + 6000, ease(progress(more, 0.4, 8.6))),
          ),
        );
      }
      if (phone) {
        // A tag tab with a single other post: its end note.
        const top = feedTop(phone);
        scroll(
          phone,
          lerp(
            top - 120,
            Math.max(top - 120, feedEnd(phone) + 140),
            ease(progress(more, 3.6, 6.4)),
          ),
        );
      }
    }

    const open = local(t, 'open');
    if (open !== null) {
      const laptop = win['open-laptop'];
      const phone = win['open-phone'];
      if (laptop) {
        const opened = fired.current.has('open-laptop-card');
        const card = opened ? undefined : firstCard(laptop);
        if (!opened) {
          const top = feedTop(laptop);
          scroll(
            laptop,
            lerp(top - 360, top - 40, ease(progress(open, 0.3, 1.6))),
          );
        } else {
          const top = feedTop(laptop);
          scroll(laptop, lerp(0, top - 300, ease(progress(open, 4.2, 9.4))));
        }
        const box = screenBox('open-laptop');
        pointer(
          open,
          'open-laptop',
          card
            ? {
                view: laptop,
                element: card,
                screen: 'laptop',
                at: { x: 0.35, y: 110 },
              }
            : null,
          [1.8, 3.0],
          [1.6, 3.6],
          {
            x: (box?.x ?? 0) + (box?.width ?? 0) * 0.85,
            y: (box?.y ?? 0) + (box?.height ?? 0) * 0.9,
          },
          () => (cardLink(card) ?? (card as HTMLElement | undefined))?.click(),
          'open-laptop-card',
        );
        cursorUsed = true;
      }
      if (phone) {
        const opened = fired.current.has('open-phone-card');
        if (!opened) {
          const top = feedTop(phone);
          scroll(
            phone,
            lerp(top - 300, top - 40, ease(progress(open, 0.3, 1.6))),
          );
          if (open >= 3.12) {
            fired.current.add('open-phone-card');
            const card = firstCard(phone);
            (cardLink(card) ?? (card as HTMLElement | undefined))?.click();
          }
        } else {
          const top = feedTop(phone);
          scroll(phone, lerp(0, top - 200, ease(progress(open, 4.2, 9.4))));
        }
      }
    }

    if (!cursorUsed && cursor.current) {
      cursor.current.style.opacity = '0';
    }

    const done = pending.current;
    pending.current = null;
    if (done) {
      // Let the scrolled pages paint, and their covers arrive.
      const images = Object.values(win).flatMap((view) =>
        view
          ? [...view.document.images].filter((img) => {
              const rect = img.getBoundingClientRect();
              return (
                !img.complete && rect.bottom > 0 && rect.top < view.innerHeight
              );
            })
          : [],
      );
      Promise.race([
        Promise.all(
          images.map(
            (img) =>
              new Promise((resolve) => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
              }),
          ),
        ),
        new Promise((resolve) => window.setTimeout(resolve, 2500)),
      ]).then(() =>
        requestAnimationFrame(() => requestAnimationFrame(() => done())),
      );
    }
  }, [clock]); // eslint-disable-line react-hooks/exhaustive-deps

  // The recorder's handle, or the clock running on its own.
  useEffect(() => {
    window.__demo = {
      duration: KEEP_READING_VIDEO_DURATION,
      ready: () =>
        (['today', 'feed', 'more', 'open'] as const)
          .filter((id) => mounted(clockRef.current, id))
          .every((id) =>
            ['laptop', 'phone'].every((screen) => {
              const view = windows.current[`${id}-${screen}`];
              return (
                !!view?.document.querySelector(
                  '[data-testid="postContainer"]',
                ) &&
                (id === 'today' || !!view.document.getElementById('post-feed'))
              );
            }),
          ),
      seek: (next) =>
        new Promise<void>((resolve) => {
          // Never hang the recorder: a frame that cannot settle in 3s is
          // captured as it is.
          const fallback = window.setTimeout(() => {
            console.warn(`[demo] seek ${next} did not settle`);
            resolve();
          }, 3000);
          pending.current = () => {
            window.clearTimeout(fallback);
            resolve();
          };
          setClock((current) => ({ t: next, n: current.n + 1 }));
        }),
    };
    if (window.__demoRecording) {
      return undefined;
    }
    let frame = 0;
    const begin = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - begin) / 1000;
      if (elapsed >= KEEP_READING_VIDEO_DURATION) {
        onLoop();
        return;
      }
      setClock((current) => ({ t: elapsed, n: current.n + 1 }));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onLoop]);

  const title = local(t, 'title') ?? 0;
  const ships = local(t, 'ships') ?? 0;
  const ask = local(t, 'ask') ?? 0;
  const deviceTop = 236;

  return (
    <div
      ref={stage}
      className="relative overflow-hidden text-text-primary antialiased"
      style={{
        width: W,
        height: H,
        background:
          'radial-gradient(1200px 700px at 85% -10%, color-mix(in srgb, var(--theme-accent-cabbage-default) 14%, transparent), transparent 70%), var(--theme-background-default)',
      }}
    >
      <Layer opacity={sceneOpacity(t, 'title')}>
        <div className="flex size-full flex-col items-center justify-center gap-7 text-center">
          <div style={rise(title, 0.1)}>
            <LogoIcon className={{ container: 'h-16 w-auto' }} />
          </div>
          <Eyebrow style={rise(title, 0.35)}>Post page · experiment</Eyebrow>
          <h1
            className="font-bold"
            style={{ fontSize: 96, lineHeight: 1.04, ...rise(title, 0.5) }}
          >
            Keep reading
          </h1>
          <p
            className="text-text-secondary"
            style={{ fontSize: 34, maxWidth: 1200, ...rise(title, 0.8) }}
          >
            A feed after the comments, so a post is never a dead end.
          </p>
        </div>
      </Layer>

      {[
        {
          id: 'today' as const,
          eyebrow: 'Today',
          title: 'The post page ends at the comments',
          lines: [
            [0, 'Read it, scroll the discussion, and the page is over.'],
          ] as [number, string][],
          laptop: <PostPageWithFeed start="top" />,
          phone: <PostPageWithFeed start="top" />,
        },
        {
          id: 'feed' as const,
          eyebrow: 'Keep reading',
          title: 'Your feed continues under the post',
          lines: [
            [0, 'The same tabs as the home page, then your For you feed.'],
            [4.4, 'One tap for the post’s tags or its source.'],
          ] as [number, string][],
          laptop: <WithFeed />,
          phone: <WithFeed />,
        },
        {
          id: 'more' as const,
          eyebrow: 'Keep reading',
          title: 'For you never runs out',
          lines: [
            [0, 'It’s your own home feed, so it keeps loading as you scroll.'],
            [
              3.6,
              'A tag or a source runs out, and says when you’re caught up.',
            ],
          ] as [number, string][],
          laptop: <WithFeed />,
          phone: <WithFeed tab="#github" />,
        },
        {
          id: 'open' as const,
          eyebrow: 'Keep reading',
          title: 'Open a post, keep going',
          lines: [
            [0, 'Cards look and work like the home feed.'],
            [3.6, 'The post opens with its own feed underneath.'],
          ] as [number, string][],
          laptop: <WithFeed />,
          phone: <WithFeed />,
        },
      ].map((scene) => (
        <Layer key={scene.id} opacity={sceneOpacity(t, scene.id)}>
          <Caption
            s={local(t, scene.id) ?? 0}
            eyebrow={scene.eyebrow}
            title={scene.title}
            lines={scene.lines}
          />
          <div className="absolute" style={{ left: 178, top: deviceTop }}>
            {mounted(t, scene.id) && (
              <DeviceRow
                id={scene.id}
                laptop={scene.laptop}
                phone={scene.phone}
                register={register}
              />
            )}
          </div>
          <Footer current={scene.id} />
        </Layer>
      ))}

      <Layer opacity={sceneOpacity(t, 'ships')}>
        <div
          className="flex size-full flex-col justify-center gap-12"
          style={{ padding: '0 178px' }}
        >
          <div className="flex flex-col gap-3">
            <Eyebrow style={rise(ships, 0.1)}>How it ships</Eyebrow>
            <h2
              className="font-bold"
              style={{ fontSize: 64, ...rise(ships, 0.2) }}
            >
              An experiment, behind a flag
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {[
              [
                'Signed-in readers only',
                'Signed-out readers keep the comments and the sign-up footer.',
              ],
              [
                'Behind post_page_feed',
                'Off by default: tested against today’s post page.',
              ],
              [
                'The home page’s tabs',
                'Phone, tablet and laptop each use the home feed’s own tabs.',
              ],
              [
                'The production feed',
                'Real list cards, infinite scroll and logging. No API changes.',
              ],
              [
                'Every post type',
                'Articles, videos, shares, posts, polls, collections and X posts.',
              ],
              [
                'Every screen',
                'Checked from 320 to 2560px, in light and dark.',
              ],
            ].map(([head, body], index) => (
              <div
                key={head}
                className="flex flex-col gap-3 rounded-24 border border-border-subtlest-tertiary bg-background-subtle"
                style={{ padding: 36, ...rise(ships, 0.4 + index * 0.12) }}
              >
                <span className="font-bold" style={{ fontSize: 32 }}>
                  {head}
                </span>
                <span className="text-text-secondary" style={{ fontSize: 24 }}>
                  {body}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Layer>

      <Layer opacity={sceneOpacity(t, 'ask')}>
        <div className="flex size-full flex-col items-center justify-center gap-8 text-center">
          <Eyebrow style={rise(ask, 0.1)}>Next</Eyebrow>
          <h2
            className="font-bold"
            style={{ fontSize: 84, lineHeight: 1.05, ...rise(ask, 0.25) }}
          >
            Ready to test
          </h2>
          <p
            className="text-text-secondary"
            style={{ fontSize: 32, maxWidth: 1200, ...rise(ask, 0.5) }}
          >
            Questions, or something we should measure? Reply in the thread.
          </p>
        </div>
      </Layer>

      <Cursor ref={cursor} />
    </div>
  );
};

/** The stage scaled to the window, replaying from the top when it ends. */
export const KeepReadingVideo = (): ReactElement => {
  const [run, setRun] = useState(0);
  const [scale, setScale] = useState(1);
  const onLoop = useCallback(() => setRun((current) => current + 1), []);

  // The video is dark from start to end, whatever the toolbar theme says
  // (a recording once came out light from the comparison on).
  useEffect(() => {
    const html = document.documentElement;
    const enforce = () => {
      if (
        !html.classList.contains('dark') ||
        html.classList.contains('light')
      ) {
        html.classList.remove('light');
        html.classList.add('dark');
      }
    };
    enforce();
    const observer = new MutationObserver(enforce);
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fit = () =>
      setScale(Math.min(1, window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  return (
    <div className="min-h-screen bg-background-default">
      <div style={{ width: W * scale, height: H * scale, overflow: 'hidden' }}>
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          <Stage key={run} onLoop={onLoop} />
        </div>
      </div>
    </div>
  );
};
