import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Case, Page } from './shared';
import { viewerCases } from './cases';

const meta: Meta = {
  title: 'Squad Page/2. Use cases/Viewers',
  parameters: { layout: 'fullscreen' },
};

export default meta;

// Six people open the same Home. What each of them can do decides what
// they see: the primary button, the composer, the manage section, the
// preview switch.

export const Overview: StoryObj = {
  render: () => (
    <Page
      eyebrow="Use cases · Viewers"
      title="Six people, one Home"
      intro={
        <p>
          The same page for everyone who can open it. What changes is only what
          they are allowed to do, and the page never shows a control it would
          refuse.
        </p>
      }
    >
      <div className="flex flex-col gap-12">
        {viewerCases.map((useCase) => (
          <Case key={useCase.id} useCase={useCase} />
        ))}
      </div>
    </Page>
  ),
};
