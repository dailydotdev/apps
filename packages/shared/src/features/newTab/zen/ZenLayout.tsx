import type { ReactElement, ReactNode } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useZenModules } from '../store/zenModules.store';
import { ZenClock } from './ZenClock';
import { ZenGreeting } from './ZenGreeting';
import { ZenIntention } from './ZenIntention';
import { ZenTodos } from './ZenTodos';
import { ZenMustReads } from './ZenMustReads';
import { ZenQuote } from './ZenQuote';
import { ZenBackground } from './ZenBackground';
import { ZenWeather } from './ZenWeather';
import { ZenTodayStrip } from './ZenTodayStrip';

interface ZenLayoutProps {
  className?: string;
  // Shortcuts row is injected by the extension since it owns the top-sites
  // permission flow. In the webapp we'll render nothing.
  shortcuts?: ReactNode;
}

// Zen is a single-column, generously spaced homepage. Modules are opt-in via
// `useZenModules`; the infinite feed is intentionally absent. The must-reads
// card has an explicit "Open full feed" escape hatch.
export const ZenLayout = ({
  className,
  shortcuts,
}: ZenLayoutProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { toggles } = useZenModules();
  // Wallpaper used to be flag-gated but we want new-tab modes to produce an
  // obviously different experience the moment a user picks Zen. The toggle
  // still lives in the sidebar for anyone who prefers a flat background.
  const showWallpaper = toggles.wallpaper;

  useEffect(() => {
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.CustomizeNewTab,
      extra: JSON.stringify({
        feature_name: 'zen_layout',
        modules: Object.entries(toggles)
          .filter(([, enabled]) => enabled)
          .map(([name]) => name),
        wallpaper: showWallpaper,
      }),
    });
    // Only log on mount; toggles themselves have their own analytics events.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logEvent]);

  return (
    <>
      {showWallpaper ? <ZenBackground /> : null}
      <main
        aria-label="Zen homepage"
        className={classNames(
          'mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 pb-16 pt-10 tablet:pt-16',
          className,
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <ZenClock />
          <ZenGreeting />
          {toggles.weather ? <ZenWeather className="mt-1" /> : null}
        </div>

        <ZenTodayStrip />

        {toggles.quote ? <ZenQuote /> : null}

        {toggles.intention ? <ZenIntention /> : null}

        {toggles.todos ? <ZenTodos /> : null}

        {toggles.shortcuts && shortcuts ? (
          <div className="w-full max-w-4xl">{shortcuts}</div>
        ) : null}

        {toggles.mustReads ? <ZenMustReads /> : null}
      </main>
    </>
  );
};
