import type { ReactElement } from 'react';
import React from 'react';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Actions,
  CardGrid,
  Cover,
  FeedToolbar,
  Frame,
  LinksList,
  Logo,
  MetaLine,
  Name,
  Panel,
  PinnedRow,
  SectionTitle,
  StackRow,
  Stat,
  TabBar,
  TeamRow,
  Viewer,
  defaultMeta,
  stats,
} from './kit';
import {
  feedEntries,
  formatCount,
  jobs,
  pinnedEntry,
  squad,
  stack,
  team,
} from './data';

// Direction A: Channel. YouTube, Twitch and LinkedIn company pages.
// A full-bleed cover, one identity band, then tabs. The feed owns the whole
// width and everything that is not the feed lives one tab away.

export enum ChannelTab {
  Posts = 'Posts',
  About = 'About',
}

const tabs = [
  { label: 'Posts', count: squad.totalPosts },
  { label: 'About' },
  { label: 'Members', count: squad.membersCount },
  { label: 'Stack' },
  { label: 'Jobs', count: jobs.length },
];

const AboutTab = (): ReactElement => (
  <div
    className="grid gap-8"
    style={{ gridTemplateColumns: 'minmax(0, 1fr) 20rem' }}
  >
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <SectionTitle title="About" />
        <p className="max-w-[64ch] text-text-secondary typo-body">
          {squad.description}. {squad.tagline}
        </p>
        <div className="mt-2 grid grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-12 border border-border-subtlest-tertiary p-4"
            >
              <Stat value={stat.value} label={stat.label} />
            </div>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <SectionTitle title="Team" count={team.length} />
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {team.map((member) => (
            <TeamRow key={member.id} member={member} />
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <SectionTitle title="Stack & tools" />
        <StackRow items={stack} />
      </section>
    </div>
    <div className="flex flex-col gap-4">
      <Panel title="Company">
        <dl className="flex flex-col gap-2 typo-footnote">
          {[
            ['Website', squad.company.website],
            ['Location', squad.company.location],
            ['Size', squad.company.size],
            ['Category', squad.category],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-text-tertiary">{label}</dt>
              <dd className="text-text-primary">{value}</dd>
            </div>
          ))}
        </dl>
      </Panel>
      <Panel title="Links">
        <LinksList items={squad.links} />
      </Panel>
      <Panel title="Open roles">
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
      </Panel>
    </div>
  </div>
);

export const LayoutChannel = ({
  viewer = Viewer.Visitor,
  tab = ChannelTab.Posts,
}: {
  viewer?: Viewer;
  tab?: ChannelTab;
}): ReactElement => (
  <Frame>
    <Cover height={15} />
    <div className="relative mx-auto -mt-12 w-full max-w-[64rem] px-6">
      <div className="flex items-end gap-6">
        <Logo size={7.5} />
        <div className="flex min-w-0 flex-1 flex-col gap-1 pb-1">
          <Name size="title1" />
          <MetaLine
            items={[
              ...defaultMeta,
              `${formatCount(squad.membersCount)} members`,
              `${formatCount(squad.totalPosts)} posts`,
            ]}
          />
        </div>
        <Actions viewer={viewer} size={ButtonSize.Medium} className="pb-1" />
      </div>
      <p className="mt-4 max-w-[64ch] text-text-secondary typo-callout">
        {squad.tagline}{' '}
        <button type="button" className="text-text-link">
          More
        </button>
      </p>
      <TabBar tabs={tabs} active={tab} className="mt-5" />
    </div>
    <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-5 px-6 py-6">
      {tab === ChannelTab.Posts ? (
        <>
          <FeedToolbar />
          <PinnedRow entry={pinnedEntry} />
          <CardGrid entries={feedEntries.slice(0, 6)} columns={3} />
        </>
      ) : (
        <AboutTab />
      )}
    </div>
  </Frame>
);
