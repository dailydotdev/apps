import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import { Viewer } from '../kit';
import { ContentSource } from '../workspace';
import { Page, viewerLabel } from './shared';
import { cases as viewerCases } from './Viewers.stories';
import { cases as postingCases } from './Posting.stories';
import { cases as contentCases } from './Content.stories';
import { cases as stateCases } from './States.stories';
import { cases as productionCases } from './Production.stories';

const meta: Meta = {
  title: 'Squad Page/5. Use cases/Overview',
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
            The verified company page is a squad. Same roles, same channels,
            same moderation, same rules and pages. The package a customer buys
            is three things on top: the badge that marks the page as official,
            the feed that fills Releases from their RSS without anyone posting
            by hand, and the daily.dev manager who runs it for them. Everything
            below is the squad&apos;s existing model, with those three added.
          </p>
          <p>
            Five story files cover it: Viewers (who opens the page), Posting
            (who publishes where), Content source (fed or hand-written), States
            (empty, private), and Production parity (every state the production
            page has today, audited, with a coverage matrix). The matrices here
            are the index.
          </p>
        </>
      }
    >
      <Section title="Permissions">
        <Table
          head={['Can they…', ...viewers.map((viewer) => viewerLabel[viewer])]}
          rows={[
            ['Read a public squad', ...can(() => true)],
            [
              'See Follow',
              ...can((viewer) => viewer === Viewer.Visitor).map((cell, index) =>
                index === 5 ? (
                  <span className="text-text-tertiary">Disabled</span>
                ) : (
                  cell
                ),
              ),
            ],
            ['Read a private squad', ...can(joined)],
            ['Post in Discussions', ...can(joined)],
            ['Vote in Polls', ...can(joined)],
            ['Ask a poll', ...can(staff)],
            ['Post a release (plain squad)', ...can(staff)],
            ['Post in Discussions (moderators only setting)', ...can(staff)],
            ['Post in Discussions (below the reputation gate)', ...can(staff)],
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
              'Edit the page, pages, sections',
              ...can((viewer) => viewer === Viewer.Admin),
            ],
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
              'Award the squad',
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
          head={['Viewer', 'Sidebar header', 'Home header', 'Extra pages']}
          rows={viewerCases.map((useCase) => [
            useCase.title,
            useCase.viewer === Viewer.Anonymous
              ? 'Sign up to follow, Log in'
              : useCase.viewer === Viewer.Visitor
              ? 'Follow'
              : useCase.viewer === Viewer.Admin
              ? 'Preview as Admin'
              : useCase.viewer === Viewer.Moderator
              ? 'Alerts / Invite / Share, Preview as Moderator'
              : useCase.viewer === Viewer.Blocked
              ? 'Follow disabled, You are not allowed to follow this Squad'
              : 'Alerts / Invite / Share',
            useCase.viewer === Viewer.Admin
              ? 'Edit page, Share, more'
              : joined(useCase.viewer)
              ? 'Following, bell, Share, more'
              : 'Share, more',
            useCase.viewer === Viewer.Admin
              ? 'Manage: Content feed, Moderation, Analytics, Settings; Add a page'
              : useCase.viewer === Viewer.Moderator
              ? 'Manage: Moderation'
              : 'None',
          ])}
        />
      </Section>

      <Section title="Fed page vs plain squad">
        <Table
          head={[
            '',
            'Verified company page (fed)',
            'Plain squad (hand-written)',
          ]}
          rows={[
            [
              'Releases',
              'Imported from the company’s RSS, hourly, by daily.dev',
              'Written by the team',
            ],
            [
              'Releases page bar',
              'Feed settings (admin); strip says where posts come from',
              'New release (staff)',
            ],
            [
              'Manage',
              'Content feed, Moderation, Analytics, Settings',
              'Moderation, Analytics, Settings',
            ],
            ['Badge', 'Official company page', 'None'],
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
