import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useContext, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  AddUserIcon,
  ArrowIcon,
  BellIcon,
  DragIcon,
  EyeCancelIcon,
  LinkIcon,
  LockIcon,
  OpenLinkIcon,
  PlusIcon,
  SettingsIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { rules, squad, team } from '../data';
import {
  isAdmin,
  isBlocked,
  isJoined,
  isStaff,
  VerifiedMark,
  Viewer,
} from '../kit';
import { Kit2Styles } from '../kit2';
import { SquadHome } from '../home';
import type { SquadConfig, WorkspaceState } from '../state';
import {
  ContentSource,
  defaultConfig,
  MemberRole,
  useWorkspace,
  WorkspaceContext,
} from '../state';
import {
  AnalyticsPage,
  ChannelPage,
  Column,
  common,
  DocPage,
  docs,
  FeedSourcePage,
  hidden,
  iconFor,
  InvitePage,
  MembersPage,
  ModerationPage,
  NotFoundPage,
  pageIcon,
  PageType,
  PendingPostsPage,
  PollsPage,
  PrivateWall,
  ProductsPage,
  Rail,
  ReleasesPage,
  RulesPage,
  sections,
  SettingsPage,
  SquadPage,
  WorkspaceStyles,
} from '../workspace';

// The earlier direction's shell: a workspace sidebar of channels and
// pages, the bar above each page, and the Add a page picker. Only the
// archived Workspace story renders it; the chosen direction reuses the
// pages in ../workspace.tsx.

export const allPages: SquadPage[] = [
  ...sections.flatMap((section) => section.pages),
  common.members,
  ...Object.values(hidden),
].filter(
  (candidate, index, list) =>
    list.findIndex((other) => other.id === candidate.id) === index,
);

/** What an admin can add, grouped the way a community thinks about it. */
export const pageCatalogue: {
  group: string;
  items: {
    type: PageType;
    title: string;
    description: string;
    exists: boolean;
  }[];
}[] = [
  {
    group: 'Channels',
    items: [
      {
        type: PageType.Channel,
        title: 'Discussions',
        description:
          'The feed, with a posting rule. Questions, feedback and bug reports live here too.',
        exists: true,
      },
      {
        type: PageType.Polls,
        title: 'Polls',
        description:
          'The poll post type, on its own page. The team asks, members vote.',
        exists: true,
      },
    ],
  },
  {
    group: 'Documentation',
    items: [
      {
        type: PageType.Rules,
        title: 'Rules',
        description:
          'Numbered, one line each, expandable. Also shown on Home and before a first post.',
        exists: false,
      },
      {
        type: PageType.Doc,
        title: 'FAQ or wiki',
        description: 'A freeform post rendered as a page.',
        exists: true,
      },
      {
        type: PageType.Doc,
        title: 'Page',
        description: 'Any long-form document: a welcome, a roadmap, a guide.',
        exists: true,
      },
    ],
  },
  {
    group: 'Company',
    items: [
      {
        type: PageType.Releases,
        title: 'Releases',
        description:
          'Every release post as a log, grouped by month, filterable by kind. Reads like GitHub Releases.',
        exists: false,
      },
      {
        type: PageType.Products,
        title: 'Products',
        description:
          'Everything the company makes. Imported from Product Hunt, G2, GitHub or a URL; each row links to the member stack.',
        exists: false,
      },
    ],
  },
  {
    group: 'Links and people',
    items: [
      {
        type: PageType.Link,
        title: 'Link',
        description:
          'Docs, GitHub, X, YouTube, LinkedIn, Discord. Opens in a new tab.',
        exists: true,
      },
      {
        type: PageType.Members,
        title: 'Followers',
        description: 'Everyone in the squad, with the team on top.',
        exists: true,
      },
    ],
  },
];

const Badge = ({ value }: { value: number }): ReactElement => (
  <span className="sq-nums ml-auto rounded-8 bg-surface-float px-1.5 font-bold text-text-tertiary typo-caption2">
    {value}
  </span>
);

const SidebarItem = ({
  page,
  active,
  admin,
  onSelect,
}: {
  page: SquadPage;
  active: boolean;
  admin: boolean;
  onSelect: (page: SquadPage) => void;
}): ReactElement => (
  <button
    type="button"
    onClick={() => onSelect(page)}
    className={classNames(
      'ws-item group relative flex w-full items-center gap-2.5 rounded-10 px-2.5 py-1.5 text-left typo-callout transition-colors',
      active
        ? 'ws-active bg-surface-float font-bold text-text-primary'
        : 'text-text-tertiary hover:bg-surface-float hover:text-text-primary',
    )}
  >
    <span
      className={classNames(
        'flex shrink-0',
        active
          ? 'text-text-primary'
          : 'text-text-quaternary group-hover:text-text-primary',
      )}
    >
      {iconFor(page)}
    </span>
    <span className="truncate">{page.label}</span>
    {page.href && (
      <OpenLinkIcon
        size={IconSize.XSmall}
        className="ml-auto shrink-0 text-text-quaternary opacity-0 transition-opacity group-hover:opacity-100"
      />
    )}
    {page.restricted && (
      <LockIcon
        size={IconSize.XSmall}
        className="shrink-0 text-text-quaternary"
      />
    )}
    {typeof page.badge === 'number' && <Badge value={page.badge} />}
    {admin && (
      <span
        className={classNames(
          'ws-item-tools flex items-center gap-1 text-text-quaternary',
          typeof page.badge !== 'number' && 'ml-auto',
        )}
      >
        <EyeCancelIcon size={IconSize.XSmall} />
        <DragIcon size={IconSize.XSmall} />
      </span>
    )}
  </button>
);

export const SquadSidebar = ({
  active,
  viewer,
  onSelect,
  className,
}: {
  active: SquadPage;
  viewer: Viewer;
  onSelect: (page: SquadPage) => void;
  className?: string;
}): ReactElement => {
  const admin = isAdmin(viewer);
  const staff = isStaff(viewer);
  const { source, config } = useWorkspace();
  const canInvite = staff || config.memberInviteRole === MemberRole.Member;

  return (
    <aside
      className={classNames(
        'ws-scroll flex w-64 shrink-0 flex-col overflow-y-auto border-r border-border-subtlest-tertiary',
        className,
      )}
    >
      <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary p-4">
        <div className="flex items-center gap-3">
          <img
            src={squad.image}
            alt=""
            className="size-10 rounded-full bg-background-default object-cover ring-1 ring-border-subtlest-tertiary"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-1 truncate font-bold text-text-primary typo-callout">
              {squad.name}
              <VerifiedMark label={false} className="shrink-0" />
            </span>
            <span className="truncate text-text-tertiary typo-caption1">
              Verified · {squad.company.website}
            </span>
          </div>
        </div>
        {viewer === Viewer.Anonymous && (
          <div className="flex flex-col gap-2">
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              className="w-full"
            >
              Sign up to follow
            </Button>
            <span className="text-center text-text-tertiary typo-caption1">
              Already on daily.dev?{' '}
              <span className="text-text-link">Log in</span>
            </span>
          </div>
        )}
        {viewer === Viewer.Visitor && config.isPublic && (
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            className="w-full"
          >
            Follow
          </Button>
        )}
        {viewer === Viewer.Visitor && !config.isPublic && (
          <div className="flex items-center gap-2 rounded-10 bg-surface-float px-3 py-2 text-text-tertiary typo-caption1">
            <LockIcon size={IconSize.Small} />
            Private squad. Followers join by invitation link.
          </div>
        )}
        {isBlocked(viewer) && (
          <div className="flex flex-col gap-2">
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              className="w-full"
              disabled
            >
              Follow
            </Button>
            <span className="text-center text-text-tertiary typo-caption1">
              You are not allowed to follow this Squad
            </span>
          </div>
        )}
        {(viewer === Viewer.Member || viewer === Viewer.Moderator) && (
          <div
            className={classNames(
              'grid gap-1',
              canInvite ? 'grid-cols-3' : 'grid-cols-2',
            )}
          >
            {[
              [<BellIcon key="bell" size={IconSize.Small} />, 'Alerts'],
              ...(canInvite
                ? [
                    [
                      <AddUserIcon key="invite" size={IconSize.Small} />,
                      'Invite',
                    ],
                  ]
                : []),
              [<LinkIcon key="share" size={IconSize.Small} />, 'Share'],
            ].map(([icon, label]) => (
              <button
                type="button"
                key={label as string}
                className="flex flex-col items-center gap-0.5 rounded-10 bg-surface-float py-2 text-text-tertiary typo-caption1 transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        )}
        {staff && (
          <div className="flex items-center justify-between rounded-10 bg-surface-float px-3 py-1.5 text-text-tertiary typo-caption1">
            Preview as
            <span className="flex items-center gap-1 font-bold text-text-primary">
              {admin ? 'Admin' : 'Moderator'}
              <ArrowIcon size={IconSize.XSmall} className="rotate-180" />
            </span>
          </div>
        )}
      </header>
      <div className="flex flex-col gap-4 px-2 py-3">
        {sections
          .filter((section) => !section.admin || staff)
          .map((section) => ({
            ...section,
            pages: section.pages.filter(
              (item) =>
                (!item.adminOnly || admin) &&
                (item.type !== PageType.Feed || source === ContentSource.Feed),
            ),
          }))
          .map((section) => (
            <div key={section.id} className="flex flex-col gap-0.5">
              {section.label && (
                <div className="flex items-center justify-between px-2 pb-1">
                  <span className="flex items-center gap-1 font-bold uppercase tracking-[0.12em] text-text-quaternary typo-caption2">
                    {section.label}
                    <ArrowIcon size={IconSize.XSmall} className="rotate-180" />
                  </span>
                  {admin && (
                    <button
                      type="button"
                      aria-label={`Add a page to ${section.label}`}
                      className="text-text-quaternary hover:text-text-primary"
                      onClick={() =>
                        onSelect({
                          id: 'add',
                          label: 'Add a page',
                          type: PageType.Add,
                        })
                      }
                    >
                      <PlusIcon size={IconSize.XSmall} />
                    </button>
                  )}
                </div>
              )}
              {section.pages.map((page) => (
                <SidebarItem
                  key={page.id}
                  page={page}
                  active={page.id === active.id}
                  admin={admin}
                  onSelect={onSelect}
                />
              ))}
            </div>
          ))}
        {admin && (
          <button
            type="button"
            onClick={() =>
              onSelect({ id: 'add', label: 'Add a page', type: PageType.Add })
            }
            className={classNames(
              'flex items-center gap-2 rounded-10 border border-dashed border-border-subtlest-secondary px-2 py-1.5 text-text-tertiary typo-callout hover:border-border-subtlest-primary hover:text-text-primary',
              active.type === PageType.Add &&
                'border-border-subtlest-primary text-text-primary',
            )}
          >
            <PlusIcon size={IconSize.Small} />
            Add a page
          </button>
        )}
      </div>
    </aside>
  );
};

/** Every page's top strip: where you are, and what you can do here. */
export const PageBar = ({
  page,
  children,
}: {
  page: SquadPage;
  children?: ReactNode;
}): ReactElement => (
  <div className="sticky top-0 z-3 flex h-12 items-center gap-2 border-b border-border-subtlest-tertiary bg-background-default px-6">
    <span className="text-text-tertiary">{iconFor(page)}</span>
    <span className="font-bold text-text-primary typo-callout">
      {page.label}
    </span>
    {page.restricted && (
      <span className="ml-1 flex items-center gap-1 rounded-8 bg-surface-float px-2 py-0.5 text-text-tertiary typo-caption1">
        <LockIcon size={IconSize.XSmall} />
        Team only
      </span>
    )}
    <div className="ml-auto flex items-center gap-1">{children}</div>
  </div>
);

const IconButton = ({
  icon,
  label,
}: {
  icon: ReactElement;
  label: string;
}): ReactElement => (
  <Button
    variant={ButtonVariant.Float}
    size={ButtonSize.Small}
    icon={icon}
    aria-label={label}
  />
);

/** Home is the profile page's skeleton, for a squad. See home.tsx. */
const HomePage = ({
  viewer,
  empty,
  onOpenMembers,
  onOpenRules,
  onOpenFaq,
  onOpenPending,
}: {
  viewer: Viewer;
  empty: boolean;
  onOpenMembers: () => void;
  onOpenRules: () => void;
  onOpenFaq: () => void;
  onOpenPending: () => void;
}): ReactElement => (
  <SquadHome
    viewer={viewer}
    empty={empty}
    onOpenMembers={onOpenMembers}
    onOpenRules={onOpenRules}
    onOpenFaq={onOpenFaq}
    onOpenPending={onOpenPending}
  />
);

const AddPage = (): ReactElement => (
  <Column width="max-w-[52rem]" className="gap-8">
    <div className="flex flex-col gap-1">
      <h1 className="font-bold text-text-primary typo-title2">Add a page</h1>
      <p className="text-text-tertiary typo-callout">
        Pick what the page is. You name it and choose the section afterwards.
      </p>
    </div>
    {pageCatalogue.map((group) => (
      <div key={group.group} className="flex flex-col gap-3">
        <span className="font-bold uppercase tracking-wide text-text-quaternary typo-caption2">
          {group.group}
        </span>
        <div className="grid grid-cols-2 gap-3">
          {group.items.map((item) => (
            <button
              type="button"
              key={item.title}
              className="flex items-start gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 text-left hover:border-border-subtlest-primary"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-10 bg-background-default text-text-primary">
                {pageIcon(item.type, IconSize.Small)}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2 font-bold text-text-primary typo-callout">
                  {item.title}
                  {!item.exists && (
                    <span className="rounded-6 bg-accent-cabbage-flat px-1.5 text-accent-cabbage-default typo-caption2">
                      New
                    </span>
                  )}
                </span>
                <span className="text-text-tertiary typo-footnote">
                  {item.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    ))}
  </Column>
);

export const AdminPlaceholder = ({
  page,
}: {
  page: SquadPage;
}): ReactElement => (
  <Column>
    <div className="flex flex-col items-center gap-2 rounded-16 border border-dashed border-border-subtlest-secondary p-10 text-center">
      <span className="text-text-tertiary">
        {pageIcon(page.type, IconSize.Large)}
      </span>
      <span className="font-bold text-text-primary typo-callout">
        {page.label}
      </span>
      <span className="max-w-[40ch] text-text-tertiary typo-footnote">
        The existing {page.label.toLowerCase()} screen, opened inside the
        workspace instead of on its own route.
      </span>
    </div>
  </Column>
);

const PageBody = ({
  page: current,
  viewer,
  onSelect,
}: {
  page: SquadPage;
  viewer: Viewer;
  onSelect: (page: SquadPage) => void;
}): ReactElement => {
  const { isPrivate, empty } = useWorkspace();

  if (
    isPrivate &&
    !isJoined(viewer) &&
    current.type !== PageType.Home &&
    current.type !== PageType.Invite &&
    current.type !== PageType.NotFound
  ) {
    return <PrivateWall viewer={viewer} />;
  }

  switch (current.type) {
    case PageType.Home:
      return (
        <HomePage
          viewer={viewer}
          empty={empty}
          onOpenMembers={() => onSelect(common.members)}
          onOpenRules={() => onSelect(docs.rules)}
          onOpenFaq={() => onSelect(docs.faq)}
          onOpenPending={() => onSelect(hidden.pending)}
        />
      );
    case PageType.Moderation:
      return <ModerationPage />;
    case PageType.Pending:
      return <PendingPostsPage />;
    case PageType.Settings:
      return <SettingsPage />;
    case PageType.Analytics:
      return <AnalyticsPage />;
    case PageType.Invite:
      return <InvitePage viewer={viewer} />;
    case PageType.NotFound:
      return <NotFoundPage />;
    case PageType.Feed:
      return <FeedSourcePage />;
    case PageType.Channel:
      return <ChannelPage page={current} viewer={viewer} />;
    case PageType.Releases:
      return <ReleasesPage viewer={viewer} />;
    case PageType.Polls:
      return <PollsPage viewer={viewer} />;
    case PageType.Doc:
      return <DocPage page={current} />;
    case PageType.Rules:
      return <RulesPage />;
    case PageType.Products:
      return <ProductsPage viewer={viewer} />;
    case PageType.Members:
      return <MembersPage viewer={viewer} />;
    case PageType.Add:
      return <AddPage />;
    default:
      return <AdminPlaceholder page={current} />;
  }
};

const pageBarTools = (page: SquadPage, viewer: Viewer): ReactNode => {
  switch (page.type) {
    case PageType.Home:
    case PageType.Channel:
      return isAdmin(viewer) ? (
        <IconButton icon={<SettingsIcon />} label="Page settings" />
      ) : null;
    case PageType.Products:
      return isAdmin(viewer) ? (
        <Button variant={ButtonVariant.Subtle} size={ButtonSize.Small}>
          Sync now
        </Button>
      ) : null;
    case PageType.Doc:
      return isStaff(viewer) ? (
        <Button variant={ButtonVariant.Subtle} size={ButtonSize.Small}>
          Edit page
        </Button>
      ) : (
        <IconButton icon={<LinkIcon />} label="Copy link" />
      );
    default:
      return null;
  }
};

/* -------------------------------------------------------------- workspace */

export const WorkspaceShell = ({
  viewer = Viewer.Member,
  initialPage = allPages[0],
  source = ContentSource.Feed,
  empty = false,
  isPrivate = false,
  config,
  height = 56,
  width = 1440,
}: {
  viewer?: Viewer;
  initialPage?: SquadPage;
  source?: ContentSource;
  empty?: boolean;
  isPrivate?: boolean;
  config?: Partial<SquadConfig>;
  /** rem */
  height?: number;
  width?: number;
}): ReactElement => {
  const [active, setActive] = useState<SquadPage>(initialPage);
  const state: WorkspaceState = {
    viewer,
    source,
    empty,
    isPrivate,
    config: { ...defaultConfig, isPublic: !isPrivate, ...config },
  };

  const standalonePage =
    active.type === PageType.Invite || active.type === PageType.NotFound;

  const onSelect = (page: SquadPage) => {
    if (page.href) {
      return;
    }
    setActive(page);
  };

  return (
    <WorkspaceContext.Provider value={state}>
      <div
        style={{ width, maxWidth: '100%', height: `${height}rem` }}
        className="sq-elevated flex overflow-hidden rounded-16 bg-background-default text-text-primary"
      >
        <WorkspaceStyles />
        <Kit2Styles />
        <Rail />
        {!standalonePage && (
          <SquadSidebar active={active} viewer={viewer} onSelect={onSelect} />
        )}
        <main className="ws-scroll flex min-w-0 flex-1 flex-col overflow-y-auto">
          {active.type !== PageType.Home && !standalonePage && (
            <PageBar page={active}>{pageBarTools(active, viewer)}</PageBar>
          )}
          <div className="flex-1">
            <PageBody page={active} viewer={viewer} onSelect={onSelect} />
          </div>
        </main>
      </div>
    </WorkspaceContext.Provider>
  );
};

export const findPage = (id: string): SquadPage =>
  allPages.find((page) => page.id === id) ?? allPages[0];

export const addPage: SquadPage = {
  id: 'add',
  label: 'Add a page',
  type: PageType.Add,
};
