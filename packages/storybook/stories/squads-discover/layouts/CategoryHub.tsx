import type { ReactElement, ReactNode } from 'react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  PlusIcon,
  SearchIcon,
  TimerIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryNavbar';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { AuthenticationBanner } from '@dailydotdev/shared/src/components/auth/AuthenticationBanner';
import { TargetId } from '@dailydotdev/shared/src/lib/log';
import {
  FavoriteButton,
  usePreview,
  SectionHeader,
  SquadAvatar,
  SquadRow,
} from '../kit';
import {
  SearchButton,
  SquadSearchContext,
  grouped,
  Gutter,
  slotsFor,
  withPromoted,
} from '../parts';
import type { NavigateDetail } from '../shell';
import {
  AppShell,
  NAVIGATE_EVENT,
  PageHeaderStrip,
  PhoneBlock,
  ShellSquare,
  STEP_EVENT,
} from '../shell';
import { ProfileInnerPage, TOPIC_PAGE_SIZE } from './ProfileInnerPage';
import { ModerationView } from './Moderation';
import { FeaturedMosaic } from '../featured';
import { PacksSection, withPacks } from '../packs';
import type { DiscoverSquad } from '../data';
import {
  categories,
  categoryTitle,
  myPrivilegedIds,
  mySquads,
  pendingPosts,
  spotlightFor,
  topByCategory,
  topSquads,
  totalMembers,
} from '../data';

const Tile = ({
  slug,
  onOpen,
}: {
  slug: string;
  onOpen: () => void;
}): ReactElement => {
  const top = topByCategory(slug).slice(0, 3);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="sd-press flex min-h-28 flex-col justify-between gap-3 rounded-16 bg-surface-float p-4 text-left transition-colors hover:bg-surface-hover"
    >
      <Typography
        tag={TypographyTag.H3}
        type={TypographyType.Body}
        className="tablet:typo-title3"
        bold
      >
        {categoryTitle(slug)}
      </Typography>
      <span className="flex flex-col gap-2 tablet:flex-row tablet:items-center">
        <span className="flex flex-row-reverse justify-end pl-2">
          {top
            .slice()
            .reverse()
            .map((item) => (
              <SquadAvatar
                key={item.id}
                squad={item}
                className="-ml-2 size-7 ring-2 ring-background-default"
              />
            ))}
        </span>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Secondary}
          className="sd-nums"
          bold
        >
          {largeNumberFormat(totalMembers(slug))} members
        </Typography>
      </span>
    </button>
  );
};

/** A topic's (or Featured's) rows: its slots, grouped, with the topic's pack in front. */
const viewRows = (slug: string): ReactNode[] =>
  withPacks(slug, [
    // Below laptop there is no widget column, so its Promoted campaign
    // opens the list instead, labelled on its meta line.
    <SquadRow
      key="spotlight"
      squad={spotlightFor(slug)}
      promoted
      description
      size="large"
      className="laptop:hidden"
    />,
    ...slotsFor(slug, TOPIC_PAGE_SIZE).map((slot) =>
      grouped(
        slot,
        <SquadRow
          squad={slot.squad}
          promoted={slot.promoted}
          description
          size="large"
        />,
      ),
    ),
  ]);

/**
 * My Squads as production builds it (pages/squads/discover/my): Pending
 * posts for moderators, then "Admin and moderator" and "Member" groups,
 * each row with its favorite star.
 */
/**
 * The moderator's way into their queue: a whole-row button on a float
 * surface, the count as a badge right by its label, where the posts wait
 * on the second line and a chevron saying it opens a page.
 */
const PendingPostsButton = ({
  count,
  squads,
  onOpen,
}: {
  count: number;
  squads: DiscoverSquad[];
  onOpen?: () => void;
}): ReactElement => (
  <button
    type="button"
    onClick={onOpen}
    className="col-span-full mb-3 flex w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3 text-left transition-colors hover:bg-surface-hover"
  >
    <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-accent-bun-flat text-accent-bun-default">
      <TimerIcon />
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="flex items-center gap-2">
        <Typography type={TypographyType.Callout} bold>
          Pending posts
        </Typography>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-8 bg-accent-cabbage-default px-1 font-bold text-white tabular-nums typo-caption1">
          {count}
        </span>
      </span>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        truncate
      >
        Waiting for your review in {squads.map((item) => item.name).join(', ')}
      </Typography>
    </span>
    <ArrowIcon className="shrink-0 rotate-90 text-text-tertiary" />
  </button>
);

const MySquadsView = ({
  pending,
  onOpenModeration,
}: {
  pending: number;
  onOpenModeration?: () => void;
}): ReactElement => {
  const { mySquads: role = 'moderator' } = usePreview();
  const [favorites, setFavorites] = useState(() => new Set([mySquads[0].id]));
  const privileged = role === 'moderator' ? myPrivilegedIds : new Set();
  const toggleFavorite = (id: string) =>
    setFavorites((current) => {
      const next = new Set(current);
      if (!next.delete(id)) {
        next.add(id);
      }
      return next;
    });
  const groups = [
    {
      title: 'Admin and moderator',
      squads: mySquads.filter((item) => privileged.has(item.id)),
    },
    {
      title: 'Member',
      squads: mySquads.filter((item) => !privileged.has(item.id)),
    },
  ].filter((group) => group.squads.length > 0);

  // No squads yet: somewhere to go instead of production's redirect.
  if (role === 'empty') {
    return (
      <ProfileInnerPage chip="my">
        <div className="col-span-full flex flex-col gap-1 pb-2">
          <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
            You&apos;re not in any Squads yet
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Start with a pack: five Squads that go well together, joined in one
            tap.
          </Typography>
        </div>
        <PacksSection title="Starter packs" className="col-span-full" />
      </ProfileInnerPage>
    );
  }

  return (
    <ProfileInnerPage chip="my">
      {pending > 0 && (
        <PendingPostsButton
          count={pending}
          squads={mySquads.filter((item) => privileged.has(item.id))}
          onOpen={onOpenModeration}
        />
      )}
      {groups.map((group) => [
        <Typography
          key={group.title}
          tag={TypographyTag.H2}
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          bold
          className="col-span-full mt-4 first:mt-0"
        >
          {group.title}
        </Typography>,
        ...group.squads.map((item) => (
          <SquadRow
            key={item.id}
            squad={item}
            join={false}
            action={
              <FavoriteButton
                squad={item}
                favorited={favorites.has(item.id)}
                onToggle={() => toggleFavorite(item.id)}
              />
            }
          />
        )),
      ])}
    </ProfileInnerPage>
  );
};

/** What a tab other than Discover opens, in the squad page's frame. */
const InnerView = ({
  tab,
  pending,
  onOpenModeration,
}: {
  tab: string;
  pending: number;
  onOpenModeration: () => void;
}): ReactElement =>
  tab === 'my' ? (
    <MySquadsView pending={pending} onOpenModeration={onOpenModeration} />
  ) : (
    <ProfileInnerPage key={tab} chip={tab}>
      {viewRows(tab)}
    </ProfileInnerPage>
  );

const DISCOVER = 'discover';
const MY_SQUADS = 'my';
/** The moderation queue: not a tab, a page My Squads opens. */
const MODERATE = 'moderate';

/** Each tab keeps production's URL (squadCategoriesPaths and [id]). */
const pathFor = (id: string): string => {
  if (id === MODERATE) {
    return '/squads/moderate';
  }
  return id === DISCOVER ? '/squads/discover' : `/squads/discover/${id}`;
};

/** Production's tabs (squadCategoriesPaths), with Discover first. */
const tabs = [
  { id: DISCOVER, label: 'Discover' },
  { id: MY_SQUADS, label: 'My Squads' },
  { id: 'featured', label: 'Featured' },
  ...categories.map((category) => ({
    id: category.slug,
    label: category.title,
  })),
];

/** Production hides My Squads from anyone without squads. */
const visibleTabs = (loggedOut: boolean) =>
  tabs.filter((tab) => !(loggedOut && tab.id === MY_SQUADS));

const PhoneSearchSquare = (): ReactElement => {
  const openSearch = useContext(SquadSearchContext);
  return (
    <ShellSquare label="Search Squads" onClick={() => openSearch?.()}>
      <SearchIcon size={IconSize.Small} />
    </ShellSquare>
  );
};

const TabBar = ({
  active,
  onChange,
  size,
  loggedOut,
}: {
  active: string;
  onChange: (id: string) => void;
  size: ButtonSize;
  loggedOut: boolean;
}): ReactElement => (
  <SquadDirectoryNavbar className="!mx-0 min-w-0 flex-1 !border-0 !px-0">
    {visibleTabs(loggedOut).map((tab) => (
      <SquadDirectoryNavbarItem
        key={tab.id}
        buttonSize={size}
        isActive={tab.id === active}
        label={tab.label}
        onClick={() => onChange(tab.id)}
      />
    ))}
  </SquadDirectoryNavbar>
);

/**
 * Today's directory navigation, kept: production's own tab bar (Discover,
 * My Squads, Featured, every topic) in the v2 header strip on laptop and
 * as the first row on phones, with no page title above it. Search leads
 * the row and New Squad closes it, quietly. Tabs switch the
 * view in place but keep production's URL per tab, a history entry each,
 * so back/forward, shared links and the topic pages' SEO still work.
 */
const HubHeader = ({
  active,
  onChange,
  loggedOut,
}: {
  active: string;
  onChange: (id: string) => void;
  loggedOut: boolean;
}): ReactElement => (
  <>
    <PageHeaderStrip className="hidden gap-4 !py-0 laptop:flex">
      <div className="shrink-0 py-2">
        <SearchButton />
      </div>
      <TabBar
        active={active}
        onChange={onChange}
        size={ButtonSize.Small}
        loggedOut={loggedOut}
      />
      <div className="shrink-0 py-2">
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Subtle}
          icon={<PlusIcon />}
        >
          New Squad
        </Button>
      </div>
    </PageHeaderStrip>
    {/* Tablet: the same row under SidebarTablet's rail. */}
    <header className="hidden items-center gap-1 border-b border-border-subtlest-tertiary px-2 tablet:flex laptop:hidden">
      <SearchButton />
      <TabBar
        active={active}
        onChange={onChange}
        size={ButtonSize.XSmall}
        loggedOut={loggedOut}
      />
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Subtle}
        icon={<PlusIcon />}
        aria-label="New Squad"
      />
    </header>
    {/* Phones: production's shell block, the tabs as its chips. Search and
        New Squad are the page's actions in the title row. */}
    <PhoneBlock
      title="Squads"
      loggedOut={loggedOut}
      active={active}
      onChange={onChange}
      chips={visibleTabs(loggedOut)}
      actions={
        <>
          <PhoneSearchSquare />
          <ShellSquare label="New Squad">
            <PlusIcon size={IconSize.Small} />
          </ShellSquare>
        </>
      }
    />
  </>
);

/**
 * The topic hub, the chosen direction. Today's tab bar with no
 * page title. Discover holds the Featured mosaic, Trending, starter packs
 * and a tile per topic; every other tab opens in the squad page's frame.
 */
export const CategoryHub = ({
  initialCategory,
  loggedOut = false,
}: {
  initialCategory?: string;
  /** An anonymous visitor: no My Squads, and the sign-up banner on laptop. */
  loggedOut?: boolean;
}): ReactElement => {
  const [tab, setTab] = useState(initialCategory ?? DISCOVER);
  const preview = usePreview();
  const topRef = useRef<HTMLDivElement>(null);
  // Tab history, kept here rather than in the browser's: a frame shares its
  // session history with Storybook, so a real back could leave the story.
  const entries = useRef([initialCategory ?? DISCOVER]);
  const index = useRef(0);

  // The window the page renders in: a device frame's, never the canvas's,
  // so the story's own URL is never touched.
  const frameWindow = (): Window | null => {
    const win = topRef.current?.ownerDocument.defaultView ?? null;
    return win && win !== window ? win : null;
  };

  const go = (id: string) => {
    setTab(id);
    const win = frameWindow();
    win?.history.replaceState(null, '', pathFor(id));
    win?.dispatchEvent(
      new CustomEvent<NavigateDetail>(NAVIGATE_EVENT, {
        detail: {
          canBack: index.current > 0,
          canForward: index.current < entries.current.length - 1,
        },
      }),
    );
    (win ?? topRef.current?.ownerDocument.defaultView)?.scrollTo({ top: 0 });
  };

  useEffect(() => {
    const win = frameWindow();
    if (!win) {
      return undefined;
    }
    go(entries.current[0]);
    const scrollEnd = preview.scrollEnd
      ? win.setTimeout(() => {
          // Two steps, so the phone shell sees a scroll down and hides.
          win.scrollTo(0, 200);
          win.setTimeout(
            () => win.scrollTo(0, win.document.body.scrollHeight),
            150,
          );
        }, 600)
      : 0;
    const onStep = (event: Event) => {
      const next = index.current + (event as CustomEvent<number>).detail;
      if (next < 0 || next >= entries.current.length) {
        return;
      }
      index.current = next;
      go(entries.current[next]);
    };
    win.addEventListener(STEP_EVENT, onStep);
    return () => {
      win.clearTimeout(scrollEnd);
      win.removeEventListener(STEP_EVENT, onStep);
    };
    // Registers once per frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showTab = (id: string) => {
    entries.current = [...entries.current.slice(0, index.current + 1), id];
    index.current = entries.current.length - 1;
    go(id);
  };
  const trending = withPromoted(topSquads.slice(0, 9), 'top', 1);
  const [queue, setQueue] = useState(() => {
    if ((preview.mySquads ?? 'moderator') !== 'moderator') {
      return [];
    }
    if (preview.moderation === 'empty') {
      return [];
    }
    // After approving one: the queue has one fewer.
    return preview.moderation === 'approved'
      ? pendingPosts.slice(1)
      : pendingPosts;
  });
  const back = () => {
    if (index.current === 0) {
      showTab(MY_SQUADS);
      return;
    }
    index.current -= 1;
    go(entries.current[index.current]);
  };

  if (tab === MODERATE) {
    return (
      <AppShell>
        <div ref={topRef} />
        <ModerationView
          queue={queue}
          onBack={back}
          onResolve={(ids) =>
            setQueue((list) => list.filter((post) => !ids.includes(post.id)))
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div ref={topRef} />
      <HubHeader active={tab} onChange={showTab} loggedOut={loggedOut} />
      {tab !== DISCOVER ? (
        <InnerView
          tab={tab}
          pending={queue.length}
          onOpenModeration={() => showTab(MODERATE)}
        />
      ) : (
        <Gutter className="flex flex-col pb-10 pt-5 laptop:pt-6">
          <div className="mb-8">
            <FeaturedMosaic />
          </div>
          <SectionHeader
            title="Trending this week"
            subtitle="Most joined across daily.dev"
            className="mb-2"
          />
          <ul className="grid grid-cols-1 gap-x-8 laptop:grid-flow-col laptop:grid-cols-3 laptop:grid-rows-3">
            {trending.slice(0, 9).map(({ squad, promoted }, index) => (
              <li
                key={squad.id}
                className={classNames(index >= 4 && 'hidden laptop:block')}
              >
                <SquadRow squad={squad} promoted={promoted} />
              </li>
            ))}
          </ul>
          <PacksSection className="mt-8" />
          <SectionHeader title="Browse by topic" className="mb-3 mt-8" />
          <div className="grid grid-cols-2 gap-3 laptop:grid-cols-4">
            {categories.map((category) => (
              <Tile
                key={category.slug}
                slug={category.slug}
                onOpen={() => showTab(category.slug)}
              />
            ))}
          </div>
        </Gutter>
      )}
      {loggedOut && (
        // Production's PublicPageSignupBanner: laptop only, pinned to the
        // window, with a spacer so the end of the page clears it.
        <div className="hidden laptop:block">
          <div aria-hidden className="h-72" />
          <AuthenticationBanner targetId={TargetId.PublicPageSignupBanner} />
        </div>
      )}
    </AppShell>
  );
};
