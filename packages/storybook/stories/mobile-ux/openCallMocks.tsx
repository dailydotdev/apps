import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { OpenLinkIcon } from '@dailydotdev/shared/src/components/icons/OpenLink';
import { CopyIcon } from '@dailydotdev/shared/src/components/icons/Copy';
import { RefreshIcon } from '@dailydotdev/shared/src/components/icons/Refresh';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { TrendingIcon } from '@dailydotdev/shared/src/components/icons/Trending';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import { DiscussIcon } from '@dailydotdev/shared/src/components/icons/Discuss';
import { CalendarIcon } from '@dailydotdev/shared/src/components/icons/Calendar';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { GoogleIcon } from '@dailydotdev/shared/src/components/icons/Google';
import { GitHubIcon } from '@dailydotdev/shared/src/components/icons/GitHub';
import { AppleIcon } from '@dailydotdev/shared/src/components/icons/Apple';
import { FacebookIcon } from '@dailydotdev/shared/src/components/icons/Facebook';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';
import { Circle, ExploreCluster, Field, chromeSpec } from './chrome';
import { BarMaterial } from './floating';
import { ExploreHub, FeedList } from './mocks';
import { BottomKind, ScrollPage, TopKind } from './scrollPages';
import { Sheet, SheetGroup, SheetRow } from './sheets';
import { quietChipClassName } from './rowStyle';
import { posts, tags } from './data';

// Mocks for chapter 9b, one per open call: what the recommendation looks
// like, and the alternative beside it where a picture settles it faster
// than a sentence.

const material = BarMaterial.Glass;
const feed = [...posts, ...posts, ...posts];

// Call 3: the field keeps the family's geometry. Radius follows height
// (22 at rest, 18 compact), 52px when focused, and the mobile web keeps the
// floating cluster at compact size above Safari's own pill.
export const FieldSpecimens = (): ReactElement => (
  <div style={{ width: 375 }} className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
    {[
      { p: 0, label: 'At rest: 52px, radius 22, the placeholder' },
      { p: 1, label: 'Compact while reading: 44px, radius 18, pulled in to 40px, "Search"' },
    ].map(({ p, label }) => (
      <div key={label} className="flex flex-col gap-2">
        <span className="text-text-tertiary typo-caption1">{label}</span>
        <div className="flex" style={{ paddingInline: p ? chromeSpec.compactInset - 16 : chromeSpec.inset - 16 }}>
          <Field material={material} p={p} />
        </div>
      </div>
    ))}
    <span className="text-text-tertiary typo-caption1">Focused: 52px, radius 22, hairline in the primary colour (the still beside this one).</span>
  </div>
);

export const MobileWebStill = (): ReactElement => (
  <Phone browser={BrowserChrome.Safari} host="app.daily.dev">
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 items-center px-4 font-bold typo-title3">Explore</div>
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden pb-24">
        <ExploreHub withSearch={false} withSquads={false} withFeed={false} />
        <FeedList items={feed} compact />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
        <ExploreCluster material={material} p={1} />
      </div>
    </div>
  </Phone>
);

// Call 6: a no-shell page. No cluster, no floating buttons, one close
// button top left; system back closes.
export const CloseTop = (): ReactElement => (
  <div className="pointer-events-none absolute inset-x-0 top-2 z-2 flex" style={{ paddingInline: chromeSpec.topInset }}>
    <Circle material={material} fixed className="pointer-events-auto">
      <MiniCloseIcon size={IconSize.Small} />
    </Circle>
  </div>
);

const Primary = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="flex h-12 items-center justify-center rounded-12 bg-text-primary font-bold text-surface-invert typo-callout">{children}</span>
);

export const PlusCheckoutStill = (): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <CloseTop />
      <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-6 pt-16">
        <h1 className="font-bold typo-title3">daily.dev Plus</h1>
        <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
          <span className="font-bold typo-title2">$6.99 <span className="text-text-tertiary typo-footnote">/ month</span></span>
          {['Ad-free reading', 'Custom feeds without limits', 'Clickbait shield and summaries', 'Support the team'].map((line) => (
            <span key={line} className="flex items-center gap-2 typo-callout">
              <VIcon size={IconSize.Small} className="text-accent-avocado-default" />
              {line}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-2 rounded-16 bg-surface-float p-4">
          <span className="text-text-tertiary typo-caption1">Payment</span>
          <span className="typo-callout">Apple Pay · Visa 4242</span>
        </div>
        <span className="flex-1" />
        <Primary>Continue</Primary>
        <span className="text-center text-text-tertiary typo-caption1">Renews monthly. Cancel any time.</span>
      </div>
    </div>
  </Phone>
);

export const OnboardingStepStill = (): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <CloseTop />
      <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-6 pt-16">
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((step) => (
            <span key={step} className={classNames('h-1 flex-1 rounded-2', step <= 1 ? 'bg-text-primary' : 'bg-surface-float')} />
          ))}
        </div>
        <h1 className="font-bold typo-title3">What do you want to follow?</h1>
        <span className="text-text-tertiary typo-footnote">Pick at least three. You can change them any time.</span>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 16).map((tag, index) => (
            <span key={tag} className={quietChipClassName(index % 5 === 0, true)}>#{tag}</span>
          ))}
        </div>
        <span className="flex-1" />
        <Primary>Continue</Primary>
      </div>
    </div>
  </Phone>
);

// Call 8: the page menu in the in-app browser, with reload and without a
// second Share (Share stays on the page's bar).
const PageBehind = (): ReactElement => (
  <div className="flex min-h-0 flex-1 flex-col">
    <div className="flex h-14 items-center justify-center text-text-tertiary typo-footnote">rust-lang.org</div>
    <div className="h-36 bg-gradient-to-br from-accent-bun-default to-accent-cheese-default" />
    <div className="flex flex-col gap-2 px-4 pt-4">
      <span className="h-6 w-3/4 rounded-6 bg-surface-float" />
      <span className="h-3 w-full rounded-4 bg-surface-float" />
      <span className="h-3 w-full rounded-4 bg-surface-float" />
      <span className="h-3 w-2/3 rounded-4 bg-surface-float" />
    </div>
  </div>
);

export const BrowserMenuStill = (): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <PageBehind />
      <Sheet title="rust-lang.org">
        <SheetGroup>
          <SheetRow icon={<OpenLinkIcon size={IconSize.Medium} />} label="Open in Safari" />
          <SheetRow icon={<CopyIcon size={IconSize.Medium} />} label="Copy link" />
          <SheetRow icon={<RefreshIcon size={IconSize.Medium} />} label="Reload" />
        </SheetGroup>
        <SheetGroup>
          <SheetRow icon={<ArrowIcon size={IconSize.Medium} className="-rotate-90" />} label="Back" />
          <SheetRow icon={<ArrowIcon size={IconSize.Medium} className="rotate-90" />} label="Forward" />
        </SheetGroup>
      </Sheet>
    </div>
  </Phone>
);

export const SettingsGeneralStill = (): ReactElement => (
  <ScrollPage kind={TopKind.Page} title="General" active="Home">
    {[
      ['Theme', 'System'],
      ['Language', 'English'],
      ['Open links in the app', 'On'],
      ['Show read time', 'On'],
      ['Reduce motion', 'Follows the system'],
      ['Haptics', 'On'],
    ].map(([label, value]) => (
      <span key={label} className={classNames('flex h-12 items-center justify-between px-4 typo-callout', label === 'Open links in the app' && 'bg-surface-float')}>
        {label}
        <span className="text-text-tertiary typo-footnote">{value}</span>
      </span>
    ))}
    <span className="block px-4 pt-3 text-text-tertiary typo-caption1">
      Off sends article links to Safari or Chrome. The setting exists because Apple and the EU rules ask for a way out, and because some members prefer their own browser.
    </span>
  </ScrollPage>
);

// Call 9: a best-of archive is a plain leaf named after its month, reached
// from the period inside the sort sheet.
export const ArchiveScroll = (): ReactElement => (
  <ScrollPage kind={TopKind.Page} title="September 2025" active="Explore">
    <span className="block px-4 pb-1 pt-2 text-text-tertiary typo-footnote">Best of the month · 40 posts · from the Explore feed</span>
    <FeedList items={feed} compact />
  </ScrollPage>
);

export const SortSheetStill = (): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 items-center px-4 font-bold typo-title3">Explore</div>
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden">
        <ExploreHub withSearch={false} withSquads={false} withFeed={false} />
        <FeedList items={feed} compact />
      </div>
      <Sheet title="Explore feed">
        <SheetGroup>
          <SheetRow icon={<TrendingIcon size={IconSize.Medium} />} label="Popular" meta="Selected" />
          <SheetRow icon={<UpvoteIcon size={IconSize.Medium} />} label="Most upvoted" />
          <SheetRow icon={<DiscussIcon size={IconSize.Medium} />} label="Most discussed" />
        </SheetGroup>
        <SheetGroup>
          <SheetRow icon={<CalendarIcon size={IconSize.Medium} />} label="Period" meta="This week" chevron />
        </SheetGroup>
      </Sheet>
    </div>
  </Phone>
);

// Call 10: the navigation map redrawn from the decisions.
interface Root {
  name: string;
  leaves: string[];
}

const roots: Root[] = [
  { name: 'Home', leaves: ['Segments: For you · Happening now (channels in a menu) · Following · custom feeds', 'Post', 'Comment', 'Tag, Source, Profile, Squad (things)'] },
  { name: 'Explore', leaves: ['Places: Popular, Discussions, Happening now, Tags, Sources, Agents, Hot takes, Game center', 'Explore feed with a sort menu', 'Search (Spotlight, then results with segments)', 'Tags directory, Sources directory, Leaderboard'] },
  { name: 'Squads', leaves: ['Your squads, Discover with category chips', 'Squad page (Posts · About), Members, Manage', 'New squad'] },
  { name: 'Activity', leaves: ['Type chips', 'Notification settings'] },
];

const you = ['Profile (About · Posts · Replies · Upvoted)', 'daily.dev Plus, Custom feeds, My squads, Following, Bookmarks (segments: All · Read later · folders), History', 'Your progress: Achievements, Streak, DevCard, Hot takes, Game center', 'Core wallet, Invite friends, Settings (list, then pages); Help as the top action'];
const noShell = ['Onboarding, welcome, join', 'Log in, verification, OAuth', 'Plus and Cores checkout', 'Invite landing, permission prompts'];

const Box = ({ title, items, tone }: { title: string; items: string[]; tone?: string }): ReactElement => (
  <div className={classNames('flex flex-col gap-2 rounded-16 border p-4', tone ?? 'border-border-subtlest-tertiary')}>
    <span className="font-bold typo-callout">{title}</span>
    <ul className="flex flex-col gap-1 text-text-secondary typo-footnote">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="shrink-0 text-text-quaternary">·</span>
          <span className="min-w-0 flex-1">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const NavMap = (): ReactElement => (
  <div className="flex flex-col gap-4">
    <div className="grid gap-3 tablet:grid-cols-2 laptop:grid-cols-5">
      {roots.map((root) => (
        <Box key={root.name} title={`${root.name} (root)`} items={root.leaves} />
      ))}
      <Box title="Create (square)" items={['Opens the composer directly', 'Kind and audience inside it', 'Posting lands back where you were']} tone="border-accent-cabbage-default" />
    </div>
    <div className="grid gap-3 tablet:grid-cols-2">
      <Box title="You (a leaf behind the avatar, not a tab)" items={you} />
      <Box title="No-shell pages (close top left, no cluster)" items={noShell} tone="border-border-subtlest-secondary" />
    </div>
    <div className="grid gap-3 tablet:grid-cols-3">
      <Box title="Back" items={['A leaf pops to what opened it', 'A segment change replaces the entry, so back leaves the page', 'A deep link with no stack goes to the root that owns the URL']} />
      <Box title="Overlays" items={['Spotlight, sheets and the composer close on back and are not history entries', 'The reading drawer: back pops page history first, then closes the page']} />
      <Box title="Tabs" items={['Re-tap a root: scroll to top, then to its first segment', 'A post opened from Explore keeps Explore lit', 'Nothing lit on a deep link with no owner']} />
    </div>
  </div>
);

// Call 9: the period is one option inside the sort menu; it opens its own
// short list, and the last row leads to the archive.
export const PeriodSheetStill = (): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 items-center px-4 font-bold typo-title3">Explore</div>
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden">
        <ExploreHub withSearch={false} withSquads={false} withFeed={false} />
        <FeedList items={feed} compact />
      </div>
      <Sheet title="Period">
        <SheetGroup>
          <SheetRow icon={<CalendarIcon size={IconSize.Medium} />} label="This week" meta="Selected" />
          <SheetRow icon={<CalendarIcon size={IconSize.Medium} />} label="This month" />
          <SheetRow icon={<CalendarIcon size={IconSize.Medium} />} label="This year" />
          <SheetRow icon={<CalendarIcon size={IconSize.Medium} />} label="A month in the archive" chevron />
        </SheetGroup>
        <span className="px-5 pt-2 text-text-tertiary typo-caption1">Applies to Most upvoted and Most discussed.</span>
      </Sheet>
    </div>
  </Phone>
);

// Call 7: sign-up on a gated action. Production already opens its sign-up
// screen directly (captured in /mobile-ux/prod-auth-gated.jpg: a back
// chevron and "Sign up", four providers, email, the terms line, Log in).
// The proposal keeps that screen and changes two things: the close button
// top left (the no-shell class) and one line naming what the action gets.
const providers: [string, ReactNode][] = [
  ['Google', <GoogleIcon key="google" size={IconSize.Medium} secondary />],
  ['GitHub', <GitHubIcon key="github" size={IconSize.Medium} />],
  ['Apple', <AppleIcon key="apple" size={IconSize.Medium} secondary />],
  ['Facebook', <FacebookIcon key="facebook" size={IconSize.Medium} secondary />],
];

export const SignupPageStill = ({ context = 'Save this post and build your feed' }: { context?: string }): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <CloseTop />
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-6 pt-16">
        <h1 className="font-bold typo-title2">Sign up</h1>
        <span className="pb-5 pt-1 text-text-tertiary typo-callout">{context}</span>
        <div className="flex flex-col gap-3">
          {providers.map(([label, icon]) => (
            <span key={label} className="flex h-12 items-center justify-center gap-3 rounded-[999px] bg-text-primary font-bold text-surface-invert typo-callout">
              {icon}
              Continue with {label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 py-4">
          <span className="h-px flex-1 bg-border-subtlest-tertiary" />
          <span className="text-text-tertiary typo-footnote">or</span>
          <span className="h-px flex-1 bg-border-subtlest-tertiary" />
        </div>
        <span className="flex h-12 items-center gap-2 rounded-[999px] border border-border-subtlest-secondary px-4 text-text-tertiary typo-callout">
          <span className="flex-1">Email</span>
          <ArrowIcon size={IconSize.Small} className="rotate-90" />
        </span>
        <span className="pt-3 text-center text-text-tertiary typo-footnote">
          By continuing, you agree to the <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
        </span>
        <span className="flex-1" />
        <span className="text-center text-text-secondary typo-callout">
          Already using daily.dev? <span className="font-bold text-text-primary underline">Log in</span>
        </span>
      </div>
    </div>
  </Phone>
);
