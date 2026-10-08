import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { ContentPreferenceType } from '@dailydotdev/shared/src/graphql/contentPreference';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusIcon, SourceIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import {
  SourceMemberRole,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import HorizontalScroll from '@dailydotdev/shared/src/components/HorizontalScroll/HorizontalScroll';
import { HorizontalScrollTitle } from '@dailydotdev/shared/src/components/HorizontalScroll/HorizontalScrollHeader';
import { SquadGrid } from '@dailydotdev/shared/src/components/cards/squad/SquadGrid';
import { UnfeaturedSquadGrid } from '@dailydotdev/shared/src/components/cards/squad/UnfeaturedSquadGrid';
import { SquadList } from '@dailydotdev/shared/src/components/cards/squad/SquadList';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '@dailydotdev/shared/src/components/squads/layout/SquadDirectoryNavbar';
import { AppShell, PageHeaderStrip, PhoneBlock, ShellSquare } from '../shell';
import type { DiscoverSquad } from '../data';
import { categories, featuredSquads, squadsByCategory } from '../data';

// Today's page, assembled from the production components themselves
// (SquadGrid, UnfeaturedSquadGrid, SquadList, HorizontalScroll and the
// directory navbar) fed with the same real squads as every redesign.

const toProductionSquad = (item: DiscoverSquad): Squad => ({
  id: item.id,
  name: item.name,
  handle: item.handle,
  image: item.image,
  headerImage: item.headerImage ?? undefined,
  color: item.color ?? undefined,
  description: item.description,
  permalink: item.permalink,
  membersCount: item.membersCount,
  active: true,
  public: true,
  type: SourceType.Squad,
  memberPostingRole: SourceMemberRole.Member,
  memberInviteRole: SourceMemberRole.Member,
  moderationRequired: false,
  moderationPostCount: 0,
  flags: {
    featured: item.featured,
    totalPosts: item.totalPosts,
    totalViews: 0,
    totalUpvotes: 0,
    totalAwards: 0,
  },
  features: { verified: item.verified } as Squad['features'],
});

const tabs = [
  'Discover',
  'Featured',
  ...categories.map((category) => category.title),
];

/**
 * Production shows My Squads first for anyone with a squad, except in the
 * v2 laptop header, which drops it.
 */
const Navbar = ({
  size,
  withMySquads = false,
}: {
  size: ButtonSize;
  withMySquads?: boolean;
}): ReactElement => (
  <SquadDirectoryNavbar className="!mx-0 min-w-0 flex-1 !border-0 !px-0">
    {(withMySquads ? ['My Squads', ...tabs] : tabs).map((tab) => (
      <SquadDirectoryNavbarItem
        key={tab}
        buttonSize={size}
        isActive={tab === 'Discover'}
        label={tab}
      />
    ))}
  </SquadDirectoryNavbar>
);

const sections = [
  { id: 'featured', title: 'Featured', squads: featuredSquads },
  ...categories.map((category) => ({
    id: category.slug,
    title: category.title,
    squads: squadsByCategory(category.slug),
  })),
];

/**
 * Production renders a card's Join only after that card's own
 * content-preference query resolves, and every featured card fetches its
 * own members. Seed both from the fixtures (placeholder faces) so the baseline shows
 * the settled page instead of a row of missing buttons.
 */
const SeedProductionQueries = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  // Keyed on the user: auth settles after the first render and the
  // production query keys carry the user id.
  useMemo(() => {
    sections
      .flatMap((section) => section.squads)
      .forEach((item) => {
        queryClient.setQueryData(
          generateQueryKey(RequestKey.ContentPreference, user, {
            id: item.id,
            entity: ContentPreferenceType.Source,
          }),
          null,
        );
        queryClient.setQueryData(
          generateQueryKey(RequestKey.SquadMembers, user, item.id),
          item.members.map((image, index) => ({
            user: {
              id: `${item.id}-${index}`,
              image,
              username: `member${index}`,
              name: 'Member',
              permalink: '#',
            },
          })),
        );
      });
  }, [queryClient, user]);
  return <>{children}</>;
};

export const Current = (): ReactElement => (
  <SeedProductionQueries>
    <AppShell>
      {/* Laptop: the v2 page-header strip with the tabs and New Squad. */}
      <PageHeaderStrip className="hidden gap-4 !py-0 laptop:flex">
        <Navbar size={ButtonSize.Small} />
        <div className="shrink-0 py-2">
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            icon={<PlusIcon />}
          >
            New Squad
          </Button>
        </div>
      </PageHeaderStrip>
      {/* Phones: the shell block owns the title, New Squad and the tabs. */}
      <PhoneBlock
        title="Squads"
        active="Discover"
        onChange={() => undefined}
        chips={['My Squads', ...tabs].map((tab) => ({ id: tab, label: tab }))}
        actions={
          <ShellSquare label="New Squad">
            <PlusIcon size={IconSize.Small} />
          </ShellSquare>
        }
      />
      <div className="relative mb-4 flex flex-col px-4 pt-2 tablet:pt-4 laptop:px-6 laptop:pt-6">
        <div className="absolute inset-0 -z-1 hidden h-[25rem] w-full bg-gradient-to-t from-accent-cabbage-default to-background-default tablet:flex" />
        <header className="hidden w-full flex-col gap-2 tablet:flex laptop:hidden">
          <section className="flex w-full flex-row items-center justify-between typo-body">
            <strong>Squads</strong>
            <Button
              type="button"
              icon={<PlusIcon />}
              variant={ButtonVariant.Primary}
            >
              New Squad
            </Button>
          </section>
          <div className="-mx-4 border-b border-border-subtlest-tertiary px-4">
            <Navbar size={ButtonSize.XSmall} withMySquads />
          </div>
        </header>
        <section className="flex w-full flex-col gap-6 pt-2 tablet:pt-5 laptop:pt-0">
          {sections.map((section) => {
            const squads = section.squads.map(toProductionSquad);
            const isFeatured = section.id === 'featured';
            const title = {
              copy: section.title,
              icon: isFeatured ? (
                <SourceIcon secondary size={IconSize.Large} />
              ) : undefined,
            };
            return (
              <div key={section.id}>
                <div className="hidden tablet:block">
                  <HorizontalScroll
                    className={{ scroll: 'gap-6 laptop:-mx-6 laptop:px-6' }}
                    scrollProps={{ title, linkToSeeAll: '#' }}
                  >
                    {squads.map((item) =>
                      isFeatured ? (
                        <SquadGrid
                          key={item.id}
                          source={item}
                          className="w-80"
                        />
                      ) : (
                        <UnfeaturedSquadGrid
                          key={item.id}
                          source={item}
                          className="w-80"
                        />
                      ),
                    )}
                  </HorizontalScroll>
                </div>
                <div className="relative flex flex-col gap-3 pb-6 tablet:hidden">
                  <header className="mb-2 flex flex-row items-center justify-between">
                    <HorizontalScrollTitle {...title} />
                    <Button variant={ButtonVariant.Tertiary} tag="a">
                      See all
                    </Button>
                  </header>
                  {squads.slice(0, 5).map((item) => (
                    <SquadList key={item.id} squad={item} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </AppShell>
  </SeedProductionQueries>
);
