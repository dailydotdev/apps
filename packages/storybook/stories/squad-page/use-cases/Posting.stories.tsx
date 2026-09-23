import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Viewer } from '../kit';
import { ContentSource } from '../workspace';
import type { UseCase } from './shared';
import { Case, Page } from './shared';

const meta: Meta = {
  title: 'Squad Page/5. Use cases/Posting',
  parameters: { layout: 'fullscreen' },
  excludeStories: ['cases'],
};

export default meta;

// Who can publish where. Discussions is open to members; Releases is fed by
// the company's RSS on a verified page and written by the team on a plain
// squad; Polls are asked by the team and answered by members; what members
// post can wait for a moderator.

export const cases: UseCase[] = [
  {
    id: 'discussions-anonymous',
    title: 'Discussions, logged out',
    who: 'Anonymous',
    sees: 'The strip says Sign up to post. The feed reads in full.',
    viewer: Viewer.Anonymous,
    page: 'discussions',
    height: 36,
  },
  {
    id: 'discussions-visitor',
    title: 'Discussions, not a member',
    who: 'Logged in, not joined',
    sees: 'The strip says Join to post. Same feed.',
    viewer: Viewer.Visitor,
    page: 'discussions',
    height: 36,
  },
  {
    id: 'discussions-member',
    title: 'Discussions, as a member',
    who: 'Member',
    sees: 'Post to Discussions in the strip. The post goes to the queue if the squad requires approval.',
    viewer: Viewer.Member,
    page: 'discussions',
    height: 36,
  },
  {
    id: 'releases-fed',
    title: 'Releases on a verified page',
    who: 'Admin, feed connected',
    sees: 'No New release button: the feed publishes. Feed settings in its place, and the strip says where the posts come from.',
    viewer: Viewer.Admin,
    page: 'releases',
    source: ContentSource.Feed,
    height: 44,
  },
  {
    id: 'releases-manual',
    title: 'Releases on a hand-written squad',
    who: 'Admin, no feed',
    sees: 'New release, and no strip. The same page with the company writing instead of syncing.',
    viewer: Viewer.Admin,
    page: 'releases',
    source: ContentSource.Manual,
    height: 44,
  },
  {
    id: 'polls-member',
    title: 'Polls, as a member',
    who: 'Member',
    sees: 'One vote each on the production poll card. The team asks; New poll is theirs, not the member’s.',
    viewer: Viewer.Member,
    page: 'polls',
    height: 40,
  },
  {
    id: 'polls-moderator',
    title: 'Polls, as a moderator',
    who: 'Moderator',
    sees: 'New poll appears. Moderators can ask.',
    viewer: Viewer.Moderator,
    page: 'polls',
    height: 40,
  },
  {
    id: 'moderation',
    title: 'The queue',
    who: 'Moderator',
    sees: 'Member posts waiting for approval, with Approve and Reject. Moderation is the only Manage page a moderator sees.',
    viewer: Viewer.Moderator,
    page: 'moderation',
    height: 40,
  },
];

export const Overview: StoryObj = {
  render: () => (
    <Page
      eyebrow="Use cases · Posting"
      title="Who publishes where"
      intro={
        <>
          <p>
            A verified company page is a squad whose Releases are fed by the
            company&apos;s RSS. Members still write in Discussions, vote in
            Polls, and wait for a moderator when the squad asks for review. The
            rules are the squad&apos;s existing rules; only the source of the
            team&apos;s posts changes.
          </p>
        </>
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
