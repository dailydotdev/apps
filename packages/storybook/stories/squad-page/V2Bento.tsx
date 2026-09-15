import type { ReactElement } from 'react';
import React from 'react';
import { CardGrid, Facepile, Frame, Logo, VerifiedMark, Viewer } from './kit';
import {
  CustomizeBar,
  Kit2Styles,
  PinnedBody,
  PrimaryActions,
  PulseBody,
  SortChips,
  StackBody,
  StatBig,
  TeamFaces,
  Tile,
  tileIcons,
} from './kit2';
import { feedEntries, formatSince, squad } from './data';

// V2 Bento. The tiles are the header. The identity is the largest tile, the
// cover lives inside it, and the owner arranges the rest around it. The feed
// gets the full width beneath because nothing sits beside it.

const areas = `
  "id id members pulse team"
  "id id pinned pinned stack"
`;

const IdentityTile = ({ viewer }: { viewer: Viewer }): ReactElement => (
  <section
    className="sq2-tile relative flex flex-col justify-end overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float p-5"
    style={{ gridArea: 'id' }}
  >
    <img
      src={squad.headerImage}
      alt=""
      className="absolute inset-0 h-full w-full object-cover opacity-70"
    />
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(to top, var(--theme-background-default) 18%, color-mix(in srgb, var(--theme-background-default), transparent 45%) 60%, transparent 100%)',
      }}
    />
    <div className="relative flex flex-col gap-3">
      <Logo size={3.5} ring={false} className="sq-elevated" />
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 font-bold text-text-primary typo-title2">
          {squad.name}
          <VerifiedMark label={false} />
        </h1>
        <p className="text-text-secondary typo-footnote">{squad.tagline}</p>
        <span className="text-text-quaternary typo-caption1">
          @{squad.handle} · {squad.category} · Since{' '}
          {formatSince(squad.createdAt)}
        </span>
      </div>
      <PrimaryActions viewer={viewer} size="sm" />
    </div>
  </section>
);

export const V2Bento = ({
  viewer = Viewer.Visitor,
}: {
  viewer?: Viewer;
}): ReactElement => {
  const admin = viewer === Viewer.Admin;

  return (
    <Frame>
      <Kit2Styles />
      <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-6 px-6 py-8">
        {admin && <CustomizeBar />}
        <div
          className="grid gap-3"
          style={{
            gridTemplateAreas: areas,
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            gridAutoRows: '9.5rem',
          }}
        >
          <IdentityTile viewer={viewer} />
          <Tile
            icon={tileIcons.team}
            title="Members"
            admin={admin}
            className="justify-between"
            bodyClassName="justify-end"
          >
            <StatBig
              value={squad.membersCount}
              label="developers"
              extra={<Facepile size={1.25} max={5} className="mt-1" />}
            />
          </Tile>
          <Tile
            icon={tileIcons.leaderboard}
            title="Activity"
            admin={admin}
            className="justify-between"
          >
            <PulseBody trend={false} />
          </Tile>
          <Tile icon={tileIcons.team} title="Team" admin={admin}>
            <TeamFaces />
          </Tile>
          <Tile
            icon={tileIcons.pinned}
            title="Pinned"
            admin={admin}
            className="justify-between"
            style={{ gridArea: 'pinned' }}
          >
            <PinnedBody />
          </Tile>
          <Tile icon={tileIcons.stack} title="Stack" admin={admin}>
            <StackBody max={3} />
          </Tile>
        </div>
        <div className="flex items-center justify-between pt-2">
          <SortChips />
          <span className="text-text-quaternary typo-footnote">
            {squad.totalPosts} posts
          </span>
        </div>
        <CardGrid entries={feedEntries.slice(0, 6)} columns={3} />
      </div>
    </Frame>
  );
};
