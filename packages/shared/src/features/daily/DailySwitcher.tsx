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
import { isExtension } from '../../lib/func';
import { useDailyPage } from '../../hooks/feed/useDailyPage';

interface DailySwitcherProps {
  className?: string;
  compact?: boolean;
  reverse?: boolean;
  onFeedClick?: () => void;
}

const TAB_DAILY = `${webappUrl}daily`;

export const DailySwitcher = ({
  className,
  compact = false,
  reverse = false,
  onFeedClick,
}: DailySwitcherProps): ReactElement => {
  const router = useRouter();
  const { isDailyDefault, isDailyAsDefault, setShowDaily } = useDailyPage();
  const path = router?.pathname ?? '';
  const isDaily = path === TAB_DAILY || isDailyAsDefault;

  const handleDaily = (event: React.MouseEvent) => {
    if (isDailyDefault && isExtension) {
      event.preventDefault();
      setShowDaily(true);
    }
  };

  const handleFeed = (event: React.MouseEvent) => {
    if (isDailyDefault) {
      if (isExtension) {
        event.preventDefault();
      }
      setShowDaily(false);
      return;
    }

    if (onFeedClick) {
      event.preventDefault();
      onFeedClick();
    }
  };

  const tabClass = compact
    ? 'inline-flex items-center gap-1.5 rounded-8 px-2 py-1 transition-colors'
    : 'inline-flex items-center gap-2 rounded-10 px-3 py-1.5 transition-colors';

  const dailyTab = (
    <Link key="daily" href={TAB_DAILY} passHref>
      <a
        href={TAB_DAILY}
        aria-current={isDaily ? 'page' : undefined}
        onClick={handleDaily}
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
    <Link key="feed" href={webappUrl} passHref>
      <a
        href={webappUrl}
        aria-current={!isDaily ? 'page' : undefined}
        onClick={handleFeed}
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
