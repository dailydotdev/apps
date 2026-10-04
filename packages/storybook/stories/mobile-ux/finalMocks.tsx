import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { RefreshIcon } from '@dailydotdev/shared/src/components/icons/Refresh';
import { AlertIcon } from '@dailydotdev/shared/src/components/icons/Alert';
import { AgentIcon } from '@dailydotdev/shared/src/components/icons/Agent';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BottomKind, PostScroll, ScrollPage, TopKind } from './scrollPages';
import { CloseTop } from './openCallMocks';
import { BrowserChrome, Phone } from './kit';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { HomeIcon } from '@dailydotdev/shared/src/components/icons/Home';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { VisitorActions } from './visitors';
import { ExploreHub, FeedList, PostArticle, PostCover, SegmentedRow } from './mocks';
import { Field, Select } from './settingsMocks';
import { Keyboard } from './create';
import { ChannelLine, Chips, MenuLabel, Segments, activityTypes, squadCategories } from './tabMocks';
import { Circle, chromeSpec } from './chrome';
import { BarMaterial } from './floating';
import { quietChipClassName } from './rowStyle';
import { posts, squads } from './data';

// Mocks for chapter 9e, the last pass before development: the states every
// decided rule implies but no chapter drew, and the few routes that still
// need a call. Nothing here introduces a new piece of chrome.

const material = BarMaterial.Glass;
const feed = [...posts, ...posts, ...posts];

const EmptyState = ({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: string;
}): ReactElement => (
  <div className="flex flex-col items-center gap-3 px-8 pb-10 pt-20 text-center">
    <span className="flex size-14 items-center justify-center rounded-16 bg-surface-float text-text-secondary">
      {icon}
    </span>
    <span className="font-bold typo-callout">{title}</span>
    <span className="text-text-tertiary typo-footnote">{body}</span>
    {action && <span className={classNames(quietChipClassName(false, true), 'mt-1')}>{action}</span>}
  </div>
);

const DiscoverRows = (): ReactElement => (
  <>
    {[...squads, ...squads, ...squads].map((squad, index) => (
      <div key={`${squad.name}-${index}`} className="flex items-center gap-3 border-b border-border-subtlest-tertiary px-4 py-3">
        <span className={classNames('flex size-10 items-center justify-center rounded-max font-bold typo-callout', squad.tone)}>
          {squad.initials}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold typo-callout">{squad.name}</span>
          <span className="text-text-tertiary typo-footnote">{squad.meta}</span>
        </div>
        <span className="rounded-10 border border-border-subtlest-tertiary px-2.5 py-1 font-bold typo-footnote">Join</span>
      </div>
    ))}
  </>
);

// A member with no squads: the New tile alone, one quiet line where the
// squads will be, then Discover. Nothing in the chrome changes.
export const SquadsEmptyScroll = (): ReactElement => (
  <ScrollPage
    kind={TopKind.Root}
    title="Squads"
    active="Squads"
    bottom={BottomKind.Field}
    placeholder="Search squads"
    hero={
      <>
        <span className="px-4 pt-2 text-text-tertiary typo-caption1">Your squads</span>
        <div className="flex items-center gap-3 px-4 pb-4 pt-2">
          <span className="flex w-14 flex-col items-center gap-1">
            <span className="flex size-12 items-center justify-center rounded-max border border-dashed border-border-subtlest-secondary text-text-secondary">
              <PlusIcon size={IconSize.Medium} />
            </span>
            <span className="w-full truncate text-center text-text-secondary typo-caption2">New</span>
          </span>
          <span className="min-w-0 flex-1 text-text-tertiary typo-footnote">Join a squad below and it shows up here.</span>
        </div>
        <div className="border-t border-border-subtlest-tertiary px-4 pb-1 pt-4 font-bold typo-title3">Discover</div>
      </>
    }
    row={<Chips items={squadCategories} active={0} />}
  >
    <DiscoverRows />
  </ScrollPage>
);

export const ActivityEmptyScroll = (): ReactElement => (
  <ScrollPage kind={TopKind.Root} title="Activity" active="Activity" row={<Chips items={activityTypes} active={0} />}>
    <EmptyState icon={<BellIcon size={IconSize.Large} />} title="Nothing yet" body="Upvotes, replies, mentions and posts from your squads land here. Turn on notifications and we tell you when they do." action="Turn on notifications" />
  </ScrollPage>
);

export const BookmarksEmptyScroll = (): ReactElement => (
  <ScrollPage
    kind={TopKind.Page}
    title="Bookmarks"
    active="Home"
    bottom={BottomKind.Field}
    placeholder="Search bookmarks"
    row={<Segments items={['Quick saves', 'Read it later']} />}
  >
    <EmptyState icon={<BookmarkIcon size={IconSize.Large} />} title="No bookmarks yet" body="Tap the bookmark on any post and it is kept here, in the list you choose." action="Browse Popular" />
  </ScrollPage>
);

const SkeletonCard = (): ReactElement => (
  <div className="flex animate-pulse flex-col gap-3 border-b border-border-subtlest-tertiary px-4 py-4">
    <div className="flex items-center gap-2">
      <span className="size-6 rounded-max bg-surface-float" />
      <span className="h-3 w-24 rounded-6 bg-surface-float" />
    </div>
    <span className="h-4 w-full rounded-6 bg-surface-float" />
    <span className="h-4 w-4/5 rounded-6 bg-surface-float" />
    <span className="h-36 w-full rounded-12 bg-surface-float" />
  </div>
);

// Loading: the block and the cluster at rest, skeletons in the content.
// Nothing hides, because there is nothing to read yet.
export const LoadingScroll = (): ReactElement => (
  <ScrollPage kind={TopKind.Root} brand streak row={<SegmentedRow active={0} />}>
    {[0, 1, 2, 3].map((index) => (
      <SkeletonCard key={index} />
    ))}
  </ScrollPage>
);

// The offline strip: under the status bar, above the block, on top of
// everything, and it stays while the block hides. Inverted so it reads as
// a system message, not content.
const OfflineStrip = (): ReactElement => (
  <div className="flex h-9 items-center gap-2 bg-text-primary px-4 text-surface-invert typo-footnote">
    <AlertIcon size={IconSize.Small} />
    <span className="min-w-0 flex-1 truncate">You are offline. Showing what loaded last.</span>
    <span className="font-bold">Retry</span>
  </div>
);

// Offline with a cached feed: the strip on top, the feed as it was.
export const OfflineScroll = (): ReactElement => (
  <ScrollPage kind={TopKind.Root} brand streak row={<SegmentedRow active={0} />} topBanner={<OfflineStrip />}>
    <FeedList items={feed} />
  </ScrollPage>
);

// Nothing cached: one line, Retry, the cluster stays so you can leave.
export const ErrorScroll = (): ReactElement => (
  <ScrollPage kind={TopKind.Root} title="Explore" active="Explore" bottom={BottomKind.Field}>
    <EmptyState icon={<RefreshIcon size={IconSize.Large} />} title="Could not load" body="Check your connection and try again." action="Retry" />
  </ScrollPage>
);

// 404 inside the shell: back if there is a stack, one line, one way out.
export const NotFoundScroll = (): ReactElement => (
  <ScrollPage kind={TopKind.Page} active="Home">
    <EmptyState icon={<AlertIcon size={IconSize.Large} />} title="This page does not exist" body="The link may be old, or the post was removed." action="Go to Home" />
  </ScrollPage>
);

// A page shorter than the screen: nothing scrolls, so nothing hides.
export const ShortPageScroll = (): ReactElement => (
  <ScrollPage kind={TopKind.Page} title="Blocked content" active="Home" actions={<Circle material={material} fixed><PlusIcon size={IconSize.Small} /></Circle>}>
    {[
      ['#crypto', 'Tag'],
      ['Growth Hacker Weekly', 'Source'],
      ['dan_ortiz', 'User'],
    ].map(([name, kind]) => (
      <div key={name} className="flex h-14 items-center justify-between border-b border-border-subtlest-tertiary px-4">
        <div className="flex flex-col">
          <span className="typo-callout">{name}</span>
          <span className="text-text-tertiary typo-caption1">{kind}</span>
        </div>
        <span className={quietChipClassName(false, true)}>Unblock</span>
      </div>
    ))}
  </ScrollPage>
);

const SaveAction = ({ enabled }: { enabled: boolean }): ReactElement => (
  <Circle material={material} fixed className={enabled ? undefined : 'opacity-40'}>
    <VIcon size={IconSize.Small} />
  </Circle>
);

// A form with the keyboard up: the field rides the keyboard, the cluster
// does not. It stays at the layout viewport's bottom and is covered.
export const FormKeyboardStill = (): ReactElement => (
  <ScrollPage
    kind={TopKind.Page}
    title="Edit profile"
    active="Home"
    actions={<SaveAction enabled />}
    overlay={
      <div className="absolute inset-x-0 bottom-0 z-3 flex flex-col">
        <div className="flex h-11 items-center justify-between border-t border-border-subtlest-tertiary bg-background-default px-4 text-text-secondary typo-footnote">
          <span>Bio</span>
          <span className="font-bold text-text-primary">Done</span>
        </div>
        <Keyboard />
      </div>
    }
  >
    <div className="flex flex-col gap-4 pb-8 pt-2">
      <Field label="Name" value="Maya Chen" />
      <Field label="Username" value="mayachen" />
      <Field label="Bio" value="Building the reading experience at daily.dev. Rust on weekends and" multiline />
      <Field label="Company" value="daily.dev" />
      <Field label="Job title" value="Staff engineer" />
    </div>
  </ScrollPage>
);

// The toast sits 12px above the cluster, inside its inset, one at a time.
export const ToastStill = (): ReactElement => (
  <ScrollPage
    kind={TopKind.Root}
    brand
    streak
    row={<SegmentedRow active={1} menuIndex={1} />}
    overlay={
      <div
        className="absolute z-3 flex h-12 items-center gap-3 rounded-14 bg-text-primary px-4 text-surface-invert shadow-2"
        style={{ insetInline: chromeSpec.inset, bottom: 8 + chromeSpec.rest + 12 }}
      >
        <span className="min-w-0 flex-1 truncate typo-callout">Saved to Read it later</span>
        <span className="font-bold typo-callout">Undo</span>
      </div>
    }
  >
    <ChannelLine />
    <FeedList items={feed} />
  </ScrollPage>
);

const shareMenu = (
  <>
    <Circle material={material} fixed>
      <ShareIcon size={IconSize.Small} />
    </Circle>
    <Circle material={material} fixed>
      <MenuIcon size={IconSize.Small} />
    </Circle>
  </>
);

// The lightbox: full screen over the status bar, the dark overlay, no
// cluster. The close button is the header's button: same 38px, 14px radius,
// 16px inset, same row, same material, so it is light in light mode and
// dark in dark mode like every top button.
export const LightboxStill = (): ReactElement => (
  <ScrollPage
    kind={TopKind.Page}
    active="Home"
    actions={shareMenu}
    bottom={BottomKind.Post}
    overlay={
      <div className="absolute inset-0 z-3 flex flex-col bg-overlay-primary-pepper pt-11">
        <div className="flex pt-2" style={{ paddingInline: chromeSpec.topInset, height: chromeSpec.topButton + 14 }}>
          <Circle material={material} fixed>
            <MiniCloseIcon size={IconSize.Small} />
          </Circle>
        </div>
        <div className="flex flex-1 items-center">
          <PostCover post={posts[0]} className="h-64 !rounded-none" />
        </div>
        <span className="pb-10 text-center text-white typo-caption1">1 of 3</span>
      </div>
    }
  >
    <PostArticle post={posts[0]} showReadCta />
  </ScrollPage>
);

// Android with three-button navigation: the system bar takes 48px, the
// cluster sits above it at the same 8px it keeps above the home indicator.
export const AndroidNavStill = (): ReactElement => (
  <ScrollPage
    kind={TopKind.Root}
    brand
    streak
    row={<SegmentedRow active={0} />}
    bottomInset={48}
    overlay={
      <div className="absolute inset-x-0 bottom-0 z-3 flex h-12 items-center justify-center gap-14 border-t border-border-subtlest-tertiary bg-background-default text-text-secondary">
        <span
          style={{ borderStyle: 'solid', borderWidth: '6px 10px 6px 0', borderColor: 'transparent currentColor transparent transparent' } as CSSProperties}
        />
        <span className="size-3.5 rounded-max border-2 border-current" />
        <span className="size-3 border-2 border-current" />
      </div>
    }
  >
    <ChannelLine />
    <FeedList items={feed} />
  </ScrollPage>
);

// Visitors on the other roots: Log in and Open app where members see the
// streak and avatar; nothing personal in the content.
export const VisitorExploreScroll = (): ReactElement => (
  <ScrollPage kind={TopKind.Root} title="Explore" active="Explore" personal={false} trailing={<VisitorActions />} bottom={BottomKind.Field}>
    <ExploreHub withSearch={false} withSquads={false} withFeed={false} />
    <div className="flex items-center justify-between border-t border-border-subtlest-tertiary px-4 pb-2 pt-4">
      <span className="font-bold typo-title3">Explore feed</span>
      <MenuLabel>Popular</MenuLabel>
    </div>
    <FeedList items={feed} />
  </ScrollPage>
);

export const VisitorSquadsScroll = (): ReactElement => (
  <ScrollPage
    kind={TopKind.Root}
    title="Squads"
    active="Squads"
    personal={false}
    trailing={<VisitorActions />}
    bottom={BottomKind.Field}
    placeholder="Search squads"
    hero={<div className="px-4 pb-1 pt-3 font-bold typo-title3">Discover</div>}
    row={<Chips items={squadCategories} active={0} />}
  >
    <DiscoverRows />
  </ScrollPage>
);

const agents: [string, string, string][] = [
  ['Release notes', 'Summarises every release of the tools you follow', 'bg-accent-cabbage-default'],
  ['Code reviewer', 'Reads a PR link and returns a review', 'bg-accent-water-default'],
  ['Interview prep', 'Drills system design from the posts you read', 'bg-accent-bun-default'],
  ['Digest', 'One message a day with what mattered', 'bg-accent-avocado-default'],
  ['Rust tutor', 'Explains any Rust snippet line by line', 'bg-accent-cheese-default'],
  ['Trend spotter', 'What is rising this week and why', 'bg-accent-onion-default'],
];

// Agents, reached from its Explore row: a page with the area's three views
// as segments. An agent is not a person, so its avatar is the circle.
export const AgentsScroll = (): ReactElement => (
  <ScrollPage kind={TopKind.Page} title="Agents" active="Explore" row={<Segments items={['Agents', 'Arena', 'Ask']} />}>
    {[...agents, ...agents].map(([name, meta, tone], index) => (
      <div key={`${name}-${index}`} className="flex items-center gap-3 border-b border-border-subtlest-tertiary px-4 py-3">
        <span className={classNames('flex size-10 items-center justify-center rounded-max text-white', tone)}>
          <AgentIcon size={IconSize.Medium} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold typo-callout">{name}</span>
          <span className="truncate text-text-tertiary typo-footnote">{meta}</span>
        </div>
        <span className={quietChipClassName(false, true)}>Open</span>
      </div>
    ))}
  </ScrollPage>
);

// Creating a squad: one form leaf from the New tile, Save as the check,
// dimmed until the required fields are filled. One route.
export const NewSquadFormScroll = (): ReactElement => (
  <ScrollPage kind={TopKind.Page} title="New squad" active="Squads" actions={<SaveAction enabled={false} />}>
    <div className="flex flex-col gap-4 pb-8 pt-2">
      <div className="flex items-center gap-4 px-4">
        <span className="flex size-16 items-center justify-center rounded-max border border-dashed border-border-subtlest-secondary text-text-secondary">
          <PlusIcon size={IconSize.Medium} />
        </span>
        <div className="flex flex-col">
          <span className="font-bold typo-callout">Squad image</span>
          <span className="text-text-tertiary typo-footnote">Square, at least 512px</span>
        </div>
      </div>
      <Field label="Name" placeholder="What is the squad called" />
      <Field label="Handle" placeholder="@handle" />
      <Field label="Description" placeholder="What it is for, in a line or two" multiline />
      <Select label="Category" value="Web" />
      <Select label="Who can post" value="Everyone" />
      <Select label="Visibility" value="Public" />
    </div>
  </ScrollPage>
);

// Organization settings: the section's views are segments with the URLs
// they already have.
export const OrgSettingsScroll = (): ReactElement => (
  <ScrollPage kind={TopKind.Page} title="Acme Inc" active="Home" row={<Segments items={['General', 'Members', 'Billing']} />}>
    <div className="flex flex-col gap-4 pb-8 pt-2">
      <Field label="Organization name" value="Acme Inc" />
      <Field label="Domain" value="acme.com" />
      <Field label="Website" value="https://acme.com" />
      <Select label="Default role" value="Member" />
    </div>
  </ScrollPage>
);

// Call 6: a post opened from a link with no stack. Chapter 3 said no tab
// lights; the recommendation lights the root that owns the URL, because
// that is where back goes.
export const DeepLinkPostNothingLit = (): ReactElement => <PostScroll active="" />;
export const DeepLinkPostHomeLit = (): ReactElement => <PostScroll active="Home" />;

// Call 7: chapter 3's table gave Squads a dot for new posts and the avatar
// a dot for a new achievement, next to the Activity count. Three marks.
export const ThreeBadgesStill = (): ReactElement => (
  <ScrollPage
    kind={TopKind.Root}
    brand
    streak
    row={<SegmentedRow active={0} />}
    dots={['Squads']}
    overlay={
      <span
        className="absolute z-3 size-2.5 rounded-4 border-2 border-background-default bg-accent-cabbage-default"
        style={{ top: 44 + 5 - 3, right: chromeSpec.topInset - 3 }}
      />
    }
  >
    <ChannelLine />
    <FeedList items={feed} />
  </ScrollPage>
);

// Call 9: Jobs. The list and a job are leaves; the candidate flow's steps
// are the no-shell class.
const jobs: [string, string, string][] = [
  ['Senior Frontend Engineer', 'Vercel · Remote · $180k to $220k', 'bg-accent-cabbage-default'],
  ['Staff Engineer, Platform', 'Supabase · Remote', 'bg-accent-avocado-default'],
  ['Rust Engineer', 'Cloudflare · London', 'bg-accent-bun-default'],
  ['Developer Advocate', 'Stripe · Dublin', 'bg-accent-water-default'],
  ['Engineering Manager', 'Linear · Remote', 'bg-accent-onion-default'],
];

export const JobsScroll = (): ReactElement => (
  <ScrollPage kind={TopKind.Page} title="Jobs" active="Explore" row={<Chips items={['All', 'Remote', 'Frontend', 'Backend', 'AI', 'Management']} active={0} />}>
    {[...jobs, ...jobs].map(([title, meta, tone], index) => (
      <div key={`${title}-${index}`} className="flex items-center gap-3 border-b border-border-subtlest-tertiary px-4 py-3">
        <span className={classNames('size-10 shrink-0 rounded-12', tone)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-bold typo-callout">{title}</span>
          <span className="truncate text-text-tertiary typo-footnote">{meta}</span>
        </div>
      </div>
    ))}
  </ScrollPage>
);

export const JobStepStill = (): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <CloseTop />
      <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-6 pt-16">
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((step) => (
            <span key={step} className={classNames('h-1 flex-1 rounded-2', step <= 1 ? 'bg-text-primary' : 'bg-surface-float')} />
          ))}
        </div>
        <span className="text-text-tertiary typo-caption1">Senior Frontend Engineer · Vercel</span>
        <h1 className="font-bold typo-title3">How many years have you worked with React in production?</h1>
        <div className="flex flex-col gap-2">
          {['Under 2', '2 to 4', '4 to 7', 'More than 7'].map((option, index) => (
            <span
              key={option}
              className={classNames(
                'flex h-12 items-center rounded-12 border px-4 typo-callout',
                index === 2 ? 'border-text-primary bg-surface-float font-bold' : 'border-border-subtlest-secondary',
              )}
            >
              {option}
            </span>
          ))}
        </div>
        <span className="flex-1" />
        <span className="flex h-12 items-center justify-center rounded-12 bg-text-primary font-bold text-surface-invert typo-callout">Continue</span>
      </div>
    </div>
  </Phone>
);

// Call 10: the narrowest phone we support (360 by 640, an Android budget
// phone or an iPhone SE at 375 by 667): the same shell, nothing scaled.
export const SmallHomeScroll = (): ReactElement => (
  <ScrollPage kind={TopKind.Root} brand streak row={<SegmentedRow active={0} />} width={360} height={640}>
    <ChannelLine />
    <FeedList items={feed} />
  </ScrollPage>
);

// Call 10: above 656px (a tablet, or a phone turned sideways) the desktop
// layout as it is today: the rail, the header, the grid. No phone shell.
const DesktopLayout = ({ columns }: { columns: number }): ReactElement => (
  <div className="flex min-h-0 flex-1">
    <div className="flex w-16 shrink-0 flex-col items-center gap-5 border-r border-border-subtlest-tertiary pt-5 text-text-secondary">
      <HomeIcon size={IconSize.Medium} secondary />
      <SearchIcon size={IconSize.Medium} />
      <BellIcon size={IconSize.Medium} />
      <BookmarkIcon size={IconSize.Medium} />
    </div>
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border-subtlest-tertiary px-4">
        <span className="font-bold typo-callout">For you</span>
        <span className="size-8 rounded-10 bg-accent-cabbage-default" />
      </div>
      <div className="grid min-h-0 flex-1 gap-3 overflow-hidden p-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {feed.slice(0, columns * 3).map((post, index) => (
          <div key={`${post.id}-${index}`} className="flex h-56 flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-3">
            <span className="line-clamp-2 font-bold typo-footnote">{post.title}</span>
            <span className="text-text-tertiary typo-caption2">{post.source}</span>
            <PostCover post={post} className="min-h-0 flex-1" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const LandscapePhoneStill = (): ReactElement => (
  <Phone browser={BrowserChrome.None} width={812} height={375}>
    <DesktopLayout columns={3} />
  </Phone>
);

export const TabletStill = (): ReactElement => (
  <Phone browser={BrowserChrome.None} width={768} height={1024} zoom={0.5}>
    <DesktopLayout columns={2} />
  </Phone>
);
