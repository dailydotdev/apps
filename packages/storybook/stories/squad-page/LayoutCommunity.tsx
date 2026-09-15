import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Actions,
  CardGrid,
  CardList,
  Cover,
  Facepile,
  FeedToolbar,
  Frame,
  LinksList,
  Logo,
  MetaLine,
  Name,
  Panel,
  PinnedRow,
  StackRow,
  Stat,
  TeamRow,
  Viewer,
  defaultMeta,
  stats,
} from './kit';
import { feedEntries, jobs, pinnedEntry, squad, stack, team } from './data';

// Direction B: Community. Reddit and Discord.
// A short cover and identity row, then the feed on the left and a sticky
// "about" rail on the right. Everything a first-time visitor needs to trust
// the squad stays on screen while they scroll the posts.

export enum CommunityFeed {
  Grid = 'grid',
  List = 'list',
}

const Rail = (): ReactElement => (
  <aside className="sq-sticky flex flex-col gap-4 self-start">
    <Panel title="About">
      <p className="text-text-secondary typo-footnote">{squad.tagline}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border-subtlest-tertiary py-3">
        {stats.map((stat) => (
          <Stat key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </div>
      <dl className="flex flex-col gap-1.5 typo-footnote">
        {[
          ['Website', squad.company.website],
          ['Location', squad.company.location],
          ['Size', squad.company.size],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-text-tertiary">{label}</dt>
            <dd className="text-text-primary">{value}</dd>
          </div>
        ))}
      </dl>
      <LinksList items={squad.links} />
    </Panel>
    <Panel
      title="Team"
      action={
        <button type="button" className="text-text-link typo-footnote">
          All {team.length}
        </button>
      }
    >
      {team.slice(0, 4).map((member) => (
        <TeamRow key={member.id} member={member} compact />
      ))}
    </Panel>
    <Panel title="Stack & tools">
      <StackRow items={stack} />
    </Panel>
    <Panel
      title="Open roles"
      action={
        <span className="rounded-6 bg-surface-hover px-1.5 text-text-tertiary typo-caption1">
          {jobs.length}
        </span>
      }
    >
      {jobs.map((job) => (
        <div key={job.title} className="flex flex-col">
          <span className="font-bold text-text-primary typo-callout">
            {job.title}
          </span>
          <span className="text-text-tertiary typo-footnote">
            {job.location} · {job.type}
          </span>
        </div>
      ))}
      <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
        View all roles
      </Button>
    </Panel>
  </aside>
);

export const LayoutCommunity = ({
  viewer = Viewer.Visitor,
  feed = CommunityFeed.Grid,
}: {
  viewer?: Viewer;
  feed?: CommunityFeed;
}): ReactElement => (
  <Frame>
    <Cover height={11} />
    <div className="relative mx-auto -mt-10 w-full max-w-[64rem] px-6">
      <div className="flex items-end gap-5">
        <Logo size={6} />
        <div className="flex min-w-0 flex-1 flex-col gap-1 pb-0.5">
          <Name size="title1" />
          <div className="flex items-center gap-3">
            <MetaLine items={defaultMeta} />
            <Facepile count={squad.membersCount} size={1.25} max={4} />
          </div>
        </div>
        <Actions viewer={viewer} size={ButtonSize.Medium} className="pb-0.5" />
      </div>
    </div>
    <div
      className="mx-auto grid w-full max-w-[64rem] gap-8 px-6 pb-8 pt-6"
      style={{ gridTemplateColumns: 'minmax(0, 1fr) 20rem' }}
    >
      <main className="flex min-w-0 flex-col gap-4">
        <FeedToolbar />
        <PinnedRow entry={pinnedEntry} />
        {feed === CommunityFeed.Grid ? (
          <CardGrid entries={feedEntries.slice(0, 4)} columns={2} />
        ) : (
          <CardList entries={feedEntries.slice(0, 5)} />
        )}
      </main>
      <Rail />
    </div>
  </Frame>
);
