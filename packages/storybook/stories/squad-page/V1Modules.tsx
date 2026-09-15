import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons';
import { CardList, Frame, Viewer } from './kit';
import {
  AboutBody,
  AddTile,
  Ambient,
  Composer,
  CustomizeBar,
  IdentityRow,
  Kit2Styles,
  LeaderboardBody,
  LinksBody,
  PinnedBody,
  RolesBody,
  SortChips,
  StackBody,
  TeamFaces,
  Tile,
  tileIcons,
} from './kit2';
import { feedEntries, jobs } from './data';

// V1 Modules. The WHOOP reading, straight: a single-column feed and a column
// of uniform tiles the owner orders. No banner. The ambient glow is the brand.

export const V1Modules = ({
  viewer = Viewer.Visitor,
}: {
  viewer?: Viewer;
}): ReactElement => {
  const admin = viewer === Viewer.Admin;

  return (
    <Frame>
      <Kit2Styles />
      <Ambient />
      <div className="relative mx-auto w-full max-w-[64rem] px-6 pt-8">
        <IdentityRow viewer={viewer} />
      </div>
      <div
        className="relative mx-auto grid w-full max-w-[64rem] gap-8 px-6 pb-10 pt-6"
        style={{ gridTemplateColumns: 'minmax(0, 1fr) 19rem' }}
      >
        <main className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center justify-between">
            <SortChips />
            <Button
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              icon={<SearchIcon />}
              aria-label="Search this squad"
            />
          </div>
          {viewer !== Viewer.Visitor && <Composer />}
          <CardList entries={feedEntries.slice(0, 5)} />
        </main>
        <aside className="sq-sticky flex flex-col gap-3 self-start">
          {admin && <CustomizeBar className="px-1" />}
          <Tile icon={tileIcons.pinned} title="Pinned" admin={admin}>
            <PinnedBody />
          </Tile>
          <Tile icon={tileIcons.about} title="About" admin={admin}>
            <AboutBody />
          </Tile>
          <Tile
            icon={tileIcons.leaderboard}
            title="Top this week"
            admin={admin}
          >
            <LeaderboardBody highlight />
          </Tile>
          <Tile icon={tileIcons.team} title="Team" admin={admin}>
            <TeamFaces />
          </Tile>
          <Tile icon={tileIcons.stack} title="Stack" admin={admin}>
            <StackBody />
          </Tile>
          <Tile
            icon={tileIcons.roles}
            title="Open roles"
            meta={jobs.length}
            admin={admin}
          >
            <RolesBody />
          </Tile>
          <Tile icon={tileIcons.links} title="Links" admin={admin}>
            <LinksBody />
          </Tile>
          {admin && <AddTile />}
        </aside>
      </div>
    </Frame>
  );
};
