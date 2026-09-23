import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Viewer } from '../kit';
import type { UseCase } from './shared';
import { Case, Page } from './shared';

const meta: Meta = {
  title: 'Squad Page/5. Use cases/Viewers',
  parameters: { layout: 'fullscreen' },
  excludeStories: ['cases'],
};

export default meta;

// Five people open the same Home. What each of them can do decides what
// they see: the primary button, the composer, the manage section, the
// preview switch.

export const cases: UseCase[] = [
  {
    id: 'anonymous',
    title: 'Anonymous',
    who: 'Logged out, from a link or a search result',
    sees: 'The page reads in full. The sidebar asks them to sign up to join, with log in underneath. No composer, no bell, polls are read-only.',
    viewer: Viewer.Anonymous,
  },
  {
    id: 'visitor',
    title: 'Logged in, not a member',
    who: 'A daily.dev user who has not joined',
    sees: 'Join squad is the one primary button. Everything is readable; posting and voting say Join to post.',
    viewer: Viewer.Visitor,
  },
  {
    id: 'member',
    title: 'Member',
    who: 'Joined',
    sees: 'Joined and the bell in the header, Alerts / Invite / Share in the sidebar, the composer on Home, Post to Discussions, a vote in Polls.',
    viewer: Viewer.Member,
  },
  {
    id: 'moderator',
    title: 'Moderator',
    who: 'A member the company trusts with the queue',
    sees: 'Everything a member has, plus Manage with only Moderation, Preview as Moderator, Edit page on documents. No feed, analytics or settings.',
    viewer: Viewer.Moderator,
  },
  {
    id: 'admin',
    title: 'Admin',
    who: 'The company, or the daily.dev manager acting for them',
    sees: 'Edit page on Home, the full Manage section including the Content feed, Add a page, drag and hide on every row, page settings in every bar.',
    viewer: Viewer.Admin,
  },
];

export const Overview: StoryObj = {
  render: () => (
    <Page
      eyebrow="Use cases · Viewers"
      title="Five people, one Home"
      intro={
        <p>
          The same page for everyone who can open it. What changes is only what
          they are allowed to do, and the page never shows a control it would
          refuse.
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
