import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ExtensionProviders from '../extension/_providers';
import { KitStyles, Viewer } from './kit';
import { WorkspaceStyles } from './workspace';
import { directionPageIds, DirectionShell } from './direction';
import { PinStyle, pinStyles } from './pins';
import { allCases, caseById } from './use-cases/cases';

const meta: Meta = {
  title: 'Squad Page/1. Direction',
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

const Case = ({
  title,
  body,
  viewer,
  page,
}: {
  title: string;
  body: string;
  viewer: Viewer;
  page: string;
}): ReactElement => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-1">
      <span className="font-bold text-text-primary typo-callout">{title}</span>
      <span className="max-w-[90ch] text-text-tertiary typo-footnote">
        {body}
      </span>
    </div>
    <DirectionShell viewer={viewer} initialPage={page} height={46} />
  </div>
);

export const Overview: StoryObj = {
  render: () => (
    <Page>
      <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary pb-8">
        <Eyebrow>Squad page · Direction</Eyebrow>
        <h1 className="max-w-[24ch] font-bold typo-mega3">
          Chips on the feed, products on top, pages under a strip
        </h1>
        <div className="flex max-w-[76ch] flex-col gap-3 text-text-secondary typo-body">
          <p>
            The profile header and the profile&apos;s right column stay. Home is
            one feed with kind chips on its toolbar, All, Releases, Discussions,
            Polls, and the products as a shelf between the header and the feed
            with See all. Everything that is not the feed, Rules, FAQ,
            Followers, Products and the team&apos;s pages, replaces the whole
            centre card with the page under a compact strip: back, the logo, the
            name, the page&apos;s name. The right column keeps the visitor
            oriented while they are there.
          </p>
          <p>
            The Links widget is now a list, one row per link with the address as
            the text, the way GitHub lists an organization&apos;s links.
          </p>
        </div>
      </header>
      <div className="flex flex-col gap-12">
        <Case
          title="Home, as a follower"
          body="Header, the products shelf, the composer, then the feed with its chips. The shelf shows three products and clips the fourth so it reads as scrollable; See all opens the catalogue."
          viewer={Viewer.Member}
          page="home"
        />
        <Case
          title="Rules, from the widget"
          body="All rules in the right column replaces the centre with the Rules page under the strip. Back, or the name, returns to Home. Follow stays in reach at the right of the strip."
          viewer={Viewer.Visitor}
          page="rules"
        />
        <Case
          title="Followers, from the count"
          body="The same strip over the followers list with its tabs and search. The right column is unchanged."
          viewer={Viewer.Member}
          page="members"
        />
        <Case
          title="Moderation, as an admin"
          body="The options menu opens with Manage for the team; each page replaces the centre under the strip like any other page."
          viewer={Viewer.Admin}
          page="moderation"
        />
      </div>
    </Page>
  ),
};

export const Playground: StoryObj<{
  viewer: Viewer;
  page: string;
  pin: PinStyle;
  case: string;
}> = {
  parameters: { layout: 'fullscreen' },
  args: {
    viewer: Viewer.Member,
    page: 'home',
    pin: PinStyle.Reddit,
    case: 'none',
  },
  argTypes: {
    viewer: { control: 'select', options: Object.values(Viewer) },
    page: { control: 'select', options: directionPageIds },
    pin: { control: 'select', options: pinStyles },
    case: {
      control: 'select',
      options: ['none', ...allCases.map((useCase) => useCase.id)],
      description:
        'Open a use case by id (Squad Page, 2. Use cases); it overrides viewer and page.',
    },
  },
  render: ({ viewer, page, pin, case: caseId }) => {
    const useCase = caseById[caseId];

    return (
      <>
        <KitStyles />
        <WorkspaceStyles />
        {useCase ? (
          <DirectionShell
            key={useCase.id}
            viewer={useCase.viewer}
            initialPage={useCase.page ?? 'home'}
            source={useCase.source}
            empty={useCase.empty}
            isPrivate={useCase.isPrivate}
            config={useCase.config}
            pinStyle={pin}
            fluid
          />
        ) : (
          <DirectionShell
            key={`${viewer}-${page}-${pin}`}
            viewer={viewer}
            initialPage={page}
            pinStyle={pin}
            fluid
          />
        )}
      </>
    );
  },
};
