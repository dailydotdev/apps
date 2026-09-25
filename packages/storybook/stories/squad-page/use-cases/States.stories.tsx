import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Case, Page } from './shared';
import { stateCases } from './cases';

const meta: Meta = {
  title: 'Squad Page/2. Use cases/States',
  parameters: { layout: 'fullscreen' },
};

export default meta;

// The squad before it has anything, and the squad that keeps people out.

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
        {stateCases.map((useCase) => (
          <Case key={useCase.id} useCase={useCase} />
        ))}
      </div>
    </Page>
  ),
};
