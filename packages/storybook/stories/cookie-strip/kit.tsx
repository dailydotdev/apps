import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { DailyIcon } from '@dailydotdev/shared/src/components/icons/DailyIcon';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { PhoneIcon } from '@dailydotdev/shared/src/components/icons/Phone';
import { HomeIcon } from '@dailydotdev/shared/src/components/icons/Home';
import { CompassIcon } from '@dailydotdev/shared/src/components/icons/Compass';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons/Hashtag';
import { DiscussIcon } from '@dailydotdev/shared/src/components/icons/Discuss';
import { watchIubendaBanner } from '../../../webapp/components/iubendaBanner';
import { RealCard, realPosts } from '../experiments/cardActions/swap';
import { GEOMETRY, columnsForViewport } from '../experiments/cardActions/shell';
import '../../../webapp/styles/iubenda.css';
import './cookieStrip.css';

export { realPosts };

/* ------------------------------------------------------------------------ */
/* Cookie copy                                                               */
/* ------------------------------------------------------------------------ */

export type CookieCopy = 'short' | 'tcf';

/** The English body configured in components/Iubenda.tsx. */
const SHORT_BODY =
  'This site uses cookies to improve your experience. By continuing to use our site, you accept our use of cookies, Privacy Policy, and Terms of Service.';

/**
 * Stand-in for the TCF-mandated text iubenda appends in the EU: roughly the
 * same length and shape (two paragraphs and a policy link), so the real
 * show-more clamp from iubendaBanner.ts has something to clamp.
 */
const TCF_BODY = [
  'We and selected third parties collect personal information and use cookies or similar technologies for technical purposes and, with your consent, for experience, measurement and marketing purposes, including personalized ads, as described in the',
  'With respect to advertising, we and selected partners may use precise geolocation data and identification through device scanning to store and access information on a device and process personal data like usage data. You can give, deny, or withdraw your consent at any time from the preferences panel.',
];

/* ------------------------------------------------------------------------ */
/* Devices                                                                   */
/* ------------------------------------------------------------------------ */

export interface Device {
  name: string;
  width: number;
  height: number;
  note?: string;
}

/**
 * The strip is gated to laptop (1,020px) and up, so these are the widths it
 * actually renders at, smallest first. 1366×768 is still the most common
 * laptop panel; 1536×864 is a 1920 panel at 125% Windows scaling.
 */
export const DEVICES: Device[] = [
  { name: 'Small laptop', width: 1024, height: 768, note: 'strip breakpoint' },
  { name: 'Laptop', width: 1280, height: 800 },
  { name: 'Common laptop', width: 1366, height: 768, note: 'most common' },
  { name: 'MacBook Air', width: 1440, height: 900 },
  { name: 'Windows 125%', width: 1536, height: 864 },
  { name: 'MacBook Pro 16', width: 1728, height: 1117 },
  { name: 'Full HD', width: 1920, height: 1080 },
  { name: 'QHD', width: 2560, height: 1440 },
];

export const BELOW_STRIP_DEVICES: Device[] = [
  { name: 'Tablet', width: 834, height: 1112, note: 'no strip' },
  { name: 'Phone', width: 390, height: 844, note: 'no strip' },
];

/* ------------------------------------------------------------------------ */
/* Backdrop: the logged-out Explore page                                     */
/* ------------------------------------------------------------------------ */

const RailIcon = ({ icon }: { icon: ReactElement }) => (
  <span className="flex h-9 w-9 items-center justify-center text-text-tertiary">
    {React.cloneElement(icon, { size: IconSize.Small })}
  </span>
);

const TABS = ['Popular', 'By upvotes', 'By comments', 'By date', 'Best of'];

/**
 * Drawn chrome (header, collapsed rail, Explore tabs) around production grid
 * cards from the live-feed snapshot, at the geometry production uses.
 */
export const LoggedOutExplore = ({
  width,
}: {
  width: number;
}): ReactElement => {
  const laptop = width >= 1020;
  const cols = columnsForViewport(width, 'closed');
  const posts = realPosts.slice(0, laptop ? cols * 3 : 6);

  return (
    <div className="min-h-screen bg-background-default">
      <header className="sticky top-0 z-3 flex h-16 items-center gap-4 border-b border-border-subtlest-tertiary bg-background-default px-4">
        <span className="flex items-center gap-1 font-bold text-text-primary typo-title3">
          <DailyIcon className="h-8 w-8" />
          {laptop && 'daily.dev'}
        </span>
        {laptop && (
          <div className="ml-6 flex h-10 w-full max-w-[25rem] items-center gap-2 rounded-12 bg-surface-float px-3 text-text-quaternary typo-callout">
            <SearchIcon size={IconSize.Small} />
            Search
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          {laptop && (
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Float}
              icon={<PhoneIcon />}
            >
              Get the app
            </Button>
          )}
          <Button size={ButtonSize.Small} variant={ButtonVariant.Secondary}>
            Log in
          </Button>
          <Button size={ButtonSize.Small} variant={ButtonVariant.Primary}>
            Sign up
          </Button>
        </div>
      </header>
      <div className="flex">
        {laptop && (
          <aside
            className="sticky top-16 flex shrink-0 flex-col items-center gap-1 border-r border-border-subtlest-tertiary py-2"
            style={{
              width: GEOMETRY.sidebarClosed,
              height: 'calc(100vh - 4rem)',
            }}
          >
            <RailIcon icon={<HomeIcon />} />
            <RailIcon icon={<CompassIcon />} />
            <RailIcon icon={<SquadIcon />} />
            <RailIcon icon={<DiscussIcon />} />
            <RailIcon icon={<HashtagIcon />} />
            <RailIcon icon={<BookmarkIcon />} />
          </aside>
        )}
        <main className="min-w-0 flex-1 px-4 pb-16 pt-6 laptop:px-10">
          <p className="mb-4 flex items-center gap-2 font-bold text-text-primary typo-callout">
            <HomeIcon size={IconSize.XSmall} className="text-text-tertiary" />/
            Explore
          </p>
          <div className="mb-6 flex gap-1">
            {TABS.map((tab, i) => (
              <span
                key={tab}
                className={classNames(
                  'rounded-10 px-3 py-1.5 font-bold typo-callout',
                  i === 0
                    ? 'bg-surface-float text-text-primary'
                    : 'text-text-tertiary',
                )}
              >
                {tab}
              </span>
            ))}
          </div>
          {laptop ? (
            <div
              className="grid"
              style={{
                gap: GEOMETRY.gap,
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              }}
            >
              {posts.map((post) => (
                <RealCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              {posts.map((post) => (
                <RealCard key={post.id} post={post} list />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------------ */
/* Cookie card: iubenda's first-layer DOM, styled by the production CSS      */
/* ------------------------------------------------------------------------ */

export const publishHeight = (name: string, el: HTMLElement | null) => {
  if (!el) {
    return () => undefined;
  }
  const root = document.documentElement;
  const observer = new ResizeObserver(() =>
    root.style.setProperty(name, `${el.offsetHeight}px`),
  );
  observer.observe(el);
  return () => {
    observer.disconnect();
    root.style.removeProperty(name);
  };
};

/**
 * Same markup iubenda renders, so `webapp/styles/iubenda.css` and the real
 * show-more enhancer from `iubendaBanner.ts` apply unchanged. Any answer
 * (Accept, Reject, ×) removes it, as iubenda does.
 */
export const CookieCard = ({
  copy,
  onAnswer,
}: {
  copy: CookieCopy;
  onAnswer: () => void;
}): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dd-consent-open');
    const stopWatching = watchIubendaBanner();
    const stopPublishing = publishHeight('--dd-cookie-h', ref.current);
    return () => {
      root.classList.remove('dd-consent-open');
      stopWatching();
      stopPublishing();
    };
  }, []);

  return (
    <div id="iubenda-cs-banner" ref={ref} className="iubenda-cs-visible">
      <div className="iubenda-cs-container">
        <div className="iubenda-cs-content">
          <div className="iubenda-cs-rationale">
            <div className="iubenda-banner-content">
              <h2 id="iubenda-cs-title">We value your privacy</h2>
              <div id="iubenda-cs-paragraph">
                {copy === 'short' ? (
                  SHORT_BODY
                ) : (
                  <>
                    {TCF_BODY[0]}{' '}
                    <a
                      href="#cookie-policy"
                      className="iubenda-cs-cookie-policy-lnk"
                    >
                      cookie policy
                    </a>
                    .<br />
                    {TCF_BODY[1]}
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              className="iubenda-cs-close-btn"
              onClick={onAnswer}
            >
              <span>×</span>
            </button>
            <div className="iubenda-cs-counter" />
            <div className="iubenda-cs-opt-group">
              <div className="iubenda-cs-opt-group-custom">
                <button type="button" className="iubenda-cs-customize-btn">
                  Customize
                </button>
                <button
                  type="button"
                  className="iubenda-cs-reject-btn"
                  onClick={onAnswer}
                >
                  Reject
                </button>
              </div>
              <div className="iubenda-cs-opt-group-consent">
                <button
                  type="button"
                  className="iubenda-cs-accept-btn"
                  onClick={onAnswer}
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
