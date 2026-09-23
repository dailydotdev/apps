import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import ExtensionProviders from '../extension/_providers';
import { KitStyles, Viewer } from './kit';
import { WorkspaceStyles } from './workspace';
import { Layout, layouts, NoSidebarShell, pageIds } from './nosidebar';

const meta: Meta = {
  title: 'Squad Page/6. No sidebar',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

/* ------------------------------------------------------------ furniture */

const Page = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="min-h-screen bg-background-default px-8 pb-24 pt-10 text-text-primary">
    <KitStyles />
    <WorkspaceStyles />
    <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-14">
      {children}
    </div>
  </div>
);

const Eyebrow = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
    {children}
  </span>
);

const Prose = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex max-w-[76ch] flex-col gap-3 text-text-secondary typo-body">
    {children}
  </div>
);

const Section = ({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-bold typo-title1">{title}</h2>
    </div>
    {children}
  </section>
);

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

/* -------------------------------------------------------------- content */

const seats: Record<string, string[]> = {
  'Home / posts': [
    'Posts tab',
    'Posts tab',
    'The feed, All chip',
    'Latest posts shelf, See all',
    'The center',
    'The center',
  ],
  Releases: [
    'Tab, count 14',
    'Tab',
    'Chip on the feed',
    'Shelf, See all',
    'Pages card',
    'Highlight',
  ],
  Products: [
    'Tab',
    'Tab',
    'Widget, See all',
    'Shelf, See all',
    'Pages card',
    'Highlight',
  ],
  Discussions: [
    'Tab, count 38',
    'Tab',
    'Chip on the feed',
    'Posts shelf',
    'Pages card',
    'Highlight',
  ],
  Polls: [
    'Tab, new dot',
    'Tab',
    'Chip on the feed',
    'Shelf, See all',
    'Pages card',
    'Highlight',
  ],
  'Rules, FAQ': [
    'About accordions, card on Posts',
    'Rules widget',
    'Rules widget',
    'Rules widget',
    'Rules widget',
    'Highlights',
  ],
  Links: [
    'Header row, About',
    'Links widget',
    'Links widget',
    'Links widget',
    'Links widget',
    'Highlights, marked external',
  ],
  Followers: [
    'More, count',
    'Follower count',
    'Follower count',
    'Follower count',
    'Pages card and count',
    'Follower count',
  ],
  Follow: [
    'Header, then the bar',
    'Header',
    'Header',
    'Header',
    'Header',
    'Header',
  ],
  Manage: [
    'Appended tab, second row',
    'Header menu',
    'Header menu',
    'Header menu',
    'Header menu',
    'Header menu',
  ],
  'Feed dominates Home': [
    'Yes',
    'Yes',
    'Yes',
    'No, one click away',
    'Yes',
    'Yes',
  ],
  'Pages a visitor can see at once': [
    '6, More',
    '5',
    '4 kinds',
    'All',
    '5',
    'All, plus links',
  ],
  'Room to grow': [
    'Unlimited via More',
    'To about 6 tabs',
    'To about 5 chips',
    'Unlimited shelves',
    'Unlimited rows',
    'Scrolls',
  ],
  Mobile: [
    'Row folds, About',
    'Tabs scroll',
    'Chips scroll',
    'Jump row scrolls',
    'Column drops below',
    'Native',
  ],
};

const LayoutBlock = ({
  spec,
  index,
  viewer,
  height,
}: {
  spec: (typeof layouts)[number];
  index: number;
  viewer: Viewer;
  height?: number;
}): ReactElement => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-3">
        <span className="sq-nums font-bold text-text-quaternary typo-title3">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="font-bold typo-title2">{spec.title}</h3>
        <span className="text-text-quaternary typo-footnote">
          after {spec.reference}
        </span>
      </div>
      <div className="grid max-w-[100ch] grid-cols-2 gap-6 text-text-tertiary typo-footnote">
        <p>
          <b className="text-text-secondary">Carries the pages. </b>
          {spec.carries}
        </p>
        <p>
          <b className="text-text-secondary">Costs. </b>
          {spec.tradeoff}
        </p>
      </div>
    </div>
    <NoSidebarShell layout={spec.id} viewer={viewer} height={height} />
  </div>
);

export const Overview: StoryObj = {
  render: () => (
    <Page>
      <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary pb-8">
        <Eyebrow>Squad page · No sidebar</Eyebrow>
        <h1 className="max-w-[24ch] font-bold typo-mega3">
          The same squad, without the pages column
        </h1>
        <Prose>
          <p>
            The workspace put the squad&apos;s pages in a column of their own.
            Take the column away and everything it carried has to find a seat in
            the page: the pages, the two documents, the links, Follow, and the
            manage entry for the team. Five ways to seat them, each after a
            product that never had a sidebar. Same header, same feed, same right
            column, same page bodies; only the navigation moves.
          </p>
          <p>
            In every variant Follow sits in the header with the name, Followers
            opens from the member count, Rules and FAQ keep the Rules widget,
            and the team&apos;s Manage section is a menu on the header. What
            differs is where Releases, Products, Discussions and Polls live.
          </p>
        </Prose>
      </header>

      <div className="flex flex-col gap-16">
        {layouts.map((spec, index) => (
          <LayoutBlock
            key={spec.id}
            spec={spec}
            index={index}
            viewer={Viewer.Member}
            height={index === 0 || index === 3 ? 60 : 48}
          />
        ))}
      </div>

      <Section eyebrow="Compare" title="Where each sidebar item lands">
        <Table
          head={['', ...layouts.map((spec) => spec.title)]}
          rows={Object.entries(seats).map(([item, cells]) => [item, ...cells])}
        />
      </Section>

      <Section eyebrow="Verdict" title="Which to pick">
        <Prose>
          <p>
            <b className="text-text-primary">Tabs</b> if the goal is a squad
            that reads like a profile and the page count stays small, which it
            does on the lean squad: five tabs, nothing hidden, the feed first.
            It is the X and Reddit answer and the one a visitor never has to
            learn.
          </p>
          <p>
            <b className="text-text-primary">Overview</b> if the goal is to show
            the company off in one scroll: releases, products and the poll all
            visible without a click, which is the strongest sell for a fed page
            whose content arrives on its own. It trades the feed dominating Home
            for a page that always looks full.
          </p>
          <p>
            <b className="text-text-primary">Bookmarks</b> is the quiet one: the
            center is only posts, and the Pages card in the column is a sidebar
            that stopped being a column. Chips and Highlights are the most
            modern to look at and the two that scale worst as pages are added:
            chips because a feed filter cannot hold a Products page, highlights
            because twelve glyphs in a row ask the visitor to read icons.
          </p>
          <p>
            My pick is Tabs, with the Overview shelves as the empty state a fed
            page grows out of rather than a second Home.
          </p>
        </Prose>
      </Section>
    </Page>
  ),
};

export const Playground: StoryObj<{
  layout: Layout;
  viewer: Viewer;
  page: string;
  width: number;
}> = {
  args: {
    layout: Layout.Composite,
    viewer: Viewer.Member,
    page: 'home',
    width: 1440,
  },
  argTypes: {
    layout: { control: 'select', options: Object.values(Layout) },
    viewer: { control: 'select', options: Object.values(Viewer) },
    page: {
      control: 'select',
      options: [
        'home',
        'posts',
        'about',
        ...pageIds.filter((id) => id !== 'home'),
      ],
    },
    width: { control: { type: 'range', min: 720, max: 1600, step: 20 } },
  },
  render: ({ layout, viewer, page, width }) => (
    <div className="flex min-h-screen items-start justify-center bg-background-subtle p-8">
      <KitStyles />
      <WorkspaceStyles />
      <NoSidebarShell
        key={`${layout}-${viewer}-${page}-${width}`}
        layout={layout}
        viewer={viewer}
        initialPage={page}
        height={52}
        width={width}
      />
    </div>
  ),
};
