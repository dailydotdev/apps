import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { OpenLinkIcon } from '@dailydotdev/shared/src/components/icons/OpenLink';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BottomKind, ScrollPage, TopKind } from './scrollPages';
import { VisitorActions, VisitorButtonLook } from './visitors';
import { CommentList, PostCover, SourceAvatar } from './mocks';
import { posts } from './data';

// Mocks for chapter 9f: the public post page and the arbitrage page with
// their ads, under the shell. Sizes come from the code, not from captures:
// headless captures show the chrome but the auction never fills there.
//
// Production (ProgrammaticAd.tsx): every unit is a constant WHITE card, not
// a theme token, because display creatives are designed against light
// backgrounds; the label is a constant gray for the same reason. The 320x50
// strip renders compact (no label, py-1 = 58px); the 300x250 reserves 286px.

const post = posts[0];

const Creative = ({ width, height, label }: { width: number; height: number; label: string }): ReactElement => (
  <span
    className="mx-auto flex items-center justify-center bg-gradient-to-br from-raw-pepper-10 to-raw-salt-30 text-raw-pepper-60 typo-caption1"
    style={{ width, height }}
  >
    {label}
  </span>
);

export const AdStrip = (): ReactElement => (
  <div className="flex h-full items-center justify-center bg-background-default py-1">
    <div className="w-80 rounded-8 bg-white">
      <Creative width={320} height={50} label="320 × 50" />
    </div>
  </div>
);

export const adStripHeight = 58;

export const AdCard = ({ className }: { className?: string }): ReactElement => (
  <div className={classNames('mx-auto w-full max-w-[300px] rounded-8 bg-white py-2 text-center', className)}>
    <span className="block pb-1 pr-1 text-right text-raw-pepper-10 typo-caption2">Advertisements</span>
    <Creative width={300} height={250} label="300 × 250" />
  </div>
);

// PostSidebarAdWidget, inline variant: the direct-sold unit that stacks
// under the article on phones. Unchanged by the shell.
export const PromotedWidget = (): ReactElement => (
  <div className="mx-4 flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-3">
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-max bg-accent-avocado-default font-bold text-white typo-callout">n</span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold typo-callout">NinjaOne</span>
        <span className="text-text-quaternary typo-footnote">Promoted by NinjaOne · Advertise here</span>
      </div>
      <span className="rounded-10 bg-text-primary px-3 py-1.5 font-bold text-surface-invert typo-footnote">Visit</span>
    </div>
    <span className="typo-callout">Cut patch cycles from 72 hours to minutes.</span>
  </div>
);

const summaryOne =
  'The App Router adds real power and real complexity. The author walks through where file-based routing got harder, and which patterns still keep it simple, with a checklist for teams deciding when to migrate.';
const summaryTwo =
  'Server components change where data loads and where state lives; the post ends with the three cases where the Pages Router is still the right call.';

const Article = ({ visitor }: { visitor?: boolean }): ReactElement => (
  <div className="flex flex-col gap-4 px-4 pb-6 pt-4">
    <div className="flex items-center gap-2">
      <SourceAvatar post={post} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-bold typo-footnote">{post.source}</span>
        <span className="text-text-tertiary typo-caption1">
          {post.date} · {post.readTime}m read time
        </span>
      </div>
    </div>
    <h1 className="font-bold leading-tight typo-title1">{post.title}</h1>
    <p className="text-text-secondary typo-body">{summaryOne}</p>
    {/* The first in-content MPU: after 250 characters of the TLDR. The
        second and later stay hidden on phones (hideOnPhone). */}
    <AdCard />
    <p className="text-text-secondary typo-body">{summaryTwo}</p>
    <div className="flex flex-wrap gap-1.5">
      {post.tags.map((tag) => (
        <span key={tag} className="rounded-8 bg-surface-float px-2 py-0.5 text-text-tertiary typo-caption1">
          #{tag}
        </span>
      ))}
    </div>
    <PostCover post={post} className="h-40" />
    <span className="flex h-12 items-center justify-center gap-2 rounded-12 bg-text-primary font-bold text-surface-invert typo-callout">
      <OpenLinkIcon size={IconSize.Small} />
      {visitor ? 'Read the full post' : 'Read the full post'}
    </span>
  </div>
);

const AfterComments = (): ReactElement => (
  <div className="flex flex-col gap-4 pb-6 pt-2">
    <PromotedWidget />
    {/* Slot 16: the rail unit, which stacks full width under the article
        on phones. No hideOnPhone. */}
    <AdCard />
    <div className="mx-4 flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
      <span className="font-bold typo-callout">You might like</span>
      {posts.slice(1, 3).map((item) => (
        <div key={item.id} className="flex items-center gap-3">
          <SourceAvatar post={item} />
          <span className="min-w-0 flex-1 truncate typo-callout">{item.title}</span>
        </div>
      ))}
    </div>
  </div>
);

const visitorActions = <VisitorActions look={VisitorButtonLook.Floating} />;

// The public post page for a visitor, under the shell: the pinned strip on
// top of everything (the one thing at the top that never hides), the leaf
// block (back, Log in, Open app) that hides while reading, the post
// cluster at the bottom, the in-content units as content.
export const PublicPostAdsScroll = ({ strip = true }: { strip?: boolean } = {}): ReactElement => (
  <ScrollPage
    kind={TopKind.Page}
    active="Home"
    personal={false}
    actions={visitorActions}
    bottom={BottomKind.Post}
    topBanner={strip ? <AdStrip /> : undefined}
    topBannerHeight={adStripHeight}
  >
    <Article visitor />
    {/* Slot 23: above the comments. */}
    <div className="border-t border-border-subtlest-tertiary px-4 pt-6">
      <AdCard />
    </div>
    <CommentList />
    <AfterComments />
  </ScrollPage>
);

// The arbitrage page (/articles/[id]) under the shell: the same page for a
// visitor who arrived from a paid campaign. No auth banner (as today), the
// strip pinned, light theme forced (as today), the cluster present so the
// page is not a doorway. Read the full post opens the source in a new tab,
// as the mobile web does everywhere.
export const ArbitragePageScroll = (): ReactElement => (
  <ScrollPage
    kind={TopKind.Page}
    active="Home"
    personal={false}
    actions={visitorActions}
    bottom={BottomKind.Post}
    topBanner={<AdStrip />}
    topBannerHeight={adStripHeight}
  >
    <Article visitor />
    <div className="border-t border-border-subtlest-tertiary px-4 pt-6">
      <AdCard />
    </div>
    <CommentList />
    <div className="flex flex-col gap-4 px-4 pb-6 pt-2">
      <span className="font-bold typo-callout">Further reading</span>
      {posts.slice(1, 4).map((item) => (
        <div key={item.id} className="flex items-center gap-3">
          <SourceAvatar post={item} />
          <span className="min-w-0 flex-1 truncate typo-callout">{item.title}</span>
        </div>
      ))}
    </div>
  </ScrollPage>
);

// Today's pinned stack on a public post, drawn to scale: strip 58, auth
// banner 56, back bar 49 at the top; floating bar and footer nav 143 at
// the bottom. What is left is the reading area.
const Pinned = ({ height, children, tone }: { height: number; children: ReactNode; tone: string }): ReactElement => (
  <div className={classNames('flex shrink-0 items-center justify-center px-3 text-center typo-caption1', tone)} style={{ height }}>
    {children}
  </div>
);

export const PinnedStackToday = (): ReactElement => (
  <div className="flex h-[41.5rem] w-[23.4375rem] flex-col overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default">
    <Pinned height={58} tone="bg-overlay-float-ketchup text-accent-ketchup-default">Pinned 320×50 strip · 58</Pinned>
    <Pinned height={56} tone="bg-overlay-float-cabbage text-accent-cabbage-default">Log in · Sign up banner · 56</Pinned>
    <Pinned height={49} tone="bg-overlay-float-cabbage text-accent-cabbage-default">Back · Read post · menu · 49</Pinned>
    <div className="flex flex-1 items-center justify-center text-text-tertiary typo-footnote">Reading area · 358px of 664</div>
    <Pinned height={143} tone="bg-overlay-float-cabbage text-accent-cabbage-default">Floating action bar + footer nav · 143</Pinned>
  </div>
);

export const PinnedStackShell = (): ReactElement => (
  <div className="flex h-[41.5rem] w-[23.4375rem] flex-col overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default">
    <Pinned height={44} tone="bg-surface-float text-text-tertiary">Status bar · 44</Pinned>
    <Pinned height={58} tone="bg-overlay-float-ketchup text-accent-ketchup-default">Pinned 320×50 strip · 58</Pinned>
    <div className="flex flex-1 items-center justify-center text-text-tertiary typo-footnote">Reading area · 510px of 664 while reading (the block is hidden, the tab bar has slid away)</div>
    <Pinned height={44 + 8} tone="bg-overlay-float-cabbage text-accent-cabbage-default">Compact action bar · 44 + 8</Pinned>
  </div>
);

export const slotsToday: [string, string, string, string][] = [
  ['Pinned 320×50 strip', 'Slot 21 (public post), slot 20 (arbitrage)', 'Sticky at the very top, z-max, 58px, for the whole visit', 'Yes'],
  ['Log in · Sign up banner', 'CustomAuthBanner, not an ad', 'Sticky under the strip, z-max, public post only', 'Yes'],
  ['Leaderboard', 'Slot 15 / 2', 'Top of the content column', 'No, tablet and up'],
  ['In-content 300×250', 'Slot 22 / 17, every 250 characters of the TLDR, at most 4', 'Inside the summary', 'The first one only'],
  ['Above the comments 300×250', 'Slot 23 / 18', 'Between the post and the thread', 'Yes'],
  ['In the thread 300×250', 'Slot 24 / 7, every 6 comments', 'Inside the comments', 'No, tablet and up'],
  ['Promoted by (direct sold)', 'PostSidebarAdWidget, inline', 'Under the article, before the rail unit', 'Yes'],
  ['Rail 300×250', 'Slot 16 (public post only)', 'Stacks full width under the article on phones', 'Yes'],
  ['Sticky 300×600', 'Slot 19 (arbitrage only)', 'End of the rail', 'No, laptop only'],
  ['Bottom anchor', 'None', 'Retired with AdSense; the page spends its one sticky on slot 19', 'No'],
];

export const adRules: [string, string][] = [
  ['The strip is the one pinned thing at the top', 'It uses the top strip slot (the same place the offline strip takes), under the status bar and above the block. The block hides under it while reading; the strip never hides. It is the only exception to “nothing at the top is permanently sticky”, and it exists only on the two public post pages.'],
  ['Ads are content everywhere else', 'The in-content units, the above-comments unit, the promoted widget and the rail unit scroll with the page in the order production has them. None sits in the block, in the cluster or over the reading drawer’s bar.'],
  ['The auth banner leaves the top', 'Log in and Open app are the leaf block’s right slot (chapter 4). The 56px sticky banner under the strip is gone; the pinned budget on a public post drops from 306px to 110px while reading.'],
  ['White cards stay white', 'The constant white card and gray label are kept in both themes, production’s call: creatives are designed against light backgrounds.'],
  ['No bottom anchor', 'The cluster owns the bottom. An anchor unit would be a second sticky over the tab bar; slots.ts already rules it out.'],
  ['The consent banner is a sheet', 'Decided in 9h: the sheet primitive on the first page, before anything else, covering the strip and the cluster; never a card over the footer. Skipped inside the native wrappers, as today.'],
  ['The arbitrage page keeps its own rules', 'Light theme forced, noindex, no auth banner, a hard navigation on the way out so no ad follows a visitor into the app. Under the shell it is the public post leaf with the cluster; the cluster is what keeps it from reading as a doorway page.'],
  ['Reading the link', 'Read the full post opens the source in a new tab on the mobile web, on both pages, as today. The reading drawer (6b) is a wrapper feature and never runs on the arbitrage page: the wrapper never loads it.'],
];
