import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Case, Page } from './shared';
import { manageCases } from './cases';

const meta: Meta = {
  title: 'Squad Page/2. Use cases/Manage',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Overview: StoryObj = {
  render: () => (
    <Page
      eyebrow="Use cases · Manage"
      title="Editing the page, like editing a profile"
      intro={
        <p>
          Edit profile opens a settings area with its own menu; Edit page does
          the same for the squad. Everything the team runs lives there, grouped
          the way profile settings groups its pages, and each page carries one
          action in its header. The options menu&apos;s Manage items open the
          same area on their section.
        </p>
      }
    >
      <div className="flex flex-col gap-12">
        {manageCases.map((useCase) => (
          <Case key={useCase.id} useCase={useCase} />
        ))}
      </div>
    </Page>
  ),
};
