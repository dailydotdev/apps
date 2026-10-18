import type { ReactElement } from 'react';
import React from 'react';
import { getSearchUrl, SearchProviderEnum } from '../../../graphql/search';
import { Segments, ShellRow } from '../../shell/ShellRow';
import { SquadDirectoryNavbar } from '../../squads/layout/SquadDirectoryNavbar';
import { SquadDirectoryNavbarItem } from '../../squads/layout/SquadDirectoryNavbarItem';
import { ButtonSize } from '../../buttons/Button';

const providerTabs = [
  { provider: SearchProviderEnum.Posts, label: 'Posts' },
  { provider: SearchProviderEnum.Sources, label: 'Squads' },
  { provider: SearchProviderEnum.Users, label: 'People' },
  { provider: SearchProviderEnum.Tags, label: 'Tags' },
];

interface SearchProviderTabsProps {
  query: string;
  provider: SearchProviderEnum;
}

export const SearchProviderSegments = ({
  query,
  provider,
}: SearchProviderTabsProps): ReactElement => (
  <ShellRow>
    <Segments
      items={providerTabs.map((tab) => ({
        key: tab.provider,
        label: tab.label,
        href: getSearchUrl({ query, provider: tab.provider }),
        active: tab.provider === provider,
        replace: true,
      }))}
    />
  </ShellRow>
);

export const SearchProviderNavbar = ({
  query,
  provider,
}: SearchProviderTabsProps): ReactElement => (
  <SquadDirectoryNavbar
    aria-label="Search results"
    className="!mx-0 min-w-0 flex-1 !border-0 !px-0"
  >
    {providerTabs.map((tab) => (
      <SquadDirectoryNavbarItem
        key={tab.provider}
        buttonSize={ButtonSize.Small}
        isActive={tab.provider === provider}
        label={tab.label}
        path={getSearchUrl({ query, provider: tab.provider })}
        ariaLabel={`Show ${tab.label}`}
      />
    ))}
  </SquadDirectoryNavbar>
);
