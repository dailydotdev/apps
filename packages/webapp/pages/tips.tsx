import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import classNames from 'classnames';
import { LayoutHeader } from '@dailydotdev/shared/src/components/layout/common';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import { useIsPhone } from '@dailydotdev/shared/src/hooks/useViewSize';
import { ShellPage } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import {
  ResponsivePageContainer,
  pageBorders,
} from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, Origin, TargetType } from '@dailydotdev/shared/src/lib/log';
import type { FeedWidgetTip } from '@dailydotdev/shared/src/features/feedWidgets/tips';
import { getFeedWidgetTips } from '@dailydotdev/shared/src/features/feedWidgets/tips';
import { useFeedWidgets } from '@dailydotdev/shared/src/features/feedWidgets/useFeedWidgets';
import { readStoredFeedRail } from '@dailydotdev/shared/src/features/feedWidgets/storedRail';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import {
  feedWidgetTipAccent,
  feedWidgetTipWash,
} from '@dailydotdev/shared/src/styles/custom';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';
import { getPageSeoTitles } from '../components/layouts/utils';
import { defaultOpenGraph } from '../next-seo';

const pageTitle = 'daily.dev tips';
const seoTitles = getPageSeoTitles(pageTitle);
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'Tips to get more out of daily.dev: shape your feed, save posts for later, join Squads, keep your streak, and more.',
};

const TipItem = ({ tip }: { tip: FeedWidgetTip }): ReactElement => {
  const { logEvent } = useLogContext();
  const { icon: Icon } = tip;
  const accent = feedWidgetTipAccent(tip.tone);

  const item = (
    <a
      href={tip.href}
      {...(tip.isExternal && { target: '_blank', rel: 'noopener' })}
      onClick={() =>
        logEvent({
          event_name: LogEvent.ClickFeedWidgetTip,
          target_type: TargetType.FeedWidget,
          target_id: tip.id,
          extra: JSON.stringify({ origin: Origin.TipsPage }),
        })
      }
      className="focus-outline flex items-start gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 transition-colors hover:border-border-subtlest-secondary"
      style={{ backgroundImage: feedWidgetTipWash(tip.tone) }}
    >
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-12 text-white shadow-2"
        style={{ background: accent }}
      >
        <Icon secondary size={IconSize.Medium} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1 break-words">
        <span className="font-bold typo-caption1" style={{ color: accent }}>
          {tip.eyebrow}
        </span>
        <span className="min-w-0 font-bold text-text-primary typo-callout">
          {tip.title}
        </span>
        <span className="min-w-0 text-text-tertiary typo-footnote">
          {tip.description}
        </span>
      </span>
    </a>
  );

  return (
    <li>
      {tip.isExternal ? (
        item
      ) : (
        <Link href={tip.href} passHref>
          {item}
        </Link>
      )}
    </li>
  );
};

const RestoreTipsButton = (): ReactElement | null => {
  const { isReadOnly, setTipHidden } = useFeedWidgets();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();

  // A rail a newer build saved is not written here.
  if (isReadOnly) {
    return null;
  }

  return (
    <Button
      variant={ButtonVariant.Secondary}
      size={ButtonSize.Small}
      className="self-start"
      onClick={() =>
        setTipHidden(false).then((isSaved) => {
          if (!isSaved) {
            return;
          }
          logEvent({
            event_name: LogEvent.RestoreFeedWidgetTip,
            target_type: TargetType.FeedWidget,
            extra: JSON.stringify({ origin: Origin.TipsPage }),
          });
          displayToast('daily.dev tips are back in your feed');
        })
      }
    >
      Show tips in my feed
    </Button>
  );
};

/** Offered to a signed-in reader who removed the tips from their rail. */
const ShowTipsInFeed = (): ReactElement | null => {
  const { user } = useAuthContext();
  const { flags } = useSettingsContext();
  const isHidden = readStoredFeedRail(flags?.feedWidgets)?.tipsHidden === true;

  // The rail's hook only mounts for the readers who can use it.
  return user && isHidden ? <RestoreTipsButton /> : null;
};

function TipsPage(): ReactElement {
  const { isV2 } = useLayoutVariant();
  const isPhone = useIsPhone();

  return (
    <>
      {isV2 && <PageHeader title={pageTitle} />}
      {isPhone && <ShellPage title={pageTitle} />}
      <div className="mx-auto w-full max-w-[42.5rem]">
        {!isV2 && !isPhone && (
          <LayoutHeader
            className={classNames(
              '!mb-0 hidden gap-2 border-b px-4 tablet:flex',
              pageBorders,
            )}
          >
            <Typography
              tag={TypographyTag.H1}
              type={TypographyType.Title3}
              bold
              color={TypographyColor.Primary}
              className="flex-1"
            >
              {pageTitle}
            </Typography>
          </LayoutHeader>
        )}
        <ResponsivePageContainer className="!mx-0 !w-full !max-w-full gap-4 pb-10 pt-4 tablet:pt-6">
          <ShowTipsInFeed />
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Small things that make daily.dev work better for you.
          </Typography>
          <ul className="flex flex-col gap-3">
            {getFeedWidgetTips().map((tip) => (
              <TipItem key={tip.id} tip={tip} />
            ))}
          </ul>
        </ResponsivePageContainer>
      </div>
    </>
  );
}

const getTipsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

TipsPage.getLayout = getTipsLayout;
TipsPage.layoutProps = { screenCentered: false, seo };

export default TipsPage;
