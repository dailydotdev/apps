import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Case, Page } from './shared';
import { postingCases } from './cases';

const meta: Meta = {
  title: 'Squad Page/2. Use cases/Posting',
  parameters: { layout: 'fullscreen' },
};

export default meta;

// Who can publish where. Discussions is open to members; Releases is fed by
// the company's RSS on a verified page and written by the team on a plain
// squad; Polls are asked by the team and answered by members; what members
// post can wait for a moderator.

export const Overview: StoryObj = {
  render: () => (
    <Page
      eyebrow="Use cases · Posting"
      title="Who publishes where"
      intro={
        <>
          <p>
            A verified company page is a squad whose Releases are fed by the
            company&apos;s RSS. Followers still write in Discussions, vote in
            Polls, and wait for a moderator when the squad asks for review. The
            rules are the squad&apos;s existing rules; only the source of the
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
