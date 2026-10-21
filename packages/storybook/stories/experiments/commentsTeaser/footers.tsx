import type { CSSProperties, ReactElement, RefObject } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { MobileAppFooter } from '@dailydotdev/shared/src/features/getApp/components/MobileAppFooter';
import { mobileAppFooterHeight } from '@dailydotdev/shared/src/features/getApp/mobileAppFooter';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { cloudinaryCharmNoComments } from '@dailydotdev/shared/src/lib/image';

/* ------------------------------------------------------------- reveal */

// X's reveal rule for its logged-out footer, read from x.com's
// logged-out-open-app-banner module (21 Oct 2026). The footer is not there
// on load; it appears on whichever comes first:
//   - the reader has scrolled one full screen (scrollY >= innerHeight),
//   - the reader is within 168px of the bottom of the page,
//   - the page barely scrolls (<= 168px of scroll) and 1.5s have passed,
//   - 5s have passed, whatever the reader did.
export const REVEAL_FALLBACK_MS = 5000;
export const REVEAL_SHORT_PAGE_MS = 1500;
export const REVEAL_BOTTOM_PX = 168;

/** How the footer arrives: X's rule, or production's (on load). */
export type Reveal = 'x' | 'onLoad';

/**
 * X's reveal, run in the window the marker renders in (a Device's frame
 * here), so its scroll and size are the page's, not Storybook's.
 */
export const useReveal = (
  reveal: Reveal,
): [RefObject<HTMLSpanElement>, boolean] => {
  const marker = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(reveal === 'onLoad');

  useEffect(() => {
    if (reveal === 'onLoad') {
      setShown(true);
      return undefined;
    }
    setShown(false);
    const view = marker.current?.ownerDocument.defaultView;
    if (!view) {
      return undefined;
    }
    const doc = view.document;
    let shortTimer: number | undefined;
    let shortPageWaited = false;
    let shortPageArmed = false;
    const stop = () => {
      view.clearTimeout(shortTimer);
      view.clearTimeout(fallback);
      view.removeEventListener('scroll', check);
      view.removeEventListener('resize', check);
    };
    const show = () => {
      stop();
      setShown(true);
    };
    function check() {
      const { scrollHeight } = doc.documentElement;
      const { innerHeight, scrollY } = view!;
      if (scrollHeight - innerHeight <= REVEAL_BOTTOM_PX) {
        if (shortPageWaited) {
          show();
          return;
        }
        if (!shortPageArmed) {
          shortPageArmed = true;
          shortTimer = view!.setTimeout(() => {
            shortPageWaited = true;
            check();
          }, REVEAL_SHORT_PAGE_MS);
        }
        return;
      }
      const scrolledAScreen = scrollY >= innerHeight;
      const nearBottom =
        scrollY + innerHeight >= scrollHeight - REVEAL_BOTTOM_PX;
      if (scrolledAScreen || nearBottom) {
        show();
      }
    }
    view.addEventListener('scroll', check, { passive: true });
    view.addEventListener('resize', check);
    const fallback = view.setTimeout(show, REVEAL_FALLBACK_MS);
    check();
    return stop;
  }, [reveal]);

  return [marker, shown];
};

/* ---------------------------------------------------------- entrance */

// X's entrance, keyframe for keyframe: the fade unfurls up from the bottom
// (700ms), the heading rises out of a blur (600ms, +180ms), the button
// springs up (650ms, +320ms). Reduced motion: everything only fades.
const entranceCss = `
@keyframes sb-unfurl-y { from { opacity: 0; transform: scaleY(0.72) } to { opacity: 1; transform: none } }
@keyframes sb-blur-rise { from { opacity: 0; transform: translateY(24px); filter: blur(6px) } to { opacity: 1; transform: none; filter: none } }
@keyframes sb-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes sb-rise { from { transform: translateY(40px) scale(0.97) } to { transform: none } }
.sb-unfurl-y { animation: sb-unfurl-y 700ms cubic-bezier(0.16, 1, 0.3, 1) both; transform-origin: bottom }
.sb-blur-rise { animation: sb-blur-rise 600ms cubic-bezier(0.16, 1, 0.3, 1) 180ms both }
.sb-rise { animation: sb-fade 390ms ease-out 320ms both, sb-rise 650ms cubic-bezier(0.34, 1.4, 0.64, 1) 320ms both }
.sb-enter-fade { animation: sb-fade 300ms ease both }
@media (prefers-reduced-motion: reduce) {
  .sb-unfurl-y, .sb-blur-rise, .sb-rise { animation: sb-fade 300ms ease both }
}
`;

// X: from the page colour at 52%, 45% of it at 84%, clear at the top,
// starting 72px above the footer.
const fadeStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(to top, var(--theme-background-default) 52%, color-mix(in srgb, var(--theme-background-default) 45%, transparent) 84%, transparent 100%)',
};

/* ------------------------------------------------------------- phone */

/**
 * The phone footer that won mobile_app_footer (app usage +167%), the real
 * component, mounted the way FooterWrapper mounts it. Only its title
 * changes on a post page ("See all posts" today), and with X's reveal it
 * mounts once the reader has read a little, so its own charm animation
 * plays as it arrives.
 */
export const PhoneFooter = ({
  title,
  reveal,
}: {
  title: string;
  reveal: Reveal;
}): ReactElement => {
  const [marker, shown] = useReveal(reveal);
  return (
    <>
      <span ref={marker} hidden />
      {shown && (
        <div className="pointer-events-none fixed !bottom-0 left-0 z-3 w-full">
          <style>{entranceCss}</style>
          <div className="sb-enter-fade pointer-events-auto">
            <MobileAppFooter title={title} />
          </div>
        </div>
      )}
    </>
  );
};

/** The page spacer FooterNavBarLayout keeps under the phone footer. */
export const PhoneFooterSpacer = (): ReactElement => (
  <div aria-hidden className={mobileAppFooterHeight} />
);

/* ----------------------------------------------------------- desktop */

/**
 * X's desktop footer in daily.dev's parts: centred heading, one full-width
 * button, X's fade behind both. No "Log in" beside it: X's single button
 * opens the log-in flow, which offers sign-up too, so one button covers
 * both. Ours opens daily.dev's auth modal, which does the same.
 *
 * The charm is the phone footer's, markup and animations unchanged: it
 * peeks over the button's right end from behind it, presses it, and the
 * button answers. The heading stays centred; the charm sits outside the
 * text's run, at the row's right edge.
 */
export const XFooterCard = ({
  title,
  cta,
  onContinue,
  animate = true,
}: {
  title: string;
  cta: string;
  onContinue: () => void;
  animate?: boolean;
}): ReactElement => (
  <div className="relative flex flex-col items-center px-6 pb-6 pt-3 text-center">
    <style>{entranceCss}</style>
    <div
      aria-hidden
      className={classNames(
        'pointer-events-none absolute inset-x-0 -top-[4.5rem] bottom-0 -z-1',
        animate && 'sb-unfurl-y',
      )}
      style={fadeStyle}
    />
    <div className="relative flex h-14 w-full items-end justify-center">
      <h2
        className={classNames(
          'max-w-[calc(100%-13.25rem)] pb-3 font-bold tracking-[-0.01em] text-balance typo-title3',
          animate && 'sb-blur-rise',
        )}
      >
        {title}
      </h2>
      {/* MobileAppFooter's charm, as is. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-2 -right-3 h-[3.625rem] w-[6.625rem] overflow-hidden"
      >
        <div className="animate-charm-rise absolute inset-0">
          <div className="animate-charm-press absolute inset-0">
            <img
              src={cloudinaryCharmNoComments}
              alt=""
              className="absolute -top-2.5 left-0 size-[6.625rem] max-w-none"
            />
          </div>
        </div>
      </div>
      <span className="animate-charm-ripple pointer-events-none absolute -bottom-2.5 right-[2.75rem] z-2 size-5 rounded-max bg-accent-cabbage-default opacity-0 blur-sm" />
    </div>
    <div className={classNames('relative z-1 w-full', animate && 'sb-rise')}>
      <div className="animate-charm-button-press">
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.XLarge}
          className="w-full"
          onClick={onContinue}
        >
          {cta}
        </Button>
      </div>
    </div>
  </div>
);

/**
 * The laptop footer: XFooterCard pinned to the bottom of the window at the
 * post column's width, like X pins its own to the centre column, with X's
 * reveal. Reads the column from the comment slot, so it follows the page's
 * real layout.
 */
export const DesktopColumnFooter = ({
  title,
  reveal,
  onContinue,
}: {
  title: string;
  reveal: Reveal;
  onContinue: () => void;
}): ReactElement => {
  const [marker, shown] = useReveal(reveal);
  const [box, setBox] = useState<{ left: number; width: number }>();

  useEffect(() => {
    const doc = marker.current?.ownerDocument;
    const view = doc?.defaultView;
    if (!doc || !view) {
      return undefined;
    }
    const measure = () => {
      const slot = doc.querySelector('[data-teaser-slot]');
      const rect = slot?.getBoundingClientRect();
      if (rect && rect.width) {
        setBox({ left: rect.left, width: rect.width });
      }
    };
    const timer = view.setInterval(measure, 400);
    view.addEventListener('resize', measure);
    measure();
    return () => {
      view.clearInterval(timer);
      view.removeEventListener('resize', measure);
    };
  }, [marker]);

  return (
    <>
      <span ref={marker} hidden />
      {shown && box && (
        <aside
          className="fixed bottom-0 z-3"
          style={{ left: box.left, width: box.width }}
        >
          <XFooterCard
            title={title}
            cta="Continue to daily.dev"
            onContinue={onContinue}
          />
        </aside>
      )}
    </>
  );
};
