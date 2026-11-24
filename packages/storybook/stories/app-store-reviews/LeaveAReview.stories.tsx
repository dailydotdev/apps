import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import type { MarketingCta } from '@dailydotdev/shared/src/components/marketing/cta/common';
import { MarketingCtaVariant } from '@dailydotdev/shared/src/components/marketing/cta/common';
import MarketingCtaModal from '@dailydotdev/shared/src/components/marketing/cta/MarketingCtaModal';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import { ProfileSection } from '@dailydotdev/shared/src/components/ProfileMenu/ProfileSection';
import { NotifMessage } from '@dailydotdev/shared/src/components/notifications/utils';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { StarIcon } from '@dailydotdev/shared/src/components/icons/Star';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons/ReadingStreak';
import { MedalBadgeIcon } from '@dailydotdev/shared/src/components/icons/MedalBadge';
import { GooglePlayIcon } from '@dailydotdev/shared/src/components/icons/GooglePlay';
import { TerminalIcon } from '@dailydotdev/shared/src/components/icons/Terminal';
import { MegaphoneIcon } from '@dailydotdev/shared/src/components/icons/Megaphone';
import { DocsIcon } from '@dailydotdev/shared/src/components/icons/Docs';
import { FeedbackIcon } from '@dailydotdev/shared/src/components/icons/Feedback';
import { rateAppTitle } from '@dailydotdev/shared/src/hooks/useRateAppRow';
import { AskCard } from '@dailydotdev/shared/src/components/appStoreReview/AskCard';
import { streakReviewTargetId } from '@dailydotdev/shared/src/components/appStoreReview/common';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { defaultBootData, getBootMock } from '../../mock/boot';

// "Leave a review" popover: what changes on each platform, before and after.
// Before is the production modal with each campaign's stored payload; the
// after surfaces are mock-ups built from production primitives, none of them
// shipped yet.

const noop = (): void => undefined;

const storeLine =
  'Enjoying daily.dev? A quick rating helps other devs find us.';

const Providers = ({ children }: { children: ReactNode }): ReactElement => {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <BootDataProvider
        app={BootApp.Extension}
        deviceId="123"
        getPage={fn()}
        getRedirectUri={fn()}
        version="pwa"
        localBootData={getBootMock({ ...defaultBootData, user: defaultUser })}
      >
        {/* Modal mounts on production's app root. */}
        <div id="__next">{children}</div>
      </BootDataProvider>
    </QueryClientProvider>
  );
};

// The marketing_cta rows campaigns 65, 66 and 70 point at, verbatim. Their
// variant is popover, which BootPopups opens as MarketingCtaModal.
const todayFlags = {
  title: 'Enjoying daily.dev?',
  ctaText: 'Leave a review 💜',
  tagText: '',
  tagColor: 'avocado',
};

const todayCampaigns: { label: string; marketingCta: MarketingCta }[] = [
  {
    label: 'Chrome (65)',
    marketingCta: {
      campaignId: 'extension-review',
      createdAt: new Date('2026-07-01T00:00:00.000Z'),
      variant: MarketingCtaVariant.Popover,
      flags: {
        ...todayFlags,
        description:
          "You're here every day! help other devs find us on Chrome!",
        image:
          'https://media.daily.dev/image/upload/s--JUvMCrf9--/f_auto,q_auto/v1778147978/webapp/daily.dev_Reviews_cover',
        ctaUrl:
          'https://chromewebstore.google.com/detail/dailydev-the-homepage-dev/jlmpjdjjbgclbocgajdjefcidcncaied/reviews',
      },
    },
  },
  {
    label: 'Edge (66)',
    marketingCta: {
      campaignId: 'extension-review-edge',
      createdAt: new Date('2026-07-01T00:00:00.000Z'),
      variant: MarketingCtaVariant.Popover,
      flags: {
        ...todayFlags,
        description: "You're here every day! help other devs find us on Edge!",
        image:
          'https://media.daily.dev/image/upload/s--8lpKAg9d--/f_auto,q_auto/v1779194154/webapp/image_8',
        ctaUrl:
          'https://microsoftedge.microsoft.com/addons/detail/dailydev-the-homepage-/cbdhgldgiancdheindpekpcbkccpjaeb',
      },
    },
  },
  {
    label: 'Android (70)',
    marketingCta: {
      campaignId: 'extension-review-android',
      createdAt: new Date('2026-07-01T00:00:00.000Z'),
      variant: MarketingCtaVariant.Popover,
      flags: {
        ...todayFlags,
        description:
          "You're here every day! help other devs find us on android!",
        image:
          'https://media.daily.dev/image/upload/s--oyLIDRIG--/f_auto,q_auto/v1780662678/public/daily.dev%20Reviews%20cover%20-%20Google%20play',
        ctaUrl:
          'https://play.google.com/store/apps/details?id=dev.daily&showAllReviews=true',
      },
    },
  },
];

// Opened after mount: Modal binds to #__next, which exists once rendered.
const TodayModal = ({
  marketingCta,
  onRequestClose,
}: {
  marketingCta: MarketingCta;
  onRequestClose: () => void;
}): ReactElement | null => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <MarketingCtaModal
      marketingCta={marketingCta}
      isOpen
      ariaHideApp={false}
      onRequestClose={onRequestClose}
    />
  );
};

type Status = 'shipped' | 'planned' | 'off' | 'open';

const statusStyles: Record<Status, string> = {
  shipped: 'bg-accent-avocado-flat text-accent-avocado-default',
  planned: 'bg-accent-cabbage-flat text-accent-cabbage-default',
  off: 'bg-accent-ketchup-flat text-accent-ketchup-default',
  open: 'bg-accent-cheese-flat text-accent-cheese-default',
};

const statusLabels: Record<Status, string> = {
  shipped: 'Shipped',
  planned: 'New',
  off: 'Turning off',
  open: 'Open',
};

const Pill = ({ status }: { status: Status }): ReactElement => (
  <span
    className={classNames(
      'w-fit shrink-0 rounded-8 px-2 py-0.5 font-bold typo-caption1',
      statusStyles[status],
    )}
  >
    {statusLabels[status]}
  </span>
);

const Section = ({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <Typography type={TypographyType.Title2} tag={TypographyTag.H2} bold>
        {title}
      </Typography>
      {intro && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {intro}
        </Typography>
      )}
    </div>
    {children}
  </section>
);

// What runs on the platform now and goes away.
const Before = ({
  status,
  children,
  campaigns = [],
  onOpen,
}: {
  status: Status;
  children: ReactNode;
  campaigns?: typeof todayCampaigns;
  onOpen?: (marketingCta: MarketingCta) => void;
}): ReactElement => (
  <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 tablet:flex-row tablet:items-center">
    <div className="flex min-w-0 flex-1 items-start gap-2">
      <span className="shrink-0 pt-0.5 font-bold text-text-quaternary typo-caption1">
        BEFORE
      </span>
      <Pill status={status} />
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className="min-w-0 flex-1"
      >
        {children}
      </Typography>
    </div>
    {campaigns.length > 0 && (
      <div className="flex shrink-0 flex-wrap gap-2">
        {campaigns.map(({ label, marketingCta }) => (
          <Button
            key={marketingCta.campaignId}
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            onClick={() => onOpen?.(marketingCta)}
          >
            Open {label}
          </Button>
        ))}
      </div>
    )}
  </div>
);

// One thing that ships, with the production-like preview and what to know.
const Surface = ({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: ReactNode;
}): ReactElement => (
  <article className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
    <div className="flex items-center gap-2">
      <Pill status="planned" />
      <Typography type={TypographyType.Body} bold>
        {title}
      </Typography>
    </div>
    <div className="flex min-h-48 items-center justify-center rounded-12 bg-background-subtle p-4">
      {children}
    </div>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {note}
    </Typography>
  </article>
);

// The line the streak and achievement popups gain: one row under their own
// content, no image, no second popup.
const StoreLine = (): ReactElement => (
  <div className="flex items-center gap-2 border-t border-border-subtlest-tertiary pt-3">
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className="flex-1 text-left"
    >
      {storeLine}
    </Typography>
    <Button
      variant={ButtonVariant.Secondary}
      size={ButtonSize.XSmall}
      icon={<StarIcon />}
    >
      Rate
    </Button>
  </div>
);

const PopupShell = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex w-72 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 text-center shadow-2">
    {children}
  </div>
);

const StreakPopup = (): ReactElement => (
  <PopupShell>
    <ReadingStreakIcon
      size={IconSize.XXXLarge}
      className="mx-auto text-accent-bacon-default"
      secondary
    />
    <Typography type={TypographyType.Title3} bold>
      30 day streak
    </Typography>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      You read every day for a month. Keep it going.
    </Typography>
    <StoreLine />
  </PopupShell>
);

const AchievementPopup = (): ReactElement => (
  <PopupShell>
    <MedalBadgeIcon
      size={IconSize.XXXLarge}
      className="mx-auto text-accent-cheese-default"
      secondary
    />
    <Typography type={TypographyType.Title3} bold>
      Achievement unlocked
    </Typography>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      Bookworm: read 100 posts.
    </Typography>
    <StoreLine />
  </PopupShell>
);

// Toast markup without the fixed positioning, so it sits in the card.
const ReviewToast = (): ReactElement => (
  <div className="invert flex w-full max-w-[22.5rem] flex-row items-center gap-2.5 rounded-12 border border-border-subtlest-tertiary bg-background-default py-2 pl-3 pr-2 shadow-3">
    <UpvoteIcon secondary className="shrink-0 text-accent-avocado-default" />
    <NotifMessage>Upvoted. Enjoying daily.dev? Rate us.</NotifMessage>
    <Button variant={ButtonVariant.Subtle} size={ButtonSize.XSmall}>
      Rate
    </Button>
    <button
      type="button"
      aria-label="Dismiss toast notification"
      className="grid size-8 shrink-0 place-items-center rounded-full text-text-primary hover:bg-surface-float"
    >
      <MiniCloseIcon size={IconSize.Small} />
    </button>
  </div>
);

const BellNotification = (): ReactElement => (
  <div className="flex w-full max-w-[22.5rem] flex-col rounded-16 border border-border-subtlest-tertiary bg-background-default">
    <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary px-4 py-3">
      <BellIcon />
      <Typography type={TypographyType.Callout} bold>
        Notifications
      </Typography>
    </div>
    <div className="flex gap-3 bg-surface-float px-4 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-surface-invert">
        <LogoIcon className={{ container: 'h-5 text-surface-primary' }} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Typography type={TypographyType.Callout}>
          <strong>Two weeks on daily.dev.</strong> If it earned a spot on your
          new tab, a quick rating on the Chrome Web Store helps other devs find
          us.
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Quaternary}
        >
          Just now
        </Typography>
      </div>
    </div>
  </div>
);

const RateRow = (): ReactElement => (
  <div className="w-full max-w-[22.5rem] rounded-16 border border-border-subtlest-tertiary bg-background-default p-2">
    <ProfileSection
      items={[
        { title: 'Changelog', icon: TerminalIcon, onClick: noop },
        { title: 'Advertise', icon: MegaphoneIcon, onClick: noop },
        { title: 'Docs', icon: DocsIcon, onClick: noop },
        { title: 'Support', icon: FeedbackIcon, onClick: noop },
        { title: rateAppTitle, icon: StarIcon, onClick: noop },
      ]}
    />
  </div>
);

// Google's in-app review sheet: the app can only decide when to ask, the
// sheet itself is Google's.
const PlaySheet = (): ReactElement => (
  <div className="flex h-[26rem] w-60 flex-col justify-end overflow-hidden rounded-24 border-4 border-border-subtlest-secondary bg-background-subtle">
    <div className="flex flex-col items-center gap-3 rounded-t-16 bg-background-default px-4 pb-4 pt-5">
      <span className="flex size-10 items-center justify-center rounded-10 bg-surface-invert">
        <LogoIcon className={{ container: 'h-6 text-surface-primary' }} />
      </span>
      <Typography type={TypographyType.Callout} bold>
        Rate daily.dev
      </Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        className="text-center"
      >
        Reviews are public and include your account info
      </Typography>
      <div className="flex gap-2 text-text-quaternary">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} size={IconSize.Medium} />
        ))}
      </div>
      <div className="flex w-full items-center justify-between pt-1">
        <span className="flex items-center gap-1 text-text-quaternary typo-caption1">
          <GooglePlayIcon size={IconSize.XSmall} />
          Google Play
        </span>
        <span className="font-bold text-text-tertiary typo-footnote">
          Not now
        </span>
      </div>
    </div>
  </div>
);

// Apple's in-app rating sheet: its text is fixed, the app only picks when
// to request it.
const AppleSheet = (): ReactElement => (
  <div className="flex w-56 flex-col items-center gap-2 rounded-16 bg-surface-float pt-4 text-center shadow-2">
    <span className="flex size-10 items-center justify-center rounded-10 bg-surface-invert">
      <LogoIcon className={{ container: 'h-6 text-surface-primary' }} />
    </span>
    <Typography type={TypographyType.Callout} bold>
      Enjoying daily.dev?
    </Typography>
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      className="px-4"
    >
      Tap a star to rate it on the App Store.
    </Typography>
    <div className="flex gap-2 text-accent-blueCheese-default">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon key={star} size={IconSize.Medium} />
      ))}
    </div>
    <span className="w-full border-t border-border-subtlest-tertiary py-2 font-bold text-accent-blueCheese-default typo-callout">
      Not Now
    </span>
  </div>
);

const IOSRate = (): ReactElement => (
  <div className="flex flex-col items-center gap-3">
    <AskCard targetId={streakReviewTargetId} className="max-w-72" />
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      Rate daily.dev ↓
    </Typography>
    <AppleSheet />
  </div>
);

const Row = ({
  label,
  status,
  children,
}: {
  label: string;
  status: Status;
  children: ReactNode;
}): ReactElement => (
  <li className="flex flex-col gap-2 border-b border-border-subtlest-tertiary py-3 last:border-b-0 tablet:flex-row tablet:items-start">
    <div className="flex w-72 shrink-0 items-center gap-2">
      <Pill status={status} />
      <Typography type={TypographyType.Callout} bold>
        {label}
      </Typography>
    </div>
    <Typography
      type={TypographyType.Callout}
      color={TypographyColor.Secondary}
      className="min-w-0 flex-1"
    >
      {children}
    </Typography>
  </li>
);

// A plain table for the build spec; scrolls sideways on phones.
const Table = ({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}): ReactElement => (
  <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary bg-background-default">
    <table className="w-full min-w-[40rem] text-left typo-footnote">
      <thead>
        <tr className="border-b border-border-subtlest-tertiary text-text-tertiary">
          {headers.map((header) => (
            <th key={header} className="px-4 py-3 font-bold">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="text-text-secondary">
        {rows.map((cells, index) => (
          <tr
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="border-b border-border-subtlest-tertiary align-top last:border-b-0"
          >
            {cells.map((cell, cellIndex) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={cellIndex}
                className={classNames(
                  'px-4 py-3',
                  cellIndex === 0 && 'font-bold text-text-primary',
                )}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Overview = (): ReactElement => {
  const [openCampaign, setOpenCampaign] = useState<MarketingCta | null>(null);

  return (
    <Providers>
      <div className="flex min-h-screen justify-center bg-background-subtle px-4 py-10">
        <div className="flex w-full max-w-[60rem] flex-col gap-12">
          <header className="flex flex-col gap-2">
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Brand}
              bold
            >
              LEAVE A REVIEW
            </Typography>
            <Typography
              type={TypographyType.LargeTitle}
              tag={TypographyTag.H1}
              bold
            >
              What we&apos;re changing
            </Typography>
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Tertiary}
            >
              The review popover goes away: 1.6% of people who saw it tapped,
              and 1 in 10 saw it 27 or more times. Each platform asks at happy
              moments instead, in the store&apos;s own page or sheet.
            </Typography>
          </header>

          <Section title="Chrome and Edge extension">
            <Before
              status="off"
              campaigns={todayCampaigns.slice(0, 2)}
              onOpen={setOpenCampaign}
            >
              Campaigns 65 and 66: this modal on every new tab until it&apos;s
              closed.
            </Before>
            <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
              <Surface
                title="Line in the streak popup"
                note="One row under the existing popup content. Opens the browser's own store page: Chrome Web Store or Edge Add-ons."
              >
                <StreakPopup />
              </Surface>
              <Surface
                title="Line in the achievement popup"
                note="The same row, so both celebrations read the same."
              >
                <AchievementPopup />
              </Surface>
              <Surface
                title="Toast after an upvote or bookmark"
                note="First word matches the action. Ships behind a flag with a holdout. No claimed-quest trigger: the Chrome Web Store bans incentivized reviews."
              >
                <ReviewToast />
              </Surface>
              <Surface
                title="Day-14 bell notification"
                note="On the first day someone passes the minimum (14 days, 5 active days). Once in a lifetime, in the bell, not over the feed."
              >
                <BellNotification />
              </Surface>
            </div>
          </Section>

          <Section title="Android app">
            <Before
              status="off"
              campaigns={todayCampaigns.slice(2)}
              onOpen={setOpenCampaign}
            >
              Campaign 70: the same modal, linking to Google Play.
            </Before>
            <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
              <Surface
                title="Play rating sheet"
                note="At a streak milestone, achievement, upvote or bookmark. Needs the next Android release for Google's in-app review API."
              >
                <PlaySheet />
              </Surface>
            </div>
          </Section>

          <Section title="iOS app">
            <Before status="shipped">
              Our ask sheet (campaigns 74, 75, 76) and the 30+ day streak card
              stay. Their Rate button opens the App Store, and Apple&apos;s
              sheet is requested on its own 2s after the ask.
            </Before>
            <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
              <Surface
                title="Rate opens Apple's sheet"
                note="Rate requests Apple's in-app rating sheet, so people stay in the app, and the automatic request goes away. Apple shows it at most 3 times a year and never says whether it did, so a tap can show nothing. The profile row keeps opening the App Store."
              >
                <IOSRate />
              </Surface>
            </div>
          </Section>

          <Section title="Web and extension menu">
            <Before status="off">Nothing: no way to rate on purpose.</Before>
            <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
              <Surface
                title="Rate row next to Support"
                note="The iOS row's title. Always visible, since it's only opened on purpose."
              >
                <RateRow />
              </Surface>
            </div>
          </Section>

          <Section
            title="Rules for every ask"
            intro="One new minimum, and the iOS cooldown reused so every platform shares one clock."
          >
            <ul className="flex flex-col rounded-16 border border-border-subtlest-tertiary bg-background-default px-4">
              <Row label="Minimum" status="planned">
                At least 14 days since signup and 5 active days. Nothing checks
                account age today.
              </Row>
              <Row label="Cooldown" status="shipped">
                At most once per 120 days across all platforms. Asking anywhere
                sets <code>review_ask_at</code>; segment 143 (&ldquo;asked in
                last 120 days&rdquo;) excludes those people from campaigns.
              </Row>
              <Row label="Bad moments" status="planned">
                Never right after an error, a report, a downvote or a failed
                payment.
              </Row>
              <Row label="Rate row" status="planned">
                Exempt from the cooldown: it never shows on its own.
              </Row>
            </ul>
          </Section>

          <Section
            title="Build spec"
            intro="What each platform, user and surface does, and what has to exist before it can ship."
          >
            <Typography type={TypographyType.Body} bold>
              Platforms and devices
            </Typography>
            <Table
              headers={['Where', 'Asks', 'Rate opens', 'Turns off']}
              rows={[
                [
                  'Chrome extension',
                  'Streak line, achievement line, toast, day-14 bell, menu row',
                  'Chrome Web Store reviews page, new tab',
                  'Campaign 65',
                ],
                [
                  'Edge extension',
                  'Same as Chrome',
                  'Edge Add-ons page, new tab',
                  'Campaign 66',
                ],
                [
                  'Web, desktop Chrome or Edge',
                  'Menu row only',
                  'That browser’s extension store page',
                  '–',
                ],
                [
                  'Web, Safari, Firefox, mobile browsers',
                  'None until the rate row reach question is settled',
                  '–',
                  '–',
                ],
                [
                  'iOS app, iPhone and iPad',
                  'Ask sheet (74, 75, 76), 30+ day streak card, profile row',
                  'Apple’s in-app sheet; the profile row opens the App Store',
                  '–',
                ],
                [
                  'Android app',
                  'Play sheet at streak milestone, achievement, upvote, bookmark',
                  'Google’s in-app review sheet',
                  'Campaign 70, once the release is out',
                ],
              ]}
            />

            <Typography type={TypographyType.Body} bold>
              Users
            </Typography>
            <Table
              headers={['Who', 'Automatic asks', 'Menu row']}
              rows={[
                ['Logged out', 'Never', 'Not shown: the menu needs an account'],
                [
                  'Under 14 days or 5 reading days',
                  'Never. Account age from user.createdAt, reading days from readingStreak.total',
                  'Shown',
                ],
                [
                  'Asked in the last 120 days, on any platform',
                  'Never',
                  'Shown',
                ],
                [
                  'Eligible',
                  'The first happy moment asks once, then the cooldown starts',
                  'Shown',
                ],
                [
                  'Plus',
                  'Same rules; on iOS a renewal also triggers campaign 75',
                  'Shown',
                ],
                [
                  'Achievements turned off',
                  'No achievement line; other moments still ask',
                  'Shown',
                ],
                [
                  'In the toast holdout',
                  'No toast; every other ask still runs',
                  'Shown',
                ],
                [
                  'Already reviewed',
                  'We can’t tell. Apple and Google hide their sheets on their own; the extension stores don’t',
                  'Shown',
                ],
              ]}
            />

            <Typography type={TypographyType.Body} bold>
              Flows
            </Typography>
            <Table
              headers={['Surface', 'Shows when', 'Tap', 'Logs (target_id)']}
              rows={[
                [
                  'Streak line',
                  'The streak milestone modal (NewStreakModal) at 30+ days, the slot iOS already uses for its card',
                  'Opens the store in a new tab, closes nothing',
                  'streak_milestone',
                ],
                [
                  'Achievement line',
                  'AchievementCompletionModal, after the unlock',
                  'Same',
                  'achievement',
                ],
                [
                  'Toast',
                  'Right after an upvote. After a bookmark, only once the bookmark toast (with Change folder) is gone',
                  'Rate opens the store; X or timeout dismisses',
                  'toast_upvote, toast_bookmark',
                ],
                [
                  'Day-14 bell',
                  'The first day someone passes the minimum, once ever',
                  'Opens the store',
                  'bell_day_14',
                ],
                [
                  'Menu row',
                  'Always, next to Support',
                  'Opens the store; never starts the cooldown',
                  'profile_menu',
                ],
                [
                  'iOS Rate',
                  'Unchanged triggers',
                  'Requests Apple’s sheet; no request on a timer',
                  'Existing streak_milestone and campaign ids',
                ],
                [
                  'Android sheet',
                  'The same moments, from the web layer',
                  'Google’s sheet; it never reports back',
                  'Same ids as the extension',
                ],
              ]}
            />
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Every automatic ask logs an impression, a click and a dismiss with
              target_type app_store_review, and starts the shared cooldown when
              it shows, not when it&apos;s tapped.
            </Typography>

            <Typography type={TypographyType.Body} bold>
              Needed before it ships
            </Typography>
            <ul className="flex flex-col rounded-16 border border-border-subtlest-tertiary bg-background-default px-4">
              <Row label="One cooldown" status="open">
                Today there are two clocks. review_ask_at is written only by
                Customer.io campaigns 74, 75 and 76, and the iOS streak card
                keeps its own date on the device (IndexedDB review_prompt).
                daily-api needs a review-asked date on the user that boot
                returns, the web app writes when an ask shows, and Customer.io
                reads as review_ask_at.
              </Row>
              <Row label="Android bridge" status="open">
                The Android app has no DailyAndroid bridge yet (nativeBridge.ts
                expects one). The next release needs it, with Google&apos;s
                in-app review API behind a review-request message.
              </Row>
              <Row label="Bell notification" status="open">
                A new notification type in daily-api, sent once by a daily job
                to people who reach the minimum.
              </Row>
              <Row label="Feature flag" status="open">
                A new flag for the extension and web asks, default off, with the
                toast holdout as a variant. app_store_review stays the iOS flag.
              </Row>
              <Row label="Store links" status="open">
                Chrome Web Store and Edge Add-ons review URLs as constants; only
                the Google Play URL exists in lib/constants.ts today.
              </Row>
              <Row label="Turning campaigns off" status="open">
                65 and 66 when the extension asks reach 100% of the flag; 70
                when the Android release reaches most users.
              </Row>
              <Row label="Measuring it" status="open">
                Weekly review count and average rating per store, holdout
                against everyone else. Taps aren&apos;t reviews, and no store
                tells us who reviewed.
              </Row>
              <Row label="QA" status="open">
                Light and dark theme, phone width for the Android sheet and
                toast, Chrome and Edge for store links, a cooled-down account
                and a new one.
              </Row>
            </ul>
          </Section>

          <Section title="Open questions">
            <ul className="flex flex-col rounded-16 border border-border-subtlest-tertiary bg-background-default px-4">
              <Row label="iOS moments" status="open">
                Add asks after an achievement, upvote or bookmark on iOS, or
                keep it to the 30+ day streak?
              </Row>
              <Row label="Rate row title" status="open">
                &ldquo;Rate daily.dev&rdquo; next to Send feedback, or the iOS
                title, <q>{rateAppTitle}</q>, after Support?
              </Row>
              <Row label="Rate row reach" status="open">
                Add it to the Android app? Safari and Firefox have no store
                page: hide the row there, or link somewhere else?
              </Row>
              <Row label="Bookmark toast" status="open">
                The bookmark toast already has a Change folder button. Ask after
                it closes, as above, or only after upvotes?
              </Row>
              <Row label="Bad moments" status="open">
                The examples are placeholders. Which events block an ask, and
                for how long?
              </Row>
              <Row label="Segment 143" status="open">
                A second ask inside 120 days doesn&apos;t match on its own, so
                the count may be low. Campaigns re-check the field before
                sending, so nothing breaks. Ante to confirm.
              </Row>
            </ul>
          </Section>
        </div>
      </div>
      {openCampaign && (
        <TodayModal
          marketingCta={openCampaign}
          onRequestClose={() => setOpenCampaign(null)}
        />
      )}
    </Providers>
  );
};

const meta: Meta = {
  title: 'Growth/App Store reviews/Leave a review popover',
  id: 'leave-a-review-popover',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

// Named like the component so the sidebar shows one entry.
export const Plan: Story = {
  name: 'Leave a review popover',
  render: () => <Overview />,
};
