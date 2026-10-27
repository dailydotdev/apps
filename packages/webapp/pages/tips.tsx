import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import classNames from 'classnames';
import { LayoutHeader } from '@dailydotdev/shared/src/components/layout/common';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { useLaptopLayout } from '@dailydotdev/shared/src/hooks/layout/useLaptopLayout';
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
import { useSpotlight } from '@dailydotdev/shared/src/components/spotlight/SpotlightContext';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { OpenLinkIcon } from '@dailydotdev/shared/src/components/icons/OpenLink';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import type { FeedWidgetTip } from '@dailydotdev/shared/src/features/feedWidgets/tips';
import {
  feedWidgetTipGroups,
  feedWidgetTipLogEvent,
  useFeedWidgetTips,
} from '@dailydotdev/shared/src/features/feedWidgets/tips';
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
  feedWidgetTipTile,
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
  const { open: openSearch } = useSpotlight();
  const isSearch = tip.id === 'search';
  const ItemTag = isSearch ? 'button' : 'a';
  const { icon: Icon } = tip;
  const DestinationIcon = tip.isExternal ? OpenLinkIcon : ArrowIcon;

  const item = (
    <ItemTag
      href={isSearch ? undefined : tip.href}
      type={isSearch ? 'button' : undefined}
      {...(tip.isExternal && { target: '_blank', rel: 'noopener' })}
      onClick={() => {
        logEvent(
          feedWidgetTipLogEvent(
            LogEvent.ClickFeedWidgetTip,
            Origin.TipsPage,
            tip,
          ),
        );
        if (isSearch) {
          openSearch();
        }
      }}
      className="focus-outline group/row -mx-2 flex items-start gap-3 rounded-12 px-2 py-3 text-left transition-colors hover:bg-surface-hover"
    >
      <span
        aria-hidden
        className="flex size-10 items-center justify-center rounded-12"
        style={{
          background: feedWidgetTipTile(tip.tone),
          color: feedWidgetTipAccent(tip.tone),
        }}
      >
        <Icon secondary size={IconSize.Small} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 break-words">
        <span className="font-bold text-text-primary typo-callout">
          {tip.title}
        </span>
        <span className="text-text-tertiary typo-footnote">
          {tip.description}
        </span>
      </span>
      <DestinationIcon
        aria-hidden
        size={IconSize.Size16}
        className={classNames(
          'mt-1 text-text-quaternary group-hover/row:text-text-primary',
          !tip.isExternal && 'rotate-90',
        )}
      />
    </ItemTag>
  );

  return (
    <li className="border-b border-border-subtlest-tertiary last:border-0">
      {tip.isExternal || isSearch ? (
        item
      ) : (
        <Link href={tip.href} passHref>
          {item}
        </Link>
      )}
    </li>
  );
};

const TipGroups = (): ReactElement => {
  const tips = useFeedWidgetTips();

  return (
    <>
      {feedWidgetTipGroups.map((group) => {
        const groupTips = tips.filter((tip) => tip.group === group);
        if (!groupTips.length) {
          return null;
        }

        return (
          <section key={group} className="flex flex-col gap-1">
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Footnote}
              bold
              color={TypographyColor.Tertiary}
            >
              {group}
            </Typography>
            <ul className="flex flex-col">
              {groupTips.map((tip) => (
                <TipItem key={tip.id} tip={tip} />
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
};

const RestoreTips = (): ReactElement | null => {
  const { isReadOnly, setTipHidden } = useFeedWidgets();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();

  // A rail a newer build saved is not written here.
  if (isReadOnly) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
        className="flex-1"
      >
        You removed tips from your feed.
      </Typography>
      <Button
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        onClick={() =>
          setTipHidden(false).then((isSaved) => {
            if (!isSaved) {
              return;
            }
            logEvent(
              feedWidgetTipLogEvent(
                LogEvent.RestoreFeedWidgetTip,
                Origin.TipsPage,
              ),
            );
            displayToast('daily.dev tips are back in your feed');
          })
        }
      >
        Show tips in my feed
      </Button>
    </div>
  );
};

/** Offered to a signed-in reader who removed the tips from their rail. */
const ShowTipsInFeed = (): ReactElement | null => {
  const { user } = useAuthContext();
  const { flags } = useSettingsContext();
  const isHidden = readStoredFeedRail(flags?.feedWidgets)?.tipsHidden === true;

  // The rail's hook only mounts for the readers who can use it.
  return user && isHidden ? <RestoreTips /> : null;
};

function TipsPage(): ReactElement {
  const isLaptopLayout = useLaptopLayout();
  const isPhone = useIsPhone();

  return (
    <>
      {isLaptopLayout && <PageHeader title={pageTitle} />}
      {isPhone && <ShellPage title={pageTitle} />}
      <div className="mx-auto w-full max-w-[42.5rem]">
        {!isLaptopLayout && !isPhone && (
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
        <ResponsivePageContainer className="!mx-0 !w-full !max-w-full gap-6 pb-10 pt-4 tablet:pt-6">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Small things that make daily.dev work better for you.
          </Typography>
          <ShowTipsInFeed />
          <TipGroups />
        </ResponsivePageContainer>
      </div>
    </>
  );
}

const getTipsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

TipsPage.getLayout = getTipsLayout;
TipsPage.layoutProps = { seo };

export default TipsPage;
