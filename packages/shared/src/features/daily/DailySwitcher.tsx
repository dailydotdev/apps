import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import Link from '../../components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { MagicIcon, HomeIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { webappUrl } from '../../lib/constants';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import {
  DailyPageVariant,
  featureDailyPage,
} from '../../lib/featureManagement';

interface DailySwitcherProps {
  className?: string;
  compact?: boolean;
  // Render "Your feed" first instead of "Daily" (e.g. when shown inside the
  // feed nav strip where the feed is the current surface).
  reverse?: boolean;
  onFeedClick?: () => void;
  onDailyClick?: () => void;
  dailyActive?: boolean;
}

const TAB_DAILY = `${webappUrl}daily`;

export const DailySwitcher = ({
  className,
  compact = false,
  reverse = false,
  onFeedClick,
  onDailyClick,
  dailyActive,
}: DailySwitcherProps): ReactElement => {
  const router = useRouter();
  const { isLoggedIn } = useAuthContext();
  const { value: dailyVariant } = useConditionalFeature({
    feature: featureDailyPage,
    shouldEvaluate: isLoggedIn,
  });
  const dailyAsDefault = dailyVariant === DailyPageVariant.DailyAsDefault;
  const path = router?.pathname ?? '';
  const feedHref = dailyAsDefault ? `${webappUrl}my-feed` : webappUrl;
  const dailyHref = dailyAsDefault ? webappUrl : TAB_DAILY;
  const isDaily =
    dailyActive ||
    (dailyAsDefault
      ? path === TAB_DAILY || path === webappUrl
      : path === TAB_DAILY);

  const tabClass = compact
    ? 'inline-flex items-center gap-1.5 rounded-8 px-2 py-1 transition-colors'
    : 'inline-flex items-center gap-2 rounded-10 px-3 py-1.5 transition-colors';

  const dailyTab = (
    <Link key="daily" href={dailyHref} passHref>
      <a
        href={dailyHref}
        aria-current={isDaily ? 'page' : undefined}
        onClick={
          onDailyClick
            ? (event) => {
                event.preventDefault();
                onDailyClick();
              }
            : undefined
        }
        className={classNames(
          tabClass,
          isDaily
            ? 'bg-surface-active text-text-primary'
            : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
        )}
      >
        <MagicIcon
          size={IconSize.XSmall}
          className={
            isDaily ? 'text-accent-cabbage-default' : 'text-text-secondary'
          }
          secondary={isDaily}
        />
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          bold
          color={isDaily ? TypographyColor.Primary : TypographyColor.Secondary}
        >
          Daily
        </Typography>
      </a>
    </Link>
  );

  const feedTab = (
    <Link key="feed" href={feedHref} passHref>
      <a
        href={feedHref}
        aria-current={!isDaily ? 'page' : undefined}
        onClick={
          onFeedClick
            ? (event) => {
                event.preventDefault();
                onFeedClick();
              }
            : undefined
        }
        className={classNames(
          tabClass,
          !isDaily
            ? 'bg-surface-active text-text-primary'
            : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
        )}
      >
        <HomeIcon
          size={IconSize.XSmall}
          secondary={!isDaily}
          className={!isDaily ? undefined : 'text-text-secondary'}
        />
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          bold
          color={!isDaily ? TypographyColor.Primary : TypographyColor.Secondary}
        >
          Your feed
        </Typography>
      </a>
    </Link>
  );

  return (
    <nav
      aria-label="Daily / feed switch"
      className={classNames(
        'inline-flex w-fit shrink-0 items-center border border-border-subtlest-tertiary bg-background-default',
        compact ? 'gap-0.5 rounded-10 p-0.5' : 'gap-1 rounded-12 p-1',
        className,
      )}
    >
      {reverse ? [feedTab, dailyTab] : [dailyTab, feedTab]}
    </nav>
  );
};
