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
          The profile page, for a company
        </h1>
        <div className="flex max-w-[76ch] flex-col gap-3 text-text-secondary typo-body">
          <p>
            The profile&apos;s header and right column, for a squad. The header
            carries the cover, the round logo, the name with the verified badge,
            one meta line and the stats, with every action as a Subtle button
            and Follow last. Home is the products shelf, the composer, pinned
            posts and one feed filtered by chips: All, Releases, Discussions,
            Polls, and About on smaller screens.
          </p>
          <p>
            Rules, FAQ, Followers, Products and the other pages replace the
            centre card under a back button and the page title. Edit page opens
            the Manage area, laid out like profile settings: a grouped menu on
            laptop, a list and then one page at a time on phones.
          </p>
          <p>
            The right column holds the Verified company page card, View as a
            visitor and the share card for the team, Rules, Team, Stack &amp;
            Tools, Analytics for admins, and Links. Below 1020px it moves behind
            the About chip.
          </p>
        </div>
      </header>
      <div className="flex flex-col gap-12">
        <Case
          title="Home, as a follower"
          body="Header, the products shelf, the composer, pinned posts, then the feed with its chips. The shelf clips the last product so it reads as scrollable; See all opens Products."
          viewer={Viewer.Member}
          page="home"
        />
        <Case
          title="Home, as an admin"
          body="Edit page, Boost, the bell, Share and the options menu with Manage. The right column opens with View as a visitor and the share card, and adds Analytics."
          viewer={Viewer.Admin}
          page="home"
        />
        <Case
          title="Rules, from the widget"
          body="All rules replaces the centre with the Rules page under a back button and the title. The right column stays."
          viewer={Viewer.Visitor}
          page="rules"
        />
        <Case
          title="Followers, from the count"
          body="The followers list with its tabs and search, under the same back button and title."
          viewer={Viewer.Member}
          page="members"
        />
        <Case
          title="Manage, from Edit page"
          body="The settings area: the grouped menu beside the page, Details first. Moderation, Content feed, Analytics and Settings in the options menu open their section here."
          viewer={Viewer.Admin}
          page="manage-details"
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
