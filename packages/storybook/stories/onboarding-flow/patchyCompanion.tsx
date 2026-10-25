import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

// Exploration: Patchy keeps the user company through the onboarding steps,
// no popups. He sits at the edge of the screen, watches what the step is
// doing and changes his expression. Drawn over the production steps, read
// from their DOM, so no step component changes until a direction is picked.

export type CompanionPlacement = 'none' | 'perch' | 'peek' | 'side';

export const companionPlacements: Array<{
  id: Exclude<CompanionPlacement, 'none'>;
  label: string;
  note: string;
}> = [
  {
    id: 'perch',
    label: 'A. Perched on the content',
    note: 'He peeks over the top edge of the first field or option, right beside what you’re about to touch.',
  },
  {
    id: 'peek',
    label: 'B. Peeking over the button',
    note: 'He leans on the top of the bottom button bar, watching the list from below.',
  },
  {
    id: 'side',
    label: 'C. Following from the side',
    note: 'He peeks in from the right edge, level with whatever you last touched, and moves with you.',
  },
];

type Mood = 'curious' | 'reading' | 'happy' | 'excited';

// Agent Smith's art, one expression per mood.
const peek: Record<Mood, string> = {
  curious: new URL('./assets/peek-curious.webp', import.meta.url).href,
  reading: new URL('./assets/peek-reading.webp', import.meta.url).href,
  happy: new URL('./assets/peek-happy.webp', import.meta.url).href,
  excited: new URL('./assets/peek-excited.webp', import.meta.url).href,
};
const sideCurious = new URL('./assets/side-curious.webp', import.meta.url)
  .href;
const sideHappy = new URL('./assets/side-happy.webp', import.meta.url).href;

const art: Record<'peek' | 'side', Record<Mood, string>> = {
  peek,
  side: {
    curious: sideCurious,
    reading: sideCurious,
    happy: sideHappy,
    excited: sideHappy,
  },
};

// Tag chips mark a pick only by their primary style, not an ARIA state.
const SELECTED =
  '[aria-checked="true"], [aria-pressed="true"], [data-funnel-track="feed tag"].btn-primary-cabbage';
const CHOICES =
  '[role="checkbox"], [role="radio"], [aria-pressed], [data-funnel-track="feed tag"], input';
const CTA = '[data-funnel-track="step cta"]';

interface Watch {
  mood: Mood;
  /** The element he looks at: the last one touched, else the first choice. */
  focus?: DOMRect;
  firstChoice?: DOMRect;
  cta?: DOMRect;
}

/** What the step is doing, read every frame. */
const useWatch = (): Watch => {
  const [watch, setWatch] = useState<Watch>({ mood: 'curious' });
  const lastTouched = useRef<Element | null>(null);
  const cheerUntil = useRef(0);
  const lastSelected = useRef(0);

  useEffect(() => {
    const onDown = (event: PointerEvent) => {
      const target = (event.target as Element)?.closest?.(CHOICES);
      if (target) {
        lastTouched.current = target;
      }
    };
    const onFocus = (event: FocusEvent) => {
      if ((event.target as Element)?.matches?.('input, textarea')) {
        lastTouched.current = event.target as Element;
      }
    };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('focusin', onFocus, true);

    let frame = 0;
    const read = () => {
      const root = document.querySelector('#storybook-root');
      const selected = root?.querySelectorAll(SELECTED).length ?? 0;
      const now = performance.now();
      if (selected > lastSelected.current) {
        cheerUntil.current = now + 1400;
      }
      lastSelected.current = selected;
      const active = document.activeElement;
      const isTyping = !!active?.matches?.('input, textarea');
      const filled = [
        ...(root?.querySelectorAll<HTMLInputElement>('input[type="text"], input[type="email"], input:not([type])') ?? []),
      ].filter((input) => input.value).length;

      let mood: Mood = 'curious';
      if (now < cheerUntil.current) {
        mood = 'excited';
      } else if (isTyping) {
        mood = 'reading';
      } else if (selected > 0 || filled >= 3) {
        mood = 'happy';
      }

      const first = root?.querySelector(CHOICES);
      const touched =
        lastTouched.current && root?.contains(lastTouched.current)
          ? lastTouched.current
          : first;
      setWatch({
        mood,
        focus: touched?.getBoundingClientRect(),
        firstChoice: first?.getBoundingClientRect(),
        cta: document.querySelector(CTA)?.getBoundingClientRect(),
      });
      frame = window.requestAnimationFrame(read);
    };
    frame = window.requestAnimationFrame(read);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('focusin', onFocus, true);
    };
  }, []);

  return watch;
};

/** Cross-fades between moods so an expression change reads as a reaction. */
const Face = ({
  set,
  mood,
  size,
}: {
  set: 'peek' | 'side';
  mood: Mood;
  size: number;
}): ReactElement => {
  return (
    <span className="relative block" style={{ width: size, height: size }}>
      {(Object.keys(art[set]) as Mood[]).map((key) => {
        const src = art[set][key];
        return (
          <img
            key={key}
            aria-hidden
            alt=""
            src={src}
            className={classNames(
              'absolute inset-0 size-full object-contain transition-[opacity,transform] duration-300',
              set === 'peek' ? 'object-bottom' : 'object-right',
              key === mood ? 'opacity-100' : 'opacity-0',
              key === mood && key === 'excited' && 'scale-110',
            )}
            style={{ transformOrigin: set === 'peek' ? '50% 100%' : '100% 50%' }}
          />
        );
      })}
    </span>
  );
};

const Companion = ({
  placement,
}: {
  placement: Exclude<CompanionPlacement, 'none'>;
}): ReactElement | null => {
  const watch = useWatch();

  if (placement === 'perch' && watch.firstChoice) {
    const size = 60;
    return (
      <span
        className="pointer-events-none fixed z-1"
        style={{
          left: watch.firstChoice.right - size - 16,
          top: watch.firstChoice.top - size + 4,
        }}
      >
        <Face set="peek" mood={watch.mood} size={size} />
      </span>
    );
  }

  if (placement === 'peek' && watch.cta) {
    const size = 88;
    return (
      <span
        className="pointer-events-none fixed z-3"
        style={{ left: watch.cta.right - size - 4, top: watch.cta.top - size + 10 }}
      >
        <Face set="peek" mood={watch.mood} size={size} />
      </span>
    );
  }

  if (placement === 'side' && watch.focus) {
    const size = 64;
    return (
      <span
        className="pointer-events-none fixed right-0 z-3 transition-[top] duration-500 ease-out"
        style={{ top: watch.focus.top + watch.focus.height / 2 - size / 2 }}
      >
        <Face set="side" mood={watch.mood} size={size} />
      </span>
    );
  }

  return null;
};

export const PatchyCompanion = ({
  placement,
}: {
  placement: CompanionPlacement;
}): ReactElement | null =>
  placement === 'none' ? null : <Companion placement={placement} />;
