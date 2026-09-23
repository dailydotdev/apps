import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Viewer } from '../kit';
import { ContentSource } from '../workspace';
import type { UseCase } from './shared';
import { Case, Page } from './shared';

const meta: Meta = {
  title: 'Squad Page/5. Use cases/States',
  parameters: { layout: 'fullscreen' },
  excludeStories: ['cases'],
};

export default meta;

// The squad before it has anything, and the squad that keeps people out.

export const cases: UseCase[] = [
  {
    id: 'empty-admin',
    title: 'Just created, as an admin',
    who: 'Admin, feed not yet delivering',
    sees: 'The identity block, the badge, the rules, the team and the links are all there. The posts area says what to do next: connect the feed or write the first post.',
    viewer: Viewer.Admin,
    empty: true,
    height: 44,
  },
  {
    id: 'empty-visitor',
    title: 'Just created, as a visitor',
    who: 'Logged in, not a member',
    sees: 'The same page with an empty posts area asking them to join to hear when the team posts.',
    viewer: Viewer.Visitor,
    empty: true,
    height: 44,
  },
  {
    id: 'empty-releases',
    title: 'Releases before the first item',
    who: 'Member, feed connected',
    sees: 'The feed strip and an empty log: the first item lands the hour it is published.',
    viewer: Viewer.Member,
    page: 'releases',
    empty: true,
    source: ContentSource.Feed,
    height: 36,
  },
  {
    id: 'private-anonymous',
    title: 'Private squad, logged out',
    who: 'Anonymous',
    sees: 'Home reads (identity, badge, rules, team). Every other page is the members-only wall with Sign up to join.',
    viewer: Viewer.Anonymous,
    page: 'discussions',
    isPrivate: true,
    height: 36,
  },
  {
    id: 'private-visitor',
    title: 'Private squad, logged in',
    who: 'Logged in, not a member',
    sees: 'The same wall with Request to join, since a private squad approves its members.',
    viewer: Viewer.Visitor,
    page: 'releases',
    isPrivate: true,
    height: 36,
  },
  {
    id: 'private-member',
    title: 'Private squad, as a member',
    who: 'Member',
    sees: 'No wall. The squad behaves like any other.',
    viewer: Viewer.Member,
    page: 'discussions',
    isPrivate: true,
    height: 36,
  },
];

export const Overview: StoryObj = {
  render: () => (
    <Page
      eyebrow="Use cases · States"
      title="Empty and private"
      intro={
        <p>
          Two states the page has to survive. Empty is the first day, before the
          feed delivers or anyone writes. Private is the squad that only
          approved members read, which a company may want for a customer
          community or a beta.
        </p>
      }
    >
      <div className="flex flex-col gap-12">
        {cases.map((useCase) => (
          <Case key={useCase.id} useCase={useCase} />
        ))}
      </div>
    </Page>
  ),
};
