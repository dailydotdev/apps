import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ExtensionProviders from '../extension/_providers';
import { KitStyles, Viewer } from './kit';
import { WorkspaceStyles } from './workspace';
import { Nav, navPageIds, NavShell, specs } from './navigation';

const meta: Meta = {
  title: 'Squad Page/8. Navigation',
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

const Block = ({
  spec,
  index,
  viewer,
}: {
  spec: (typeof specs)[number];
  index: number;
  viewer: Viewer;
}): ReactElement => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-3">
        <span className="sq-nums font-bold text-text-quaternary typo-title3">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="font-bold typo-title2">{spec.title}</h3>
        <span className="text-text-quaternary typo-footnote">
          after {spec.after}
        </span>
      </div>
      <div className="grid max-w-[100ch] grid-cols-2 gap-6 text-text-tertiary typo-footnote">
        <p>
          <b className="text-text-secondary">The idea. </b>
          {spec.idea}
        </p>
        <p>
          <b className="text-text-secondary">Costs. </b>
          {spec.costs}
        </p>
      </div>
    </div>
    <NavShell nav={spec.id} viewer={viewer} height={46} />
  </div>
);

export const Overview: StoryObj = {
  render: () => (
    <Page>
      <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary pb-8">
        <Eyebrow>Squad page · Navigation</Eyebrow>
        <h1 className="max-w-[24ch] font-bold typo-mega3">
          Ten ways to carry the pages, one idea each
        </h1>
        <div className="flex max-w-[76ch] flex-col gap-3 text-text-secondary typo-body">
          <p>
            The same lean header on every one: cover, logo, name, one line of
            tagline, one line of meta, Follow and three icons. What changes is
            only how a visitor gets from the feed to Releases, Products,
            Discussions, Polls and About, and what else is on screen while they
            decide. Followers opens from the count. The team&apos;s Manage
            section is the gear, except where a variant has a better seat for
            it.
          </p>
          <p>
            Every shell is live: click through the pages, and use the Playground
            to switch viewer and width.
          </p>
        </div>
      </header>
      <div className="flex flex-col gap-16">
        {specs.map((spec, index) => (
          <Block
            key={spec.id}
            spec={spec}
            index={index}
            viewer={Viewer.Member}
          />
        ))}
      </div>
    </Page>
  ),
};

export const Playground: StoryObj<{
  nav: Nav;
  viewer: Viewer;
  page: string;
  width: number;
}> = {
  args: {
    nav: Nav.Profile,
    viewer: Viewer.Member,
    page: 'home',
    width: 1440,
  },
  argTypes: {
    nav: { control: 'select', options: Object.values(Nav) },
    viewer: { control: 'select', options: Object.values(Viewer) },
    page: { control: 'select', options: navPageIds },
    width: { control: { type: 'range', min: 720, max: 1600, step: 20 } },
  },
  render: ({ nav, viewer, page, width }) => (
    <div className="flex min-h-screen items-start justify-center bg-background-subtle p-8">
      <KitStyles />
      <WorkspaceStyles />
      <NavShell
        key={`${nav}-${viewer}-${page}-${width}`}
        nav={nav}
        viewer={viewer}
        initialPage={page}
        height={52}
        width={width}
      />
    </div>
  ),
};
