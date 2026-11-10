import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import { Checkbox } from '@dailydotdev/shared/src/components/fields/Checkbox';
import { ModalClose } from '@dailydotdev/shared/src/components/modals/common/ModalClose';
import { ProfileSection } from '@dailydotdev/shared/src/components/ProfileMenu/ProfileSection';
import type { ProfileSectionItemProps } from '@dailydotdev/shared/src/components/ProfileMenu/ProfileSectionItem';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { HorizontalSeparator } from '@dailydotdev/shared/src/components/utilities/common';
import { StarIcon } from '@dailydotdev/shared/src/components/icons/Star';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { CreditCardIcon } from '@dailydotdev/shared/src/components/icons/CreditCard';
import { InviteIcon } from '@dailydotdev/shared/src/components/icons/Invite';
import { TerminalIcon } from '@dailydotdev/shared/src/components/icons/Terminal';
import { DocsIcon } from '@dailydotdev/shared/src/components/icons/Docs';
import { FeedbackIcon } from '@dailydotdev/shared/src/components/icons/Feedback';
import { MegaphoneIcon } from '@dailydotdev/shared/src/components/icons/Megaphone';
import { AppleIcon } from '@dailydotdev/shared/src/components/icons/Apple';
import { TimerIcon } from '@dailydotdev/shared/src/components/icons/Timer';
import { ShieldPlusIcon } from '@dailydotdev/shared/src/components/icons/ShieldPlus';
import { BlockIcon } from '@dailydotdev/shared/src/components/icons/Block';
import { BriefIcon } from '@dailydotdev/shared/src/components/icons/Brief';
import { DevPlusIcon } from '@dailydotdev/shared/src/components/icons/DevPlus';
import { GiftIcon } from '@dailydotdev/shared/src/components/icons/gift';
import { PlusUser } from '@dailydotdev/shared/src/components/PlusUser';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';
import { cloudinaryStreakFire } from '@dailydotdev/shared/src/lib/image';

// The surfaces behind the App Store review ideas, built from the production
// components.

const noop = (): void => undefined;

// An iPhone 16 at 360 by 740 points: status bar, Dynamic Island and the home
// indicator around whatever screen it holds.
const Phone = ({
  children,
  label,
}: {
  children: ReactNode;
  label?: string;
}): ReactElement => (
  <figure className="flex shrink-0 flex-col items-center gap-3">
    <div className="relative h-[46.25rem] w-[22.5rem] overflow-hidden rounded-[3rem] border-[0.375rem] border-border-subtlest-primary bg-background-default shadow-2">
      <div className="absolute inset-x-0 top-0 z-3 flex h-12 items-center justify-between px-8 font-bold text-text-primary typo-callout">
        <span>9:41</span>
        <span className="absolute left-1/2 top-2.5 h-8 w-28 -translate-x-1/2 rounded-[1rem] bg-black" />
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-4 rounded-2 bg-text-primary" />
          <span className="h-3 w-6 rounded-4 border border-text-primary p-0.5">
            <span className="block size-full rounded-2 bg-text-primary" />
          </span>
        </span>
      </div>
      <div className="flex h-full flex-col pt-12">{children}</div>
      <span className="absolute bottom-2 left-1/2 z-3 h-1 w-32 -translate-x-1/2 rounded-[0.125rem] bg-text-primary" />
    </div>
    {label && (
      <figcaption className="max-w-[22.5rem] text-center text-text-tertiary typo-footnote">
        {label}
      </figcaption>
    )}
  </figure>
);

const FeedBehind = (): ReactElement => (
  <div className="flex flex-1 flex-col gap-3 px-4 pt-2" aria-hidden>
    <div className="flex items-center justify-between py-2">
      <LogoIcon className={{ container: 'h-6 w-auto' }} />
      <span className="size-8 rounded-10 bg-surface-float" />
    </div>
    {[0, 1, 2].map((card) => (
      <div
        key={card}
        className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-3"
      >
        <span className="h-3 w-10/12 rounded-4 bg-surface-float" />
        <span className="h-3 w-7/12 rounded-4 bg-surface-float" />
        <span className="mt-1 h-32 rounded-12 bg-surface-float" />
      </div>
    ))}
  </div>
);

// The mobile drawer chrome Modal uses with isDrawerOnMobile.
const Sheet = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div className="absolute inset-0 z-2 flex flex-col justify-end bg-overlay-quaternary-onion">
    <div
      className={classNames(
        'flex flex-col rounded-t-16 border-t border-border-subtlest-tertiary bg-background-default pb-8',
        className,
      )}
    >
      <div className="flex shrink-0 justify-center pb-1 pt-3">
        <span className="h-1 w-9 rounded-2 bg-border-subtlest-secondary" />
      </div>
      {children}
    </div>
  </div>
);

// Our own ask around Apple's sheet, whose text stays fixed. The CTA is the
// write-a-review link, never the prompt itself.
const askCopy = {
  headline: 'A little love goes a long way. ❤️',
  text: 'If daily.dev has made your day a little better, a quick rating would mean a lot to us.',
  shortText: 'Made your day a little better? A quick rating means a lot.',
  cta: 'Rate daily.dev',
  row: 'Show daily.dev some love ❤️',
};

// The ask as a card inside a sheet we already show.
const AskCard = (): ReactElement => {
  return (
    <div className="flex w-full flex-col gap-1 rounded-16 bg-surface-float p-4 text-left">
      <Typography type={TypographyType.Callout} bold>
        {askCopy.headline}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {askCopy.shortText}
      </Typography>
      <Button
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        icon={<AppleIcon />}
        className="mt-2 w-fit"
      >
        {askCopy.cta}
      </Button>
    </div>
  );
};

// The ask as its own sheet over the feed.
const AskSheet = (): ReactElement => {
  return (
    <Sheet className="gap-5 px-4">
      <div className="flex flex-col items-center gap-2 pt-4 text-center">
        <span aria-hidden>
          <LogoIcon className={{ container: 'size-12' }} />
        </span>
        <Typography type={TypographyType.Title2} bold className="mt-2">
          {askCopy.headline}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {askCopy.text}
        </Typography>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          icon={<AppleIcon />}
        >
          {askCopy.cta}
        </Button>
        <Button variant={ButtonVariant.Tertiary} size={ButtonSize.Medium}>
          Not now
        </Button>
      </div>
    </Sheet>
  );
};

// NewStreakModal's body, as the drawer a phone gets.
const StreakMilestoneSheet = (): ReactElement => (
  <Sheet>
    <div className="flex flex-col items-center px-4">
      <div className="relative flex h-14 w-full items-center justify-end">
        <ModalClose onClick={noop} className="!right-0 top-2" />
      </div>
      <span className="relative flex flex-col items-center justify-center">
        <img
          src={cloudinaryStreakFire}
          alt="A large fire icon"
          className="h-[10rem] w-[10rem]"
        />
        <strong className="absolute typo-tera">30</strong>
      </span>
      <strong className="mt-6 typo-title1">30 days streak</strong>
      <p className="mt-2 text-center text-text-tertiary typo-body">
        New milestone reached! You are unstoppable.
      </p>
      <div className="mt-6 w-full">
        <AskCard />
      </div>
      <Checkbox name="show_streaks" className="mt-6">
        Never show this again
      </Checkbox>
    </div>
  </Sheet>
);

// Apple's own rating sheet (SKStoreReviewController). We do not draw this;
// it is here to show what lands on screen when review-request fires.
const AppleRatingSheet = (): ReactElement => (
  <div className="absolute inset-0 z-2 flex items-center justify-center bg-overlay-tertiary-black px-14">
    <div className="flex w-full flex-col items-center overflow-hidden rounded-24 bg-background-popover text-center shadow-3">
      <div className="flex flex-col items-center gap-1 px-5 pb-4 pt-5">
        <span className="mb-2 flex size-12 items-center justify-center rounded-12 bg-black">
          <LogoIcon className={{ container: 'size-8', group: 'fill-white' }} />
        </span>
        <p className="font-bold text-text-primary typo-body">
          Enjoying daily.dev?
        </p>
        <p className="text-text-secondary typo-footnote">
          Tap a star to rate it on the App Store.
        </p>
      </div>
      <div className="flex w-full justify-center gap-3 border-t border-border-subtlest-tertiary py-3 text-accent-blueCheese-default">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} size={IconSize.Small} />
        ))}
      </div>
      <span className="w-full border-t border-border-subtlest-tertiary py-3 text-accent-blueCheese-default typo-body">
        Not Now
      </span>
    </div>
  </div>
);

// The App Store's own write-a-review sheet, which opens from
// review-open-store (the product page URL with action=write-review). Apple
// draws this too.
const AppStoreWriteReview = (): ReactElement => (
  <div className="flex flex-1 flex-col gap-6 px-4 pt-2">
    <div className="flex items-center justify-between py-2 typo-body">
      <span className="text-accent-blueCheese-default">Cancel</span>
      <span className="font-bold text-text-primary">Write a Review</span>
      <span className="font-bold text-text-disabled">Send</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <span className="flex size-14 items-center justify-center rounded-14 bg-black">
        <LogoIcon className={{ container: 'size-9', group: 'fill-white' }} />
      </span>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        Tap a Star to Rate
      </Typography>
      <span className="flex gap-3 text-accent-blueCheese-default">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} size={IconSize.Large} />
        ))}
      </span>
    </div>
    <div className="flex flex-col rounded-12 bg-surface-float">
      <span className="border-b border-border-subtlest-tertiary px-4 py-3 text-text-quaternary typo-body">
        Title
      </span>
      <span className="h-40 px-4 py-3 text-text-quaternary typo-body">
        Review (Optional)
      </span>
    </div>
  </div>
);

const Section = ({
  title,
  idea,
  children,
}: {
  title: string;
  idea: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-6">
    <div className="flex flex-col gap-1">
      <Typography type={TypographyType.Title2} bold>
        {title}
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="max-w-[48rem]"
      >
        {idea}
      </Typography>
    </div>
    <div className="flex flex-wrap items-start gap-10">{children}</div>
  </section>
);

const Page = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="min-h-screen bg-background-subtle px-4 py-10 tablet:px-10">
    <div className="mx-auto flex max-w-[80rem] flex-col gap-16">{children}</div>
  </div>
);

const StreakPromptSurface = (): ReactElement => (
  <Section
    title="Streak milestone: tie the ask to the moment"
    idea="Apple draws the rating sheet, and its text is fixed: iOS always writes “Enjoying daily.dev?” in the user's language, and requestReview takes no askCopy. So the link to the milestone comes from timing: the emotional peak, at the end of something the reader completed, which is exactly where Apple says to ask. The fire animation and a success haptic play, then about 1.5s later review-request fires on its own while the 30 is still on screen behind Apple's sheet. People rate the feeling. Only when the session had no errors and the 120-day cooldown allows it."
  >
    <Phone label="1. The 30-day milestone drawer, with our ask under it">
      <FeedBehind />
      <StreakMilestoneSheet />
    </Phone>
    <Phone label="Apple's sheet over the milestone, about 1.5s after it lands. The sheet's text is set by iOS">
      <FeedBehind />
      <StreakMilestoneSheet />
      <AppleRatingSheet />
    </Phone>
  </Section>
);

const accountItems = [
  { title: 'Settings', icon: SettingsIcon, href: '/settings/profile' },
  {
    title: 'Payment & Subscription',
    icon: CreditCardIcon,
    href: '/settings/subscription',
  },
  { title: 'Invite friends', icon: InviteIcon, href: '/settings/invite' },
];

const resourceItems = (rateItem: ProfileSectionItemProps) => [
  {
    title: 'Changelog',
    icon: TerminalIcon,
    href: 'https://app.daily.dev/sources/daily_updates',
  },
  rateItem,
  {
    title: 'Advertise',
    icon: MegaphoneIcon,
    href: 'https://business.daily.dev',
    external: true,
  },
  {
    title: 'Docs',
    icon: DocsIcon,
    href: 'https://docs.daily.dev',
    external: true,
  },
  {
    title: 'Support',
    icon: FeedbackIcon,
    href: 'https://daily.dev/support',
    external: true,
  },
];

// The iOS profile tab, the real ProfileSection rows.
const ProfileScreen = (): ReactElement => {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pt-4">
      <div className="flex items-center gap-3 px-1">
        <img
          src="https://media.daily.dev/image/upload/f_auto,q_auto/v1/placeholders/1"
          alt="Dev Dana"
          className="size-12 rounded-12 object-cover"
        />
        <div className="flex flex-col">
          <Typography type={TypographyType.Body} bold>
            Dev Dana
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            @dana · 1,284 reputation
          </Typography>
        </div>
      </div>
      <HorizontalSeparator />
      <ProfileSection items={accountItems} withSeparator />
      <ProfileSection
        title="Resources"
        items={resourceItems({
          title: askCopy.row,
          icon: AppleIcon,
          onClick: noop,
        })}
      />
    </div>
  );
};

const RateRowSurface = (): ReactElement => (
  <Section
    title="Permanent “Rate daily.dev” row"
    idea="One row in the profile menu's resources section, the real ProfileSection. Apple's own advice for a button like this: never call requestReview from a tap, because it may show nothing, and put a persistent link to the write-a-review page in settings instead. So the row calls review-open-store, which opens the App Store's “Write a Review” sheet. It never uses up the yearly prompt, so it is there for anyone, any time."
  >
    <Phone label="iOS profile tab with the Rate daily.dev row">
      <ProfileScreen />
    </Phone>
    <Phone label="The tap opens the App Store's Write a Review sheet">
      <AppStoreWriteReview />
    </Phone>
  </Section>
);

// Placeholder people and quotes. In production the quotes come word for word
// from the same source as daily.dev/wall-of-love, never a list in the bundle.
const placeholderAvatar = (index: number): string =>
  `https://media.daily.dev/image/upload/f_auto,q_auto/v1/placeholders/${index}`;

const testimonials = [
  {
    name: 'Alex Rivera',
    role: 'Software Engineer',
    avatar: placeholderAvatar(1),
    text: 'It changed how I keep up with my field. I am usually the one on my team who already read about the new release.',
  },
  {
    name: 'Sam Patel',
    role: 'Senior Staff Software Engineer',
    avatar: placeholderAvatar(2),
    text: 'My daily source of what is new in tech, and of the conversations developers are having about it.',
  },
  {
    name: 'Jordan Lee',
    role: 'CTO',
    avatar: placeholderAvatar(3),
    text: 'I used to check a handful of sites every morning. Now it is one tab, and it is part of my routine.',
  },
  {
    name: 'Casey Morgan',
    role: 'Software Developer',
    avatar: placeholderAvatar(4),
    text: 'It is my browser start page now. The latest news and resources, without hunting all over the internet.',
  },
  {
    name: 'Riley Chen',
    role: 'Senior Developer',
    avatar: placeholderAvatar(5),
    text: 'Short summaries plus comments from people in the industry help me form an opinion fast.',
  },
];

// Our own screen, shown when someone comes back to the feed from their first
// article on a big release. It never asks for stars itself: review-request
// fires on its own after a short pause, and the button is the write-a-review
// link for people who want to add words.
const ReviewScreen = ({
  withPrompt = false,
}: {
  withPrompt?: boolean;
}): ReactElement => {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex justify-end px-4 pt-2">
        <ModalClose onClick={noop} className="!static" />
      </div>
      <div className="flex flex-col items-center gap-2 px-6 pt-2 text-center">
        <span aria-hidden>
          <LogoIcon className={{ container: 'size-12' }} />
        </span>
        <Typography type={TypographyType.Title1} bold className="mt-2">
          {askCopy.headline}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {askCopy.text}
        </Typography>
        <div className="mt-2 flex items-center gap-2">
          <span className="flex -space-x-2">
            {testimonials.map(({ name, avatar }) => (
              <img
                key={name}
                src={avatar}
                alt=""
                className="size-6 rounded-8 border-2 border-background-default object-cover"
              />
            ))}
          </span>
          <Typography type={TypographyType.Footnote} bold>
            Join millions of developers
          </Typography>
        </div>
      </div>
      <div className="mt-6 flex snap-x gap-3 overflow-x-auto px-6 pb-2">
        {testimonials.map((testimonial) => (
          <article
            key={testimonial.name}
            className="flex w-64 shrink-0 snap-center flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4"
          >
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
              className="line-clamp-4"
            >
              “{testimonial.text}”
            </Typography>
            <div className="mt-auto flex items-center gap-2">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="size-8 rounded-10 object-cover"
              />
              <div className="flex min-w-0 flex-col">
                <Typography type={TypographyType.Caption1} bold truncate>
                  {testimonial.name}
                </Typography>
                <Typography
                  type={TypographyType.Caption2}
                  color={TypographyColor.Tertiary}
                  truncate
                >
                  {testimonial.role}
                </Typography>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-auto flex flex-col px-6 pb-8">
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          icon={<AppleIcon />}
        >
          {askCopy.cta}
        </Button>
      </div>
      {withPrompt && <AppleRatingSheet />}
    </div>
  );
};

const ReviewScreenSurface = (): ReactElement => (
  <Section
    title="What's new, then a review screen"
    idea="The method behind Left's 4.7★ from thousands of ratings, adjusted to Apple's advice. Only after a big release: when someone comes back to the feed from their first article on the new version, a full screen of real testimonials from our wall of love opens. After a short pause on it, review-request fires on its own and Apple's sheet opens over it, the way Apple's own sample asks only after people pause on a finished step. The button is never the prompt: it is “Rate daily.dev”, the write-a-review link, for people who want to add words. Never at launch, and skipped for anyone who already rated."
  >
    <Phone label="1. Back on the feed after their first article on the new version">
      <ReviewScreen />
    </Phone>
    <Phone label="2. About 2s later, Apple's sheet opens on its own">
      <ReviewScreen withPrompt />
    </Phone>
  </Section>
);

// An example heavy week: minutes read each day, from the posts opened and
// the time spent in the native reader.
const readingWeek = [
  { day: 'Mon', minutes: 18 },
  { day: 'Tue', minutes: 24 },
  { day: 'Wed', minutes: 0 },
  { day: 'Thu', minutes: 31 },
  { day: 'Fri', minutes: 22 },
  { day: 'Sat', minutes: 9 },
  { day: 'Sun', minutes: 14 },
];
const weeklyMinutesBar = 90;
const weeklyDaysBar = 5;
const weekMinutes = readingWeek.reduce((sum, { minutes }) => sum + minutes, 0);
const weekDays = readingWeek.filter(({ minutes }) => minutes > 0).length;
const longestDay = Math.max(...readingWeek.map(({ minutes }) => minutes));

const WeekRule = (): ReactElement => (
  <div className="flex w-[22.5rem] flex-col gap-5 rounded-24 border border-border-subtlest-tertiary bg-background-default p-6">
    <div className="flex items-center gap-2">
      <TimerIcon size={IconSize.Small} />
      <Typography type={TypographyType.Callout} bold>
        Dana’s last 7 days
      </Typography>
    </div>
    <div className="flex h-32 items-end gap-2">
      {readingWeek.map(({ day, minutes }) => (
        <div
          key={day}
          className="flex h-full flex-1 flex-col items-center gap-1"
        >
          <div className="flex w-full flex-1 items-end">
            <span
              className={classNames(
                'w-full rounded-6',
                minutes ? 'bg-accent-cabbage-default' : 'bg-surface-float',
              )}
              style={{
                height: minutes
                  ? `${(minutes / longestDay) * 100}%`
                  : '0.25rem',
              }}
            />
          </div>
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
          >
            {day}
          </Typography>
        </div>
      ))}
    </div>
    <div className="flex flex-col gap-2">
      {[
        `${Math.floor(weekMinutes / 60)}h ${weekMinutes % 60}m read, over the ${weeklyMinutesBar}m bar`,
        `${weekDays} reading days, over the ${weeklyDaysBar}-day bar`,
        'No errors or slow loads this session',
      ].map((check) => (
        <div key={check} className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-accent-avocado-flat text-accent-avocado-default typo-caption2">
            ✓
          </span>
          <Typography type={TypographyType.Footnote}>{check}</Typography>
        </div>
      ))}
    </div>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      Both bars crossed, so review-request fires the next time Dana closes an
      article and lands back on the feed.
    </Typography>
  </div>
);

const HeavyWeekSurface = (): ReactElement => (
  <Section
    title="A heavy week of reading"
    idea={`Apple suggests timing the ask by how often people use the app, and time spent is the most honest sign someone likes it. When a reader passes ${weeklyMinutesBar} minutes and ${weeklyDaysBar} reading days in the last 7 days, the next time they finish an article and land back on the feed, review-request fires on its own and Apple's sheet opens. That is a natural break, never mid-article, never at launch and never in a session with errors. The bars live in GrowthBook so we can tune them, and the 120-day cooldown is kept on the device.`}
  >
    <WeekRule />
    <Phone label="1. Back on the feed after the article that crossed the bar">
      <FeedBehind />
      <AskSheet />
    </Phone>
    <Phone label="2. About 2s later, Apple's sheet opens on its own">
      <FeedBehind />
      <AskSheet />
      <AppleRatingSheet />
    </Phone>
  </Section>
);

// What Plus did for this member in their first month, with example numbers.
const plusMonth = [
  { icon: ShieldPlusIcon, text: '38 clickbait titles rewritten' },
  { icon: BlockIcon, text: '412 posts read, zero ads' },
  { icon: BriefIcon, text: '4 Presidential Briefings delivered' },
];

// After the first renewal: they chose to stay.
const PlusRenewalSheet = (): ReactElement => (
  <Sheet className="gap-4 px-4">
    <div className="flex flex-col items-center gap-2 pt-2 text-center">
      <span className="flex size-16 items-center justify-center rounded-20 bg-action-plus-float text-action-plus-default">
        <DevPlusIcon secondary size={IconSize.XXLarge} />
      </span>
      <PlusUser typographyType={TypographyType.Callout} />
      <Typography type={TypographyType.Title2} bold>
        Thanks for staying with Plus
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Here’s your first month of Plus.
      </Typography>
    </div>
    <div className="flex flex-col gap-1 rounded-16 bg-surface-float p-2">
      {plusMonth.map(({ icon: Icon, text }) => (
        <div key={text} className="flex items-center gap-3 px-2 py-2">
          <span className="text-action-plus-default">
            <Icon secondary size={IconSize.Small} />
          </span>
          <Typography type={TypographyType.Callout}>{text}</Typography>
        </div>
      ))}
    </div>
    <AskCard />
    <div className="flex flex-col gap-2">
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        icon={<GiftIcon />}
      >
        Gift Plus to a friend
      </Button>
      <Button variant={ButtonVariant.Tertiary} size={ButtonSize.Medium}>
        Back to my feed
      </Button>
    </div>
  </Sheet>
);

const PlusMembersSurface = (): ReactElement => (
  <Section
    title="Plus members, after they renew"
    idea="People who pay are the ones who already decided daily.dev is worth it. After their first renewal, and again on their Plus anniversary, a sheet thanks them with what Plus did for them that month, when they come back to the feed from an article, never at launch. After a short pause on it, review-request fires on its own and Apple's sheet opens over it, like the streak milestone. “Gift Plus to a friend” is the other way to spread the word. The ask card’s button opens the write-a-review page, never the prompt: Apple says the prompt may not show from a tap. Never on a checkout or paywall screen, never after a failed payment, and no perk for rating."
  >
    <Phone label="1. The thank-you sheet after the first renewal">
      <FeedBehind />
      <PlusRenewalSheet />
    </Phone>
    <Phone label="2. About 2s later, Apple's sheet opens on its own">
      <FeedBehind />
      <PlusRenewalSheet />
      <AppleRatingSheet />
    </Phone>
  </Section>
);

const shareCards: { id: string; surface: () => ReactElement }[] = [
  { id: 'streak-milestone', surface: StreakPromptSurface },
  { id: 'rate-row', surface: RateRowSurface },
  { id: 'review-screen', surface: ReviewScreenSurface },
  { id: 'heavy-week', surface: HeavyWeekSurface },
  { id: 'plus-members', surface: PlusMembersSurface },
];

// One idea per card, sized to share as an image: the brand, the idea's
// number, its description and its UI.
const ShareCard = ({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}): ReactElement => {
  return (
    <article
      data-share-card={shareCards[index].id}
      className="flex w-fit min-w-[56rem] max-w-[90rem] flex-col gap-10 bg-background-subtle p-16"
    >
      <header className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <LogoIcon className={{ container: 'h-8 w-auto' }} />
          <LogoText className={{ container: 'h-6 w-auto' }} />
        </span>
        <span className="rounded-10 bg-accent-cabbage-flat px-3 py-1 font-bold text-accent-cabbage-default typo-callout">
          More App Store reviews · Idea {index + 1} of {shareCards.length}
        </span>
      </header>
      {children}
    </article>
  );
};

const meta: Meta = {
  title: 'Growth/App Store reviews/Surfaces',
  id: 'app-store-review-surfaces',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const AllSurfaces: Story = {
  name: 'All surfaces',
  render: () => (
    <Page>
      <StreakPromptSurface />
      <RateRowSurface />
      <ReviewScreenSurface />
      <HeavyWeekSurface />
      <PlusMembersSurface />
    </Page>
  ),
};

export const ShareCards: Story = {
  name: 'Share cards',
  render: () => (
    <div className="flex flex-col items-start gap-8 bg-background-default p-8">
      {shareCards.map((card, index) => {
        const Surface = card.surface;
        return (
          <ShareCard key={card.id} index={index}>
            <Surface />
          </ShareCard>
        );
      })}
    </div>
  ),
};

export const StreakPrompt: Story = {
  name: 'Streak milestone',
  render: () => (
    <Page>
      <StreakPromptSurface />
    </Page>
  ),
};

export const RateRow: Story = {
  name: 'Rate daily.dev row',
  render: () => (
    <Page>
      <RateRowSurface />
    </Page>
  ),
};

export const ReviewScreenAfterLaunch: Story = {
  name: "What's new, then a review screen",
  render: () => (
    <Page>
      <ReviewScreenSurface />
    </Page>
  ),
};

export const HeavyWeek: Story = {
  name: 'A heavy week of reading',
  render: () => (
    <Page>
      <HeavyWeekSurface />
    </Page>
  ),
};

export const PlusMembers: Story = {
  name: 'Plus members, after they renew',
  render: () => (
    <Page>
      <PlusMembersSurface />
    </Page>
  ),
};
