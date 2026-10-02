import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { EarthIcon } from '@dailydotdev/shared/src/components/icons/Earth';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { cloudinaryAppIconMain, cloudinaryCharmNoComments } from '@dailydotdev/shared/src/lib/image';
import { BottomKind, ScrollPage, TopKind } from './scrollPages';
import { VisitorActions, VisitorButtonLook } from './visitors';
import { CommentList, ExploreHub, FeedList, SegmentedRow } from './mocks';
import { AdStrip, adStripHeight } from './adsMocks';
import { ChannelLine, MenuLabel } from './tabMocks';
import { chromeSpec } from './chrome';
import { quietChipClassName } from './rowStyle';
import { posts } from './data';

// Chapter 9h: everything that can sit at the bottom of a phone besides the
// cluster. Three things exist in production today: the iubenda consent
// banner (fixed, bottom 12px, z 1000), the logged-out app footer (merged
// in #6735: the Charm footer that REPLACES the tab bar once a page's
// trigger fires, 176px, no close, until navigation) and the logged-in
// "See daily.dev in…" sheet (same PR: App / Browser rows, once per snooze
// window). Both PR features are behind flags, off by default, never inside
// the wrappers, never on tablets.

const feed = [...posts, ...posts, ...posts];
const visitorActions = <VisitorActions look={VisitorButtonLook.Floating} />;
const postClusterHeight = chromeSpec.rest + chromeSpec.gap + chromeSpec.accessory;

export enum ConsentLook {
  Card = 'card',
  Sheet = 'sheet',
  Strip = 'strip',
  Replace = 'replace',
}

export const consentLookNotes: Record<ConsentLook, string> = {
  [ConsentLook.Card]: 'Production’s card, moved up: 12px above the cluster inside a 12px inset, like a toast. The bar stays usable. On a post it stacks a third thing at the bottom (card, action bar, tab bar: about 280px).',
  [ConsentLook.Sheet]: 'The sheet primitive from 4b, the same one the app sheet and every menu use: covers the whole screen including the status bar, the cluster under the dim, one choice and it is gone. A one-time legal moment treated like every other sheet.',
  [ConsentLook.Strip]: 'One line above the cluster: the sentence, Accept, and Options that opens the full card. The smallest footprint; too small for the reject choice the law wants at the same level as accept in most of Europe, so it needs the second step.',
  [ConsentLook.Replace]: 'The card takes the cluster’s place, as the app footer does: the bar hides while the card shows and returns after the choice. Nothing stacks, and nothing can be tapped under it until the choice is made.',
};

const ConsentCard = ({ className }: { className?: string }): ReactElement => (
  <div className={classNames('flex flex-col gap-3 bg-background-default p-4', className)}>
    <span className="font-bold typo-callout">We value your privacy</span>
    <span className="text-text-tertiary typo-footnote">
      We and our partners use cookies to show ads and measure them. You can accept, reject, or choose what to allow.
    </span>
    <div className="flex gap-2">
      <span className={classNames(quietChipClassName(true, false), 'flex-1 justify-center')}>Accept</span>
      <span className={classNames(quietChipClassName(false, true), 'flex-1 justify-center')}>Reject</span>
      <span className={classNames(quietChipClassName(false, true), 'flex-1 justify-center')}>Learn more</span>
    </div>
  </div>
);

const Dim = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="absolute inset-0 z-3 flex flex-col justify-end bg-overlay-quaternary-onion">{children}</div>
);

const SheetBody = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex flex-col rounded-t-24 bg-background-default px-4 pb-8 pt-2">
    <span className="mx-auto mb-4 h-1 w-10 rounded-4 bg-surface-hover" />
    {children}
  </div>
);

const CardAbove = ({ clusterHeight }: { clusterHeight: number }): ReactElement => (
  <div className="absolute z-3" style={{ insetInline: 12, bottom: 8 + clusterHeight + 12 }}>
    <ConsentCard className="rounded-16 border border-border-subtlest-tertiary shadow-2" />
  </div>
);

const SheetConsent = (): ReactElement => (
  <Dim>
    <SheetBody>
      <span className="pb-1 font-bold typo-title3">We value your privacy</span>
      <span className="pb-4 text-text-tertiary typo-footnote">
        We and our partners use cookies to show ads and measure them. You can accept, reject, or choose what to allow. Change it any time in Settings.
      </span>
      <span className="flex h-12 items-center justify-center rounded-12 bg-text-primary font-bold text-surface-invert typo-callout">Accept all</span>
      <div className="flex gap-2 pt-2">
        <span className={classNames(quietChipClassName(false, true), 'h-11 flex-1 justify-center')}>Reject all</span>
        <span className={classNames(quietChipClassName(false, true), 'h-11 flex-1 justify-center')}>Choose</span>
      </div>
    </SheetBody>
  </Dim>
);

const StripConsent = ({ clusterHeight }: { clusterHeight: number }): ReactElement => (
  <div
    className="absolute z-3 flex h-11 items-center gap-3 rounded-14 border border-border-subtlest-tertiary bg-background-default px-3 shadow-2"
    style={{ insetInline: 12, bottom: 8 + clusterHeight + 12 }}
  >
    <span className="min-w-0 flex-1 truncate text-text-secondary typo-footnote">We use cookies for ads and measurement.</span>
    <span className={quietChipClassName(true, false)}>Accept</span>
    <span className="font-bold typo-footnote">Options</span>
  </div>
);

const ReplaceConsent = (): ReactElement => (
  <div className="absolute inset-x-0 bottom-0 z-3 flex flex-col">
    <div className="h-12 bg-gradient-to-b from-transparent to-background-default" />
    <ConsentCard className="border-t border-border-subtlest-tertiary pb-8" />
  </div>
);

export const ConsentStill = ({ look }: { look: ConsentLook }): ReactElement => (
  <ScrollPage
    kind={TopKind.Page}
    active="Home"
    personal={false}
    actions={visitorActions}
    bottom={look === ConsentLook.Replace ? BottomKind.None : BottomKind.Post}
    topBanner={<AdStrip />}
    topBannerHeight={adStripHeight}
    overlay={
      look === ConsentLook.Card ? (
        <CardAbove clusterHeight={postClusterHeight} />
      ) : look === ConsentLook.Sheet ? (
        <SheetConsent />
      ) : look === ConsentLook.Strip ? (
        <StripConsent clusterHeight={postClusterHeight} />
      ) : (
        <ReplaceConsent />
      )
    }
  >
    <PostBody />
  </ScrollPage>
);

const PostBody = (): ReactElement => (
  <>
    <div className="flex flex-col gap-4 px-4 pb-6 pt-4">
      <span className="font-bold typo-footnote">{posts[0].source}</span>
      <h1 className="font-bold leading-tight typo-title1">{posts[0].title}</h1>
      <p className="text-text-secondary typo-body">{posts[0].summary}</p>
      <p className="text-text-secondary typo-body">{posts[1].summary}</p>
    </div>
    <CommentList />
    <CommentList />
  </>
);

// The merged logged-out footer (#6735): a fade, the title, Charm pressing
// Open daily.dev app, 176px, replacing the tab bar. Under the shell it
// replaces the cluster the same way; the leaf block keeps Log in and Open
// app at the top, which is what the header PR ships.
export const CharmFooter = ({ title }: { title: string }): ReactElement => (
  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-3 flex flex-col justify-end">
    <div className="h-12 bg-gradient-to-b from-transparent to-background-default" />
    <div className="pointer-events-auto relative bg-background-default px-5 pb-6">
      <div className="relative flex h-14 items-end">
        <h3 className="min-w-0 flex-1 pb-2 pr-16 font-bold leading-tight typo-title3">{title}</h3>
        <div aria-hidden className="pointer-events-none absolute -bottom-2 -right-3 h-[3.625rem] w-[6.625rem] overflow-hidden">
          <img src={cloudinaryCharmNoComments} alt="" className="absolute -top-2.5 left-0 size-[6.625rem] max-w-none" />
        </div>
      </div>
      <span className="relative z-1 flex h-12 items-center justify-center rounded-12 bg-text-primary font-bold text-surface-invert typo-callout">Open daily.dev app</span>
    </div>
  </div>
);

export const VisitorPostFooterStill = (): ReactElement => (
  <ScrollPage
    kind={TopKind.Page}
    active="Home"
    personal={false}
    actions={visitorActions}
    bottom={BottomKind.None}
    topBanner={<AdStrip />}
    topBannerHeight={adStripHeight}
    overlay={<CharmFooter title="See all comments" />}
  >
    <PostBody />
  </ScrollPage>
);

export const VisitorExploreFooterStill = (): ReactElement => (
  <ScrollPage kind={TopKind.Root} title="Explore" active="Explore" personal={false} trailing={<VisitorActions />} bottom={BottomKind.None} overlay={<CharmFooter title="See all posts" />}>
    <ExploreHub withSearch={false} withSquads={false} withFeed={false} />
    <div className="flex items-center justify-between border-t border-border-subtlest-tertiary px-4 pb-2 pt-4">
      <span className="font-bold typo-title3">Explore feed</span>
      <MenuLabel>Popular</MenuLabel>
    </div>
    <FeedList items={feed} />
  </ScrollPage>
);

// The merged logged-in sheet (#6735): "See daily.dev in…", App / Browser,
// once per snooze window, on landing. The sheet primitive, over the
// cluster, status bar included.
export const MemberAppSheetStill = (): ReactElement => (
  <ScrollPage
    kind={TopKind.Root}
    brand
    streak
    row={<SegmentedRow active={0} />}
    overlay={
      <Dim>
        <SheetBody>
          <h2 className="mb-2 text-center font-bold typo-title3">See daily.dev in…</h2>
          <div className="flex flex-col divide-y divide-border-subtlest-tertiary">
            <div className="flex items-center gap-3 py-2.5">
              <img src={cloudinaryAppIconMain} alt="" className="size-10 shrink-0 rounded-10 border border-border-subtlest-tertiary" />
              <span className="flex-1 font-bold typo-callout">daily.dev App</span>
              <span className="flex h-8 w-28 items-center justify-center rounded-10 bg-text-primary font-bold text-surface-invert typo-footnote">Open</span>
            </div>
            <div className="flex items-center gap-3 py-2.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-10 bg-surface-float text-text-secondary">
                <EarthIcon size={IconSize.Medium} />
              </span>
              <span className="flex-1 font-bold typo-callout">Browser</span>
              <span className="flex h-8 w-28 items-center justify-center rounded-10 bg-surface-float font-bold typo-footnote">Continue</span>
            </div>
          </div>
        </SheetBody>
      </Dim>
    }
  >
    <ChannelLine />
    <FeedList items={feed} />
  </ScrollPage>
);

// A toast while the app footer shows: above the footer, not above the
// cluster, because the footer owns the bottom then.
export const FooterAndToastStill = (): ReactElement => (
  <ScrollPage
    kind={TopKind.Page}
    active="Home"
    personal={false}
    actions={visitorActions}
    bottom={BottomKind.None}
    overlay={
      <>
        <CharmFooter title="See all comments" />
        <div className="absolute z-3 flex h-12 items-center gap-3 rounded-14 bg-text-primary px-4 text-surface-invert shadow-2" style={{ insetInline: chromeSpec.inset, bottom: 176 + 12 }}>
          <span className="min-w-0 flex-1 truncate typo-callout">Link copied</span>
        </div>
      </>
    }
  >
    <PostBody />
  </ScrollPage>
);

export const bottomCases: [string, string, string, string][] = [
  ['Visitor, public post, first screen', 'Strip on top, the leaf block (back, Log in, Open app), the post cluster', 'Nothing yet', 'Consent sheet first if the region needs it and it was never answered'],
  ['Visitor, public post, past the second comment', 'The Charm footer replaces the cluster: See all comments, Open daily.dev app', 'Footer', 'Stays until navigation, no close; the block still hides and returns'],
  ['Visitor, Explore, past card 12', 'The Charm footer replaces the cluster: See all posts', 'Footer', 'The search field goes with the cluster; it comes back on the next page'],
  ['Visitor sent by a search engine', 'The page as it is; no footer on that page view', 'Nothing', 'Google’s interstitial rule; the next page in the session may show it'],
  ['Visitor, the arbitrage page', 'Strip on top, no auth banner, the cluster', 'Nothing', 'Not in the footer’s route map; keep it that way, the page has one job'],
  ['Visitor, a gated tap (upvote, bookmark, follow)', 'The sign-up page (9b)', 'A page, not a prompt', 'The footer is dismissed by the navigation'],
  ['Member, landing on the mobile web', 'The See daily.dev in… sheet over Home', 'Sheet', 'Once per snooze window (72h by default); Open or Continue closes it'],
  ['Member, inside the wrapper', 'The shell, nothing else', 'Nothing', 'No consent banner, no footer, no sheet in the native apps'],
  ['Anyone, consent never answered, in a TCF region', 'The consent sheet on the first page, before anything else', 'Sheet', 'One sheet at a time (4b): the app sheet or the footer wait for the choice'],
  ['Anyone, a toast while a prompt shows', '12px above whatever owns the bottom: the cluster, or the footer', 'Toast', 'Never over a sheet; a toast waits for the sheet to close'],
];

export const bottomRules: [string, string][] = [
  ['One owner of the bottom', 'At any moment exactly one thing owns the bottom of the screen: the cluster, or the app footer in its place. Prompts do not stack under the cluster.'],
  ['One sheet at a time, consent first', 'The consent sheet, the app sheet and every menu are the same primitive and never overlap. Order on a first visit: consent, then the app sheet (members) or the footer (visitors, at its trigger).'],
  ['The footer replaces, it never floats', 'As merged: the Charm footer takes the cluster’s place, 176px, until navigation. The leaf block keeps hiding and returning above it; the strip stays on top.'],
  ['Toasts follow the owner', '12px above the cluster, or 12px above the footer. Never over a sheet.'],
  ['The strip is unaffected', 'The pinned ad strip lives at the top and never meets a bottom prompt. The consent sheet covers it while open, like everything else.'],
  ['Nothing in the wrappers', 'Consent, the footer and the sheet are mobile-web only, as today. The shell inside the apps has no prompts of this kind.'],
  ['Log in and Open app appear at most twice', 'In the leaf block (header PR) and, while it shows, in the footer (footer PR). Never a third time in a sheet or a toast.'],
];
