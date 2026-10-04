import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { DevPlusIcon } from '@dailydotdev/shared/src/components/icons/DevPlus';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { plusSaleLabelBg } from '@dailydotdev/shared/src/styles/custom';
import { ScrollPage, TopKind } from './scrollPages';
import { FeedList, Logo, SegmentedRow } from './mocks';
import { ChannelLine } from './tabMocks';
import { Circle, chromeSpec } from './chrome';
import { BarMaterial } from './floating';
import { posts } from './data';

// Chapter 9k: Plus on Home. Production today: UpgradeToPlus is a Bacon
// primary button with the DevPlus glyph that returns null for members;
// PlusMobileEntryBanner is a gradient card under the For you tab behind
// plus_entry_mobile; HeaderLogo passes isPlus to the logo, which draws the
// Plus mark on the wordmark; PlusUserBadge marks members next to names;
// the You page's first row is daily.dev Plus (decided). Subscription
// states in lib/plus.ts: active, cancelled, expired, none; providers Paddle
// and Apple StoreKit. Nothing here adds a state the app does not have.

const material = BarMaterial.Glass;
const feed = [...posts, ...posts, ...posts];

export enum PlusLook {
  Square = 'square',
  Chip = 'chip',
  Banner = 'banner',
  YouOnly = 'youOnly',
}

export const plusLookNotes: Record<PlusLook, string> = {
  [PlusLook.Square]: 'An icon square in the brand row between the streak and the avatar (Tsahi’s placement): the Plus glyph in the Plus colour on the top-button material, 38px like every top control. Quiet, the avatar’s size, Home only, hides with the block. A second thing between the logo and the avatar, which 9c allowed only if it is quiet: this is.',
  [PlusLook.Chip]: 'Production’s UpgradeToPlus at chip size: Bacon fill, the glyph and “Plus”, the sale label when a sale runs. Clear, and the strongest thing in the row; next to the streak and the avatar it is three marks on one line.',
  [PlusLook.Banner]: 'Production’s PlusMobileEntryBanner, as plus_entry_mobile ships it: the gradient card under the segments with a lead-in, the CTA and Close. Content, not chrome; dismissable; nothing in the brand row.',
  [PlusLook.YouOnly]: 'Nothing on Home. Plus is the first row behind the avatar (decided in 9b) and that is the only door. The quietest, and the one Tsahi asked to go beyond.',
};

// The glyph takes the Plus colour inside the button (Circle sets the
// primary text colour on itself).
export const PlusSquare = (): ReactElement => (
  <Circle material={material} fixed>
    <span className="flex text-action-plus-default">
      <DevPlusIcon secondary size={IconSize.Small} />
    </span>
  </Circle>
);

export const PlusChip = ({ sale = false }: { sale?: boolean }): ReactElement => (
  <span
    className="flex items-center gap-1 rounded-14 bg-accent-bacon-default pl-2 pr-2.5 font-bold text-white typo-footnote"
    style={{ height: chromeSpec.topButton }}
  >
    <DevPlusIcon secondary size={IconSize.Small} />
    Plus
    {sale && (
      <span className="ml-1 rounded-6 px-1.5 py-0.5 text-black typo-caption1" style={{ background: plusSaleLabelBg }}>
        20% off
      </span>
    )}
  </span>
);

const PlusBanner = (): ReactElement => (
  <div className="relative mx-4 my-3 overflow-hidden rounded-16 p-4">
    <div className="plus-entry-gradient absolute inset-0 -z-1" />
    <div className="flex flex-col gap-3 text-center">
      <span className="typo-callout">
        <span className="text-action-plus-default">Read smarter.</span> Plus gives you AI summaries, no ads and custom feeds.
      </span>
      <div className="flex gap-2">
        <span className="flex h-10 flex-1 items-center justify-center gap-1 rounded-12 bg-accent-bacon-default font-bold text-white typo-callout">
          <DevPlusIcon secondary size={IconSize.Small} />
          Upgrade to Plus
        </span>
        <span className="flex h-10 flex-1 items-center justify-center rounded-12 bg-surface-float font-bold typo-callout">Close</span>
      </div>
    </div>
  </div>
);

export enum PlusState {
  Free = 'free',
  Member = 'member',
  Cancelled = 'cancelled',
  Expired = 'expired',
  Organization = 'organization',
  Sale = 'sale',
}

export const plusStateNotes: Record<PlusState, string> = {
  [PlusState.Free]: 'No subscription (status none). The entry shows.',
  [PlusState.Member]: 'Active. The entry is gone; the logo carries the Plus mark, as HeaderLogo draws it today. Nothing else changes on Home.',
  [PlusState.Cancelled]: 'Cancelled but paid until the period ends: still Plus (isPlus stays true), so the mark stays and the entry stays hidden. The You row says when it ends and offers Renew.',
  [PlusState.Expired]: 'Expired: isPlus is false, the mark goes, the entry returns. Same as free; the You row says Renew instead of Upgrade.',
  [PlusState.Organization]: 'Plus through an organization seat: a member like any other on Home. The You row names the organization and has no Manage.',
  [PlusState.Sale]: 'A sale is running (usePlusSale): the entry carries the sale label, as UpgradeToPlus does. Only the chip has room for it; the square shows the sale in the You row and the banner instead.',
};

const isMember = (state: PlusState): boolean =>
  state === PlusState.Member || state === PlusState.Cancelled || state === PlusState.Organization;

const entryFor = (look: PlusLook, state: PlusState): ReactNode => {
  if (isMember(state)) {
    return null;
  }
  if (look === PlusLook.Square) {
    return <PlusSquare />;
  }
  if (look === PlusLook.Chip) {
    return <PlusChip sale={state === PlusState.Sale} />;
  }
  return null;
};

// Home with the Plus entry in one of the four looks, in one of the six
// states. Scroll it: the entry is part of the brand row and hides with it.
export const HomePlusScroll = ({ look, state = PlusState.Free }: { look: PlusLook; state?: PlusState }): ReactElement => (
  <ScrollPage
    kind={TopKind.Root}
    brand
    streak
    logo={<Logo isPlus={isMember(state)} />}
    beforeAvatar={entryFor(look, state)}
    row={<SegmentedRow active={0} />}
  >
    {look === PlusLook.Banner && !isMember(state) && <PlusBanner />}
    <ChannelLine />
    <FeedList items={feed} />
  </ScrollPage>
);

// The You page's first row per state, as a strip of specimens.
export const youPlusRows: [PlusState, string, string, string][] = [
  [PlusState.Free, 'daily.dev Plus', 'AI summaries, no ads, custom feeds', 'Upgrade'],
  [PlusState.Sale, 'daily.dev Plus', '20% off this week', 'Upgrade'],
  [PlusState.Member, 'daily.dev Plus', 'Member since Jul 2025', 'Manage'],
  [PlusState.Cancelled, 'daily.dev Plus', 'Ends 14 Oct 2026', 'Renew'],
  [PlusState.Expired, 'daily.dev Plus', 'Ended 14 Sep 2026', 'Renew'],
  [PlusState.Organization, 'daily.dev Plus', 'Through Acme Inc', ''],
];

export const YouPlusRowSpecimens = (): ReactElement => (
  <div className="flex w-[23.4375rem] flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default">
    {youPlusRows.map(([state, label, meta, action]) => (
      <div key={state} className="flex h-16 items-center gap-3 border-b border-border-subtlest-tertiary px-4 last:border-b-0">
        <span className={classNames('flex size-8 items-center justify-center', isMember(state) || state === PlusState.Cancelled ? 'text-action-plus-default' : 'text-text-secondary')}>
          <DevPlusIcon secondary={isMember(state)} size={IconSize.Medium} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold typo-callout">{label}</span>
          <span className="truncate text-text-tertiary typo-footnote">{meta}</span>
        </div>
        {action ? (
          <span className={classNames('rounded-10 px-2.5 py-1 font-bold typo-footnote', action === 'Manage' ? 'border border-border-subtlest-tertiary' : 'bg-accent-bacon-default text-white')}>
            {action}
          </span>
        ) : (
          <ArrowIcon size={IconSize.Small} className="rotate-90 text-text-quaternary" />
        )}
        <span className="w-24 shrink-0 text-right text-text-quaternary typo-caption2">{state}</span>
      </div>
    ))}
  </div>
);

export const plusCases: [string, string, string, string][] = [
  ['Free member on Home', 'The Plus square in the brand row, between the streak and the avatar', 'The logo without the mark', 'Tap: the Plus page (no-shell class, chapter 9b). Hides with the block.'],
  ['Free member, a sale running', 'The square; the sale shows in the You row and in the banner if it runs', 'The logo without the mark', 'The chip is the only look with room for the label; not worth a louder row for a week a year.'],
  ['Member (active)', 'No entry', 'The Plus mark on the logo, as HeaderLogo draws it today', 'The You row: Member since, Manage. Manage opens Paddle’s portal on the web and App Store subscriptions on iOS (usePlusSubscription).'],
  ['Member, cancelled, still in the paid period', 'No entry', 'The mark stays until the period ends', 'The You row: Ends on a date, Renew.'],
  ['Expired', 'The square returns', 'The mark goes', 'The You row: Ended on a date, Renew.'],
  ['Plus through an organization', 'No entry', 'The mark', 'The You row: Through the organization, no Manage; the organization page has the seats.'],
  ['Gift received', 'No entry once redeemed', 'The mark', 'GiftReceivedPlusModal opens once on the next visit, as today; nothing new.'],
  ['Visitor', 'No entry', 'No mark', 'Log in and Open app own the row (chapter 4). The Plus page is reachable from the You page after sign-up.'],
  ['Any other root or leaf', 'No entry', 'The mark on Home only (the logo is on Home only)', 'The You row is the door everywhere else, one tap behind the avatar.'],
  ['Inside the iOS wrapper', 'The square', 'The mark', 'The Plus page is PlusIOS with StoreKit; the same square, a different checkout. Android uses the web checkout.'],
];

export const plusRules: [string, string][] = [
  ['One door on Home, quiet', 'The Plus square sits between the streak and the avatar, the avatar’s size, on the top-button material, in the Plus colour; never a filled button in the brand row, never a second copy elsewhere on the page.'],
  ['The mark is the indicator', 'A member is shown by the Plus mark on the logo, which production already draws; no badge on the avatar, no second mark. The entry disappears for members, as UpgradeToPlus already does.'],
  ['The You row carries the state', 'Upgrade, Manage, Renew, Ends on, Through the organization: the row says which; Home never does.'],
  ['States come from the app', 'isPlus, subscriptionFlags.status and provider from usePlusSubscription; the sale from usePlusSale; nothing is invented and no new data is fetched (9j).'],
  ['Events stay', 'The square fires UpgradeSubscription with a TargetId for the mobile header, the way UpgradeToPlus fires for the sidebar and the profile menu; the banner keeps its ClickPlusFeature and MarketingCtaDismiss events if it runs.'],
  ['The banner is not this work', 'plus_entry_mobile and its banner belong to the Plus promotion initiative. The square does not replace it and does not depend on it; if both run, the banner sits under the segments as today.'],
];
