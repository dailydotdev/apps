import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from 'storybook/test';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import type { MarketingCta } from '@dailydotdev/shared/src/components/marketing/cta/common';
import { MarketingCtaVariant } from '@dailydotdev/shared/src/components/marketing/cta/common';
import { MarketingCtaPopoverSmall } from '@dailydotdev/shared/src/components/marketing/cta/MarketingCtaPopoverSmall';
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
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { defaultBootData, getBootMock } from '../../mock/boot';

// "Leave a review" popover: what runs today, what iOS already replaced it
// with, and the asks that replace the Chrome, Edge and Android campaigns.
// The popover is the production component; the new surfaces are mock-ups
// built from production primitives, none of them shipped yet.

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
        {children}
      </BootDataProvider>
    </QueryClientProvider>
  );
};

// Customer.io campaign 65 as it renders on Chrome today.
const chromeCampaign: MarketingCta = {
  campaignId: 'storybook-leave-a-review-chrome',
  createdAt: new Date('2026-07-01T00:00:00.000Z'),
  variant: MarketingCtaVariant.PopoverSmall,
  flags: {
    title: 'Enjoying daily.dev?',
    description: "You're here every day! help other devs find us on Chrome!",
    ctaText: 'Leave a review 💜',
    ctaUrl: 'https://chromewebstore.google.com/',
  },
};

type Status = 'shipped' | 'running' | 'planned' | 'dropped' | 'open';

const statusStyles: Record<Status, string> = {
  shipped: 'bg-accent-avocado-flat text-accent-avocado-default',
  running: 'bg-accent-ketchup-flat text-accent-ketchup-default',
  planned: 'bg-accent-cabbage-flat text-accent-cabbage-default',
  dropped: 'bg-surface-float text-text-tertiary',
  open: 'bg-accent-cheese-flat text-accent-cheese-default',
};

const statusLabels: Record<Status, string> = {
  shipped: 'Shipped',
  running: 'Still running',
  planned: 'Not built',
  dropped: 'Dropped',
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

const Surface = ({
  platform,
  title,
  status,
  note,
  children,
}: {
  platform: string;
  title: string;
  status: Status;
  note: string;
  children: ReactNode;
}): ReactElement => (
  <article className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
    <div className="flex items-start justify-between gap-2">
      <div className="flex flex-col">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          bold
        >
          {platform}
        </Typography>
        <Typography type={TypographyType.Body} bold>
          {title}
        </Typography>
      </div>
      <Pill status={status} />
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

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-1 flex-col gap-1 rounded-16 bg-surface-float p-4">
    <Typography type={TypographyType.Title2} bold>
      {value}
    </Typography>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {label}
    </Typography>
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

const Overview = (): ReactElement => (
  <Providers>
    <div className="flex min-h-screen justify-center bg-background-subtle px-4 py-10">
      <div className="flex w-full max-w-[60rem] flex-col gap-12">
        <header className="flex flex-col gap-2">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Brand}
            bold
          >
            LEAVE A REVIEW POPOVER
          </Typography>
          <Typography
            type={TypographyType.LargeTitle}
            tag={TypographyTag.H1}
            bold
          >
            From one popover to asks at happy moments
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            iOS already asks in Apple&apos;s own sheet. Chrome, Edge and Android
            still run the July popover. This page shows what replaces it on each
            surface.
          </Typography>
        </header>

        <Section
          title="Today"
          intro="Customer.io campaigns 65 (Chrome), 66 (Edge) and 70 (Android), unchanged since July. On the extension it returns on every new tab until it's closed."
        >
          <div className="flex flex-col gap-3 tablet:flex-row">
            <Stat value="1.6%" label="of people who saw it in 90 days tapped" />
            <Stat value="1 in 10" label="saw it 27 or more times" />
            <Stat value="3" label="campaigns still running" />
          </div>
          <div className="flex justify-center rounded-16 bg-background-default p-6">
            <MarketingCtaPopoverSmall marketingCta={chromeCampaign} />
          </div>
        </Section>

        <Section title="Where it stands">
          <ul className="flex flex-col rounded-16 border border-border-subtlest-tertiary bg-background-default px-4">
            <Row label="iOS rating sheet" status="shipped">
              Apple&apos;s native sheet at a 30+ day streak milestone, 120-day
              cooldown, behind <code>app_store_review</code> (#7364, #7475). The
              old custom prompt (campaign 69) stopped Nov 19; campaigns 74, 75
              and 76 replaced it. Ante owns the setup and its daily health
              check.
            </Row>
            <Row label="iOS rate row" status="shipped">
              &ldquo;{rateAppTitle}&rdquo; on the iPhone You page and the iPad
              profile menu.
            </Row>
            <Row label="Chrome, Edge, Android" status="running">
              Campaigns 65, 66 and 70. Turn off once the asks below ship on each
              surface.
            </Row>
            <Row label="Android, extension, web" status="planned">
              The Play rating sheet, the popup line, the toast, the day-14 bell
              and the rate row below.
            </Row>
            <Row label="Changelog line" status="dropped">
              Overlaps campaign 76 (big feature launch).
            </Row>
          </ul>
        </Section>

        <Section
          title="What replaces it"
          intro="Each ask uses the store's own page or sheet, and only shows to people who pass the eligibility rules below."
        >
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
            <Surface
              platform="Android"
              title="Play rating sheet"
              status="planned"
              note="Same moments as iOS: streak milestone, achievement, upvote or bookmark. Needs the next Android release for Google's in-app review API."
            >
              <PlaySheet />
            </Surface>
            <Surface
              platform="Extension"
              title="Line in the streak popup"
              status="planned"
              note="One row under the existing popup content. Opens the browser's own store page: Chrome Web Store or Edge Add-ons."
            >
              <StreakPopup />
            </Surface>
            <Surface
              platform="Extension"
              title="Line in the achievement popup"
              status="planned"
              note="The same row, so both celebrations read the same."
            >
              <AchievementPopup />
            </Surface>
            <Surface
              platform="Extension"
              title="Toast after a good action"
              status="planned"
              note="After an upvote, bookmark or claimed quest. Auto-dismisses like every toast; never repeats inside the cooldown."
            >
              <ReviewToast />
            </Surface>
            <Surface
              platform="Extension"
              title="Day-14 bell notification"
              status="planned"
              note="On the first day someone passes the minimum (14 days, 5 active days). Once in a lifetime, in the bell, not over the feed. Moved from day 7, which broke the minimum."
            >
              <BellNotification />
            </Surface>
            <Surface
              platform="Web and extension"
              title="Rate row next to Support"
              status="planned"
              note="The iOS row's title, on every surface. Always visible, since it's only opened on purpose."
            >
              <RateRow />
            </Surface>
          </div>
        </Section>

        <Section
          title="Who sees an ask"
          intro="One new minimum, and the iOS cooldown reused so every surface shares one clock."
        >
          <ul className="flex flex-col rounded-16 border border-border-subtlest-tertiary bg-background-default px-4">
            <Row label="Minimum" status="planned">
              At least 14 days since signup and 5 active days. Nothing checks
              account age today: segment 121 (iOS only, 10+ page views in 30
              days) and each campaign&apos;s trigger decide eligibility. The iOS
              streak ask already passes, since it needs a 30+ day streak.
            </Row>
            <Row label="Cooldown" status="shipped">
              At most once per 120 days across all surfaces. Asking anywhere
              sets <code>review_ask_at</code>; segment 143 (&ldquo;asked in last
              120 days&rdquo;) excludes those people from campaigns 74, 75 and
              76.
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
          title="Open questions"
          intro="Parts of the proposal this page doesn't settle yet."
        >
          <ul className="flex flex-col rounded-16 border border-border-subtlest-tertiary bg-background-default px-4">
            <Row label="iOS moments" status="open">
              The proposal asks after a streak, achievement, upvote or bookmark.
              iOS ships only the 30+ day streak milestone. Add the other three,
              or keep iOS to the one moment?
            </Row>
            <Row label="Rate row title" status="open">
              The proposal says &ldquo;Rate daily.dev&rdquo; next to Send
              feedback. The page reuses the iOS title, <q>{rateAppTitle}</q>,
              after Support. Which title and position?
            </Row>
            <Row label="Rate row reach" status="open">
              &ldquo;Everywhere&rdquo; also means the Android app, which the
              page doesn&apos;t show. Safari and Firefox users have no store
              page: hide the row there, or link somewhere else?
            </Row>
            <Row label="Toast versions" status="open">
              Only the upvote toast is drawn. Bookmark and claimed quest need
              their own copy, and the toast is the closest of the asks to the
              popover we&apos;re removing: ship it, or hold it until reviews
              drop?
            </Row>
            <Row label="Bad moments" status="open">
              The examples above are placeholders. Which events block an ask,
              and for how long?
            </Row>
            <Row label="Segment 143" status="open">
              It only matches when <code>review_ask_at</code> moves from an old
              value to a recent one, so a second ask inside 120 days
              doesn&apos;t match on its own. Campaigns re-check the field before
              sending, so nothing breaks, but the count may be low. Ante to
              confirm.
            </Row>
          </ul>
        </Section>

        <Section title="Later">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            Chrome is adding its own &ldquo;Rate it&rdquo; link to the
            extensions menu, which needs nothing from us.
          </Typography>
        </Section>
      </div>
    </div>
  </Providers>
);

const meta: Meta = {
  title: 'Growth/App Store reviews/Leave a review popover',
  id: 'leave-a-review-popover',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const Plan: Story = {
  name: 'Overview',
  render: () => <Overview />,
};
