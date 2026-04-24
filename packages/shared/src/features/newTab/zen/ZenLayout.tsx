import type { ReactElement, ReactNode } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useZenModules } from '../store/zenModules.store';
import { ZenAmbientStrip } from './ZenAmbientStrip';
import { ZenIntention } from './ZenIntention';
import { ZenTodos } from './ZenTodos';
import { ZenBriefing } from './ZenBriefing';
import { ZenQuote } from './ZenQuote';
import { ZenBackground } from './ZenBackground';

interface ZenLayoutProps {
  className?: string;
  // Shortcuts row is injected by the extension since it owns the top-sites
  // permission flow. In the webapp we'll render nothing.
  shortcuts?: ReactNode;
}

// Zen is daily.dev's content-first "calm mode": the briefing is the star,
// ambient widgets (clock, greeting, weather) shrink into a single strip at
// the top, and personal productivity tools (intention, todos) move to a
// compact accent row below so they never compete with the feed for attention.
// This is the key product guardrail: Zen must always show the feed, because
// staying up to date is daily.dev's core value and ads are its business.
export const ZenLayout = ({
  className,
  shortcuts,
}: ZenLayoutProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { toggles } = useZenModules();
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
    // Only log on mount; toggles have their own analytics.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logEvent]);

  const hasAccents = toggles.intention || toggles.todos || toggles.quote;

  return (
    <>
      {showWallpaper ? <ZenBackground /> : null}
      <main
        aria-label="Zen homepage"
        className={classNames(
          'mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 pb-16 pt-8 tablet:pt-10',
          className,
        )}
      >
        <ZenAmbientStrip />

        {toggles.mustReads ? <ZenBriefing /> : null}

        {hasAccents ? (
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
            {toggles.intention ? <ZenIntention /> : null}
            {toggles.todos ? <ZenTodos /> : null}
            {toggles.quote ? <ZenQuote /> : null}
          </div>
        ) : null}

        {toggles.shortcuts && shortcuts ? (
          <div className="w-full">{shortcuts}</div>
        ) : null}
      </main>
    </>
  );
};
