import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { isExtension } from '../../lib/func';
import { useLogContext } from '../../contexts/LogContext';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { getFeedName } from '../../lib/feed';
import { SharedFeedPage } from '../utilities/common';
import { LogEvent, TargetType } from '../../lib/log';

/**
 * Where the soft break is shown, logged as `target_id` on its impression and
 * click so each surface gets its own CTR.
 */
export enum StreakSoftBreakSurface {
  Popup = 'popup',
  Drawer = 'drawer',
  Sidebar = 'sidebar',
  RestoreModal = 'restore modal',
}

// Feeds where "Start again" only has to close the surface. The page comes
// from getFeedName, the same pathname-to-feed mapping the feed layout uses,
// so a renamed route can't silently fall out of a hand-kept list.
const mainFeedPages = new Set<string>([
  SharedFeedPage.MyFeed,
  SharedFeedPage.Popular,
  SharedFeedPage.Upvoted,
  SharedFeedPage.Custom,
]);

const isOnMainFeed = (pathname?: string): boolean =>
  !!pathname && mainFeedPages.has(getFeedName(pathname));

export const useStreakSoftBreakImpression = (
  surface: StreakSoftBreakSurface,
): void => {
  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_type: TargetType.StreakSoftBreak,
    target_id: surface,
  }));
};

interface StreakSoftBreakHeroProps {
  max: number;
  surface: StreakSoftBreakSurface;
  /** Closes the surface that hosts the hero (popover, drawer, panel). */
  onStartAgain?: () => void;
  className?: string;
}

/**
 * What a reset streak leads with instead of the 0: the reader's best and a way
 * back onto the feed. The popup and the sidebar panel both render it in place
 * of their big current count.
 */
export function StreakSoftBreakHero({
  max,
  surface,
  onStartAgain,
  className,
}: StreakSoftBreakHeroProps): ReactElement {
  const router = useRouter();
  const { logEvent } = useLogContext();

  useStreakSoftBreakImpression(surface);

  const onClick = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.StreakSoftBreak,
      target_id: surface,
    });
    onStartAgain?.();

    // The extension new tab is the feed, so never navigate away from it.
    if (isExtension || isOnMainFeed(router?.pathname)) {
      return;
    }

    router?.push('/');
  };

  return (
    <div className={classNames('flex flex-col items-start gap-1', className)}>
      <Typography
        type={TypographyType.Title3}
        color={TypographyColor.Primary}
        bold
        className="tabular-nums"
      >
        Your best: {max} days.
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Today can be day 1.
      </Typography>
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        className="mt-2"
        onClick={onClick}
      >
        Start again
      </Button>
    </div>
  );
}
