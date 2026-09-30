import type { FC, PropsWithChildren, ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';
import {
  Button,
  ButtonColor,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { AppleIcon } from '@dailydotdev/shared/src/components/icons/Apple';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { BriefGradientIcon } from '@dailydotdev/shared/src/components/icons/BriefGradient';
import { ChromeIcon } from '@dailydotdev/shared/src/components/icons/Browser/Chrome';
import { GooglePlayIcon } from '@dailydotdev/shared/src/components/icons/GooglePlay';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { NotifMessage } from '@dailydotdev/shared/src/components/notifications/utils';
import {
  OnboardingHeadline,
  OnboardingSubheadline,
} from '@dailydotdev/shared/src/components/onboarding/common';
import { TagElement } from '@dailydotdev/shared/src/components/tags/TagElement';
import { WidgetContainer } from '@dailydotdev/shared/src/components/widgets/common';
import { pageBorders } from '@dailydotdev/shared/src/components/utilities/common';
import { GetAppQrCode } from '@dailydotdev/shared/src/features/getApp/components/GetAppQrCode';
import { CommentMarkdownInput } from '@dailydotdev/shared/src/components/fields/MarkdownInput/CommentMarkdownInput';
import { PushNotificationsContext } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import {
  briefButtonBg,
  briefCardBg,
  briefCardBorder,
} from '@dailydotdev/shared/src/styles/custom';
import { ExtensionProviders } from '../extension/_providers';
import { post, WriteComment } from '../components/comments/composer.mocks';

const meta: Meta = {
  title: 'Day Zero Retention/All options',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

// Every option is drawn with production components, or with the exact markup
// and classes of the production component it extends when that component is
// bound to live data. Only the copy is new.

const noop = (): undefined => undefined;

const pushSupported = {
  isPushSupported: true,
  isInitialized: true,
  isSubscribed: false,
  isLoading: false,
  shouldOpenPopup: () => false,
  subscribe: async () => true,
  unsubscribe: async () => undefined,
};

const Providers: FC<PropsWithChildren> = ({ children }) => (
  <ExtensionProviders>
    <PushNotificationsContext.Provider value={pushSupported as never}>
      <WriteComment>
        <div id="__next">{children}</div>
      </WriteComment>
    </PushNotificationsContext.Provider>
  </ExtensionProviders>
);

const Phone = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="w-[20rem] overflow-hidden rounded-[2rem] border-4 border-surface-float bg-background-default">
    {children}
  </div>
);

const ToastPreview = ({
  message,
  action,
}: {
  message: string;
  action: string;
}): ReactElement => (
  // NotifContainer's classes without its fixed, page-level positioning.
  <div
    role="alert"
    className="invert flex w-fit flex-row items-center gap-2.5 rounded-12 border border-border-subtlest-tertiary bg-background-default py-2 pl-3 pr-2 shadow-3"
  >
    <NotifMessage>{message}</NotifMessage>
    <Button
      type="button"
      variant={ButtonVariant.Subtle}
      size={ButtonSize.XSmall}
      className="shrink-0"
    >
      {action}
    </Button>
    <button
      type="button"
      aria-label="Dismiss toast notification"
      className="relative grid size-8 shrink-0 place-items-center rounded-full text-text-primary hover:bg-surface-float"
    >
      <MiniCloseIcon size={IconSize.Small} />
    </button>
  </div>
);

const PlaceholderCard = (): ReactElement => (
  <div className="flex h-32 flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3 opacity-[0.64]">
    <span className="h-2 w-4/5 rounded-4 bg-surface-float" />
    <span className="h-2 w-3/5 rounded-4 bg-surface-float" />
    <span className="mt-auto h-12 rounded-8 bg-surface-float" />
  </div>
);

const PlaceholderRow = (): ReactElement => (
  <div className="grid grid-cols-3 gap-3">
    <PlaceholderCard />
    <PlaceholderCard />
    <PlaceholderCard />
  </div>
);

// Where an option sits on the feed: above the posts, as a card in the grid, or
// as a toast over the screen. The posts around it are placeholders.
const FeedFrame = ({
  position,
  children,
}: {
  position: 'top' | 'toast' | 'slot';
  children: ReactNode;
}): ReactElement => (
  <div className="relative w-full max-w-[34rem] overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default">
    <div className="flex items-center justify-between border-b border-border-subtlest-tertiary px-4 py-3">
      <span className="font-bold typo-callout">My feed</span>
      <span className="text-text-quaternary typo-caption1">
        {position === 'slot' && 'First card in the feed'}
        {(position === 'top' || position === 'toast') && 'Top of the feed'}
      </span>
    </div>
    {position === 'slot' ? (
      <div className="grid grid-cols-2 gap-3 p-3">
        {children}
        <PlaceholderCard />
        <PlaceholderCard />
        <PlaceholderCard />
      </div>
    ) : (
      <div className="flex flex-col gap-3 p-3">
        {position === 'top' && children}
        <PlaceholderRow />
        <PlaceholderRow />
      </div>
    )}
    {position === 'toast' && (
      <div className="absolute inset-x-0 top-14 flex flex-col items-center gap-2 px-3">
        {children}
      </div>
    )}
  </div>
);

// ReadingReminderHero markup, the in-feed card.
const FeedCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex w-full">
    <div className="relative flex w-full flex-col rounded-16 border border-border-subtlest-secondary bg-surface-float px-4 py-3">
      <CloseButton
        className="absolute right-1 top-1 laptop:right-3 laptop:top-3"
        onClick={noop}
      />
      <Typography type={TypographyType.Title3}>{title}</Typography>
      <Typography
        className="mt-1 pr-8 laptop:pr-0"
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {subtitle}
      </Typography>
      <div className="mt-3">{children}</div>
    </div>
  </div>
);

const AddToChrome = ({ className }: { className?: string }): ReactElement => (
  <Button
    className={className}
    variant={ButtonVariant.Primary}
    icon={<ChromeIcon aria-hidden />}
  >
    Add to Chrome
  </Button>
);

// ReadingReminderFeedHero markup, the banner at the top of the feed. Production
// uses text-white/80, which never generates (the opacity scale has no 80 step).
const FeedTopHero = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}): ReactElement => (
  <section className="w-full pb-0">
    <div className="relative overflow-hidden rounded-b-none rounded-t-16 px-px pb-0 pt-px">
      <div className="top-hero-panel-border absolute inset-0 rounded-b-none rounded-t-16" />
      <div className="top-hero-glow pointer-events-none absolute -right-12 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full blur-3xl" />
      <div className="relative overflow-hidden rounded-b-none rounded-t-[0.9375rem] bg-raw-pepper-90 shadow-2">
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          className="absolute right-3 top-3 z-2 text-white opacity-[0.8] hover:opacity-100"
          icon={<MiniCloseIcon />}
          aria-label="Close banner"
        />
        <div className="flex flex-col items-start p-6 text-left">
          <p className="mt-2 text-[0.9375rem] text-white opacity-[0.8]">
            {title}
          </p>
          <h3 className="font-bold text-white typo-title2">{subtitle}</h3>
          <AddToChrome className="mt-4 w-fit" />
        </div>
      </div>
    </div>
  </section>
);

// BriefCardDefault markup.
const SealedBriefing = (): ReactElement => (
  <div
    style={{ border: briefCardBorder, background: briefCardBg }}
    className="relative flex w-full flex-col gap-4 rounded-16 px-6 py-4 backdrop-blur-3xl"
  >
    <CloseButton
      className="absolute right-2 top-2"
      size={ButtonSize.XSmall}
      onClick={noop}
    />
    <BriefGradientIcon secondary size={IconSize.Size48} />
    <Typography
      type={TypographyType.Title2}
      color={TypographyColor.Primary}
      bold
    >
      Your first Briefing opens tomorrow at 08:00
    </Typography>
    <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
      Five things on your tags, written overnight.
    </Typography>
    <Button
      style={{ background: briefButtonBg }}
      className="mt-auto w-full text-black"
      type="button"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
    >
      Notify me at 08:00
    </Button>
  </div>
);

// The notifications page frame and header from NotificationsFeed, with the
// empty day-0 inbox replaced by an in-page promise.
const InboxEmptyState = (): ReactElement => (
  <main
    className={classNames(
      pageBorders,
      'w-full max-w-[32rem] bg-background-default',
    )}
  >
    <div className="flex items-center justify-between px-4 pb-2 pt-4">
      <h2 className="font-bold typo-body">Notifications</h2>
      <Button
        icon={<SettingsIcon />}
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        aria-label="Notification settings"
      />
    </div>
    <div className="flex flex-col items-center gap-3 px-6 pb-10 pt-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-surface-float">
        <BellIcon size={IconSize.Large} />
      </span>
      <Typography type={TypographyType.Title3} bold>
        Nothing here yet
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="max-w-[20rem]"
      >
        Turn on push and your first one arrives tomorrow at 9:00: the top post
        on your tags.
      </Typography>
      <Button
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Cabbage}
        className="mt-2"
      >
        Enable notifications
      </Button>
    </div>
  </main>
);

const OnboardingStep = ({
  headline,
  subheadline,
  children,
}: {
  headline: string;
  subheadline?: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex w-full flex-col items-center gap-6 px-6 py-8">
    <div className="flex w-full flex-col gap-3">
      <OnboardingHeadline>{headline}</OnboardingHeadline>
      {subheadline && (
        <OnboardingSubheadline>{subheadline}</OnboardingSubheadline>
      )}
    </div>
    {children}
  </div>
);

// Markup of EnableNotificationsCta, deleted in #5893. Its bell keyframes still
// ship in base.css.
const TagsPushAsk = (): ReactElement => (
  <div className="flex w-full max-w-[27.5rem] items-center gap-2 rounded-8 bg-surface-float px-3 py-2 text-left">
    <Typography
      type={TypographyType.Callout}
      color={TypographyColor.Tertiary}
      className="flex-1"
    >
      Get notified when your tags have a big story
    </Typography>
    <Button
      type="button"
      size={ButtonSize.Small}
      variant={ButtonVariant.Primary}
      icon={
        <BellIcon className="origin-top motion-safe:[animation:enable-notification-bell-ring_1.1s_ease-in-out_infinite]" />
      }
    >
      Enable
    </Button>
  </div>
);

const tags = (names: string[]) => names.map((name) => ({ name }));

const TagRow = ({
  names,
  selected = [],
  highlighted = [],
}: {
  names: string[];
  selected?: string[];
  highlighted?: string[];
}): ReactElement => (
  <div className="flex flex-row flex-wrap justify-center gap-2">
    {tags(names).map((tag) => (
      <TagElement
        key={tag.name}
        tag={tag}
        onClick={noop}
        isSelected={selected.includes(tag.name)}
        isHighlighted={highlighted.includes(tag.name)}
      />
    ))}
  </div>
);

// GetAppButton panel markup, the production "get the app" popover.
const AppPanel = (): ReactElement => (
  <div className="w-96 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4">
    <div className="flex gap-4">
      <GetAppQrCode className="size-32 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <p className="font-bold text-text-primary typo-callout">
          Take this feed with you
        </p>
        <p className="text-text-tertiary typo-footnote">
          Scan the code with your camera. Your feed, bookmarks and streak come
          with you.
        </p>
      </div>
    </div>
    <div className="mt-4 flex gap-2 border-t border-border-subtlest-tertiary pt-4">
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        className="flex-1"
        icon={<AppleIcon size={IconSize.XSmall} />}
      >
        App Store
      </Button>
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        className="flex-1"
        icon={<GooglePlayIcon size={IconSize.Size16} />}
      >
        Google Play
      </Button>
    </div>
  </div>
);

const PostPhoneWidget = ({
  title,
  body,
}: {
  title: string;
  body: string;
}): ReactElement => (
  <WidgetContainer className="flex w-full flex-col items-center gap-2 p-3 text-center">
    <h4 className="font-bold text-text-primary typo-callout">{title}</h4>
    <GetAppQrCode className="size-24" />
    <p className="text-text-tertiary typo-footnote">{body}</p>
  </WidgetContainer>
);

// Where the widget sits: the post page sidebar, next to the post. The post and
// the other sidebar widgets are placeholders.
const PostFrame = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex w-full max-w-[34rem] flex-col gap-2">
    <span className="font-bold text-text-tertiary typo-footnote">{label}</span>
    <div className="grid grid-cols-[minmax(0,1fr)_12rem] gap-4 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
      <div className="flex flex-col gap-3 opacity-[0.64]">
        <span className="h-3 w-11/12 rounded-4 bg-surface-float" />
        <span className="h-3 w-3/5 rounded-4 bg-surface-float" />
        <span className="h-24 rounded-12 bg-surface-float" />
        <span className="h-2 w-full rounded-4 bg-surface-float" />
        <span className="h-2 w-5/6 rounded-4 bg-surface-float" />
        <span className="h-2 w-4/5 rounded-4 bg-surface-float" />
      </div>
      <div className="flex flex-col gap-3">
        {children}
        <span className="h-16 rounded-16 border border-border-subtlest-tertiary opacity-[0.64]" />
      </div>
    </div>
  </div>
);

const StepOrder = ({
  label,
  steps,
  moved,
  movedFrom,
}: {
  label: string;
  steps: string[];
  moved: string;
  movedFrom: number;
}): ReactElement => (
  <div className="flex w-full flex-col gap-4">
    <span className="font-bold text-text-secondary typo-callout">{label}</span>
    <ol className="flex items-start">
      {steps.map((step, index) => {
        const isMoved = step === moved;

        return (
          <li
            key={step}
            className="relative flex flex-1 flex-col items-center gap-2 text-center"
          >
            {index > 0 && (
              <span className="absolute right-1/2 top-4 h-px w-full bg-border-subtlest-secondary" />
            )}
            <span
              className={
                isMoved
                  ? 'relative z-1 flex size-8 items-center justify-center rounded-full bg-accent-cabbage-default font-bold text-white typo-footnote'
                  : 'relative z-1 flex size-8 items-center justify-center rounded-full border border-border-subtlest-secondary bg-background-subtle font-bold text-text-secondary typo-footnote'
              }
            >
              {index + 1}
            </span>
            <span
              className={
                isMoved
                  ? 'font-bold text-text-primary typo-footnote'
                  : 'text-text-tertiary typo-footnote'
              }
            >
              {step}
            </span>
            {isMoved && (
              <span className="text-accent-cabbage-default typo-caption1">
                Was step {movedFrom}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  </div>
);

enum ConflictLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

const conflictTone: Record<ConflictLevel, string> = {
  [ConflictLevel.Low]:
    'border-accent-avocado-default text-accent-avocado-default',
  [ConflictLevel.Medium]:
    'border-accent-cheese-default text-accent-cheese-default',
  [ConflictLevel.High]:
    'border-accent-ketchup-default text-accent-ketchup-default',
};

interface Option {
  title: string;
  label?: string;
  conflict?: { level: ConflictLevel; scope?: string; note: string };
  tldr: string;
  where: string;
  why: string;
  ui: () => ReactElement;
}

const asks: {
  id: string;
  title: string;
  line: string;
  options: Option[];
}[] = [
  {
    id: 'extension',
    title: 'Extension',
    line: 'Desktop Chrome, Edge and Brave users who have not installed it.',
    options: [
      {
        title: 'Three reads today',
        tldr: 'After the third read, a feed card offers the extension.',
        where: 'Back on the feed after the third post on day 0.',
        why: 'Three or more reads retain 54.2% against 16.4%.',
        ui: () => (
          <FeedFrame position="top">
            <FeedCard
              title="Three reads today"
              subtitle="Keep it going from every new tab."
            >
              <AddToChrome className="w-full" />
            </FeedCard>
          </FeedFrame>
        ),
      },
      {
        title: 'You typed it again',
        conflict: {
          level: ConflictLevel.High,
          note: 'The reading reminder banner already takes this slot from day 1, once a day, in the same dark style, and the header\'s "Get it for Chrome" button makes the same ask once intro quests end. Merge into the reminder\'s slot instead of stacking.',
        },
        tldr: 'Users who type daily.dev in again get a banner offering the extension.',
        where: 'A day 1 to 3 visit that came in with no referrer.',
        why: 'No-referrer visits are 38.3% of returns. They already have the habit.',
        ui: () => (
          <FeedFrame position="top">
            <FeedTopHero
              title="Back again?"
              subtitle="Let daily.dev open by itself in every new tab"
            />
          </FeedFrame>
        ),
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    line: 'Asked only from a tap, with one named promise and a send within a day.',
    options: [
      {
        title: 'Tell me when it opens',
        tldr: 'The sealed first Briefing offers a push for when it opens.',
        where: 'The Briefing card on the first feed.',
        why: 'The first send is guaranteed, so the opt-in pays off the next morning.',
        ui: () => (
          <FeedFrame position="slot">
            <SealedBriefing />
          </FeedFrame>
        ),
      },
      {
        title: 'Hear when a company is interested',
        tldr: 'After a CV upload, offer a push for when a company is interested.',
        where: 'Right after the CV upload, where jobs are on.',
        why: 'About 15% upload a CV. It is the most concrete promise we have.',
        ui: () => (
          <OnboardingStep
            headline="Your CV is in"
            subheadline="Want to know the moment a company is interested?"
          >
            <div className="flex w-full max-w-[20rem] flex-col gap-2">
              <Button
                variant={ButtonVariant.Primary}
                size={ButtonSize.Large}
                className="w-full"
              >
                Notify me
              </Button>
              <Button variant={ButtonVariant.Tertiary}>Not now</Button>
            </div>
          </OnboardingStep>
        ),
      },
      {
        title: 'One notifications toast',
        tldr: 'After a follow or a poll vote, one toast asks for notifications.',
        where: 'Right after a follow or a poll vote.',
        why: 'Built once. Today the source page and the poll modal each ask their own way.',
        ui: () => (
          <FeedFrame position="toast">
            <ToastPreview
              message="Following #rust. Get a push when it has a big story?"
              action="Turn on notifications"
            />
            <ToastPreview
              message="Vote counted. Get the result when the poll closes?"
              action="Turn on notifications"
            />
          </FeedFrame>
        ),
      },
      {
        title: 'While writing a comment',
        conflict: {
          level: ConflictLevel.Low,
          scope: 'on screen',
          note: 'Only a share row and, on public squads, a join banner sit nearby. But every push prompt shares one dismissal: posting with this switch off hides all the others for good.',
        },
        tldr: 'Live today: the comment composer asks for notifications when you post.',
        where: 'Every comment composer.',
        why: '#6682 replaced the post-comment banner with this, so it asks once.',
        ui: () => (
          <div className="w-full max-w-[36rem]">
            <CommentMarkdownInput
              post={post}
              initialContent="Great write-up, the part on cold starts matched what we saw."
              onClose={noop}
            />
          </div>
        ),
      },
      {
        title: 'A first notification, guaranteed',
        tldr: 'The empty day-0 inbox promises a first notification.',
        where: 'The notifications page, in place of the empty inbox.',
        why: 'A new inbox is empty, and today it promises mentions they cannot get yet.',
        ui: () => <InboxEmptyState />,
      },
    ],
  },
  {
    id: 'app',
    title: 'Mobile app',
    line: 'A deep link on phones, a QR code on desktop and in the extension.',
    options: [
      {
        title: 'Open in the app',
        conflict: {
          level: ConflictLevel.High,
          scope: 'on iOS, none on Android',
          note: 'On iOS the last step is already "Add daily.dev to Home Screen", and Safari\'s own app banner shows on every page. Replace that step with this one. Android web has nothing there today.',
        },
        tldr: 'Phone signups finish onboarding in the app.',
        where: 'The last onboarding step on a phone.',
        why: 'App adopters retain 64.4% against 24.0%.',
        ui: () => (
          <Phone>
            <OnboardingStep
              headline="Your feed is ready"
              subheadline="Keep it on your home screen."
            >
              <div className="flex w-full flex-col gap-2">
                <Button
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.Large}
                  className="w-full"
                >
                  Open in the app
                </Button>
                <Button variant={ButtonVariant.Tertiary}>
                  Continue on the web
                </Button>
              </div>
            </OnboardingStep>
          </Phone>
        ),
      },
      {
        title: 'Open app, logged in',
        conflict: {
          level: ConflictLevel.Medium,
          note: 'The slot is free, but keeping it logged-out only was a deliberate product call, and the row already holds streak, quests, settings and avatar. It needs a product decision and must skip the native apps.',
        },
        tldr: 'Logged-in mobile web gets the "Open app" button in the header.',
        where: 'The mobile web header, logged in.',
        why: 'Logged-in web users have no app prompt at all today.',
        ui: () => (
          <Phone>
            <header className="flex h-14 flex-row items-center justify-between border-b border-border-subtlest-tertiary bg-background-default px-4">
              <span className="flex items-center gap-1">
                <LogoIcon className={{ container: 'h-7' }} />
                <LogoText className={{ container: 'h-4' }} />
              </span>
              <Button
                tag="a"
                variant={ButtonVariant.Primary}
                size={ButtonSize.Small}
              >
                Open app
              </Button>
            </header>
            <div className="h-40" />
          </Phone>
        ),
      },
      {
        title: 'Take this feed with you',
        tldr: 'Extension users get a QR code in the new tab.',
        where: 'The extension new tab, from day 3, without the app.',
        why: 'Extension and app keep 90.4% at D7. Extension alone keeps 58.6%.',
        ui: () => <AppPanel />,
      },
      {
        title: 'A phone widget beside the post',
        tldr: 'The post page sidebar offers the post in the app, with a bedtime message after 22:00.',
        where: 'The post page sidebar, desktop, without the app.',
        why: 'Android app opens are 21.1% of returns, yet 2.0% adopt the app in week one.',
        ui: () => (
          <div className="flex w-full flex-col items-center gap-6">
            <PostFrame label="Before 22:00">
              <PostPhoneWidget
                title="Read it on your phone"
                body="Scan to open this post in the app."
              />
            </PostFrame>
            <PostFrame label="After 22:00">
              <PostPhoneWidget
                title="Late one? Finish it in bed"
                body="Scan to pick up this post in the app."
              />
            </PostFrame>
          </div>
        ),
      },
      {
        title: 'A phone door for Firefox and Safari',
        tldr: 'Browsers that cannot install the extension get the app instead.',
        where: 'The extension step, on Firefox and Safari.',
        why: 'Today these signups skip the step and leave with no second surface.',
        ui: () => (
          <OnboardingStep
            headline="Where should your feed find you?"
            subheadline="Scan to open your feed on your phone."
          >
            <GetAppQrCode className="size-32" />
            <Button variant={ButtonVariant.Tertiary}>
              I will just use the website
            </Button>
          </OnboardingStep>
        ),
      },
    ],
  },
  {
    id: 'onboarding',
    title: 'Upgrade',
    line: 'Upgrades to steps and cards that already ship.',
    options: [
      {
        title: 'Ten is the magic number',
        label: 'Upgrade and notifications',
        tldr: 'The tag picker nudges toward ten, and asks for push once five are picked.',
        where:
          'The tag step. The push card appears at five tags, and the browser prompt only fires from Enable.',
        why: 'Ten tags keep 39.2% at D7 against 14.7%. Five picked tags give the push a concrete promise.',
        ui: () => (
          <OnboardingStep headline="Pick tags that are relevant to you">
            <div className="flex w-full max-w-[27.5rem] flex-col gap-2">
              <div className="flex items-center justify-between typo-footnote">
                <span className="font-bold">5 of 10</span>
                <span className="text-text-tertiary">
                  Your feed gets much sharper at 10
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-max bg-surface-float">
                <div className="h-full w-1/2 rounded-max bg-accent-cabbage-default" />
              </div>
            </div>
            <TagRow
              names={['react', 'css', 'typescript', 'nextjs', 'tailwind']}
              selected={['react', 'css', 'typescript', 'nextjs', 'tailwind']}
            />
            <TagsPushAsk />
          </OnboardingStep>
        ),
      },
      {
        title: 'The first digest gets a date',
        conflict: {
          level: ConflictLevel.Low,
          scope: 'on day 0',
          note: 'Nothing ships at the top of the first feed on day 0. From day 1 the reading reminder banner takes this slot, so keep the card to day 0. It shares the first screen with 7 and 9, so pick which one leads.',
        },
        tldr: 'The first feed tells them when the first digest arrives.',
        where: 'The first feed, day 0.',
        why: 'Only 21% open the first digest. A date makes it expected.',
        ui: () => (
          <FeedFrame position="top">
            <FeedCard
              title="Your first digest · Monday 08:00"
              subtitle="Five picks from React, TypeScript and Node."
            >
              <div className="flex gap-2">
                {['07:30', '08:00', '09:00'].map((time) => (
                  <Button
                    key={time}
                    size={ButtonSize.Small}
                    variant={
                      time === '08:00'
                        ? ButtonVariant.Primary
                        : ButtonVariant.Float
                    }
                    className="flex-1"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </FeedCard>
          </FeedFrame>
        ),
      },
      {
        title: 'SEO signups finish the setup',
        tldr: 'Signups on an article get feed setup in a sheet, right there.',
        where: 'Right after signing up on a post page.',
        why: 'Half of web signups land on an article and never see a feed.',
        ui: () => (
          <Phone>
            <div className="flex h-[24rem] flex-col justify-end bg-overlay-quaternary-onion">
              <div className="flex flex-col rounded-t-16 bg-background-default">
                <div className="flex flex-row items-center border-b border-border-subtlest-tertiary p-4 font-bold typo-title3">
                  Your feed, from this post
                </div>
                <div className="flex w-full flex-col gap-4 px-4 py-3">
                  <TagRow
                    names={['postgresql', 'database', 'backend', 'sql']}
                    selected={['postgresql', 'database']}
                  />
                  <Button variant={ButtonVariant.Primary} className="w-full">
                    Show my feed
                  </Button>
                </div>
              </div>
            </div>
          </Phone>
        ),
      },
      {
        title: 'Ask for the CV last',
        tldr: 'The CV step moves after the extension and the reminder.',
        where: 'The onboarding step order.',
        why: 'About 5% leave at the CV step and never see the extension.',
        ui: () => (
          <div className="flex flex-col gap-4">
            <StepOrder
              label="Onboarding on desktop"
              movedFrom={3}
              steps={[
                'Tags',
                'Content types',
                'Plus',
                'Extension',
                'Upload CV',
              ]}
              moved="Upload CV"
            />
            <StepOrder
              label="Onboarding on mobile"
              movedFrom={3}
              steps={[
                'Tags',
                'Content types',
                'Plus',
                'Reading reminder',
                'Upload CV',
              ]}
              moved="Upload CV"
            />
          </div>
        ),
      },
    ],
  },
];

const optionByTitle = new Map(
  asks.flatMap((ask) =>
    ask.options.map((option) => [
      option.title,
      { ...option, ask: option.label ?? ask.title },
    ]),
  ),
);

const days: {
  id: string;
  title: string;
  line: string;
  hidden?: boolean;
  moments: { title?: string; options: string[] }[];
}[] = [
  {
    id: 'day-0',
    title: 'Day 0',
    line: 'The focus. Signup, the first feed and the first session.',
    moments: [
      {
        title: 'Onboarding',
        options: [
          'Ten is the magic number',
          'Ask for the CV last',
          'Hear when a company is interested',
          'A phone door for Firefox and Safari',
          'Open in the app',
          'SEO signups finish the setup',
        ],
      },
      {
        title: 'The first feed',
        options: [
          'Tell me when it opens',
          'The first digest gets a date',
          'A first notification, guaranteed',
          'Open app, logged in',
        ],
      },
      {
        title: 'First reads and actions',
        options: [
          'Three reads today',
          'One notifications toast',
          'While writing a comment',
          'A phone widget beside the post',
        ],
      },
    ],
  },
  {
    id: 'day-1',
    title: 'Day 1',
    line: 'The second visit. The Briefing push and the first digest set up on day 0 land at 08:00.',
    moments: [{ options: ['You typed it again'] }],
  },
  {
    id: 'days-3-7',
    title: 'Days 3 to 7',
    hidden: true,
    line: 'Once the extension is in, the next ask is the phone.',
    moments: [{ options: ['Take this feed with you'] }],
  },
];

const countFor = (day: (typeof days)[number]): number =>
  day.moments.reduce((total, moment) => total + moment.options.length, 0);

const visibleDays = days.filter((day) => !day.hidden);

const optionCount = visibleDays.reduce(
  (total, day) => total + countFor(day),
  0,
);

const OptionCard = ({
  option,
  number,
}: {
  option: Option & { ask: string };
  number: number;
}): ReactElement => {
  const View = option.ui;

  return (
    <article className="flex flex-col gap-4">
      <div className="flex min-h-[18rem] items-center justify-center overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-6">
        <View />
      </div>
      <div className="flex flex-col gap-1 px-1">
        <span className="text-text-quaternary typo-footnote">{option.ask}</span>
        <h3 className="flex items-baseline gap-2 font-bold typo-title3">
          <span className="text-text-quaternary">{number}</span>
          {option.tldr}
        </h3>
        <p className="text-text-tertiary typo-footnote">
          <span className="font-bold text-text-secondary">Where </span>
          {option.where}
        </p>
        <p className="text-text-tertiary typo-footnote">
          <span className="font-bold text-text-secondary">Why </span>
          {option.why}
        </p>
        {option.conflict && (
          <div
            className={classNames(
              'mt-2 flex flex-col gap-1 rounded-12 border-l-2 bg-surface-float px-3 py-2',
              conflictTone[option.conflict.level],
            )}
          >
            <span className="font-bold typo-footnote">
              Conflict: {option.conflict.level}
              {option.conflict.scope && ` ${option.conflict.scope}`}
            </span>
            <span className="text-text-secondary typo-footnote">
              {option.conflict.note}
            </span>
          </div>
        )}
      </div>
    </article>
  );
};

const AllOptionsPage = (): ReactElement => {
  let number = 0;

  return (
    <div className="min-h-screen bg-background-default px-6 pb-24 pt-10 text-text-primary tablet:px-10">
      <div className="mx-auto flex w-full max-w-[73.75rem] flex-col gap-16">
        <header className="flex flex-col gap-3">
          <span className="text-text-tertiary typo-callout">
            Day zero retention
          </span>
          <h1 className="font-bold typo-mega3">
            {optionCount} ways to bring new users back
          </h1>
          <p className="max-w-[60ch] text-text-secondary typo-body">
            Arranged by day, with day 0 as the focus. Each option asks for one
            thing, and is built from production components.
          </p>
          <nav className="flex flex-wrap gap-2 pt-2">
            {visibleDays.map((day) => (
              <a
                key={day.id}
                href={`#${day.id}`}
                className="rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 font-bold typo-footnote hover:bg-surface-hover"
              >
                {day.title} · {countFor(day)}
              </a>
            ))}
          </nav>
        </header>

        {visibleDays.map((day) => (
          <section key={day.id} id={day.id} className="flex flex-col gap-10">
            <div className="flex flex-col gap-1 border-b border-border-subtlest-tertiary pb-4">
              <h2 className="font-bold typo-mega3">
                {day.title}{' '}
                <span className="text-text-quaternary">{countFor(day)}</span>
              </h2>
              <p className="text-text-tertiary typo-callout">{day.line}</p>
            </div>
            {day.moments.map((moment) => (
              <div key={moment.title ?? day.id} className="flex flex-col gap-6">
                {moment.title && (
                  <h3 className="font-bold typo-title2">
                    {moment.title}{' '}
                    <span className="text-text-quaternary">
                      {moment.options.length}
                    </span>
                  </h3>
                )}
                <div className="grid gap-x-8 gap-y-12 laptop:grid-cols-2">
                  {moment.options.map((title) => {
                    const option = optionByTitle.get(title);

                    if (!option) {
                      return null;
                    }

                    number += 1;

                    return (
                      <OptionCard
                        key={option.title}
                        option={option}
                        number={number}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
};

export const AllOptions: Story = {
  name: 'All options',
  render: () => (
    <Providers>
      <AllOptionsPage />
    </Providers>
  ),
};
