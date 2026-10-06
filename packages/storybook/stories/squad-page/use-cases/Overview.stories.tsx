import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import { Viewer } from '../kit';
import { ContentSource } from '../workspace';
import { Page, viewerLabel } from './shared';
import {
  contentCases,
  manageCases,
  postingCases,
  productionCases,
  stateCases,
  viewerCases,
} from './cases';
import { coverage } from './Production.stories';

const meta: Meta = {
  title: 'Squad Page/2. Use cases/Overview',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const Table = ({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}): ReactElement => (
  <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
    <table className="w-full min-w-[60rem] border-collapse text-left">
      <thead>
        <tr className="bg-surface-float">
          {head.map((cell) => (
            <th
              key={cell}
              className="px-4 py-3 font-bold text-text-secondary typo-caption1"
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            // eslint-disable-next-line react/no-array-index-key
            key={rowIndex}
            className="border-t border-border-subtlest-tertiary align-top"
          >
            {row.map((cell, cellIndex) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={cellIndex}
                className={classNames(
                  'px-4 py-3 typo-footnote',
                  cellIndex === 0
                    ? 'whitespace-nowrap font-bold text-text-primary'
                    : 'text-text-tertiary',
                )}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const yes = <span className="text-status-success">Yes</span>;
const no = <span className="text-text-quaternary">No</span>;
const viewers = [
  Viewer.Anonymous,
  Viewer.Visitor,
  Viewer.Member,
  Viewer.Moderator,
  Viewer.Admin,
  Viewer.Blocked,
];

const can = (predicate: (viewer: Viewer) => boolean): ReactNode[] =>
  viewers.map((viewer) => (predicate(viewer) ? yes : no));

const joined = (viewer: Viewer): boolean =>
  viewer === Viewer.Member ||
  viewer === Viewer.Moderator ||
  viewer === Viewer.Admin;
const staff = (viewer: Viewer): boolean =>
  viewer === Viewer.Moderator || viewer === Viewer.Admin;

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <h2 className="font-bold typo-title2">{title}</h2>
    {children}
  </section>
);

export const Overview: StoryObj = {
  render: () => (
    <Page
      eyebrow="Use cases · Overview"
      title="Every way the page is used"
      intro={
        <>
          <p>
            The verified Squad page is a Squad. Same roles, same channels, same
            moderation, same rules and pages. The package a customer buys is
            three things on top: the badge that marks the page as verified, the
            feed that posts their RSS into the Squad without anyone posting by
            hand, and the daily.dev manager who runs it for them. Everything
            below is the Squad&apos;s existing model, with those three added.
          </p>
          <p>
            Every case is drawn on the chosen direction (Squad Page, 1.
            Direction), at desktop width and on a 375px phone. Seven story files
            cover it: Viewers (who opens the page), Posting (who publishes
            where), Content source (fed or hand-written), States (empty,
            private), Manage (the settings area), Breakpoints (every device
            width), and Production parity (every state the production page has
            today, audited, with a coverage matrix). The matrices here are the
            index.
          </p>
        </>
      }
    >
      <Section title="Summary: today versus the new design">
        <p className="max-w-[76ch] text-text-tertiary typo-footnote">
          Every surface of the production Squad page, audited in Production
          parity, and what the direction adds. ✓ exists or is supported, ✕ does
          not, – stays outside the page and is unchanged.
        </p>
        <Table
          head={[
            'Area',
            'Surface',
            'In Squads today',
            'In the new design',
            'How',
          ]}
          rows={coverage.flatMap((group) =>
            group.rows.map((row) => [
              group.group,
              row.surface,
              row.production === 'None' ||
              row.production.startsWith('None ') ? (
                <span className="text-text-quaternary">✕</span>
              ) : (
                <span className="text-status-success">✓</span>
              ),
              {
                Covered: <span className="text-status-success">✓</span>,
                Added: <span className="text-status-success">✓ New</span>,
                Changed: <span className="text-status-success">✓ Changed</span>,
                Elsewhere: <span className="text-text-quaternary">–</span>,
                Dropped: <span className="text-status-error">✕ Dropped</span>,
                Neither: (
                  <span className="text-text-quaternary">
                    – Not in production, not in the design
                  </span>
                ),
              }[row.status],
              row.design,
            ]),
          )}
        />
      </Section>

      <Section title="Permissions">
        <Table
          head={['Can they…', ...viewers.map((viewer) => viewerLabel[viewer])]}
          rows={[
            ['Read a public Squad', ...can(() => true)],
            [
              'See Join Squad',
              ...can((viewer) => viewer === Viewer.Visitor).map((cell, index) =>
                index === 5 ? (
                  <span className="text-text-tertiary">Disabled</span>
                ) : (
                  cell
                ),
              ),
            ],
            ['Read a private Squad', ...can(joined)],
            ['Post in the Squad', ...can(joined)],
            ['Vote on polls', ...can(joined)],
            ['Ask a poll', ...can(staff)],
            ['Post a release (plain Squad)', ...can(staff)],
            ['Post (moderators only setting)', ...can(staff)],
            ['Post (below the reputation gate)', ...can(staff)],
            [
              'Post a release (fed page)',
              ...can(() => false).map((cell, index) =>
                index === 4 ? (
                  <span className="text-text-tertiary">
                    Feed does; admin can edit
                  </span>
                ) : (
                  cell
                ),
              ),
            ],
            ['Approve or reject posts', ...can(staff)],
            ['Edit documents', ...can(staff)],
            [
              'Edit the page and products',
              ...can((viewer) => viewer === Viewer.Admin),
            ],
            ['View as a visitor, share card', ...can(staff)],
            [
              'See the content feed',
              ...can((viewer) => viewer === Viewer.Admin),
            ],
            [
              'See analytics and settings',
              ...can((viewer) => viewer === Viewer.Admin),
            ],
            ['Invite (members may invite setting)', ...can(joined)],
            ['Invite (moderators only setting)', ...can(staff)],
            ['See the notifications bell', ...can(joined)],
            [
              'Leave',
              ...can((viewer) => joined(viewer) && viewer !== Viewer.Admin),
            ],
            [
              'Award the Squad',
              ...can(
                (viewer) =>
                  viewer !== Viewer.Anonymous && viewer !== Viewer.Admin,
              ),
            ],
            ['Boost', ...can((viewer) => viewer === Viewer.Admin)],
          ]}
        />
      </Section>

      <Section title="What changes per viewer">
        <Table
          head={['Viewer', 'Header', 'Right column', 'Manage']}
          rows={viewerCases.map((useCase) => [
            useCase.title,
            useCase.viewer === Viewer.Anonymous
              ? 'Share, search, more, Join Squad (opens sign up)'
              : useCase.viewer === Viewer.Visitor
              ? 'Share, search, more, Join Squad'
              : useCase.viewer === Viewer.Blocked
              ? 'Share, search, more, Join Squad disabled'
              : useCase.viewer === Viewer.Admin
              ? 'Edit page as a pen icon, bell, Share, search, more (with Manage), Boost last as the Primary button; on phones Boost sits beside Share page under the stats'
              : useCase.viewer === Viewer.Moderator
              ? 'Bell, Share, search, more (with Manage), Joined'
              : 'Bell, Share, search, more, Joined',
            useCase.viewer === Viewer.Admin
              ? 'View as a visitor, Verified, share card, Rules, Team, Stack & Tools, Analytics, Links'
              : useCase.viewer === Viewer.Moderator
              ? 'View as a visitor, Verified, share card, Rules, Team, Stack & Tools, Links'
              : 'Verified, Rules, Team, Stack & Tools, Links',
            useCase.viewer === Viewer.Admin
              ? 'The Manage area, every section (Edit page opens Details)'
              : useCase.viewer === Viewer.Moderator
              ? 'The Manage area: Rules, FAQ, Members, Moderation'
              : 'None',
          ])}
        />
      </Section>

      <Section title="Breakpoints">
        <Table
          head={[
            '',
            'Phone, under 656px',
            'Tablet, 656 to 1019px',
            'Laptop, 1020px and up',
          ]}
          rows={[
            [
              'App chrome',
              'Floating tab bar at the bottom',
              'The 64px labelled sidebar',
              'The classic sidebar, collapsed to icons',
            ],
            [
              'Layout',
              'One full-bleed column, 16px gutters',
              'One column',
              'The page card beside the 320px right column',
            ],
            [
              'Header',
              '80px logo; Join Squad full width under the stats, or Boost and Share page for admins',
              'Full header, Join Squad (or Boost for admins) last in the row',
              'Full header, Join Squad (or Boost for admins) last in the row',
            ],
            [
              'Right column',
              'The About tab',
              'The About tab',
              'Beside the page',
            ],
            [
              'Tabs above the feed',
              'Posts and About tabs',
              'Posts and About tabs',
              'None; the right column is beside the page',
            ],
            [
              'Team tools',
              'View as a visitor and the share card live in the right column, so not on phones; Share in the header',
              'As on phones',
              'Top of the right column',
            ],
          ]}
        />
      </Section>

      <Section title="Fed page vs plain Squad">
        <Table
          head={['', 'Verified Squad page (fed)', 'Plain Squad (hand-written)']}
          rows={[
            [
              'Releases',
              'Imported from the company’s RSS, hourly, by daily.dev',
              'Written by the team',
            ],
            [
              'Where it is explained',
              'The Content feed page in Manage',
              'Nothing to explain',
            ],
            [
              'Manage',
              'Content feed, Moderation, Analytics, Settings',
              'Moderation, Analytics, Settings',
            ],
            ['Badge', 'Verified Squad page', 'None'],
            [
              'Who runs it',
              'daily.dev, with the company keeping the keys',
              'The company',
            ],
            ['Everything else', 'Identical', 'Identical'],
          ]}
        />
      </Section>

      <Section title="Index of cases">
        <Table
          head={['File', 'Case', 'Viewer', 'Page', 'Source', 'State']}
          rows={[
            ...viewerCases.map((useCase) => [
              'Viewers',
              useCase.title,
              viewerLabel[useCase.viewer],
              'Home',
              'Fed',
              '',
            ]),
            ...postingCases.map((useCase) => [
              'Posting',
              useCase.title,
              viewerLabel[useCase.viewer],
              useCase.page ?? 'home',
              useCase.source === ContentSource.Manual ? 'Hand-written' : 'Fed',
              '',
            ]),
            ...contentCases.map((useCase) => [
              'Content source',
              useCase.title,
              viewerLabel[useCase.viewer],
              useCase.page ?? 'home',
              useCase.source === ContentSource.Manual ? 'Hand-written' : 'Fed',
              '',
            ]),
            ...stateCases.map((useCase) => [
              'States',
              useCase.title,
              viewerLabel[useCase.viewer],
              useCase.page ?? 'home',
              useCase.source === ContentSource.Manual ? 'Hand-written' : 'Fed',
              useCase.isPrivate ? 'Private' : useCase.empty ? 'Empty' : '',
            ]),
            ...manageCases.map((useCase) => [
              'Manage',
              useCase.title,
              viewerLabel[useCase.viewer],
              useCase.page ?? 'manage',
              'Fed',
              '',
            ]),
            ...productionCases.map((useCase) => [
              'Production parity',
              useCase.title,
              viewerLabel[useCase.viewer],
              useCase.page ?? 'home',
              'Fed',
              useCase.isPrivate
                ? 'Private'
                : useCase.empty
                ? 'Empty'
                : useCase.config
                ? Object.keys(useCase.config).join(', ')
                : '',
            ]),
          ]}
        />
      </Section>
    </Page>
  ),
};
