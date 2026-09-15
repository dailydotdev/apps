import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { CardGrid, Frame, Viewer } from './kit';
import {
  AddTile,
  Ambient,
  CustomizeBar,
  IdentityRow,
  Kit2Styles,
  LeaderboardBody,
  LinksBody,
  PinnedBody,
  PulseBody,
  RolesBody,
  SortChips,
  StackBody,
  TeamBody,
  Tile,
  tileIcons,
} from './kit2';
import { feedEntries, jobs } from './data';

// V4 Shelf. The modules sit in one horizontal shelf between the identity and
// the feed, like an App Store row. Four are in view, the fifth peeks to say
// there is more, and the owner decides the order. The feed keeps its full
// three-card width because nothing sits beside it.

const shelfTile = 'w-[14.5rem] shrink-0 h-[10.5rem]';

export const V4Shelf = ({
  viewer = Viewer.Visitor,
}: {
  viewer?: Viewer;
}): ReactElement => {
  const admin = viewer === Viewer.Admin;

  return (
    <Frame>
      <Kit2Styles />
      <Ambient />
      <div className="relative">
        <div className="relative mx-auto flex w-full max-w-[64rem] flex-col gap-6 px-6 pt-8">
          <IdentityRow viewer={viewer} />
          {admin && <CustomizeBar />}
          <div
            className={classNames(
              'sq2-shelf sq2-shelf-fade -mx-6 flex gap-3 overflow-x-auto px-6 pb-1',
            )}
          >
            <Tile
              icon={tileIcons.pinned}
              title="Pinned"
              admin={admin}
              className={shelfTile}
            >
              <PinnedBody />
            </Tile>
            <Tile
              icon={tileIcons.leaderboard}
              title="Top this week"
              admin={admin}
              className={shelfTile}
            >
              <LeaderboardBody highlight />
            </Tile>
            <Tile
              icon={tileIcons.team}
              title="Team"
              admin={admin}
              className={shelfTile}
            >
              <TeamBody rows={3} more={false} />
            </Tile>
            <Tile
              icon={tileIcons.stack}
              title="Stack"
              admin={admin}
              className={shelfTile}
            >
              <StackBody />
            </Tile>
            <Tile
              icon={tileIcons.roles}
              title="Open roles"
              meta={jobs.length}
              admin={admin}
              className={shelfTile}
            >
              <RolesBody />
            </Tile>
            <Tile
              icon={tileIcons.leaderboard}
              title="Activity"
              admin={admin}
              className={shelfTile}
            >
              <PulseBody />
            </Tile>
            <Tile
              icon={tileIcons.links}
              title="Links"
              admin={admin}
              className={shelfTile}
            >
              <LinksBody />
            </Tile>
            {admin && <AddTile className={shelfTile} />}
          </div>
        </div>
      </div>
      <div className="relative mx-auto flex w-full max-w-[64rem] flex-col gap-4 px-6 pb-10 pt-4">
        <SortChips className="-ml-3" />
        <CardGrid entries={feedEntries.slice(0, 6)} columns={3} />
      </div>
    </Frame>
  );
};
