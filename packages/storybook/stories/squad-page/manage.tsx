import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  AnalyticsIcon,
  AppIcon,
  ArrowIcon,
  DocsIcon,
  EditIcon,
  HelpIcon,
  LinkIcon,
  LockIcon,
  MegaphoneIcon,
  MenuIcon,
  MoveToIcon,
  PlusIcon,
  SlackIcon,
  TimerIcon,
  TrashIcon,
  UserIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { companyLinks, squad } from './data';
import { isAdmin, linkIcon, VerifiedMark, Viewer } from './kit';
import { ContentSource, useWorkspace } from './state';
import {
  AnalyticsPage,
  ColumnFitContext,
  DocPage,
  docs,
  FeedSourcePage,
  MembersPage,
  ModerationPage,
  ProductsPage,
  RulesPage,
  SettingsPage,
} from './workspace';
import { AddProductPage, SaveProductButton } from './productForm';

// Managing the squad the way a profile is edited: its own settings area,
// a grouped menu beside the page on laptop, the menu as a list and then
// one page at a time below it. Edit page opens Details; every Manage
// entry opens its section. Moderators see only what they may touch.

export type ManageSection =
  | 'details'
  | 'rules'
  | 'faq'
  | 'products'
  | 'add-product'
  | 'links'
  | 'followers'
  | 'moderation'
  | 'posting'
  | 'feed'
  | 'analytics'
  | 'integrations'
  | 'danger';

interface ManageItem {
  id: ManageSection;
  label: string;
  icon: ReactElement;
  team?: boolean;
  feedOnly?: boolean;
  badge?: number;
}

const groups: { title: string; items: ManageItem[] }[] = [
  {
    title: 'Page',
    items: [
      { id: 'details', label: 'Details', icon: <EditIcon /> },
      { id: 'rules', label: 'Rules', icon: <DocsIcon />, team: true },
      { id: 'faq', label: 'FAQ', icon: <HelpIcon />, team: true },
      { id: 'products', label: 'Products', icon: <AppIcon /> },
      { id: 'links', label: 'Links', icon: <LinkIcon /> },
    ],
  },
  {
    title: 'Community',
    items: [
      { id: 'followers', label: 'Followers', icon: <UserIcon />, team: true },
      {
        id: 'moderation',
        label: 'Moderation',
        icon: <TimerIcon />,
        team: true,
        badge: 3,
      },
      { id: 'posting', label: 'Posting and invitations', icon: <LockIcon /> },
    ],
  },
  {
    title: 'Tools',
    items: [
      {
        id: 'feed',
        label: 'Content feed',
        icon: <MegaphoneIcon />,
        feedOnly: true,
      },
      { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
      { id: 'integrations', label: 'Integrations', icon: <SlackIcon /> },
      { id: 'danger', label: 'Danger zone', icon: <TrashIcon /> },
    ],
  },
];

export const manageTitles: Record<ManageSection, string> = {
  details: 'Details',
  rules: 'Rules',
  faq: 'FAQ',
  products: 'Products',
  'add-product': 'Add product',
  links: 'Links',
  followers: 'Followers',
  moderation: 'Moderation',
  posting: 'Posting and invitations',
  feed: 'Content feed',
  analytics: 'Analytics',
  integrations: 'Integrations',
  danger: 'Danger zone',
};

export const manageSectionIds = Object.keys(manageTitles) as ManageSection[];

const useGroups = (viewer: Viewer) => {
  const { source } = useWorkspace();

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          (isAdmin(viewer) || item.team) &&
          (!item.feedOnly || source === ContentSource.Feed),
      ),
    }))
    .filter((group) => group.items.length);
};

const MenuHeader = (): ReactElement => (
  <div className="flex items-center gap-3 px-2 py-2">
    <img src={squad.image} alt="" className="size-8 rounded-full" />
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="flex items-center gap-1 font-bold text-text-primary typo-callout">
        {squad.name}
        <VerifiedMark label={false} />
      </span>
      <span className="text-text-tertiary typo-caption1">Manage page</span>
    </div>
  </div>
);

const ManageMenu = ({
  viewer,
  active,
  onSection,
  large,
}: {
  viewer: Viewer;
  active?: ManageSection;
  onSection: (id: ManageSection) => void;
  /** The phone list: bigger rows, a chevron on each. */
  large?: boolean;
}): ReactElement => (
  <nav className="flex flex-col gap-2">
    {useGroups(viewer).map((group, index) => (
      <div
        key={group.title}
        className={classNames(
          'flex flex-col',
          index > 0 && 'border-t border-border-subtlest-tertiary pt-2',
        )}
      >
        <span className="px-2 py-1.5 text-text-quaternary typo-footnote">
          {group.title}
        </span>
        {group.items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSection(item.id)}
            aria-current={active === item.id ? 'page' : undefined}
            className={classNames(
              'flex items-center gap-3 rounded-10 px-2 text-left transition-colors',
              large ? 'py-3 typo-body' : 'py-1.5 typo-callout',
              active === item.id
                ? 'bg-surface-float text-text-primary'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
            )}
          >
            {React.cloneElement(item.icon, {
              size: IconSize.Small,
              className: 'shrink-0',
            })}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {!!item.badge && (
              <span className="sq-nums rounded-8 bg-surface-float px-1.5 font-bold text-text-tertiary typo-caption2">
                {item.badge}
              </span>
            )}
            {large && (
              <ArrowIcon
                size={IconSize.Small}
                className="rotate-90 text-text-quaternary"
              />
            )}
          </button>
        ))}
      </div>
    ))}
  </nav>
);

const LinksManage = (): ReactElement => (
  <ul className="flex flex-col gap-4">
    {companyLinks.map((item) => (
      <li key={item.id} className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-surface-float text-text-secondary">
          {linkIcon(item.id, IconSize.Size16)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold text-text-primary typo-callout">
            {item.label}
          </span>
          <span className="truncate text-text-tertiary typo-footnote">
            {item.href.replace(/^https?:\/\//, '')}
          </span>
        </div>
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<MenuIcon />}
          aria-label={`${item.label} options`}
        />
      </li>
    ))}
  </ul>
);

const Section = ({
  id,
  viewer,
}: {
  id: ManageSection;
  viewer: Viewer;
}): ReactElement => {
  switch (id) {
    case 'rules':
      return <RulesPage />;
    case 'faq':
      return <DocPage page={docs.faq} />;
    case 'products':
      return <ProductsPage viewer={viewer} />;
    case 'add-product':
      return <AddProductPage />;
    case 'links':
      return (
        <div className="px-4 py-6 tablet:px-6">
          <LinksManage />
        </div>
      );
    case 'followers':
      return <MembersPage viewer={viewer} />;
    case 'moderation':
      return <ModerationPage />;
    case 'posting':
      return <SettingsPage only="posting" />;
    case 'feed':
      return <FeedSourcePage />;
    case 'analytics':
      return <AnalyticsPage />;
    case 'integrations':
      return <SettingsPage only="integrations" />;
    case 'danger':
      return <SettingsPage only="danger" />;
    default:
      return <SettingsPage only="details" />;
  }
};

const addButton = (label: string, onClick?: () => void): ReactNode => (
  <Button
    variant={ButtonVariant.Subtle}
    size={ButtonSize.Small}
    icon={<PlusIcon />}
    onClick={onClick}
  >
    {label}
  </Button>
);

const PageHeader = ({
  title,
  onBack,
  backLabel,
  action,
  backOnLaptop = false,
}: {
  title: string;
  onBack: () => void;
  backLabel: string;
  action?: ReactNode;
  backOnLaptop?: boolean;
}): ReactElement => (
  <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary px-4 py-3">
    <span className={classNames('flex', !backOnLaptop && 'laptop:hidden')}>
      <Button
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<MoveToIcon className="rotate-180" />}
        aria-label={backLabel}
        title={backLabel}
        onClick={onBack}
      />
    </span>
    <h1 className="min-w-0 flex-1 truncate font-bold text-text-primary typo-body laptop:pl-2">
      {title}
    </h1>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

/**
 * The Manage area. `section` is where it opens; without one, a laptop
 * opens the first page it may show and a phone opens the menu.
 */
export const ManageView = ({
  viewer,
  initialSection,
  onExit,
}: {
  viewer: Viewer;
  initialSection?: ManageSection;
  onExit: () => void;
}): ReactElement => {
  const visible = useGroups(viewer).flatMap((group) => group.items);
  const fallback = visible[0]?.id ?? 'details';
  const [section, setSection] = useState<ManageSection | undefined>(
    initialSection,
  );
  const shown = section ?? fallback;
  const onBack = () =>
    section === 'add-product' ? setSection('products') : setSection(undefined);

  let action: ReactNode;
  if (shown === 'details' || shown === 'posting') {
    action = (
      <Button variant={ButtonVariant.Primary} size={ButtonSize.Small}>
        Save
      </Button>
    );
  } else if (shown === 'rules') {
    action = addButton('Add rule');
  } else if (shown === 'faq') {
    action = (
      <Button
        variant={ButtonVariant.Subtle}
        size={ButtonSize.Small}
        icon={<EditIcon />}
      >
        Edit
      </Button>
    );
  } else if (shown === 'products') {
    action = addButton('Add product', () => setSection('add-product'));
  } else if (shown === 'add-product') {
    action = <SaveProductButton onSave={() => setSection('products')} />;
  } else if (shown === 'links') {
    action = addButton('Add link');
  }

  return (
    <div className="mx-auto flex w-full gap-4 laptop:max-w-5xl laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
      <aside className="hidden w-64 shrink-0 flex-col gap-2 self-start rounded-16 border border-border-subtlest-tertiary p-2 laptop:flex">
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-2 rounded-10 px-2 py-1.5 text-text-tertiary typo-footnote transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <MoveToIcon size={IconSize.Size16} className="rotate-180" />
          Back to the page
        </button>
        <MenuHeader />
        <ManageMenu viewer={viewer} active={shown} onSection={setSection} />
      </aside>

      <main
        className={classNames(
          'min-w-0 flex-1 flex-col border-border-subtlest-tertiary laptop:flex laptop:rounded-16 laptop:border',
          section ? 'flex' : 'hidden',
        )}
      >
        <PageHeader
          title={manageTitles[shown]}
          onBack={onBack}
          backLabel={
            section === 'add-product' ? 'Back to Products' : 'Back to Manage'
          }
          backOnLaptop={section === 'add-product'}
          action={action}
        />
        <ColumnFitContext.Provider value>
          <Section id={shown} viewer={viewer} />
        </ColumnFitContext.Provider>
      </main>

      {!section && (
        <div className="flex min-w-0 flex-1 flex-col laptop:hidden">
          <PageHeader
            title={`Manage ${squad.name}`}
            onBack={onExit}
            backLabel={`Back to ${squad.name}`}
            backOnLaptop
          />
          <div className="px-2 py-3 tablet:px-4">
            <MenuHeader />
            <ManageMenu viewer={viewer} onSection={setSection} large />
          </div>
        </div>
      )}
    </div>
  );
};
