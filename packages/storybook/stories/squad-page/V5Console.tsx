import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  BellIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  CardGrid,
  Facepile,
  Frame,
  Logo,
  PinnedRow,
  Stat,
  VerifiedMark,
  Viewer,
} from './kit';
import {
  AddTile,
  Ambient,
  CustomizeBar,
  Kit2Styles,
  LeaderboardBody,
  LinksBody,
  PulseBody,
  SortChips,
  StatBig,
  TeamFaces,
  Tile,
} from './kit2';
import { feedEntries, pinnedEntry, squad } from './data';

// V5 Console. WHOOP's team screen as a left panel: the squad's identity and
// its numbers in one column, oversized where it matters (members), with the
// leaderboard and the pulse as the reasons to come back. The feed takes the
// rest. This is the data-first reading of "community".

const ConsoleActions = ({ viewer }: { viewer: Viewer }): ReactElement => (
  <div className="flex items-center gap-2">
    {viewer === Viewer.Visitor ? (
      <Button
        variant={ButtonVariant.Primary}
        color={ButtonColor.Cabbage}
        size={ButtonSize.Medium}
        className="flex-1"
      >
        Join squad
      </Button>
    ) : (
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        icon={<PlusIcon />}
        className="flex-1"
      >
        New post
      </Button>
    )}
    {viewer !== Viewer.Visitor && (
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Medium}
        icon={<BellIcon />}
        aria-label="Notifications"
      />
    )}
    <Button
      variant={ButtonVariant.Float}
      size={ButtonSize.Medium}
      icon={<MenuIcon />}
      aria-label="More"
    />
  </div>
);

export const V5Console = ({
  viewer = Viewer.Visitor,
}: {
  viewer?: Viewer;
}): ReactElement => {
  const admin = viewer === Viewer.Admin;

  return (
    <Frame>
      <Kit2Styles />
      <div
        className="mx-auto grid w-full max-w-[66rem] gap-10 px-6 py-8"
        style={{ gridTemplateColumns: '18rem minmax(0, 1fr)' }}
      >
        <aside className="sq-sticky relative flex flex-col gap-5 self-start overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5">
          <Ambient intensity={0.4} />
          <div className="relative flex flex-col gap-4">
            <Logo size={4.5} ring={false} className="sq-elevated" />
            <div className="flex flex-col gap-1">
              <h1 className="font-bold text-text-primary typo-title2">
                {squad.name}
                <VerifiedMark label={false} className="ml-2 align-middle" />
              </h1>
              <span className="text-text-tertiary typo-footnote">
                @{squad.handle} ·{' '}
                <span className="text-text-link">{squad.category}</span>
              </span>
              <p className="pt-1 text-text-secondary typo-footnote">
                {squad.tagline}
              </p>
            </div>
            <ConsoleActions viewer={viewer} />
          </div>
          <div className="relative flex flex-col gap-4 border-t border-border-subtlest-tertiary pt-5">
            <StatBig
              value={squad.membersCount}
              label="members"
              size="lg"
              extra={<Facepile size={1.25} max={6} className="mt-1" />}
            />
            <div className="grid grid-cols-2 gap-3">
              <Stat value={squad.totalPosts} label="Posts" />
              <Stat value={squad.totalUpvotes} label="Upvotes" />
            </div>
          </div>
          <div className="relative flex flex-col">
            {admin && <CustomizeBar className="pb-3" />}
            <Tile flat title="This month" admin={admin}>
              <PulseBody />
            </Tile>
            <Tile flat title="Top this week" admin={admin}>
              <LeaderboardBody rows={5} highlight />
            </Tile>
            <Tile flat title="Team" admin={admin}>
              <TeamFaces />
            </Tile>
            <Tile flat title="Links" admin={admin}>
              <LinksBody />
            </Tile>
            {admin && <AddTile className="mt-4" />}
          </div>
        </aside>
        <main className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center justify-between">
            <SortChips className="-ml-3" />
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              icon={<SearchIcon />}
              aria-label="Search this squad"
            />
          </div>
          <PinnedRow entry={pinnedEntry} />
          <CardGrid entries={feedEntries.slice(0, 4)} columns={2} />
        </main>
      </div>
    </Frame>
  );
};
