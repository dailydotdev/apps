import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Case, Page } from './shared';
import { postingCases } from './cases';

const meta: Meta = {
  title: 'Squad Page/2. Use cases/Posting',
  parameters: { layout: 'fullscreen' },
};

export default meta;

// Who can publish what, in the one feed. Members post; releases come from
// the company's RSS on a verified page and from the team on a plain squad;
// polls are asked by the team and answered by members; what members post
// can wait for a moderator.

export const Overview: StoryObj = {
  render: () => (
    <Page
      eyebrow="Use cases · Posting"
      title="Who publishes where"
      intro={
        <>
          <p>
            A verified Squad page is a Squad whose releases are posted from the
            company&apos;s RSS. Members still post, vote on polls, and wait for
            a moderator when the Squad asks for review, all in the one feed. The
            rules are the Squad&apos;s existing rules; only the source of the
            team&apos;s posts changes.
          </p>
        </>
      }
    >
      <div className="flex flex-col gap-12">
        {postingCases.map((useCase) => (
          <Case key={useCase.id} useCase={useCase} />
        ))}
      </div>
    </Page>
  ),
};
