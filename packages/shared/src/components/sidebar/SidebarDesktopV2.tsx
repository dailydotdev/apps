import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { SidebarScrollWrapper } from './common';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  BookmarkIcon,
  HashtagIcon,
  HomeIcon,
  SquadIcon,
} from '../icons';
import { MainSection } from './sections/MainSection';
import { CustomFeedSection } from './sections/CustomFeedSection';
import { NetworkSection } from './sections/NetworkSection';
import { BookmarkSection } from './sections/BookmarkSection';
import { DiscoverSection } from './sections/DiscoverSection';
import { isExtension } from '../../lib/func';

type RailCategoryId = 'home' | 'feeds' | 'squads' | 'saved' | 'discover';

interface RailCategory {
  id: RailCategoryId;
  label: string;
  icon: (active: boolean) => ReactElement;
  render: (props: SectionRenderProps) => ReactElement;
}

interface SectionRenderProps {
  activePage: string;
  isItemsButton: boolean;
  onNavTabClick?: (tab: string) => void;
}

const categories: RailCategory[] = [
  {
    id: 'home',
    label: 'Home',
    icon: (active) => <HomeIcon secondary={active} />,
    render: ({ activePage, isItemsButton, onNavTabClick }) => (
      <MainSection
        activePage={activePage}
        sidebarExpanded
        shouldShowLabel
        isItemsButton={isItemsButton}
        onNavTabClick={onNavTabClick}
      />
    ),
  },
  {
    id: 'feeds',
    label: 'Feeds',
    icon: (active) => <HashtagIcon secondary={active} />,
    render: ({ activePage, onNavTabClick }) => (
      <CustomFeedSection
        activePage={activePage}
        sidebarExpanded
        shouldShowLabel
        title="Feeds"
        isItemsButton={false}
        onNavTabClick={onNavTabClick}
      />
    ),
  },
  {
    id: 'squads',
    label: 'Squads',
    icon: (active) => <SquadIcon secondary={active} />,
    render: ({ activePage, isItemsButton }) => (
      <NetworkSection
        activePage={activePage}
        sidebarExpanded
        shouldShowLabel
        title="Squads"
        isItemsButton={isItemsButton}
      />
    ),
  },
  {
    id: 'saved',
    label: 'Saved',
    icon: (active) => <BookmarkIcon secondary={active} />,
    render: ({ activePage }) => (
      <BookmarkSection
        activePage={activePage}
        sidebarExpanded
        shouldShowLabel
        title="Saved"
        isItemsButton={false}
      />
    ),
  },
  {
    id: 'discover',
    label: 'Discover',
    icon: (active) => <HashtagIcon secondary={active} />,
    render: ({ activePage, isItemsButton }) => (
      <DiscoverSection
        activePage={activePage}
        sidebarExpanded
        shouldShowLabel
        title="Discover"
        isItemsButton={isItemsButton}
      />
    ),
  },
];

interface RailIconProps {
  category: RailCategory;
  active: boolean;
  onSelect: (id: RailCategoryId) => void;
}

const RailIcon = ({
  category,
  active,
  onSelect,
}: RailIconProps): ReactElement => (
  <Button
    type="button"
    variant={active ? ButtonVariant.Float : ButtonVariant.Tertiary}
    size={ButtonSize.Medium}
    aria-label={category.label}
    aria-pressed={active}
    onClick={() => onSelect(category.id)}
    icon={category.icon(active)}
  />
);

interface RailPanelProps {
  title: string;
  children: ReactNode;
}

const RailPanel = ({ title, children }: RailPanelProps): ReactElement => (
  <div className="flex w-60 flex-col border-l border-border-subtlest-tertiary">
    <header className="flex h-12 items-center px-4 typo-callout text-text-primary">
      {title}
    </header>
    <SidebarScrollWrapper className="!h-auto min-h-0 flex-1 px-2 pb-4">
      {children}
    </SidebarScrollWrapper>
  </div>
);

interface SidebarDesktopV2Props {
  activePage?: string;
  isNavButtons?: boolean;
  onNavTabClick?: (tab: string) => void;
}

export const SidebarDesktopV2 = ({
  activePage: activePageProp,
  isNavButtons,
  onNavTabClick,
}: SidebarDesktopV2Props): ReactElement => {
  const router = useRouter();
  const activePage =
    activePageProp ?? (isExtension ? undefined : router.asPath ?? router.pathname) ?? '';
  const [selectedId, setSelectedId] = useState<RailCategoryId>('home');
  const selected = categories.find((c) => c.id === selectedId) ?? categories[0];

  const handleSelect = (id: RailCategoryId) => {
    setSelectedId(id);
  };

  return (
    <aside
      data-testid="sidebar-desktop-v2"
      className={classNames(
        'fixed left-0 top-0 z-sidebar flex h-full',
        'border-r border-border-subtlest-tertiary bg-background-default',
      )}
    >
      <nav
        aria-label="Primary"
        className="flex w-16 flex-col items-center gap-1 py-3"
      >
        {categories.map((category) => (
          <RailIcon
            key={category.id}
            category={category}
            active={category.id === selectedId}
            onSelect={handleSelect}
          />
        ))}
      </nav>
      <RailPanel title={selected.label}>
        {selected.render({
          activePage,
          isItemsButton: isNavButtons ?? false,
          onNavTabClick,
        })}
      </RailPanel>
    </aside>
  );
};
