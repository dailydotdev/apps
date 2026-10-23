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
import { mountFrame } from '../../_frame';
import { PostPageWithFeed } from './page';
import type { VariantId } from './variants';

// A 47-second demo of variations A and B for the team, desktop and phone
// side by side in every scene. Everything on screen is a pure function of
// one clock, `t`: scenes fade by it, the real post pages scroll by it, and
// the cursor moves and clicks by it. In Storybook it plays on its own; a
// recorder sets `window.__demoRecording` and steps `window.__demo.seek(t)`
// frame by frame, so the video is smooth however slow the capture is.

const W = 1920;
const H = 1080;

interface Scene {
  id: 'title' | 'today' | 'a' | 'b' | 'compare' | 'ask';
  duration: number;
}

const SCENES: Scene[] = [
  { id: 'title', duration: 4.5 },
  { id: 'today', duration: 5.5 },
  { id: 'a', duration: 13 },
  { id: 'b', duration: 13 },
  { id: 'compare', duration: 6 },
  { id: 'ask', duration: 5.5 },
];

const starts = SCENES.reduce<number[]>(
  (list, scene, index) => [
    ...list,
    index ? list[index - 1] + SCENES[index - 1].duration : 0,
  ],
  [],
);

export const DEMO_DURATION =
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
  variant,
  register,
}: {
  id: string;
  variant: VariantId | 'none';
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
          <Suspense fallback={null}>
            <PostPageWithFeed variant={variant} start="top" />
          </Suspense>
        </Screen>
      </LaptopFrame>
      <PhoneFrame>
        <Screen {...PHONE} onWindow={onPhone}>
          <Suspense fallback={null}>
            <PostPageWithFeed variant={variant} start="top" />
          </Suspense>
        </Screen>
      </PhoneFrame>
    </div>
  );
};

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
      Post page feed · design exploration
    </span>
    <span className="flex items-center gap-2">
      {(
        [
          ['today', 'Today'],
          ['a', 'Idea A'],
          ['b', 'Idea B'],
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

  // Everything the clock moves that is not React state: scroll positions,
  // the cursor, and the clicks it makes.
  useLayoutEffect(() => {
    const win = windows.current;
    Object.values(win).forEach(eager);

    const today = local(t, 'today');
    if (today !== null) {
      ['laptop', 'phone'].forEach((screen) => {
        const view = win[`today-${screen}`];
        if (!view) {
          return;
        }
        const end = pageEnd(view);
        const span = screen === 'laptop' ? 1500 : 2100;
        scroll(view, lerp(end - span, end, ease(progress(today, 0.5, 4.8))));
      });
    }

    const a = local(t, 'a');
    let cursorUsed = false;
    if (a !== null) {
      const laptop = win['a-laptop'];
      const phone = win['a-phone'];
      if (laptop) {
        const top = feedTop(laptop);
        let y = top - 380;
        if (a >= 1) {
          y = lerp(top - 380, top - 70, ease(progress(a, 1, 3.8)));
        }
        if (a >= 6.6) {
          y = lerp(top - 70, top + 1500, ease(progress(a, 6.6, 12.7)));
        }
        scroll(laptop, y);
        const chip = [...laptop.document.querySelectorAll('[role="tab"]')].find(
          (tab) => tab.textContent === '#career',
        );
        const box = screenBox('a-laptop');
        pointer(
          a,
          'a-laptop',
          chip ? { view: laptop, element: chip, screen: 'laptop' } : null,
          [4.5, 5.6],
          [4.3, 7.2],
          {
            x: (box?.x ?? 0) + (box?.width ?? 0) * 0.78,
            y: (box?.y ?? 0) + (box?.height ?? 0) * 0.85,
          },
          () => (chip as HTMLElement | undefined)?.click(),
          'a-chip',
        );
        cursorUsed = true;
      }
      if (phone) {
        const top = feedTop(phone);
        scroll(
          phone,
          Math.min(
            feedEnd(phone),
            lerp(top - 320, top + 2500, ease(progress(a, 0.8, 12.7))),
          ),
        );
      }
    }

    const b = local(t, 'b');
    if (b !== null) {
      const laptop = win['b-laptop'];
      const phone = win['b-phone'];
      if (laptop) {
        const opened = fired.current.has('b-card');
        // The card the cursor opens: the first article on the second row (a
        // video would open behind a cookie wall). The scroll ends with it in
        // the upper half of the screen.
        const card = opened
          ? undefined
          : [
              ...laptop.document.querySelectorAll(
                '#post-feed ~ section article',
              ),
            ]
              .slice(3)
              .find((article) => !article.textContent?.includes('watch time'));
        if (!opened) {
          const top = feedTop(laptop);
          const cardTop = card
            ? card.getBoundingClientRect().top + laptop.scrollY
            : top + 600;
          let y = top - 380;
          if (b >= 1) {
            y = lerp(top - 380, cardTop - 230, ease(progress(b, 1, 6.3)));
          }
          scroll(laptop, y);
        } else {
          scroll(laptop, lerp(0, 360, ease(progress(b, 9, 12.7))));
        }
        const box = screenBox('b-laptop');
        // The card's own link covers the whole card; smaller ones are the
        // source and "Read post".
        const link = card
          ? [...card.querySelectorAll<HTMLAnchorElement>('a[href]')].sort(
              (x, y) =>
                y.offsetWidth * y.offsetHeight - x.offsetWidth * x.offsetHeight,
            )[0]
          : undefined;
        pointer(
          b,
          'b-laptop',
          card
            ? {
                view: laptop,
                element: card,
                screen: 'laptop',
                at: { x: 0.42, y: 66 },
              }
            : null,
          [7, 8.1],
          [6.8, 8.9],
          {
            x: (box?.x ?? 0) + (box?.width ?? 0) * 0.85,
            y: (box?.y ?? 0) + (box?.height ?? 0) * 0.9,
          },
          () => (link ?? (card as HTMLElement | undefined))?.click(),
          'b-card',
        );
        cursorUsed = true;
      }
      if (phone) {
        const top = feedTop(phone);
        scroll(
          phone,
          Math.min(
            feedEnd(phone),
            lerp(top - 320, top + 2300, ease(progress(b, 0.8, 12.7))),
          ),
        );
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
      duration: DEMO_DURATION,
      ready: () =>
        (['today', 'a', 'b'] as const)
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
      if (elapsed >= DEMO_DURATION) {
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
  const today = local(t, 'today') ?? 0;
  const a = local(t, 'a') ?? 0;
  const b = local(t, 'b') ?? 0;
  const compare = local(t, 'compare') ?? 0;
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
          <Eyebrow style={rise(title, 0.35)}>
            Design exploration · Post page
          </Eyebrow>
          <h1
            className="font-bold"
            style={{
              fontSize: 88,
              lineHeight: 1.04,
              maxWidth: 1300,
              ...rise(title, 0.5),
            }}
          >
            What if the post page kept going?
          </h1>
          <p
            className="text-text-secondary"
            style={{ fontSize: 32, ...rise(title, 0.8) }}
          >
            Two ideas for a feed under the post. Have a look, then tell us which
            one you’d build.
          </p>
        </div>
      </Layer>

      {[
        {
          id: 'today' as const,
          variant: 'none' as const,
          s: today,
          eyebrow: 'Today',
          title: 'The post page ends at the comments',
          lines: [
            [
              0,
              'Read it, scroll through the discussion, and the page is over.',
            ],
          ] as [number, string][],
        },
        {
          id: 'a' as const,
          variant: 'list' as const,
          s: a,
          eyebrow: 'Idea A',
          title: 'Keep reading',
          lines: [
            [0, 'The feed’s list cards continue right under the comments.'],
            [
              4.3,
              'Chips steer it: the post’s topics, or more from the same source.',
            ],
          ] as [number, string][],
        },
        {
          id: 'b' as const,
          variant: 'grid' as const,
          s: b,
          eyebrow: 'Idea B',
          title: 'Your feed continues',
          lines: [
            [
              0,
              'Finish the post and the page becomes your feed, same cards as home.',
            ],
            [
              6.8,
              'Open any card and it loads right here, with a new feed under it.',
            ],
          ] as [number, string][],
        },
      ].map((scene) => (
        <Layer key={scene.id} opacity={sceneOpacity(t, scene.id)}>
          <Caption
            s={scene.s}
            eyebrow={scene.eyebrow}
            title={scene.title}
            lines={scene.lines}
          />
          <div className="absolute" style={{ left: 178, top: deviceTop }}>
            {mounted(t, scene.id) && (
              <DeviceRow
                id={scene.id}
                variant={scene.variant}
                register={register}
              />
            )}
          </div>
          <Footer current={scene.id} />
        </Layer>
      ))}

      <Layer opacity={sceneOpacity(t, 'compare')}>
        <div
          className="flex size-full flex-col justify-center gap-12"
          style={{ padding: '0 178px' }}
        >
          <div className="flex flex-col gap-3">
            <Eyebrow style={rise(compare, 0.1)}>Two directions</Eyebrow>
            <h2
              className="font-bold"
              style={{ fontSize: 64, ...rise(compare, 0.2) }}
            >
              Same goal, different bet
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-10">
            {[
              {
                letter: 'A',
                name: 'Keep reading',
                lines: [
                  'A list, like the feed on your phone',
                  'Chips for the post’s topics and its source',
                  'Feels like: more of what I just read',
                ],
              },
              {
                letter: 'B',
                name: 'Your feed continues',
                lines: [
                  'The whole feed, edge to edge',
                  'The same cards as the home feed',
                  'Feels like: back in my feed, no click needed',
                ],
              },
            ].map((idea, index) => (
              <div
                key={idea.letter}
                className="flex flex-col gap-6 rounded-24 border border-border-subtlest-tertiary bg-background-subtle"
                style={{ padding: 44, ...rise(compare, 0.45 + index * 0.2) }}
              >
                <div className="flex items-center gap-5">
                  <span
                    className="flex items-center justify-center rounded-16 font-bold"
                    style={{
                      width: 72,
                      height: 72,
                      fontSize: 40,
                      background: accent,
                      color: '#fff',
                    }}
                  >
                    {idea.letter}
                  </span>
                  <span className="font-bold" style={{ fontSize: 44 }}>
                    {idea.name}
                  </span>
                </div>
                <ul
                  className="flex flex-col gap-4 text-text-secondary"
                  style={{ fontSize: 28 }}
                >
                  {idea.lines.map((line) => (
                    <li key={line} className="flex gap-4">
                      <span style={{ color: accent }}>●</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Layer>

      <Layer opacity={sceneOpacity(t, 'ask')}>
        <div className="flex size-full flex-col items-center justify-center gap-8 text-center">
          <Eyebrow style={rise(ask, 0.1)}>Your turn</Eyebrow>
          <h2
            className="font-bold"
            style={{ fontSize: 84, lineHeight: 1.05, ...rise(ask, 0.25) }}
          >
            Which one would you build?
          </h2>
          <p
            className="text-text-secondary"
            style={{ fontSize: 32, maxWidth: 1200, ...rise(ask, 0.5) }}
          >
            Reply with A or B, and what you’d change. A better third idea is
            welcome too.
          </p>
          <p
            className="text-text-tertiary"
            style={{ fontSize: 22, ...rise(ask, 0.8) }}
          >
            Built on the real post page and real daily.dev posts. Three more
            variations are in the exploration.
          </p>
        </div>
      </Layer>

      <Cursor ref={cursor} />
    </div>
  );
};

/** The stage scaled to the window, replaying from the top when it ends. */
export const DemoVideo = (): ReactElement => {
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
