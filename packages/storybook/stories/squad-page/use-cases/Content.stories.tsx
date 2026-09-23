import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Viewer } from '../kit';
import { ContentSource } from '../workspace';
import type { UseCase } from './shared';
import { Case, Page } from './shared';

const meta: Meta = {
  title: 'Squad Page/5. Use cases/Content source',
  parameters: { layout: 'fullscreen' },
  excludeStories: ['cases'],
};

export default meta;

// The package. A verified company page is technically a squad; what the
// customer buys is the feed that fills it, the badge that marks it, and
// the daily.dev manager who runs it for them.

export const cases: UseCase[] = [
  {
    id: 'feed-admin',
    title: 'The content feed, as an admin',
    who: 'The company, or its daily.dev manager',
    sees: 'Managed by daily.dev up top with a contact. The source, its health, where it publishes, how often it is checked, what it has imported. Sync, pause, add a feed. Recent imports with their state.',
    viewer: Viewer.Admin,
    page: 'feed',
    source: ContentSource.Feed,
    height: 52,
  },
  {
    id: 'feed-member',
    title: 'Releases, as a member of a fed page',
    who: 'Member',
    sees: 'A one-line strip says the posts are published from the company’s feed and when it last synced. Otherwise a normal Releases log.',
    viewer: Viewer.Member,
    page: 'releases',
    source: ContentSource.Feed,
    height: 44,
  },
  {
    id: 'manual-moderator',
    title: 'Releases on a plain squad, as a moderator',
    who: 'Moderator, no feed',
    sees: 'New release. The sidebar has no Content feed page because there is no feed.',
    viewer: Viewer.Moderator,
    page: 'releases',
    source: ContentSource.Manual,
    height: 44,
  },
  {
    id: 'manual-admin-sidebar',
    title: 'A plain squad’s Manage section',
    who: 'Admin, no feed',
    sees: 'Moderation, Analytics, Settings. Content feed only appears once a feed is connected.',
    viewer: Viewer.Admin,
    page: 'home',
    source: ContentSource.Manual,
    height: 44,
  },
];

export const Overview: StoryObj = {
  render: () => (
    <Page
      eyebrow="Use cases · Content source"
      title="A squad, fed"
      intro={
        <>
          <p>
            Every verified company page is a squad underneath: the same members,
            roles, channels, moderation, rules and pages. The difference is how
            the team&apos;s posts arrive. On a plain squad someone writes them.
            On a verified page the company&apos;s RSS (changelog, blog,
            releases) is imported into Releases as posts, on a schedule, by
            daily.dev, and the company keeps the keys to edit, pause or add.
          </p>
          <p>
            The Content feed page is the admin&apos;s window into that
            arrangement. It exists only when a feed is connected; a plain squad
            never sees it.
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
