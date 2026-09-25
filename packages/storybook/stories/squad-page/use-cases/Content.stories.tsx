import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Case, Page } from './shared';
import { contentCases } from './cases';

const meta: Meta = {
  title: 'Squad Page/2. Use cases/Content source',
  parameters: { layout: 'fullscreen' },
};

export default meta;

// The package. A verified company page is technically a squad; what the
// customer buys is the feed that fills it, the badge that marks it, and
// the daily.dev manager who runs it for them.

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
        {contentCases.map((useCase) => (
          <Case key={useCase.id} useCase={useCase} />
        ))}
      </div>
    </Page>
  ),
};
