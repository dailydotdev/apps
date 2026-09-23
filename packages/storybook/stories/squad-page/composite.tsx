import type { ReactElement, ReactNode } from 'react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  BellIcon,
  DocsIcon,
  SettingsIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  companyLinks,
  feedEntries,
  formatCount,
  formatSince,
  pinnedEntry,
  rules,
  squad,
  team,
} from './data';
import {
  Avatar,
  isAdmin,
  isBlocked,
  isJoined,
  isLoggedIn,
  isStaff,
  linkIcon,
  VerifiedMark,
  Viewer,
} from './kit';
import {
  HomeFrame,
  OverviewWidget,
  PostsArea,
  RulesWidget,
  SectionTitle,
  SquadComposer,
  SquadHeader,
  TeamSection,
  TeamWidget,
  VerifiedWidget,
} from './home';
import {
  AnalyticsPage,
  ChannelPage,
  channels,
  FeedSourcePage,
  manage,
  MembersPage,
  ModerationPage,
  PollsPage,
  ProductsPage,
  ReleasesPage,
  SettingsPage,
  useWorkspace,
} from './workspace';

// The composite from the research page, built. One counted tab row under
// the identity block that folds right to left into More as the width goes
// (Priority+), a header that collapses into that row when it sticks, an
// About tab that holds everything that is not a stream of posts, support
// cards beside the feed on Posts only, and Manage appended to the row for
// the people who may see it, with its own second-level row inside.

/* ------------------------------------------------------------------ model */

interface Tab {
  id: string;
  label: string;
  count?: number;
  dot?: boolean;
}

const counts = {
  releases: 14,
  discussions: 38,
};

const tabs: Tab[] = [
  { id: 'home', label: 'Posts' },
  { id: 'releases', label: 'Releases', count: counts.releases },
  { id: 'products', label: 'Products' },
  { id: 'discussions', label: 'Discussions', count: counts.discussions },
  { id: 'polls', label: 'Polls', dot: true },
  { id: 'about', label: 'About' },
];

const followersTab: Tab = {
  id: 'members',
  label: 'Followers',
  count: squad.membersCount,
};

const manageIds = manage.pages.map((page) => page.id);

const faq: [string, string][] = [
  [
    'Is the changelog here the same as docs.coderabbit.ai/changelog?',
    'Yes. Releases are fed by the changelog RSS within the hour, and the team adds context in the comments.',
  ],
  [
    'Where do I report a bug?',
    'Post it in Discussions with the #bug tag. A team member picks it up and links the fix when it ships.',
  ],
  [
    'Can I request a feature?',
    'Discussions, with #feature. Polls are where the team asks the squad to rank what is next.',
  ],
  [
    'Who moderates this page?',
    'CodeRabbit staff, listed under Team, together with daily.dev. Rules are enforced with a review before member posts go live.',
  ],
  [
    'Does following cost anything?',
    'No. Following adds CodeRabbit posts to your feed and lets you turn on release notifications.',
  ],
];

/* ------------------------------------------------------------ priority+ */

/**
 * Measures every tab once, then keeps as many as fit from the left and
 * folds the rest into More whenever the row's width changes.
 */
const useFit = (
  count: number,
  reserve: number,
): {
  rowRef: React.RefObject<HTMLDivElement>;
  itemRef: (index: number) => (node: HTMLElement | null) => void;
  visible: number;
} => {
  const rowRef = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLElement | null)[]>([]);
  const widths = useRef<number[]>([]);
  const [visible, setVisible] = useState(count);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) {
      return undefined;
    }
    if (widths.current.length < count) {
      widths.current = nodes.current.map((node) => node?.offsetWidth ?? 0);
    }
    const fit = () => {
      const available = row.clientWidth - reserve;
      let used = 0;
      let fits = 0;
      for (let index = 0; index < count; index += 1) {
        used += widths.current[index] ?? 0;
        if (used > available) {
          break;
        }
        fits += 1;
      }
      setVisible(Math.max(1, fits));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(row);
    return () => observer.disconnect();
  }, [count, reserve]);

  return {
    rowRef,
    itemRef: (index) => (node) => {
      nodes.current[index] = node;
    },
    visible,
  };
};

/* --------------------------------------------------------------- the row */

const TabButton = ({
  tab,
  active,
  onSelect,
  itemRef,
  className,
  children,
}: {
  tab: Tab;
  active: boolean;
  onSelect: () => void;
  itemRef?: (node: HTMLElement | null) => void;
  className?: string;
  children?: ReactNode;
}): ReactElement => (
  <button
    ref={itemRef}
    type="button"
    onClick={onSelect}
    className={classNames(
      'relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-3 typo-callout transition-colors',
      active
        ? 'font-bold text-text-primary'
        : 'text-text-tertiary hover:text-text-primary',
      className,
    )}
  >
    {tab.label}
    {tab.count !== undefined && (
      <span
        className={classNames(
          'sq-nums rounded-8 px-1.5 py-0.5 font-normal typo-caption2',
          active
            ? 'bg-surface-float text-text-secondary'
            : 'bg-surface-float text-text-quaternary',
        )}
      >
        {formatCount(tab.count)}
      </span>
    )}
    {tab.dot && !active && (
      <span className="size-1.5 rounded-[999px] bg-accent-cabbage-default" />
    )}
    {children}
    {active && (
      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-2 bg-accent-cabbage-default" />
    )}
  </button>
);

const MoreMenu = ({
  items,
  active,
  onSelect,
  itemRef,
}: {
  items: Tab[];
  active: string;
  onSelect: (id: string) => void;
  itemRef: (node: HTMLElement | null) => void;
}): ReactElement => {
  const [open, setOpen] = useState(false);
  const current = items.find((item) => item.id === active);

  return (
    <div ref={itemRef} className="relative shrink-0">
      <TabButton
        tab={{ id: 'more', label: current ? current.label : 'More' }}
        active={Boolean(current)}
        onSelect={() => setOpen((value) => !value)}
      >
        <ArrowIcon
          size={IconSize.XSmall}
          className={classNames(
            'transition-transform',
            open ? '' : 'rotate-180',
          )}
        />
      </TabButton>
      {open && (
        <ul className="sq-elevated absolute left-0 top-full z-popup mt-1 flex w-52 flex-col rounded-12 bg-background-default p-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(item.id);
                  setOpen(false);
                }}
                className={classNames(
                  'flex w-full items-center gap-2 rounded-8 px-2 py-1.5 text-left typo-callout hover:bg-surface-float hover:text-text-primary',
                  item.id === active
                    ? 'font-bold text-text-primary'
                    : 'text-text-secondary',
                )}
              >
                {item.label}
                {item.count !== undefined && (
                  <span className="sq-nums ml-auto text-text-quaternary typo-caption1">
                    {formatCount(item.count)}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/** What the hero collapses into once the row sticks. */
const CompactIdentity = ({ stuck }: { stuck: boolean }): ReactElement => (
  <div
    className="flex shrink-0 items-center gap-2 overflow-hidden transition-all duration-200"
    style={{ maxWidth: stuck ? '16rem' : 0, opacity: stuck ? 1 : 0 }}
  >
    <img
      src={squad.image}
      alt=""
      className="size-6 shrink-0 rounded-6 object-cover"
    />
    <span className="flex items-center gap-1 whitespace-nowrap font-bold text-text-primary typo-callout">
      {squad.name}
      <VerifiedMark label={false} />
    </span>
    <span className="mx-1 h-5 w-px shrink-0 bg-border-subtlest-tertiary" />
  </div>
);

const CompactActions = ({
  viewer,
  stuck,
}: {
  viewer: Viewer;
  stuck: boolean;
}): ReactElement => {
  const { config } = useWorkspace();

  return (
    <div
      className="flex shrink-0 items-center gap-1 overflow-hidden transition-all duration-200"
      style={{ maxWidth: stuck ? '16rem' : 0, opacity: stuck ? 1 : 0 }}
    >
      {isJoined(viewer) ? (
        <>
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.XSmall}
            icon={<VIcon />}
          >
            Following
          </Button>
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.XSmall}
            icon={<BellIcon />}
            aria-label="Notifications"
          />
        </>
      ) : (
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.XSmall}
          disabled={isBlocked(viewer) || !config.isPublic}
        >
          {!config.isPublic
            ? 'Invite only'
            : isLoggedIn(viewer)
            ? 'Follow'
            : 'Sign up to follow'}
        </Button>
      )}
    </div>
  );
};

const ManageTab = ({
  viewer,
  active,
  onSelect,
}: {
  viewer: Viewer;
  active: string;
  onSelect: (id: string) => void;
}): ReactElement | null => {
  if (!isStaff(viewer)) {
    return null;
  }
  const isActive = manageIds.includes(active);
  const queue = manage.pages.find((page) => page.id === 'moderation')?.badge;

  return (
    <button
      type="button"
      onClick={() => onSelect('moderation')}
      className={classNames(
        'relative ml-1 flex shrink-0 items-center gap-1.5 whitespace-nowrap border-l border-border-subtlest-tertiary py-3 pl-4 pr-3 typo-callout transition-colors',
        isActive
          ? 'font-bold text-text-primary'
          : 'text-text-tertiary hover:text-text-primary',
      )}
    >
      <SettingsIcon size={IconSize.Small} />
      Manage
      {queue && (
        <span className="sq-nums rounded-8 bg-accent-cabbage-default px-1.5 py-0.5 font-bold text-white typo-caption2">
          {queue}
        </span>
      )}
      {isActive && (
        <span className="absolute inset-x-3 bottom-0 border-b-2 border-dashed border-accent-cabbage-default" />
      )}
    </button>
  );
};

/**
 * The row and the bar it becomes. A sentinel above it tells when it has
 * stuck to the top of the scroll container; the identity and the primary
 * action then slide in at its two ends.
 */
const StickyRow = ({
  viewer,
  active,
  onSelect,
}: {
  viewer: Viewer;
  active: string;
  onSelect: (id: string) => void;
}): ReactElement => {
  const sentinel = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const { rowRef, itemRef, visible } = useFit(tabs.length, 96);
  const overflow = [...tabs.slice(visible), followersTab];

  useLayoutEffect(() => {
    const node = sentinel.current;
    if (!node) {
      return undefined;
    }
    const root = node.closest('.ws-scroll');
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { root, threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinel} className="h-px" />
      <div
        className={classNames(
          'sticky top-0 z-3 flex items-center border-t border-border-subtlest-tertiary bg-background-default px-3 transition-shadow',
          stuck && 'shadow-2',
        )}
      >
        <CompactIdentity stuck={stuck} />
        <div ref={rowRef} className="flex min-w-0 flex-1 items-center">
          {tabs.map((tab, index) => (
            <TabButton
              key={tab.id}
              tab={tab}
              active={active === tab.id}
              onSelect={() => onSelect(tab.id)}
              itemRef={itemRef(index)}
              className={index >= visible ? 'hidden' : undefined}
            />
          ))}
          <MoreMenu
            items={overflow}
            active={active}
            onSelect={onSelect}
            itemRef={itemRef(tabs.length)}
          />
        </div>
        <CompactActions viewer={viewer} stuck={stuck} />
        <ManageTab viewer={viewer} active={active} onSelect={onSelect} />
      </div>
    </>
  );
};

/* ----------------------------------------------------------------- header */

/** Under the identity block: the links as labelled icons, the team as faces. */
const LinksAndTeam = ({
  onOpenMembers,
}: {
  onOpenMembers: () => void;
}): ReactElement => {
  const shown = companyLinks.slice(0, 5);
  const rest = companyLinks.length - shown.length;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-5">
      <div className="flex flex-wrap items-center gap-1">
        {shown.map((link) => (
          <Button
            key={link.id}
            tag="a"
            href={link.href}
            target="_blank"
            rel="noopener"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.XSmall}
            icon={linkIcon(link.id, IconSize.XSmall)}
          >
            {link.label}
          </Button>
        ))}
        {rest > 0 && (
          <span className="px-2 text-text-quaternary typo-footnote">
            and {rest} more
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onOpenMembers}
        className="flex items-center gap-2 text-text-tertiary typo-footnote hover:text-text-primary"
      >
        <span className="flex -space-x-1.5">
          {team.map((member) => (
            <Avatar
              key={member.id}
              member={member}
              size={1.5}
              className="ring-2 ring-background-default"
            />
          ))}
        </span>
        Team of {team.length}
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ pages */

const Accordion = ({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}): ReactElement => {
  const [allOpen, setAllOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 py-5">
      <SectionTitle
        action={
          <button
            type="button"
            onClick={() => setAllOpen((value) => !value)}
            className="text-text-tertiary typo-footnote hover:text-text-primary"
          >
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        }
      >
        {title}
      </SectionTitle>
      <div className="flex flex-col divide-y divide-border-subtlest-tertiary rounded-16 border border-border-subtlest-tertiary">
        {items.map(([heading, body], index) => (
          <details
            key={heading}
            open={allOpen || undefined}
            className="group px-4"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 py-3 text-text-primary typo-callout">
              <span className="sq-nums w-4 shrink-0 text-text-quaternary typo-caption1">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">{heading}</span>
              <ArrowIcon
                size={IconSize.XSmall}
                className="shrink-0 rotate-180 text-text-quaternary transition-transform group-open:rotate-0"
              />
            </summary>
            <p className="pb-3 pl-7 text-text-secondary typo-footnote">
              {body}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
};

const facts = [
  ['Website', squad.company.website],
  ['Headquarters', squad.company.location],
  ['Company size', squad.company.size],
  ['Category', squad.category],
  ['On daily.dev since', formatSince(squad.createdAt)],
  ['Content feed', squad.feedUrl],
];

const followers = Array.from(
  { length: 12 },
  (_, index) => team[index % team.length],
);

/** Everything that is not a stream of posts, in one labelled place. */
export const AboutPage = ({
  viewer,
  onOpenMembers,
}: {
  viewer: Viewer;
  onOpenMembers: () => void;
}): ReactElement => (
  <div className="mx-auto flex w-full max-w-[46rem] flex-col divide-y divide-border-subtlest-tertiary px-6 py-2">
    <div className="flex flex-col gap-3 py-5">
      <SectionTitle
        action={
          isAdmin(viewer) && (
            <span className="text-text-tertiary typo-footnote">Edit</span>
          )
        }
      >
        About
      </SectionTitle>
      <p className="text-text-primary typo-body">{squad.description}</p>
      <div className="flex flex-wrap items-center gap-1">
        {companyLinks.map((link) => (
          <Button
            key={link.id}
            tag="a"
            href={link.href}
            target="_blank"
            rel="noopener"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            icon={linkIcon(link.id)}
          >
            {link.label}
          </Button>
        ))}
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-8 gap-y-3">
        {facts.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="text-text-quaternary typo-caption1">{label}</dt>
            <dd className="truncate text-text-primary typo-callout">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
    <Accordion title="Rules" items={rules} />
    <Accordion title="FAQ" items={faq} />
    <TeamSection />
    <div className="flex flex-col gap-3 py-5">
      <SectionTitle
        action={
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.XSmall}
            icon={<ArrowIcon className="rotate-90" />}
            iconPosition={ButtonIconPosition.Right}
            onClick={onOpenMembers}
          >
            See all {squad.membersCount.toLocaleString()}
          </Button>
        }
      >
        Followers
      </SectionTitle>
      <div className="flex flex-wrap gap-2">
        {followers.map((member, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Avatar key={index} member={member} size={2.25} />
        ))}
      </div>
    </div>
  </div>
);

const PreviewAs = ({ viewer }: { viewer: Viewer }): ReactElement => (
  <span className="ml-auto flex items-center gap-1 text-text-tertiary typo-footnote">
    Preview as
    <span className="flex items-center gap-0.5 font-bold text-text-primary">
      {isAdmin(viewer) ? 'Admin' : 'Moderator'}
      <ArrowIcon size={IconSize.XSmall} className="rotate-180" />
    </span>
  </span>
);

/** The team's section: a second-level row inside the Manage tab. */
const ManageArea = ({
  viewer,
  active,
  onSelect,
}: {
  viewer: Viewer;
  active: string;
  onSelect: (id: string) => void;
}): ReactElement => {
  const items = manage.pages.filter(
    (item) => isAdmin(viewer) || !item.adminOnly,
  );

  return (
    <>
      <div className="flex items-center gap-1 border-b border-border-subtlest-tertiary bg-surface-float px-4 py-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={classNames(
              'flex items-center gap-1.5 rounded-10 px-3 py-1.5 typo-callout transition-colors',
              active === item.id
                ? 'bg-background-default font-bold text-text-primary shadow-2'
                : 'text-text-tertiary hover:text-text-primary',
            )}
          >
            {item.label}
            {item.badge && (
              <span className="sq-nums rounded-8 bg-accent-cabbage-default px-1.5 font-bold text-white typo-caption2">
                {item.badge}
              </span>
            )}
          </button>
        ))}
        <PreviewAs viewer={viewer} />
      </div>
      {active === 'moderation' && <ModerationPage />}
      {active === 'feed' && <FeedSourcePage />}
      {active === 'analytics' && <AnalyticsPage />}
      {active === 'settings' && <SettingsPage />}
    </>
  );
};

const PostsTab = ({
  viewer,
  onOpenAbout,
}: {
  viewer: Viewer;
  onOpenAbout: () => void;
}): ReactElement => (
  <PostsArea
    sort="Latest"
    entries={feedEntries.slice(0, 6)}
    pinned={pinnedEntry}
    composer={<SquadComposer viewer={viewer} />}
    toolbarChildren={
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<DocsIcon />}
        onClick={onOpenAbout}
      >
        Rules
      </Button>
    }
  />
);

const PageBody = ({
  id,
  viewer,
  onSelect,
}: {
  id: string;
  viewer: Viewer;
  onSelect: (id: string) => void;
}): ReactElement => {
  switch (id) {
    case 'home':
      return <PostsTab viewer={viewer} onOpenAbout={() => onSelect('about')} />;
    case 'releases':
      return <ReleasesPage viewer={viewer} />;
    case 'products':
      return <ProductsPage viewer={viewer} />;
    case 'discussions':
      return <ChannelPage page={channels.discussions} viewer={viewer} />;
    case 'polls':
      return <PollsPage viewer={viewer} />;
    case 'about':
      return (
        <AboutPage viewer={viewer} onOpenMembers={() => onSelect('members')} />
      );
    case 'members':
      return <MembersPage viewer={viewer} />;
    default:
      return <ManageArea viewer={viewer} active={id} onSelect={onSelect} />;
  }
};

/* ------------------------------------------------------------------- view */

export const CompositeView = ({
  viewer,
  active,
  onSelect,
  width = 1440,
}: {
  viewer: Viewer;
  active: string;
  onSelect: (id: string) => void;
  width?: number;
}): ReactElement => {
  const narrow = width < 1100;
  const showCards = active === 'home' && !narrow;

  return (
    <HomeFrame
      header={
        <>
          <SquadHeader
            viewer={viewer}
            standalone
            onOpenMembers={() => onSelect('members')}
          />
          <LinksAndTeam onOpenMembers={() => onSelect('members')} />
        </>
      }
      widgets={
        showCards && (
          <>
            <VerifiedWidget />
            <RulesWidget
              onOpenRules={() => onSelect('about')}
              onOpenFaq={() => onSelect('about')}
            />
            <TeamWidget />
            <OverviewWidget />
          </>
        )
      }
    >
      <StickyRow viewer={viewer} active={active} onSelect={onSelect} />
      <PageBody id={active} viewer={viewer} onSelect={onSelect} />
    </HomeFrame>
  );
};

export const compositeTab = (id: string): boolean =>
  tabs.some((tab) => tab.id === id) ||
  id === 'members' ||
  manageIds.includes(id);
