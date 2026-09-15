import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Actions,
  CardGrid,
  Cover,
  Facepile,
  FeaturedHero,
  Frame,
  LinksList,
  Logo,
  MetaLine,
  Name,
  Panel,
  SectionTitle,
  StackRow,
  TeamRow,
  Viewer,
  defaultMeta,
} from './kit';
import {
  feedEntries,
  formatCount,
  jobs,
  latestEntry,
  squad,
  stack,
  team,
} from './data';

// Direction D: Hub. A GitHub organisation page, or a Notion site.
// The squad gets its own section navigation on the left and an owner-curated
// Overview on the right, so a company page reads as a small site inside
// daily.dev rather than as a feed with a header.

const sections = [
  { label: 'Overview', active: true },
  { label: 'Posts', count: squad.totalPosts },
  { label: 'Announcements', count: 12 },
  { label: 'Discussions', count: 39 },
  { label: 'Members', count: squad.membersCount },
  { label: 'Stack & tools', count: stack.length },
  { label: 'Open roles', count: jobs.length },
  { label: 'About' },
];

const SectionNav = (): ReactElement => (
  <nav className="flex flex-col gap-0.5">
    {sections.map((section) => (
      <button
        type="button"
        key={section.label}
        className={classNames(
          'flex items-center justify-between rounded-10 px-3 py-2 text-left typo-callout',
          section.active
            ? 'bg-surface-float font-bold text-text-primary'
            : 'text-text-tertiary hover:bg-surface-float hover:text-text-primary',
        )}
      >
        {section.label}
        {typeof section.count === 'number' && (
          <span className="sq-nums text-text-quaternary typo-footnote">
            {formatCount(section.count)}
          </span>
        )}
      </button>
    ))}
  </nav>
);

export const LayoutHub = ({
  viewer = Viewer.Visitor,
}: {
  viewer?: Viewer;
}): ReactElement => (
  <Frame>
    <Cover height={11} />
    <div className="relative -mt-10 px-12">
      <div className="flex items-end gap-5">
        <Logo size={6} />
        <div className="flex min-w-0 flex-1 flex-col gap-1 pb-0.5">
          <Name size="title1" />
          <MetaLine
            items={[
              ...defaultMeta,
              `${formatCount(squad.membersCount)} members`,
            ]}
          />
        </div>
        <Actions viewer={viewer} size={ButtonSize.Medium} className="pb-0.5" />
      </div>
    </div>
    <div
      className="grid gap-10 px-12 pb-10 pt-8"
      style={{ gridTemplateColumns: '14rem minmax(0, 1fr)' }}
    >
      <aside className="sq-sticky flex flex-col gap-6 self-start">
        <SectionNav />
        <div className="flex flex-col gap-3 px-3">
          <span className="font-bold uppercase tracking-wide text-text-quaternary typo-caption2">
            Team
          </span>
          <Facepile members={team} max={6} size={1.5} />
          <span className="text-text-tertiary typo-footnote">
            {team.length} admins and moderators
          </span>
        </div>
        <div className="flex flex-col gap-3 px-3">
          <span className="font-bold uppercase tracking-wide text-text-quaternary typo-caption2">
            Links
          </span>
          <LinksList items={squad.links} />
        </div>
      </aside>
      <main className="flex min-w-0 flex-col gap-8">
        <section className="flex flex-col gap-3">
          <p className="max-w-[64ch] text-text-secondary typo-body">
            {squad.tagline}
          </p>
          <FeaturedHero
            entry={latestEntry}
            orientation="horizontal"
            eyebrow="Latest announcement"
          />
        </section>
        <section className="flex flex-col gap-4">
          <SectionTitle
            title="Recent posts"
            action={
              <button type="button" className="text-text-link typo-footnote">
                See all {squad.totalPosts}
              </button>
            }
          />
          <CardGrid entries={feedEntries.slice(1, 4)} columns={3} />
        </section>
        <div className="grid grid-cols-2 gap-6">
          <Panel
            title="Team"
            action={
              <button type="button" className="text-text-link typo-footnote">
                All {team.length}
              </button>
            }
          >
            {team.slice(0, 3).map((member) => (
              <TeamRow key={member.id} member={member} />
            ))}
          </Panel>
          <div className="flex flex-col gap-6">
            <Panel title="Stack & tools">
              <StackRow items={stack} />
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
      </main>
    </div>
  </Frame>
);
